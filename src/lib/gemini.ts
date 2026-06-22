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

function cleanUserPrompt(prompt: string): string {
  let clean = prompt;
  const termsToRemove = [
    /ốp\s+lưng/gi,
    /op\s+lung/gi,
    /ốp/gi,
    /vỏ\s+điện\s+thoại/gi,
    /vo\s+dien\s+thoai/gi,
    /phone\s+case/gi,
    /phonecase/gi,
    /mockup/gi,
    /iphone/gi,
    /samsung/gi,
    /case/gi,
  ];

  for (const term of termsToRemove) {
    clean = clean.replace(term, "");
  }

  // Clean up extra spaces, leading/trailing punctuation
  clean = clean.replace(/\s+/g, " ").trim();
  clean = clean.replace(/^[:,\s-]+/, "").trim();
  clean = clean.replace(/[:,\s-]+$/, "").trim();
  return clean || prompt;
}

const ENHANCE_SYSTEM_PROMPT = `You are MIRAI's prompt engineer. Your job is to take a Vietnamese customer's casual description of a design and transform it into a premium, modern, high-end English prompt optimized for AI image generation (using Replicate FLUX).

The output MUST describe ONLY the graphic design, illustration, pattern, or artwork itself.

CRITICAL DESIGN RULES:
1. PRESERVE CHARACTERS & SUBJECTS: If the customer requests a specific character, anime, brand, or public figure (e.g., "Momo Ayase from Dan Da Dan", "Luffy", "Goku"), you MUST preserve their exact name and core identity. Since the image generator might not know the character by name, you MUST also append a brief, accurate description of their iconic visual features (such as hair style and color, signature clothing, facial features, or key accessories) in the output prompt to guide the generator. For example, Momo Ayase has brown hair styled in a high bun with side bangs, and wears a beige school cardigan over a white shirt with a red ribbon tie. Keep the character recognizable.
2. AVOID CHEAP AESTHETICS: Do NOT use terms that lead to cheap vector clip-art, basic 3D renders, or amateurish digital drawings (avoid: "clip art", "basic vector", "cartoon mascot", "simple vector", "generic 2D illustration").
3. CHOOSE PREMIUM STYLES: Direct the model towards premium, trendy, modern designer aesthetics (e.g., Casetify-style designer aesthetics, retro indie-chic, vintage botanical illustrations, watercolor/gouache textures, modern minimalist line art, boho-chic, fine art prints, or elegant typography layouts).
4. BACKGROUNDS & COMPOSITIONS: Prefer beautiful organic gradients, paint strokes, linen textures, or delicate scattered patterns over plain solid color backgrounds. Allow organic compositions that cover the frame beautifully.
5. FORBIDDEN WORDS: Do NOT include words like: "phone", "case", "mockup", "iphone", "samsung", "device", "hand", "outline", "border", "cutout", "camera", "template", "realistic shadow", "3D case", "no phone case", "no mockup". (Do not try to add negative constraints like "no phone case" as Flux will generate them. Instead, completely omit these words.)
6. Output ONLY the enhanced English prompt, nothing else. Do not use markdown backticks, explanations, or labels.
7. Keep the customer's intent and aesthetic preferences intact, but elevate it to a professional designer level.
8. Keep it under 120 words.
9. Always end with: "flat 2D texture, print-ready premium artwork, aesthetic design"`;

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

async function translateToEnglish(text: string): Promise<string> {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Translation failed");
    const data = await response.json();
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return text;
  } catch (error) {
    console.error("[Translation] Failed to translate:", error);
    return text;
  }
}

/**
 * Enhance a raw Vietnamese prompt into a professional English prompt
 * suitable for image generation.
 */
export async function buildFallbackEnhancedPrompt(
  rawPrompt: string,
): Promise<string> {
  const cleanPrompt = cleanUserPrompt(rawPrompt);
  const englishPrompt = await translateToEnglish(cleanPrompt);

  const parts = [`premium aesthetic design of ${englishPrompt}`];

  const lowerPrompt = englishPrompt.toLowerCase();
  if (
    lowerPrompt.includes("momo ayase") ||
    lowerPrompt.includes("ayase momo") ||
    lowerPrompt.includes("dandadan") ||
    lowerPrompt.includes("dan da dan")
  ) {
    parts.push(
      "character Momo Ayase from the anime Dandadan",
      "short brown hair styled to the side, pinkish-red eyes, big turquoise circle disc earrings",
      "pink school sweater vest over a white collared shirt with a red bow tie",
      "dark blue pleated skirt",
      "anime style key art",
    );
  } else if (
    lowerPrompt.includes("luffy") ||
    lowerPrompt.includes("one piece")
  ) {
    parts.push(
      "Monkey D. Luffy from One Piece",
      "black hair, straw hat with red band, scar under left eye",
      "open red button shirt, blue shorts, yellow sash",
      "classic anime style",
    );
  } else if (
    lowerPrompt.includes("goku") ||
    lowerPrompt.includes("dragon ball")
  ) {
    parts.push(
      "Son Goku from Dragon Ball",
      "spiky black hair, muscular build",
      "orange martial arts gi with blue undershirt and sash",
      "classic anime style",
    );
  } else if (lowerPrompt.includes("doraemon")) {
    parts.push(
      "Doraemon character",
      "blue robotic cat, white face and belly, red nose, yellow bell collar, no ears",
      "flat cartoon style",
    );
  } else if (
    lowerPrompt.includes("pikachu") ||
    lowerPrompt.includes("pokemon")
  ) {
    parts.push(
      "Pikachu from Pokemon",
      "yellow electric mouse creature, long ears with black tips, red circular cheeks, lightning bolt tail",
      "vibrant anime style",
    );
  }

  parts.push(
    "modern designer style",
    "beautiful color palette",
    "detailed illustration",
    "fine art textures",
    "high resolution",
    "print-ready flat artwork",
    "flat 2D texture",
    "aesthetic design",
  );

  return parts.join(", ");
}

export async function enhancePrompt(
  rawPrompt: string,
  refImage?: string,
): Promise<string> {
  const cleanedPrompt = cleanUserPrompt(rawPrompt);
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
Then, generate a highly detailed English image generation prompt that perfectly blends the customer's request ("${cleanedPrompt}") with the exact stylistic elements (but NOT the exact subject, unless it fits) of this reference image.
Make sure the resulting prompt will guide the image generator to reproduce this exact style!`,
      });
    } else {
      parts.push({
        text: `Customer prompt: ${cleanedPrompt}`,
      });
    }
  } else {
    parts.push({
      text: `Customer prompt: ${cleanedPrompt}`,
    });
  }

  try {
    const result = await getTextModel().generateContent(parts);
    const enhanced = result.response.text().trim();

    // Fallback: if model returns empty, use a sensible default
    if (!enhanced) {
      return await buildFallbackEnhancedPrompt(rawPrompt);
    }

    return enhanced;
  } catch (error) {
    console.error("[Gemini] Failed to enhance prompt, using fallback:", error);
    return await buildFallbackEnhancedPrompt(rawPrompt);
  }
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
