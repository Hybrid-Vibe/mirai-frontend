import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// Gemini Client — singleton, server-side only
// ---------------------------------------------------------------------------

// Lazy initialization functions to prevent build crash when keys are missing in CI
let _genAI: GoogleGenerativeAI | null = null;
function getGenAI(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to .env.local (server-side only).",
      );
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

function getTextModel() {
  return getGenAI().getGenerativeModel({
    model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
  });
}

function getImageModel() {
  return getGenAI().getGenerativeModel({
    model: "gemini-2.0-flash-preview-image-generation",
  });
}

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

function parseBase64DataUrl(
  dataUrl: string,
): { data: string; mimeType: string } | null {
  const matches = dataUrl.match(
    /^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/,
  );
  if (!matches || matches.length !== 3) {
    return null;
  }
  return {
    mimeType: matches[1],
    data: matches[2],
  };
}

/**
 * Enhance a raw Vietnamese prompt into a professional English prompt
 * suitable for image generation.
 */
export async function enhancePrompt(
  rawPrompt: string,
  phoneModel: string,
  refImage?: string,
): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [{ text: ENHANCE_SYSTEM_PROMPT }];

  if (refImage) {
    const parsed = parseBase64DataUrl(refImage);
    if (parsed) {
      parts.push({
        inlineData: {
          data: parsed.data,
          mimeType: parsed.mimeType,
        },
      });
      parts.push({
        text: `The user has provided a reference image above. 
Your goal is to carefully analyze the artistic style, color palette, lighting, textures, layout, and composition of this reference image.
Then, generate a highly detailed English image generation prompt that perfectly blends the customer's request ("${rawPrompt}") with the exact stylistic elements (but NOT the exact subject, unless it fits) of this reference image.
Make sure the resulting prompt will guide the image generator to reproduce this exact style!
Phone model context: ${phoneModel}`,
      });
    } else {
      parts.push({
        text: `Phone model: ${phoneModel}\nCustomer prompt: ${rawPrompt}`,
      });
    }
  } else {
    parts.push({
      text: `Phone model: ${phoneModel}\nCustomer prompt: ${rawPrompt}`,
    });
  }

  const result = await getTextModel().generateContent(parts);
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
  const result = await getImageModel().generateContent({
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
