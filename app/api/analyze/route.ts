import { NextRequest, NextResponse } from "next/server";
import { getModel } from "@/lib/ai/config";
import { generateText } from "ai";
import { z } from "zod";
import PDFParser from "pdf2json";
import mammoth from "mammoth";
import { MEDICAL_SYSTEM_PROMPT } from "@/lib/ai/system-prompt";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

// Define the schema for the medical card output
const analysisSchema = z.object({
  title: z.string().describe("A short, clear title for this medical document analysis"),
  summary: z.string().describe("A brief, patient-friendly summary of the document"),
  keyFindings: z.array(z.string()).describe("List of the most important findings or abnormal values"),
  recommendations: z.array(z.string()).describe("General next steps (must include advising to see a doctor)"),
  technicalDetails: z.string().optional().describe("Any important technical details, values, or metrics from the report"),
});

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "image/jpeg",
  "image/png"
];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Authentication Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check (5 requests per minute for analysis since it's expensive)
    const rateLimit = checkRateLimit(`analyze_${user.id}`, 5, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many file analysis requests. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { url, type, name, inputPrompt } = body;

    if (!url) {
      return NextResponse.json({ error: "No file URL provided" }, { status: 400 });
    }

    // 3. Server-side Type Validation
    if (!ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid file type provided for analysis." }, { status: 400 });
    }

    let extractedText = "";
    const isImage = type.startsWith("image/");
    
    if (!isImage) {
      // Fetch the file to parse text on the server
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch file from storage");
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (type === "application/pdf") {
        extractedText = await new Promise((resolve, reject) => {
          const pdfParser = new PDFParser(null, true);
          pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          pdfParser.on("pdfParser_dataReady", () => {
            resolve((pdfParser as any).getRawTextContent());
          });
          pdfParser.parseBuffer(buffer);
        });
      } else if (type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const result = await mammoth.extractRawText({ buffer });
        extractedText = result.value;
      } else {
        return NextResponse.json({ error: "Unsupported file type for text extraction" }, { status: 400 });
      }
    }

    // Fetch user preferred AI provider
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_provider")
      .eq("id", user.id)
      .single();

    const preferredProvider = profile?.ai_provider;

    // Prepare the AI request
    const providerStr = process.env.AI_PROVIDER_ORDER || "openai,anthropic,google,xai,deepseek,together,openrouter";
    let providerOrder = providerStr.split(",").map(s => s.trim()).filter(Boolean);

    if (preferredProvider) {
      providerOrder = [preferredProvider, ...providerOrder.filter(p => p !== preferredProvider)];
    }

    const userMessageContent: any[] = [];
    
    if (inputPrompt) {
      userMessageContent.push({ type: "text", text: inputPrompt });
    } else {
      userMessageContent.push({ type: "text", text: `Please analyze this medical document: ${name}` });
    }

    if (isImage) {
      // Send the image URL directly to the vision model
      userMessageContent.push({
        type: "image",
        image: new URL(url),
      });
    } else {
      // Send the extracted text
      userMessageContent.push({
        type: "text",
        text: `\n\n--- DOCUMENT CONTENT ---\n${extractedText.substring(0, 15000)}\n--- END DOCUMENT ---\n`,
      });
    }

    let lastError: any = null;
    let object: any = null;

    for (const providerName of providerOrder) {
      try {
        console.log(`[Analyze Route] Attempting to use provider: ${providerName}`);
        const model = getModel(providerName);

        // Create a 5-minute timeout for each provider to prevent hanging indefinitely
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 300000);

        try {
          const result = await generateText({
            model,
            maxRetries: 0,
            abortSignal: controller.signal,
            system: `${MEDICAL_SYSTEM_PROMPT}\n\nYou are acting as a document analyzer. Output your findings STRICTLY as a raw JSON object matching the following structure exactly (NO markdown formatting, NO backticks, NO extra text):\n{\n  "title": "string",\n  "summary": "string",\n  "keyFindings": ["string"],\n  "recommendations": ["string"],\n  "technicalDetails": "string"\n}\n\nMaintain the required medical disclaimers in your tone.`,
            messages: [
              {
                role: "user",
                content: userMessageContent as any,
              },
            ],
          });
          clearTimeout(timeoutId);

          const textResult = result.text.trim();
          const jsonMatch = textResult.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            object = JSON.parse(jsonMatch[0]);
          } else {
            object = JSON.parse(textResult);
          }
          
          console.log(`[Analyze Route] Successfully generated and parsed structured object from: ${providerName}`);
          break; // Stop loop on success
        } catch (error) {
          clearTimeout(timeoutId);
          throw error; // Rethrow to be caught by the outer catch
        }
      } catch (error) {
        console.warn(`[Analyze Route] Provider ${providerName} failed:`, error instanceof Error ? error.message : String(error));
        lastError = error;
        continue;
      }
    }

    if (!object) {
      throw lastError || new Error("All configured AI providers failed to analyze the document.");
    }

    return NextResponse.json(object);

  } catch (error: any) {
    console.error("[Analyze API Route] Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during analysis." },
      { status: 500 }
    );
  }
}
