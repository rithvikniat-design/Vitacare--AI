import { streamMedicalResponse } from "@/lib/ai/router";
import { Message } from "ai";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Authentication Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate Limiting Check (10 requests per minute per user)
    const rateLimit = checkRateLimit(user.id, 10, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }

    const { messages, data } = await req.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided." }, { status: 400 });
    }

    const specialist = data?.specialist || "General";

    // Fetch user preferred AI provider
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_provider")
      .eq("id", user.id)
      .single();

    // Call the router which handles failover, streaming, and disclaimers
    const response = await streamMedicalResponse(messages, profile?.ai_provider, specialist);
    return response;

  } catch (error: any) {
    console.error("[Chat API Route] Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during chat processing." },
      { status: 500 }
    );
  }
}
