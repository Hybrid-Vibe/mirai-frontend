import { GoogleGenerativeAI } from "@google/generative-ai";
import type { DesignStyle } from "@/types/ai";
import {
  STYLE_PROMPT_SUFFIX,
  PHONE_CASE_BASE_SUFFIX,
  getNegativePromptForStyle,
} from "@/types/ai";

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

// ---------------------------------------------------------------------------
// ENHANCE_SYSTEM_PROMPT — Gemini system instructions for prompt engineering
// ---------------------------------------------------------------------------

const ENHANCE_SYSTEM_PROMPT = `You are MIRAI's prompt engineer. Your job is to transform a Vietnamese customer's casual design description into a premium English prompt optimized for AI image generation (Replicate FLUX).

CRITICAL CONTEXT:
The output image is a FLAT ARTWORK / TEXTURE that will be applied onto a 3D phone case model. It is NOT an image of a phone case. Generate only the design/illustration/pattern itself.

COMPOSITION RULES (Safe Zone):
- The main subject must be in the CENTER 75% of the frame
- Top 15% and bottom 10% should contain secondary elements or background only
- NEVER place the main subject in the top-left corner (camera area will cover it)
- Use vertical composition optimized for a tall narrow format (9:16)
- Keep the composition balanced and symmetrical when possible

STYLE GUIDELINES:
The user will specify a style. Adapt the prompt accordingly:
- "pop-art-floral": Use halftone print texture, floating gemstones, crescent moon elements, motion blur trails, duotone colors, vibrant gradient backgrounds. One large centered flower as focal point.
- "kawaii-pastel": Use crayon texture, paper cutout effect, soft pastel colors, repeating patterns, cute kawaii aesthetic, handmade scrapbook feel. No single focal point — use scattered repeating elements.
- "textile-pattern": Use seamless repeating pattern, woven fabric texture, clean minimal design, Scandinavian aesthetic. No focal subject — pure pattern.
- "y2k-dreamy": Use holographic iridescent effects, dreamy pastel gradients, sparkle stars, soft glow aura, nostalgic Y2K aesthetic. Scattered cute elements.
- "luxury-gem": Use gemstone collage, crystal facets, metallic gold accents, rich jewel tones, editorial luxury fashion print aesthetic.

CHARACTER PRESERVATION:
If the customer requests a specific character (anime, brand, etc.), PRESERVE their exact name AND append a brief accurate description of their iconic visual features (hair, clothing, accessories) to guide the image generator.

FORBIDDEN WORDS (never include these — Flux will render them literally):
phone, case, mockup, iphone, samsung, device, hand, outline, border, cutout, camera, template, 3D case, person, human, face, portrait, hands, body, text, letters, logo, watermark, signature, frame

OUTPUT RULES:
1. Output ONLY the enhanced English prompt — no markdown, no labels, no explanations
2. Keep it under 120 words
3. Always end with: "vertical composition, center-safe layout, print-ready premium artwork"`;

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

// ---------------------------------------------------------------------------
// Character feature map — enriches prompt with iconic visual details
// ---------------------------------------------------------------------------

function enrichCharacterDescription(englishPrompt: string): string[] {
  const lower = englishPrompt.toLowerCase();
  const extras: string[] = [];

  if (
    lower.includes("momo ayase") ||
    lower.includes("ayase momo") ||
    lower.includes("dandadan") ||
    lower.includes("dan da dan")
  ) {
    extras.push(
      "character Momo Ayase from the anime Dandadan",
      "short brown hair styled to the side, pinkish-red eyes, big turquoise circle disc earrings",
      "pink school sweater vest over a white collared shirt with a red bow tie",
      "dark blue pleated skirt",
      "anime style key art",
    );
  } else if (lower.includes("luffy") || lower.includes("one piece")) {
    extras.push(
      "Monkey D. Luffy from One Piece",
      "black hair, straw hat with red band, scar under left eye",
      "open red button shirt, blue shorts, yellow sash",
      "classic anime style",
    );
  } else if (lower.includes("goku") || lower.includes("dragon ball")) {
    extras.push(
      "Son Goku from Dragon Ball",
      "spiky black hair, muscular build",
      "orange martial arts gi with blue undershirt and sash",
      "classic anime style",
    );
  } else if (lower.includes("doraemon")) {
    extras.push(
      "Doraemon character",
      "blue robotic cat, white face and belly, red nose, yellow bell collar, no ears",
      "flat cartoon style",
    );
  } else if (lower.includes("pikachu") || lower.includes("pokemon")) {
    extras.push(
      "Pikachu from Pokemon",
      "yellow electric mouse creature, long ears with black tips, red circular cheeks, lightning bolt tail",
      "vibrant anime style",
    );
  }

  return extras;
}

// ---------------------------------------------------------------------------
// Fallback prompt builder (no Gemini required)
// ---------------------------------------------------------------------------

/**
 * Build an enhanced prompt without Gemini.
 * Translates Vietnamese → English, appends style suffix + base suffix.
 */
export async function buildFallbackEnhancedPrompt(
  rawPrompt: string,
  style: DesignStyle = "pop-art-floral",
): Promise<string> {
  const cleanPrompt = cleanUserPrompt(rawPrompt);
  const englishPrompt = await translateToEnglish(cleanPrompt);

  const parts = [englishPrompt];

  // Add character-specific descriptions
  const characterExtras = enrichCharacterDescription(englishPrompt);
  parts.push(...characterExtras);

  // Add style-specific suffix
  const styleSuffix = STYLE_PROMPT_SUFFIX[style];
  if (styleSuffix) {
    parts.push(styleSuffix);
  }

  // Add phone case base suffix
  parts.push(PHONE_CASE_BASE_SUFFIX);

  return parts.join(", ");
}

// ---------------------------------------------------------------------------
// Gemini-powered prompt enhancement
// ---------------------------------------------------------------------------

export async function enhancePrompt(
  rawPrompt: string,
  style: DesignStyle = "pop-art-floral",
  refImage?: string,
): Promise<string> {
  const cleanedPrompt = cleanUserPrompt(rawPrompt);
  const styleSuffix = STYLE_PROMPT_SUFFIX[style] || "";
  const negativeWords = getNegativePromptForStyle(style);

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
Selected style: ${style}. Style hint: ${styleSuffix}.
Avoid these subjects/words in your output: ${negativeWords}.
Make sure the resulting prompt will guide the image generator to reproduce this exact style!`,
      });
    } else {
      parts.push({
        text: `Customer prompt: ${cleanedPrompt}\nSelected style: ${style}\nStyle hint: ${styleSuffix}\nAvoid these subjects/words: ${negativeWords}`,
      });
    }
  } else {
    parts.push({
      text: `Customer prompt: ${cleanedPrompt}\nSelected style: ${style}\nStyle hint: ${styleSuffix}\nAvoid these subjects/words: ${negativeWords}`,
    });
  }

  try {
    const result = await getTextModel().generateContent(parts);
    const enhanced = result.response.text().trim();

    // Fallback: if model returns empty, use a sensible default
    if (!enhanced) {
      return await buildFallbackEnhancedPrompt(rawPrompt, style);
    }

    return enhanced;
  } catch (error) {
    console.error("[Gemini] Failed to enhance prompt, using fallback:", error);
    return await buildFallbackEnhancedPrompt(rawPrompt, style);
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
  const responseParts = response.candidates?.[0]?.content?.parts;

  if (!responseParts) {
    throw new Error("Gemini returned no content parts.");
  }

  // Find the image part in the response
  for (const part of responseParts) {
    if (part.inlineData) {
      const { mimeType, data } = part.inlineData;
      return `data:${mimeType};base64,${data}`;
    }
  }

  throw new Error("Gemini response contained no image data.");
}
