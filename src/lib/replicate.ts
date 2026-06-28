const REPLICATE_API_BASE = "https://api.replicate.com";
const DEFAULT_IMAGE_MODEL_CHAIN = ["recraft-ai/recraft-v4.1"];
const MODEL_COOLDOWN_MS = 15 * 60 * 1000;

const unavailableModels = new Map<string, number>();

type ReplicatePredictionStatus =
  | "starting"
  | "processing"
  | "succeeded"
  | "successful"
  | "failed"
  | "canceled";

interface ReplicatePrediction {
  id: string;
  status: ReplicatePredictionStatus;
  output: unknown;
  error: string | null;
  urls?: {
    get?: string;
    web?: string;
  };
}

interface ReplicateErrorBody {
  detail?: string;
  title?: string;
  status?: number;
  error?: string;
}

class ReplicateApiError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly model?: string,
  ) {
    super(message);
    this.name = "ReplicateApiError";
  }
}

const TERMINAL_STATUSES = new Set<ReplicatePredictionStatus>([
  "succeeded",
  "successful",
  "failed",
  "canceled",
]);

function getReplicateToken(): string {
  const token = process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error(
      "REPLICATE_API_TOKEN is not set. Add it to .env.local (server-side only).",
    );
  }
  return token;
}

async function parseReplicateResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | ReplicateErrorBody
    | T
    | null;

  if (!response.ok) {
    const errorBody = body as ReplicateErrorBody | null;
    const detail =
      errorBody?.detail ||
      errorBody?.error ||
      errorBody?.title ||
      response.statusText;
    throw new ReplicateApiError(
      `Replicate API ${response.status}: ${detail}`,
      response.status,
    );
  }

  if (!body) {
    throw new Error("Replicate returned an empty response.");
  }

  return body as T;
}

function getReplicateModelChain(): string[] {
  const configuredModels =
    process.env.REPLICATE_IMAGE_MODELS || process.env.REPLICATE_IMAGE_MODEL;

  const models = configuredModels
    ? configuredModels
        .split(",")
        .map((model) => model.trim())
        .filter(Boolean)
    : DEFAULT_IMAGE_MODEL_CHAIN;

  return [...new Set(models.length > 0 ? models : DEFAULT_IMAGE_MODEL_CHAIN)];
}

function isModelInCooldown(model: string): boolean {
  const cooldownUntil = unavailableModels.get(model);
  if (!cooldownUntil) return false;
  if (Date.now() > cooldownUntil) {
    unavailableModels.delete(model);
    return false;
  }
  return true;
}

function markModelUnavailable(model: string): void {
  unavailableModels.set(model, Date.now() + MODEL_COOLDOWN_MS);
}

function isFallbackEligibleError(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const status = error instanceof ReplicateApiError ? error.status : undefined;

  return (
    status === 402 ||
    status === 408 ||
    status === 409 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    message.includes("quota") ||
    message.includes("credit") ||
    message.includes("billing") ||
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("temporarily unavailable") ||
    message.includes("timed out")
  );
}

interface BuildModelInputOptions {
  negativePrompt?: string;
}

function buildModelInput(
  model: string,
  enhancedPrompt: string,
  options: BuildModelInputOptions = {},
) {
  const negativePrompt = options.negativePrompt;
  const prompt = negativePrompt
    ? `${enhancedPrompt} Must not include: ${negativePrompt}.`
    : enhancedPrompt;

  if (model === "black-forest-labs/flux-schnell") {
    return {
      prompt,
      go_fast: true,
      num_outputs: 1,
      aspect_ratio: "9:16",
      output_format: "webp",
      output_quality: 80,
      num_inference_steps: 4,
      disable_safety_checker: false,
    };
  }

  if (model === "google/imagen-4") {
    return {
      prompt,
      aspect_ratio: "9:16",
      image_size: "1K",
      output_format: "png",
      safety_filter_level: "block_medium_and_above",
    };
  }

  if (model === "black-forest-labs/flux-1.1-pro") {
    return {
      prompt,
      aspect_ratio: "9:16",
      output_format: "png",
      output_quality: 90,
      safety_tolerance: 2,
      prompt_upsampling: true,
    };
  }

  if (model === "ideogram-ai/ideogram-v3-turbo") {
    return {
      prompt,
      aspect_ratio: "9:16",
      resolution: "None",
      style_type: "Design",
      magic_prompt_option: "Auto",
    };
  }

  if (model === "black-forest-labs/flux-dev") {
    return {
      prompt,
      go_fast: true,
      guidance: 3,
      megapixels: "1",
      num_outputs: 1,
      aspect_ratio: "9:16",
      output_format: "png",
      output_quality: 90,
      num_inference_steps: 28,
      disable_safety_checker: false,
    };
  }

  if (
    model === "recraft-ai/recraft-v4.1" ||
    model === "recraft-ai/recraft-v4.1-pro"
  ) {
    return {
      prompt,
      aspect_ratio: "9:16",
    };
  }

  if (model === "recraft-ai/recraft-v4.1-svg") {
    return {
      prompt,
      aspect_ratio: "9:16",
    };
  }

  if (model === "ideogram-ai/ideogram-v4-balanced") {
    return {
      prompt,
      resolution: "None",
      enable_copyright_detection: true,
    };
  }

  if (model === "black-forest-labs/flux-kontext-pro") {
    return {
      prompt,
      aspect_ratio: "9:16",
      output_format: "png",
      safety_tolerance: 2,
      prompt_upsampling: true,
    };
  }

  return {
    prompt,
    aspect_ratio: "9:16",
  };
}

function collectOutputUrls(output: unknown): string[] {
  if (!output) return [];

  if (typeof output === "string") {
    return output.startsWith("http") || output.startsWith("data:")
      ? [output]
      : [];
  }

  if (Array.isArray(output)) {
    return output.flatMap((item) => collectOutputUrls(item));
  }

  if (typeof output === "object") {
    const record = output as Record<string, unknown>;
    const directUrl = record.url || record.uri;
    return [
      ...collectOutputUrls(directUrl),
      ...Object.values(record).flatMap((value) => collectOutputUrls(value)),
    ];
  }

  return [];
}

async function fetchImageAsDataUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith("data:")) return imageUrl;

  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Replicate image output: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get("content-type") || "image/png";
  const bytes = Buffer.from(await response.arrayBuffer());
  return `data:${contentType};base64,${bytes.toString("base64")}`;
}

async function pollPrediction(
  prediction: ReplicatePrediction,
): Promise<ReplicatePrediction> {
  let current = prediction;
  const getUrl = current.urls?.get;

  if (!getUrl) {
    return current;
  }

  const token = getReplicateToken();
  const startedAt = Date.now();
  const timeoutMs = 90_000;

  while (!TERMINAL_STATUSES.has(current.status)) {
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Replicate prediction timed out.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2_000));

    const response = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    current = await parseReplicateResponse<ReplicatePrediction>(response);
  }

  return current;
}

async function runReplicateModel(
  model: string,
  enhancedPrompt: string,
  options: BuildModelInputOptions = {},
): Promise<string> {
  const token = getReplicateToken();
  const response = await fetch(
    `${REPLICATE_API_BASE}/v1/models/${model}/predictions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Prefer: "wait=55",
        "Cancel-After": "90s",
      },
      body: JSON.stringify({
        input: buildModelInput(model, enhancedPrompt, options),
      }),
    },
  );

  const initialPrediction =
    await parseReplicateResponse<ReplicatePrediction>(response);
  const prediction = TERMINAL_STATUSES.has(initialPrediction.status)
    ? initialPrediction
    : await pollPrediction(initialPrediction);

  if (prediction.status === "failed" || prediction.status === "canceled") {
    throw new ReplicateApiError(
      `Replicate prediction ${prediction.status}: ${prediction.error || "No error details returned."}`,
      undefined,
      model,
    );
  }

  const [imageUrl] = collectOutputUrls(prediction.output);
  if (!imageUrl) {
    throw new Error("Replicate response contained no image output URL.");
  }

  return fetchImageAsDataUrl(imageUrl);
}

export async function generateReplicateImage(
  enhancedPrompt: string,
  options: { negativePrompt?: string } = {},
): Promise<{ imageUrl: string; model: string; attemptedModels: string[] }> {
  const modelChain = getReplicateModelChain();
  const attemptedModels: string[] = [];
  let lastError: unknown;

  for (const model of modelChain) {
    if (isModelInCooldown(model)) {
      continue;
    }

    attemptedModels.push(model);

    try {
      const imageUrl = await runReplicateModel(model, enhancedPrompt, {
        negativePrompt: options.negativePrompt,
      });
      return { imageUrl, model, attemptedModels };
    } catch (error) {
      lastError = error;
      console.warn(`[Replicate] ${model} failed, checking fallback:`, error);

      if (!isFallbackEligibleError(error)) {
        throw error;
      }

      markModelUnavailable(model);
    }
  }

  const skippedModels = modelChain.filter(
    (model) => !attemptedModels.includes(model),
  );
  throw new Error(
    `All Replicate image models are unavailable. Attempted: ${attemptedModels.join(", ") || "none"}. Skipped cooldown: ${skippedModels.join(", ") || "none"}. Last error: ${
      lastError instanceof Error ? lastError.message : "Unknown error"
    }`,
  );
}
