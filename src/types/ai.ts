// ----------------------------------------------------------------------
// AI Generation Types
// Types and shared constants for the AI phone case generation pipeline.
// ----------------------------------------------------------------------

// ======================================================================
// Design Style System
// ======================================================================

/** New MVP presets shown to customers. */
export type ModernDesignStyle =
  | "minimal"
  | "cute-sticker"
  | "streetwear"
  | "y2k-modern"
  | "anime-clean"
  | "luxury";

/** Legacy values are kept so old saved designs and requests remain valid. */
export type LegacyDesignStyle =
  | "pop-art-floral"
  | "kawaii-pastel"
  | "textile-pattern"
  | "y2k-dreamy"
  | "luxury-gem";

/** Available design styles for phone case artwork generation. */
export type DesignStyle = ModernDesignStyle | LegacyDesignStyle;

export type ColorPreset =
  | "auto"
  | "pastel"
  | "monochrome"
  | "neon"
  | "pink"
  | "blue"
  | "earth"
  | "custom";

export type QualityLevel = "preview" | "standard" | "premium";

export type PromptMode =
  | "generic"
  | "text"
  | "character"
  | "reference"
  | "vector";

export type RiskLevel = "low" | "medium" | "high";

/** Style option definition for UI rendering. */
export interface StyleOption {
  value: DesignStyle;
  label: string;
  description: string;
  descriptionEn: string;
  prompt: string;
  emoji?: string;
}

export interface ColorPresetOption {
  value: ColorPreset;
  label: string;
  labelEn: string;
  prompt: string;
  swatches: string[];
}

export const DESIGN_STYLE_VALUES = [
  "minimal",
  "cute-sticker",
  "streetwear",
  "y2k-modern",
  "anime-clean",
  "luxury",
  "pop-art-floral",
  "kawaii-pastel",
  "textile-pattern",
  "y2k-dreamy",
  "luxury-gem",
] as const satisfies readonly DesignStyle[];

/** All available style options for the UI selector. */
export const DESIGN_STYLE_OPTIONS: StyleOption[] = [
  {
    value: "minimal",
    label: "Minimal",
    description: "Gọn, sạch, nhiều khoảng thở",
    descriptionEn: "Clean, airy, lots of breathing room",
    prompt:
      "Minimal premium illustration, clean lines, soft shadows, subtle color palette, elegant negative space, modern lifestyle product aesthetic.",
  },
  {
    value: "cute-sticker",
    label: "Cute Sticker",
    description: "Sticker dễ thương, nét rõ",
    descriptionEn: "Adorable sticker style, bold outlines",
    prompt:
      "Cute sticker-style illustration, bold clean outline, soft rounded shapes, playful but not childish, trendy Korean stationery aesthetic.",
  },
  {
    value: "streetwear",
    label: "Streetwear",
    description: "Táo bạo, graphic, tương phản",
    descriptionEn: "Bold, graphic, high contrast",
    prompt:
      "Bold streetwear graphic, high contrast, edgy composition, modern apparel print style, clean vector-like details.",
  },
  {
    value: "y2k-modern",
    label: "Y2K Modern",
    description: "Chrome, glow, hiện đại",
    descriptionEn: "Chrome, glow, futuristic",
    prompt:
      "Modern Y2K-inspired design, chrome accents, dreamy glow, playful futuristic mood, clean and not overdecorated.",
  },
  {
    value: "anime-clean",
    label: "Anime Clean",
    description: "Anime sáng, ít rối",
    descriptionEn: "Bright anime style, uncluttered",
    prompt:
      "Clean anime-inspired illustration, soft cinematic lighting, elegant composition, detailed but not cluttered, no old anime poster look.",
  },
  {
    value: "luxury",
    label: "Luxury",
    description: "Cao cấp, tinh gọn, polished",
    descriptionEn: "Premium, refined, polished",
    prompt:
      "Premium editorial design, refined color palette, elegant lighting, high-end accessory branding feel, minimal and polished.",
  },
];

export const COLOR_PRESET_OPTIONS: ColorPresetOption[] = [
  {
    value: "auto",
    label: "AI tự chọn màu",
    labelEn: "AI Pick Color",
    prompt: "Use a tasteful modern color palette that fits the user's idea.",
    swatches: ["#f7f7f2", "#222222", "#6c7df7"],
  },
  {
    value: "pastel",
    label: "Pastel",
    labelEn: "Pastel",
    prompt: "Soft pastel palette with gentle contrast and clean highlights.",
    swatches: ["#f7c8e0", "#c7f0db", "#b8d8ff"],
  },
  {
    value: "monochrome",
    label: "Đen trắng",
    labelEn: "Monochrome",
    prompt: "Black and white palette with refined contrast and crisp details.",
    swatches: ["#0f0f0f", "#ffffff", "#b8b8b8"],
  },
  {
    value: "neon",
    label: "Neon",
    labelEn: "Neon",
    prompt: "Controlled neon accents on a clean base, vibrant but not messy.",
    swatches: ["#101014", "#39ff88", "#ff3df2"],
  },
  {
    value: "pink",
    label: "Hồng",
    labelEn: "Pink",
    prompt: "Pink-led palette with balanced highlights and premium softness.",
    swatches: ["#ffe2ef", "#ff7ab6", "#53314c"],
  },
  {
    value: "blue",
    label: "Xanh",
    labelEn: "Blue",
    prompt: "Blue-led palette with airy contrast and modern fresh energy.",
    swatches: ["#e2f0ff", "#3772ff", "#0e2a47"],
  },
  {
    value: "earth",
    label: "Earth",
    labelEn: "Earth",
    prompt:
      "Earthy natural palette with muted greens, clay, ivory, and calm contrast.",
    swatches: ["#f2eadf", "#7b8b5f", "#b26d4b"],
  },
  {
    value: "custom",
    label: "Tuỳ chọn màu",
    labelEn: "Custom Color",
    prompt: "Use the customer's custom color as the dominant palette anchor.",
    swatches: ["#ffffff", "#888888", "#111111"],
  },
];

export function isDesignStyle(value: unknown): value is DesignStyle {
  return (
    typeof value === "string" &&
    DESIGN_STYLE_VALUES.includes(value as DesignStyle)
  );
}

export function normalizeDesignStyle(value: unknown): DesignStyle {
  return isDesignStyle(value) ? value : "minimal";
}

// ======================================================================
// Model Routing Config
// Model IDs are safe constants; provider API tokens must stay server-side.
// ======================================================================

export const AI_IMAGE_MODELS = {
  primary: "recraft-ai/recraft-v4.1",
} as const;

// ======================================================================
// Style Prompt Injection Map
// Each style injects specific visual directives into the prompt.
// ======================================================================

const LEGACY_STYLE_PROMPT_SUFFIX: Record<LegacyDesignStyle, string> = {
  "pop-art-floral":
    "modern floral pop-art illustration, clean halftone texture, controlled duotone accents, centered focal flower, polished accessory artwork",
  "kawaii-pastel":
    "soft pastel kawaii illustration, rounded shapes, clean sticker-like details, playful stationery aesthetic, balanced spacing",
  "textile-pattern":
    "clean textile-inspired pattern, woven texture, minimal repeating motif, Scandinavian fashion accessory aesthetic",
  "y2k-dreamy":
    "modern Y2K-inspired design, iridescent accents, dreamy glow, clean futuristic mood, not overdecorated",
  "luxury-gem":
    "luxury gemstone-inspired editorial artwork, refined jewel tones, subtle metallic accents, premium accessory aesthetic",
};

export const STYLE_PROMPT_SUFFIX: Record<DesignStyle, string> = {
  ...Object.fromEntries(
    DESIGN_STYLE_OPTIONS.map((option) => [option.value, option.prompt]),
  ),
  ...LEGACY_STYLE_PROMPT_SUFFIX,
} as Record<DesignStyle, string>;

// ======================================================================
// Phone Case Base Suffix (always appended to every prompt)
// ======================================================================

export const PHONE_CASE_BASE_SUFFIX =
  "flat printable artwork texture for a phone case surface, not a product photo and not a phone case mockup, vertical 9:16 composition, main subject placed in the bottom center / lower-middle safe area, generous clean space in the top 30% for the real phone camera cluster that will be overlaid later, keep the upper-left camera zone free of important details, balanced negative space, clean background, crisp printable details, premium ecommerce artwork, full-bleed design canvas, avoid tiny details near edges, no phone, no phone case shell, no camera cutout, no camera lens, no device frame, no watermark, no logo, no border, avoid outdated clipart, avoid cheesy 2010s poster style";

// ======================================================================
// Negative Prompts
// ======================================================================

/** Base negative prompt — applies to all styles. */
export const BASE_NEGATIVE_PROMPT =
  "phone, smartphone, iphone, samsung phone, phone case, case shell, transparent case, product mockup, mockup photo, device frame, camera lens, camera module, camera bump, camera hole, camera cutout, hand holding phone, product photography, realistic phone render, watermark, signature, logo, frame, border, main subject near top edge, important details in upper-left camera zone, cropped object, cut off subject, low quality, blurry, pixelated, artifact, cluttered background, outdated clipart, cheesy poster effects, messy gradients";

/** Text should be blocked unless the user explicitly requests it. */
export const NO_TEXT_NEGATIVE_PROMPT =
  "random text, letters, typography, misspelled words, captions, brand names";

/** Character/reference generations should avoid anatomical glitches instead of blocking people entirely. */
export const CHARACTER_NEGATIVE_PROMPT =
  "deformed face, extra fingers, extra limbs, distorted anatomy, duplicated character, crowded scene";

/** Generic generations usually should not invent people if the user did not ask. */
export const GENERIC_SUBJECT_NEGATIVE_PROMPT =
  "unrequested person, unrequested portrait, hands covering design";

/** Additional negative prompt for pattern styles. */
export const PATTERN_NEGATIVE_PROMPT =
  "random clutter, uneven spacing, distorted pattern, broken repeat, tiny unreadable details";

export interface NegativePromptOptions {
  style?: DesignStyle;
  mode?: PromptMode;
  wantsText?: boolean;
}

/** Get the full negative prompt for a generation context. */
export function getNegativePromptForGeneration({
  style = "minimal",
  mode = "generic",
  wantsText = false,
}: NegativePromptOptions = {}): string {
  const parts = [BASE_NEGATIVE_PROMPT];

  if (!wantsText) {
    parts.push(NO_TEXT_NEGATIVE_PROMPT);
  }

  if (mode === "character" || mode === "reference") {
    parts.push(CHARACTER_NEGATIVE_PROMPT);
  } else {
    parts.push(GENERIC_SUBJECT_NEGATIVE_PROMPT);
  }

  if (
    style === "textile-pattern" ||
    style === "kawaii-pastel" ||
    style === "y2k-dreamy"
  ) {
    parts.push(PATTERN_NEGATIVE_PROMPT);
  }

  return parts.join(", ");
}

/** Get the full negative prompt for a given style. */
export function getNegativePromptForStyle(style: DesignStyle): string {
  return getNegativePromptForGeneration({ style });
}

// ======================================================================
// Classifier, Routing, Metadata Types
// ======================================================================

export interface PromptClassifierInput {
  userPrompt: string;
  selectedStyle?: DesignStyle;
  wantsText?: boolean;
  wantsVector?: boolean;
  referenceImageUrl?: string | null;
}

export interface PromptClassifierOutput {
  isSpecificCharacter: boolean;
  characterName?: string;
  hasTextRequest: boolean;
  wantsVector: boolean;
  isGenericDesign: boolean;
  recommendedMode: PromptMode;
  riskLevel: RiskLevel;
  userFacingMessage?: string;
}

export interface ModelRoutingResult {
  suggestedModel: string;
  fallbackModel: string;
  routingReason: string;
  requiresBackendRouting: boolean;
}

export interface GenerationMetadata {
  generationId?: string;
  userId?: string;
  originalPrompt: string;
  enhancedPrompt?: string;
  selectedStyle: DesignStyle;
  colorPreset?: ColorPreset;
  model?: string;
  suggestedModel?: string;
  mode: PromptMode;
  qualityLevel: QualityLevel;
  referenceImageUrl?: string;
  outputImageUrls?: string[];
  selectedImageUrl?: string;
  createdAt?: string;
}

// ======================================================================
// API Request/Response Types
// ======================================================================

/** Request body sent from client -> backend AI generation endpoint. */
export interface GenerateRequest {
  /** User's raw prompt (Vietnamese or English). */
  prompt: string;
  /** Phone model for mockup context (e.g. "iPhone 15 Pro Max"). */
  phoneModel: string;
  /** Design style hint. */
  style?: DesignStyle | string;
  /** Reference image as base64 data URL (optional). */
  refImage?: string;
  /** Negative prompt for visual exclusion (optional). */
  negativePrompt?: string;
  /** Simple color direction selected in the frontend UI. */
  colorPreset?: ColorPreset;
  /** Hex color when colorPreset === "custom". */
  customColor?: string;
  /** Whether the user explicitly wants text in the artwork. */
  wantsText?: boolean;
  /** Internal compatibility field. UI no longer exposes quality selection. */
  qualityLevel?: QualityLevel;
  /** Frontend classifier mode. */
  promptMode?: PromptMode;
  /** Frontend classifier result for backend logging/routing. */
  classification?: PromptClassifierOutput;
  /** Frontend prompt-builder draft; server may ignore and rebuild safely. */
  enhancedPromptDraft?: string;
  /** Debug metadata for future backend persistence. */
  metadata?: Partial<GenerationMetadata>;
}

/** A single generated design variant. */
export interface GeneratedDesign {
  /** Unique ID for this design. */
  id: string;
  /** Data URL of the generated image (data:image/png;base64,...). */
  imageUrl: string;
  /** The enhanced prompt used for generation (English). */
  enhancedPrompt: string;
  /** AI model that produced this image, useful for fallback/debugging. */
  model?: string;
  /** Model the frontend router recommended for this request. */
  suggestedModel?: string;
  /** Classifier mode used for the request. */
  promptMode?: PromptMode;
}

/** Successful response normalized from backend AI generation endpoint. */
export interface GenerateResponse {
  /** Array of generated design variants. */
  designs: GeneratedDesign[];
  /** Total generation time in milliseconds. */
  durationMs: number;
  classification?: PromptClassifierOutput;
  routing?: ModelRoutingResult;
  qualityLevel?: QualityLevel;
}

/** Error response from AI generation. */
export interface GenerateErrorResponse {
  error: string;
  code:
    | "INVALID_PROMPT"
    | "GENERATION_FAILED"
    | "RATE_LIMITED"
    | "SERVER_ERROR";
}

/** Status for async generation jobs (future use with polling). */
export type GenerationStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export const STANDARD_NEGATIVE_PROMPT =
  "phone mockup, 3D case render, camera cutout, phone borders, low quality, deformed, blurry, text, watermark, signature";
