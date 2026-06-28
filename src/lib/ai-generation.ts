import {
  AI_IMAGE_MODELS,
  COLOR_PRESET_OPTIONS,
  PHONE_CASE_BASE_SUFFIX,
  STYLE_PROMPT_SUFFIX,
  type ColorPreset,
  type DesignStyle,
  type ModelRoutingResult,
  type PromptClassifierInput,
  type PromptClassifierOutput,
  type PromptMode,
  type QualityLevel,
  getNegativePromptForGeneration,
} from "@/types/ai";

const CHARACTER_PATTERNS = [
  /from\s+[a-z0-9\s.'-]+/i,
  /trong\s+[a-z0-9\s.'-]+/i,
  /anime character/i,
  /game character/i,
  /cartoon character/i,
  /cosplay/i,
  /fanart/i,
  /dandadan|dan da dan/i,
  /naruto/i,
  /one piece/i,
  /jujutsu kaisen|jjk/i,
  /demon slayer|kimetsu/i,
  /genshin/i,
  /honkai/i,
  /pokemon|pikachu/i,
  /dragon ball|goku/i,
  /doraemon/i,
];

const TEXT_PATTERNS = [
  /\b(text|typography|lettering|quote)\b/i,
  /\b(co|có)\s+ch[uữ]\b/i,
  /\b(ch[uữ]|word|name|t[eê]n)\s*[:：]/i,
  /\b(viet|viết|ghi)\s+["'`“”A-Z0-9À-Ỹ]/,
  /["'`“”][^"'`“”]{1,48}["'`“”]/,
];

const VECTOR_PATTERNS = [
  /\b(vector|svg|icon|logo|badge|mascot|line art)\b/i,
  /\b(sticker|decal|nhan dan|nhãn dán|bieu tuong|biểu tượng)\b/i,
];

export interface ClientPromptEnhancerInput {
  userPrompt: string;
  selectedStyle: DesignStyle;
  colorPreset?: ColorPreset;
  customColor?: string;
  mode: PromptMode;
  wantsText?: boolean;
  hasReferenceImage?: boolean;
}

export interface GenerationPlan {
  classification: PromptClassifierOutput;
  routing: ModelRoutingResult;
  enhancedPromptDraft: string;
  negativePrompt: string;
  qualityLevel: QualityLevel;
}

export interface BuildGenerationPlanInput {
  userPrompt: string;
  selectedStyle: DesignStyle;
  colorPreset?: ColorPreset;
  customColor?: string;
  wantsText?: boolean;
  qualityLevel?: QualityLevel;
  referenceImageUrl?: string | null;
}

export function detectSpecificCharacter(prompt: string): boolean {
  return CHARACTER_PATTERNS.some((pattern) => pattern.test(prompt));
}

function detectTextRequest(prompt: string, wantsText?: boolean): boolean {
  if (wantsText) return true;
  return TEXT_PATTERNS.some((pattern) => pattern.test(prompt));
}

function detectVectorIntent(prompt: string, wantsVector?: boolean): boolean {
  if (wantsVector) return true;
  return VECTOR_PATTERNS.some((pattern) => pattern.test(prompt));
}

function extractCharacterName(prompt: string): string | undefined {
  const fromMatch = prompt.match(
    /([a-zA-ZÀ-ỹ0-9.'\s-]{2,64})\s+(?:from|trong)\s+([a-zA-ZÀ-ỹ0-9.'\s-]{2,64})/i,
  );

  if (fromMatch?.[1]) {
    return fromMatch[1].trim().replace(/^tạo\s+/i, "");
  }

  const knownMatch = prompt.match(
    /(ayase momo|momo ayase|luffy|goku|doraemon|pikachu|naruto)/i,
  );

  return knownMatch?.[1];
}

export function classifyPrompt(
  input: PromptClassifierInput,
): PromptClassifierOutput {
  const prompt = input.userPrompt.trim();
  const hasReferenceImage = Boolean(input.referenceImageUrl);
  const isSpecificCharacter = detectSpecificCharacter(prompt);
  const hasTextRequest = detectTextRequest(prompt, input.wantsText);
  const wantsVector = detectVectorIntent(prompt, input.wantsVector);

  let recommendedMode: PromptMode = "generic";
  if (hasReferenceImage) {
    recommendedMode = "reference";
  } else if (isSpecificCharacter) {
    recommendedMode = "character";
  } else if (hasTextRequest) {
    recommendedMode = "text";
  } else if (wantsVector) {
    recommendedMode = "vector";
  }

  const characterName = isSpecificCharacter
    ? extractCharacterName(prompt)
    : undefined;

  const riskLevel =
    isSpecificCharacter && !hasReferenceImage
      ? "high"
      : hasTextRequest || wantsVector
        ? "medium"
        : "low";

  const userFacingMessage =
    isSpecificCharacter && !hasReferenceImage
      ? "Mình phát hiện bạn muốn tạo nhân vật cụ thể. Tải ảnh mẫu sẽ giúp AI bám visual hơn; nếu bỏ qua, kết quả có thể chỉ là thiết kế lấy cảm hứng."
      : undefined;

  return {
    isSpecificCharacter,
    characterName,
    hasTextRequest,
    wantsVector,
    isGenericDesign: recommendedMode === "generic",
    recommendedMode,
    riskLevel,
    userFacingMessage,
  };
}

export function chooseImageModel(): string {
  return AI_IMAGE_MODELS.primary;
}

export function buildModelRouting(): ModelRoutingResult {
  const suggestedModel = chooseImageModel();

  return {
    suggestedModel,
    fallbackModel: suggestedModel,
    routingReason: "single-primary-model",
    requiresBackendRouting: false,
  };
}

function getColorPrompt(
  colorPreset: ColorPreset = "auto",
  customColor?: string,
): string {
  if (colorPreset === "custom" && customColor) {
    return `Use ${customColor} as the dominant color anchor with harmonious supporting colors.`;
  }

  return (
    COLOR_PRESET_OPTIONS.find((option) => option.value === colorPreset)
      ?.prompt ?? COLOR_PRESET_OPTIONS[0].prompt
  );
}

export function buildClientEnhancedPrompt(
  input: ClientPromptEnhancerInput,
): string {
  const stylePrompt = STYLE_PROMPT_SUFFIX[input.selectedStyle];
  const colorPrompt = getColorPrompt(input.colorPreset, input.customColor);
  const textInstruction = input.wantsText
    ? "Include only the exact text requested by the user, with clean readable typography and no extra words."
    : "No text, no random typography, no letters.";
  const modeInstruction =
    input.mode === "reference"
      ? "Use the provided reference image to preserve the visual identity and adapt it into a clean modern flat print artwork texture."
      : input.mode === "character"
        ? "If the idea mentions a specific existing character and no reference image is provided, create an original inspired design without promising exact character fidelity."
        : input.mode === "vector"
          ? "Favor clean vector-like shapes, crisp edges, and simple print-friendly silhouettes."
          : input.mode === "text"
            ? "Prioritize readable composition for the requested lettering."
            : "Keep the user's original idea as the main subject.";

  return [
    `Create only a flat printable artwork image based on this idea: "${input.userPrompt}". Do not generate a phone, phone case, product mockup, camera hole, or device frame.`,
    `Style direction: ${stylePrompt}`,
    `Color direction: ${colorPrompt}`,
    `Mode direction: ${modeInstruction}`,
    `Design requirements: ${PHONE_CASE_BASE_SUFFIX}`,
    textInstruction,
  ].join(" ");
}

export function buildGenerationPlan(
  input: BuildGenerationPlanInput,
): GenerationPlan {
  const qualityLevel = input.qualityLevel ?? "standard";
  const classification = classifyPrompt({
    userPrompt: input.userPrompt,
    selectedStyle: input.selectedStyle,
    wantsText: input.wantsText,
    referenceImageUrl: input.referenceImageUrl,
  });
  const mode = classification.recommendedMode;
  const hasReferenceImage = Boolean(input.referenceImageUrl);
  const hasText = input.wantsText ?? classification.hasTextRequest;

  return {
    classification,
    routing: buildModelRouting(),
    enhancedPromptDraft: buildClientEnhancedPrompt({
      userPrompt: input.userPrompt,
      selectedStyle: input.selectedStyle,
      colorPreset: input.colorPreset,
      customColor: input.customColor,
      mode,
      wantsText: hasText,
      hasReferenceImage,
    }),
    negativePrompt: getNegativePromptForGeneration({
      style: input.selectedStyle,
      mode,
      wantsText: hasText,
    }),
    qualityLevel,
  };
}
