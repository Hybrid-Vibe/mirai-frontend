// ----------------------------------------------------------------------
// AI Generation Types
// Types for the AI image generation pipeline.
// ----------------------------------------------------------------------

// ======================================================================
// Design Style System
// ======================================================================

/** Available design styles for phone case artwork generation */
export type DesignStyle =
  | "pop-art-floral"
  | "kawaii-pastel"
  | "textile-pattern"
  | "y2k-dreamy"
  | "luxury-gem";

/** Style option definition for UI rendering */
export interface StyleOption {
  value: DesignStyle;
  label: string;
  emoji: string;
  description: string;
}

/** All available style options for the UI selector */
export const DESIGN_STYLE_OPTIONS: StyleOption[] = [
  {
    value: "pop-art-floral",
    label: "Pop Art Floral",
    emoji: "🌸",
    description: "Hoa pop art, halftone, gemstone",
  },
  {
    value: "kawaii-pastel",
    label: "Kawaii Pastel",
    emoji: "🦋",
    description: "Pastel dễ thương, crayon",
  },
  {
    value: "textile-pattern",
    label: "Textile Pattern",
    emoji: "🧶",
    description: "Họa tiết vải dệt tối giản",
  },
  {
    value: "y2k-dreamy",
    label: "Y2K Dreamy",
    emoji: "✨",
    description: "Holographic, dreamy pastel",
  },
  {
    value: "luxury-gem",
    label: "Luxury Gem",
    emoji: "💎",
    description: "Gemstone collage sang trọng",
  },
];

// ======================================================================
// Style Prompt Injection Map
// Each style injects specific visual directives into the prompt.
// ======================================================================

export const STYLE_PROMPT_SUFFIX: Record<DesignStyle, string> = {
  "pop-art-floral":
    "pop art, halftone print texture, floating colorful gemstones, crescent moon elements, soft motion blur trails, high contrast duotone colors, vibrant gradient background, luxury fashion poster aesthetic",
  "kawaii-pastel":
    "pastel illustration, crayon texture, paper cutout effect, soft pastel colors, cute kawaii aesthetic, handmade scrapbook feel",
  "textile-pattern":
    "seamless repeating pattern, woven fabric texture, clean minimal design, fashion textile aesthetic, Scandinavian style",
  "y2k-dreamy":
    "holographic iridescent effect, dreamy pastel gradients, cute Y2K elements, sparkle stars, soft glow aura, nostalgic 2000s aesthetic",
  "luxury-gem":
    "gemstone collage, luxury fashion print, crystal facets, metallic gold accents, rich jewel tones, high-end editorial aesthetic",
};

// ======================================================================
// Phone Case Base Suffix (always appended to every prompt)
// ======================================================================

export const PHONE_CASE_BASE_SUFFIX =
  "phone case artwork, premium print, vertical composition, center-safe layout, print-ready design, high detail, clean edges, balanced composition, no text, no watermark";

// ======================================================================
// Negative Prompts
// ======================================================================

/** Base negative prompt — applies to all styles */
export const BASE_NEGATIVE_PROMPT =
  "person, human, face, portrait, hands, body, text, letters, logo, watermark, signature, frame, border, phone mockup, camera hole, cropped object, cut off subject, low quality, blurry, pixelated, artifact, deformed";

/** Additional negative prompt for floral styles (pop-art-floral, luxury-gem) */
export const FLORAL_NEGATIVE_PROMPT =
  "flower touching edge, cropped petals, flower cut off, multiple flowers, busy composition, background objects overlapping flower, extra petals, mutated leaves";

/** Additional negative prompt for pattern styles (kawaii-pastel, textile-pattern, y2k-dreamy) */
export const PATTERN_NEGATIVE_PROMPT =
  "single object, large centered object, asymmetrical layout, random clutter, uneven spacing, distorted pattern, broken repeat";

/** Get the full negative prompt for a given style */
export function getNegativePromptForStyle(style: DesignStyle): string {
  if (style === "pop-art-floral" || style === "luxury-gem") {
    return `${BASE_NEGATIVE_PROMPT}, ${FLORAL_NEGATIVE_PROMPT}`;
  }
  if (
    style === "kawaii-pastel" ||
    style === "textile-pattern" ||
    style === "y2k-dreamy"
  ) {
    return `${BASE_NEGATIVE_PROMPT}, ${PATTERN_NEGATIVE_PROMPT}`;
  }
  return BASE_NEGATIVE_PROMPT;
}

// ======================================================================
// Standard constant (kept for backward compatibility)
// ======================================================================

export const STANDARD_NEGATIVE_PROMPT = BASE_NEGATIVE_PROMPT;

// ======================================================================
// API Request/Response Types
// ======================================================================

/** Request body sent from client → POST /api/generate */
export interface GenerateRequest {
  /** User's raw prompt (Vietnamese or English) */
  prompt: string;
  /** Phone model for mockup context (e.g., "iPhone 15 Pro Max") */
  phoneModel: string;
  /** Design style hint (optional) */
  style?: string;
  /** Reference image as base64 data URL (optional) */
  refImage?: string;
  /** Negative prompt for visual exclusion (optional) */
  negativePrompt?: string;
}

/** A single generated design variant */
export interface GeneratedDesign {
  /** Unique ID for this design */
  id: string;
  /** Data URL of the generated image (data:image/png;base64,...) */
  imageUrl: string;
  /** The enhanced prompt used for generation (English) */
  enhancedPrompt: string;
  /** AI model that produced this image, useful for fallback/debugging */
  model?: string;
}

/** Successful response from POST /api/generate */
export interface GenerateResponse {
  /** Array of generated design variants */
  designs: GeneratedDesign[];
  /** Total generation time in milliseconds */
  durationMs: number;
}

/** Error response from POST /api/generate */
export interface GenerateErrorResponse {
  error: string;
  code:
    | "INVALID_PROMPT"
    | "GENERATION_FAILED"
    | "RATE_LIMITED"
    | "SERVER_ERROR";
}

/** Status for async generation jobs (future use with polling) */
export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";
