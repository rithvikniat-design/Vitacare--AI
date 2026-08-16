import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

// 1. OpenAI
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Anthropic (Claude)
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// 3. Google (Gemini)
export const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// 4. xAI (Grok) - Uses OpenAI SDK with custom base URL
export const xai = createOpenAI({
  baseURL: "https://api.x.ai/v1",
  apiKey: process.env.XAI_API_KEY,
});

// 5. DeepSeek - Uses OpenAI SDK with custom base URL
export const deepseek = createOpenAI({
  baseURL: "https://api.deepseek.com/v1",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

// 6. Together AI - Uses OpenAI SDK with custom base URL
export const together = createOpenAI({
  baseURL: "https://api.together.xyz/v1",
  apiKey: process.env.TOGETHER_API_KEY,
});

// 7. OpenRouter - Uses OpenAI SDK with custom base URL
export const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  headers: {
    "HTTP-Referer": "https://medical-ai-doctor.vercel.app", // Required for free models
    "X-Title": "Medical AI Doctor",
  }
});

// Helper to get the correct model instance based on provider name
export function getModel(providerName: string) {
  switch (providerName.toLowerCase()) {
    case "openai":
      return openai("gpt-4o");
    case "anthropic":
    case "claude":
      return anthropic("claude-3-5-sonnet-20240620");
    case "google":
    case "gemini":
      return google("gemini-1.5-pro");
    case "xai":
    case "grok":
      return xai("grok-2-latest");
    case "deepseek":
      return deepseek("deepseek-chat");
    case "together":
      return together("meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo");
    case "openrouter":
      // Using a reliable free fallback model on OpenRouter
      return openrouter("openrouter/free");
    default:
      throw new Error(`Unsupported AI provider: ${providerName}`);
  }
}
