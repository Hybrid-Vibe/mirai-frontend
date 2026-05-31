// ----------------------------------------------------------------------
// AI Generation Types
// Types for the Gemini AI image generation pipeline.
// ----------------------------------------------------------------------

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
}

/** A single generated design variant */
export interface GeneratedDesign {
  /** Unique ID for this design */
  id: string;
  /** Base64 data URL of the generated image (data:image/png;base64,...) */
  imageUrl: string;
  /** The enhanced prompt used for generation (English) */
  enhancedPrompt: string;
}

/** Successful response from POST /api/generate */
export interface GenerateResponse {
  /** Array of generated design variants (typically 3) */
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
