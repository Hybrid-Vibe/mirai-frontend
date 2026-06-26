import { NextResponse } from "next/server";
import { buildFallbackEnhancedPrompt, enhancePrompt } from "@/lib/gemini";
import { generateReplicateImage } from "@/lib/replicate";
import {
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
  GeneratedDesign,
  DesignStyle,
  getNegativePromptForStyle,
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

  const { prompt, phoneModel, style: rawStyle, refImage } = body;

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

  const validStyles: DesignStyle[] = [
    "pop-art-floral",
    "kawaii-pastel",
    "textile-pattern",
    "y2k-dreamy",
    "luxury-gem",
  ];
  const style = validStyles.includes(rawStyle as DesignStyle)
    ? (rawStyle as DesignStyle)
    : "pop-art-floral";

  const negativePrompt =
    body.negativePrompt || getNegativePromptForStyle(style);

  try {
    // --- 2. Enhance prompt (Vietnamese → English professional prompt) ---
    console.log(`[AI Generate] Enhancing prompt with style: "${style}"...`);
    const enhancedPrompt = process.env.GEMINI_API_KEY
      ? await enhancePrompt(prompt, style, refImage)
      : await buildFallbackEnhancedPrompt(prompt, style);

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
    const isQuotaOrBilling =
      lowerMessage.includes("402") ||
      lowerMessage.includes("quota") ||
      lowerMessage.includes("credit") ||
      lowerMessage.includes("billing");
    const isRateLimit =
      message.includes("429") ||
      lowerMessage.includes("rate limit") ||
      lowerMessage.includes("too many requests") ||
      lowerMessage.includes("all replicate image models are unavailable");
    const isMissingConfig =
      lowerMessage.includes("api_token") ||
      lowerMessage.includes("api_key") ||
      lowerMessage.includes("api token") ||
      lowerMessage.includes("api key");

    if (isQuotaOrBilling) {
      return NextResponse.json<GenerateErrorResponse>(
        {
          error: "AI service is out of credit or quota limit exceeded.",
          code: "SERVER_ERROR",
        },
        { status: 402 },
      );
    }

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
