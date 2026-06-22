import { NextResponse } from "next/server";
import { buildFallbackEnhancedPrompt, enhancePrompt } from "@/lib/gemini";
import { generateReplicateImage } from "@/lib/replicate";
import type {
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
  GeneratedDesign,
} from "@/types/ai";

// ---------------------------------------------------------------------------
// POST /api/generate — AI Phone Case Design Generation
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

function getImageProvider(): "replicate" {
  return "replicate";
}

export async function POST(request: Request) {
  const startTime = Date.now();

  // --- 1. Parse & validate request body ---
  let body: GenerateRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<GenerateErrorResponse>(
      { error: "Invalid JSON body.", code: "INVALID_PROMPT" },
      { status: 400 },
    );
  }

  const { prompt, phoneModel, style, refImage, negativePrompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 3) {
    return NextResponse.json<GenerateErrorResponse>(
      {
        error: "Prompt must be at least 3 characters.",
        code: "INVALID_PROMPT",
      },
      { status: 400 },
    );
  }

  if (!phoneModel || typeof phoneModel !== "string") {
    return NextResponse.json<GenerateErrorResponse>(
      { error: "phoneModel is required.", code: "INVALID_PROMPT" },
      { status: 400 },
    );
  }

  try {
    // --- 2. Enhance prompt (Vietnamese → English professional prompt) ---
    const rawPrompt = style ? `${prompt}, phong cách ${style}` : prompt;
    const enhancedPrompt = process.env.GEMINI_API_KEY
      ? await enhancePrompt(rawPrompt, refImage)
      : await buildFallbackEnhancedPrompt(rawPrompt);

    // --- 3. Generate 1 design variant via Replicate ---
    const provider = getImageProvider();
    const designs: GeneratedDesign[] = [];
    console.log(
      `[AI Generate] Generating 1 design variant via ${provider} with negativePrompt: "${negativePrompt || ""}"...`,
    );
    const replicateResult = await generateReplicateImage(enhancedPrompt);

    designs.push({
      id: `design-${Date.now()}-0`,
      imageUrl: replicateResult.imageUrl,
      enhancedPrompt,
      model: replicateResult.model,
    });

    // --- 4. Return successful response ---
    const durationMs = Date.now() - startTime;

    return NextResponse.json<GenerateResponse>({ designs, durationMs });
  } catch (error) {
    console.error("[/api/generate] Generation failed:", error);

    // Check for quota / rate limit errors
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    const lowerMessage = message.toLowerCase();
    const isRateLimit =
      message.includes("429") ||
      lowerMessage.includes("quota") ||
      lowerMessage.includes("credit") ||
      lowerMessage.includes("billing") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      lowerMessage.includes("all replicate image models are unavailable");
    const isMissingConfig =
      lowerMessage.includes("api_token") ||
      lowerMessage.includes("api_key") ||
      lowerMessage.includes("api token") ||
      lowerMessage.includes("api key");

    return NextResponse.json<GenerateErrorResponse>(
      {
        error: isRateLimit
          ? "AI generation limit reached. Please try again in a few minutes."
          : isMissingConfig
            ? "AI provider is not configured. Please add REPLICATE_API_TOKEN to .env.local."
            : "Failed to generate designs. Please try again.",
        code: isRateLimit
          ? "RATE_LIMITED"
          : isMissingConfig
            ? "SERVER_ERROR"
            : "GENERATION_FAILED",
      },
      { status: isRateLimit ? 429 : 500 },
    );
  }
}
