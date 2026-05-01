import { NextResponse } from "next/server";
import { enhancePrompt, generateDesignImage } from "@/lib/gemini";
import type {
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
  GeneratedDesign,
} from "@/types/ai";

// ---------------------------------------------------------------------------
// POST /api/generate — AI Phone Case Design Generation
// ---------------------------------------------------------------------------

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

  const { prompt, phoneModel, style } = body;

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
    const enhancedPrompt = await enhancePrompt(rawPrompt, phoneModel);

    // --- 3. Generate 3 design variants in parallel ---
    const designPromises = Array.from({ length: 3 }, async (_, index) => {
      // Add slight variation to each prompt for diversity
      const variations = [
        enhancedPrompt,
        `${enhancedPrompt}, alternative color palette, variant design`,
        `${enhancedPrompt}, minimalist variation, subtle details`,
      ];

      const imageUrl = await generateDesignImage(variations[index]);

      const design: GeneratedDesign = {
        id: `design-${Date.now()}-${index}`,
        imageUrl,
        enhancedPrompt: variations[index],
      };

      return design;
    });

    const designs = await Promise.all(designPromises);

    // --- 4. Return successful response ---
    const durationMs = Date.now() - startTime;

    return NextResponse.json<GenerateResponse>({ designs, durationMs });
  } catch (error) {
    console.error("[/api/generate] Generation failed:", error);

    // Check for quota / rate limit errors
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    const isRateLimit =
      message.includes("429") || message.includes("quota");

    return NextResponse.json<GenerateErrorResponse>(
      {
        error: isRateLimit
          ? "AI generation limit reached. Please try again in a few minutes."
          : "Failed to generate designs. Please try again.",
        code: isRateLimit ? "RATE_LIMITED" : "GENERATION_FAILED",
      },
      { status: isRateLimit ? 429 : 500 },
    );
  }
}
