import { streamText, Message, CoreMessage } from "ai";
import { getModel } from "./config";
import { MEDICAL_SYSTEM_PROMPT } from "./system-prompt";

const DISCLAIMER = "\n\n*This AI assistant is for educational and informational purposes only. It does not replace consultation with a licensed healthcare professional. Always seek medical advice for diagnosis and treatment.*";

export async function streamMedicalResponse(messages: Message[], preferredProvider?: string) {
  let providerStr = process.env.AI_PROVIDER_ORDER || "openai,anthropic,google,xai,deepseek,together,openrouter";
  let providerOrder = providerStr.split(",").map(s => s.trim()).filter(Boolean);

  if (preferredProvider) {
    providerOrder = [preferredProvider, ...providerOrder.filter(p => p !== preferredProvider)];
  }

  let lastError: any = null;

  // Convert Message[] to CoreMessage[] for ai@3
  const coreMessages = messages.filter(m => m.role !== 'data').map(m => ({
    role: m.role === 'function' ? 'assistant' : m.role,
    content: m.content,
  })) as CoreMessage[];

  for (const providerName of providerOrder) {
    try {
      console.log(`[AI Router] Attempting to use provider: ${providerName}`);
      const model = getModel(providerName);
      
      const result = await streamText({
        model,
        maxRetries: 0,
        system: `${MEDICAL_SYSTEM_PROMPT}\n\nIMPORTANT: You must append the following disclaimer at the very end of your response, exactly as written:\n${DISCLAIMER}`,
        messages: coreMessages,
      });

      console.log(`[AI Router] Successfully connected to provider: ${providerName}`);

      const dataStreamResponse = result.toDataStreamResponse();
      return dataStreamResponse;

    } catch (error) {
      console.warn(`[AI Router] Provider ${providerName} failed:`, error instanceof Error ? error.message : String(error));
      lastError = error;
      continue;
    }
  }
  // Instead of throwing, we return a simulated stream response so the UI doesn't crash with a parsing error.
  const errorMessage = lastError instanceof Error ? lastError.message : String(lastError);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // Send a single text chunk in the Vercel AI stream format (0:"text")
      controller.enqueue(encoder.encode(`0:"I'm sorry, I encountered an error connecting to my AI providers. Please check your API keys in .env.local.\\n\\nError Details: ${errorMessage}"\n`));
      controller.close();
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "x-vercel-ai-data-stream": "v1"
    }
  });
}
