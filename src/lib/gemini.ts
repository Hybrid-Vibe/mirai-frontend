import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Gemini Client — singleton, server-side only
// ---------------------------------------------------------------------------

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error(
    "GEMINI_API_KEY is not set. Add it to .env.local (server-side only, never NEXT_PUBLIC_).",
  );
}

export const genAI = new GoogleGenerativeAI(apiKey);

// ---------------------------------------------------------------------------
// Models
// ---------------------------------------------------------------------------

/** Text model for prompt enhancement (fast, cheap) */
export const textModel = genAI.getGenerativeModel({
  model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
});

/** Image model for design generation */
export const imageModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash-preview-image-generation",
});

// ---------------------------------------------------------------------------
// Prompt Enhancement
// ---------------------------------------------------------------------------

const ENHANCE_SYSTEM_PROMPT = `You are MIRAI's prompt engineer. Your job is to take a Vietnamese customer's casual description of a phone case design and transform it into a professional English prompt optimized for AI image generation.

Rules:
- Output ONLY the enhanced English prompt, nothing else.
- Keep the customer's intent and aesthetic preferences intact.
- Add technical terms: "phone case design", "flat illustration", "high resolution", "product mockup".
- If the customer mentions Vietnamese culture, names, or slang — translate the meaning, not literally.
- Keep it under 200 words.
- Include the phone model context if provided.
- Always end with: "clean background, product photography style"`;

/**
 * Enhance a raw Vietnamese prompt into a professional English prompt
 * suitable for image generation.
 */
export async function enhancePrompt(
  rawPrompt: string,
  phoneModel: string,
): Promise<string> {
  const result = await textModel.generateContent([
    { text: ENHANCE_SYSTEM_PROMPT },
    {
      text: `Phone model: ${phoneModel}\nCustomer prompt: ${rawPrompt}`,
    },
  ]);

  const enhanced = result.response.text().trim();

  // Fallback: if model returns empty, use a sensible default
  if (!enhanced) {
    return `Custom phone case design for ${phoneModel}, ${rawPrompt}, clean background, product photography style`;
  }

  return enhanced;
}

// ---------------------------------------------------------------------------
// Image Generation
// ---------------------------------------------------------------------------

/**
 * Generate a single phone case design image using Gemini's image generation.
 * Returns a base64 PNG data URL.
 */
export async function generateDesignImage(
  enhancedPrompt: string,
): Promise<string> {
  const result = await imageModel.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Generate a phone case design image based on this description: ${enhancedPrompt}`,
          },
        ],
      },
    ],
    generationConfig: {
      // @ts-expect-error — responseModalities is supported but not yet in the SDK types
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  const response = result.response;
  const parts = response.candidates?.[0]?.content?.parts;

  if (!parts) {
    throw new Error("Gemini returned no content parts.");
  }

  // Find the image part in the response
  for (const part of parts) {
    if (part.inlineData) {
      const { mimeType, data } = part.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  throw new Error("Gemini response contained no image data.");
}
