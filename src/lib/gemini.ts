import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildClientEnhancedPrompt } from "@/lib/ai-generation";
import {
  STYLE_PROMPT_SUFFIX,
  getNegativePromptForStyle,
  type ColorPreset,
  type DesignStyle,
  type PromptClassifierOutput,
  type PromptMode,
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

export interface PromptEnhancementOptions {
  colorPreset?: ColorPreset;
  customColor?: string;
  wantsText?: boolean;
  promptMode?: PromptMode;
  classification?: PromptClassifierOutput;
  refImage?: string;
  enhancedPromptDraft?: string;
}

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

const ENHANCE_SYSTEM_PROMPT = `You are MIRAI's art director for a custom phone case ecommerce website.

Rewrite the customer's short idea into one polished English prompt for an image generation model.

CRITICAL CONTEXT:
The output is only a flat 2D printable artwork texture that will be applied onto a 3D phone case model later by the frontend. It is not a phone, not a phone case object, and not a phone mockup photo. Generate only the design/illustration/pattern itself on a clean vertical canvas.

RULES:
- Keep the user's original idea.
- Make it suitable as printable artwork for a phone case surface.
- Use modern, premium, trendy visual language.
- Prefer clean composition, printable details, and balanced negative space.
- Place the main subject in the bottom center / lower-middle safe area of the artwork.
- Keep the top 30% airy and simple for phone camera clusters.
- Keep the upper-left camera zone free of faces, text, logos, focal objects, and important details.
- Do not include any phone, phone case shell, camera cutout, camera lens, device frame, product mockup, hand, shadowed product render, or AR preview.
- Avoid cheesy, outdated, old 2010s poster styles.
- Avoid messy gradients, random typography, watermark, frame, logo, and cluttered backgrounds.
- Do not add text unless the user explicitly asks for text.
- If text is requested, preserve the exact requested words.
- If a specific character is requested without reference image, do not promise exact character fidelity; make a tasteful inspired artwork.
- If a reference image is provided, adapt the visual identity and style from the reference into flat printable artwork.

STYLE GUIDELINES:
The user will specify a style. Adapt the prompt accordingly:
- "minimal": Minimal premium illustration, clean lines, soft shadows, subtle palette, elegant negative space.
- "cute-sticker": Cute sticker-style illustration, bold clean outline, soft rounded shapes, trendy Korean stationery aesthetic.
- "streetwear": Bold streetwear graphic, high contrast, edgy modern apparel print style.
- "y2k-modern": Modern Y2K-inspired design, chrome accents, dreamy glow, playful futuristic mood.
- "anime-clean": Clean anime-inspired illustration, soft cinematic lighting, elegant composition, detailed but not cluttered.
- "luxury": Premium editorial design, refined palette, elegant lighting, high-end accessory feel.

OUTPUT RULES:
1. Output ONLY the enhanced English prompt — no markdown, no labels, no explanations
2. Keep it under 140 words
3. Always include: "flat printable artwork texture", "vertical composition", "bottom-center subject placement", "camera-safe top area", "print-ready premium artwork", "no phone or case mockup"
4. Include "no text" or "no random text" unless text is explicitly requested.`;

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
  style: DesignStyle = "minimal",
  options: PromptEnhancementOptions = {},
): Promise<string> {
  const cleanPrompt = cleanUserPrompt(rawPrompt);
  const englishPrompt = await translateToEnglish(cleanPrompt);
  const promptDraft = buildClientEnhancedPrompt({
    userPrompt: englishPrompt,
    selectedStyle: style,
    colorPreset: options.colorPreset,
    customColor: options.customColor,
    mode: options.promptMode ?? "generic",
    wantsText: options.wantsText,
    hasReferenceImage: Boolean(options.refImage),
  });

  // Add character-specific descriptions
  const characterExtras = enrichCharacterDescription(englishPrompt);

  return [promptDraft, ...characterExtras].filter(Boolean).join(", ");
}

// ---------------------------------------------------------------------------
// Gemini-powered prompt enhancement
// ---------------------------------------------------------------------------

export async function enhancePrompt(
  rawPrompt: string,
  style: DesignStyle = "minimal",
  optionsOrRefImage?: PromptEnhancementOptions | string,
): Promise<string> {
  const options: PromptEnhancementOptions =
    typeof optionsOrRefImage === "string"
      ? { refImage: optionsOrRefImage }
      : (optionsOrRefImage ?? {});
  const cleanedPrompt = cleanUserPrompt(rawPrompt);
  const styleSuffix = STYLE_PROMPT_SUFFIX[style] || "";
  const negativeWords = getNegativePromptForStyle(style);
  const promptDraft =
    options.enhancedPromptDraft ||
    buildClientEnhancedPrompt({
      userPrompt: cleanedPrompt,
      selectedStyle: style,
      colorPreset: options.colorPreset,
      customColor: options.customColor,
      mode: options.promptMode ?? "generic",
      wantsText: options.wantsText,
      hasReferenceImage: Boolean(options.refImage),
    });
  const classifierMessage = options.classification?.userFacingMessage
    ? `Classifier note: ${options.classification.userFacingMessage}`
    : "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parts: any[] = [{ text: ENHANCE_SYSTEM_PROMPT }];

  if (options.refImage) {
    const parsed = parseBase64DataUrl(options.refImage);
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
Then, generate a highly detailed English image generation prompt that blends the customer's request ("${cleanedPrompt}") with the visual identity, style, color palette, lighting, textures, layout, and composition of this reference image.
The image generator must output only flat printable artwork, not a phone, not a case shell, not a camera cutout, and not a product mockup.
Selected style: ${style}. Style hint: ${styleSuffix}.
Color direction: ${options.colorPreset ?? "auto"}${options.customColor ? ` (${options.customColor})` : ""}.
Mode: ${options.promptMode ?? "reference"}.
Frontend prompt draft: ${promptDraft}
${classifierMessage}
Avoid these subjects/words in your output: ${negativeWords}.
Make sure the resulting prompt will guide the image generator to reproduce this exact style!`,
      });
    } else {
      parts.push({
        text: `Customer prompt: ${cleanedPrompt}\nSelected style: ${style}\nStyle hint: ${styleSuffix}\nColor direction: ${options.colorPreset ?? "auto"}\nMode: ${options.promptMode ?? "generic"}\nFrontend prompt draft: ${promptDraft}\n${classifierMessage}\nAvoid these subjects/words: ${negativeWords}`,
      });
    }
  } else {
    parts.push({
      text: `Customer prompt: ${cleanedPrompt}\nSelected style: ${style}\nStyle hint: ${styleSuffix}\nColor direction: ${options.colorPreset ?? "auto"}${options.customColor ? ` (${options.customColor})` : ""}\nMode: ${options.promptMode ?? "generic"}\nFrontend prompt draft: ${promptDraft}\n${classifierMessage}\nAvoid these subjects/words: ${negativeWords}`,
    });
  }

  try {
    const result = await getTextModel().generateContent(parts);
    const enhanced = result.response.text().trim();

    // Fallback: if model returns empty, use a sensible default
    if (!enhanced) {
      return await buildFallbackEnhancedPrompt(rawPrompt, style, options);
    }

    return enhanced;
  } catch (error) {
    console.error("[Gemini] Failed to enhance prompt, using fallback:", error);
    return await buildFallbackEnhancedPrompt(rawPrompt, style, options);
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
            text: `Generate only the flat printable artwork texture based on this description. Do not generate a phone, phone case shell, camera hole, product mockup, or device frame. ${enhancedPrompt}`,
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
