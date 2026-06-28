"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import {
  ImagePlus,
  Sparkles,
  Type,
  Trash2,
  Layers,
  Eye,
  EyeOff,
  Grid3X3,
  Camera,
  ShoppingCart,
  Palette,
  X,
  AlertTriangle,
} from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { aiApi } from "@/lib/api-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import type Konva from "konva";
import type { PhoneCaseArAssets } from "@/components/features/customize/PhoneCaseViewer";

import { useDesignStore } from "@/lib/store";
import { useCartStore } from "@/stores/cart-store";
import { COLOR_PRESET_OPTIONS, DESIGN_STYLE_OPTIONS } from "@/types/ai";
import { buildGenerationPlan } from "@/lib/ai-generation";
import { getFriendlyErrorMessage } from "@/lib/utils";
import {
  PHONE_CASE_TEMPLATES,
  PREVIEW_MAX_HEIGHT,
  PREVIEW_MAX_WIDTH,
  getDisplayScale,
  getTemplateById,
} from "@/constants/phone-templates";

const DynamicDesignEditor = dynamic(
  () => import("@/components/features/customize/DesignEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-muted w-full h-full rounded-2xl" />
    ),
  },
);

const DynamicPhoneCaseViewer = dynamic(
  () => import("@/components/features/customize/PhoneCaseViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-muted/50 w-full h-full rounded-2xl flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          Đang tải 3D viewer...
        </div>
      </div>
    ),
  },
);

const SUPABASE_STORAGE_URL =
  "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/phone-models";
const CUSTOM_DESIGN_TEMPLATE_VERSION = "phone-case-templates-v1";
const CUSTOM_CASE_SHELL_VERSION = "frontend-shell-v2";

const PRESET_COLORS = [
  "#ffffff",
  "#0f0f0f",
  "#4349e7",
  "#48e1ed",
  "#db4444",
  "#2fc05d",
  "#ffad33",
  "#e7b6ff",
  "#f39ab6",
];

const CASE_BG_PRESETS = [
  "#1a1a2e",
  "#0f0f0f",
  "#ffffff",
  "#f5e6d3",
  "#2d1b69",
  "#1b3a4b",
  "#4a1942",
  "#0d3b0d",
];
const DEFAULT_CASE_BG_COLOR = "#1a1a2e";

function getCenteredTemplatePosition(
  template: (typeof PHONE_CASE_TEMPLATES)[number] | null,
  width: number,
  height: number,
) {
  if (!template) {
    return { x: 80, y: 200 };
  }

  return {
    x: template.bleedPx + Math.max(0, (template.printAreaWidth - width) / 2),
    y: template.bleedPx + Math.max(0, (template.printAreaHeight - height) / 2),
  };
}

export default function CustomizePage() {
  const router = useRouter();
  const stageRef = useRef<Konva.Stage | null>(null);

  const {
    phoneModel,
    setPhoneModel,
    prompt,
    setPrompt,
    generatedImages,
    setGeneratedImages,
    selectedImage,
    setSelectedImage,
    addElement,
    updateElement,
    removeElement,
    elements,
    setElements,
    selectedElementId,
    setSelectedElementId,
    canvasDataUrl,
    setCanvasDataUrl,
    setSelectedTemplate,
    showGuides,
    setShowGuides,
    showCameraCutout,
    setShowCameraCutout,
    setBackgroundImage,
    user,
    designStyle,
    setDesignStyle,
    colorPreset,
    setColorPreset,
    customColor,
    setCustomColor,
    wantsText,
    setWantsText,
  } = useDesignStore();

  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [isGenerating, setIsGenerating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [bgColor, setBgColor] = useState(DEFAULT_CASE_BG_COLOR);
  const [casePreviewTextureUrl, setCasePreviewTextureUrl] = useState<
    string | null
  >(null);
  const [arPreviewAssets, setArPreviewAssets] =
    useState<PhoneCaseArAssets | null>(null);
  const [hasEditedCaseBackground, setHasEditedCaseBackground] = useState(false);
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Bricolage Grotesque");
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [canvasResetRevision, setCanvasResetRevision] = useState(0);

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const previousTemplateIdRef = useRef<string | null>(null);
  const shouldLoadTurnstile = false;
  const pendingGenerateRef = useRef(false);
  const [refImage, setRefImage] = useState<string | null>(null);
  const pendingModelResetRef = useRef<string | null>(null);

  const [maxPreviewWidth, setMaxPreviewWidth] = useState(PREVIEW_MAX_WIDTH);
  const [maxPreviewHeight, setMaxPreviewHeight] = useState(PREVIEW_MAX_HEIGHT);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setMaxPreviewWidth(w - 48);
        setMaxPreviewHeight((w - 48) * (620 / 420));
      } else if (w < 768) {
        setMaxPreviewWidth(380);
        setMaxPreviewHeight(380 * (620 / 420));
      } else {
        setMaxPreviewWidth(PREVIEW_MAX_WIDTH);
        setMaxPreviewHeight(PREVIEW_MAX_HEIGHT);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRefImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng tải lên định dạng hình ảnh! 🖼️");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không vượt quá 5MB! ⚠️");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setRefImage(reader.result as string);
      toast.success("Đã tải hình tham khảo thành công! ✨");
    };
    reader.onerror = () => {
      toast.error("Lỗi khi đọc file ảnh! ❌");
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveRefImage = () => {
    setRefImage(null);
    toast.success("Đã xóa hình tham khảo! 🗑️");
  };

  // Derive selected element
  const selectedElement = elements.find((el) => el.id === selectedElementId);

  // Helper functions to sync text changes to elements
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { color });
    }
  };

  const handleFontChange = (font: string) => {
    setFontFamily(font);
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { fontFamily: font });
    }
  };

  const handleSizeChange = (size: number) => {
    setFontSize(size);
    if (selectedElement && selectedElement.type === "text") {
      updateElement(selectedElement.id, { fontSize: size });
    }
  };

  const handleCaseBackgroundChange = (color: string) => {
    setBgColor(color);
    setHasEditedCaseBackground(true);
    setCanvasDataUrl(null);
    setCasePreviewTextureUrl(null);
    setArPreviewAssets(null);
  };

  // Sync selected text element values back to the control inputs when selection changes
  useEffect(() => {
    if (selectedElement && selectedElement.type === "text") {
      Promise.resolve().then(() => {
        if (selectedElement.fontFamily)
          setFontFamily(selectedElement.fontFamily);
        if (selectedElement.fontSize) setFontSize(selectedElement.fontSize);
        if (selectedElement.color) setSelectedColor(selectedElement.color);
      });
    }
  }, [selectedElementId, selectedElement]);

  // Derive model URL for 3D preview
  const currentTemplate = useMemo(() => {
    if (!phoneModel) return null;

    return (
      getTemplateById(phoneModel) ??
      PHONE_CASE_TEMPLATES.find((template) => template.label === phoneModel) ??
      null
    );
  }, [phoneModel]);
  const modelUrl = currentTemplate
    ? `${SUPABASE_STORAGE_URL}/${currentTemplate.glbFile}`
    : null;
  const previewScale = currentTemplate
    ? getDisplayScale(currentTemplate, maxPreviewWidth, maxPreviewHeight)
    : Math.min(maxPreviewWidth / 960, maxPreviewHeight / 1200);
  const previewDisplayWidth = Math.round(
    (currentTemplate?.canvasWidth ?? 960) * previewScale,
  );
  const previewDisplayHeight = Math.round(
    (currentTemplate?.canvasHeight ?? 1200) * previewScale,
  );
  const hasSelfCustomDesign = Boolean(
    mode === "self" && (elements.length > 0 || hasEditedCaseBackground),
  );
  const hasAiPreviewDesign = Boolean(
    mode === "ai" && (selectedImage || elements.length > 0),
  );
  const shouldApplyCaseTexture = Boolean(
    casePreviewTextureUrl && (hasSelfCustomDesign || hasAiPreviewDesign),
  );
  const shouldShowCaseSurface = hasSelfCustomDesign || hasAiPreviewDesign;
  const aiGenerationPlan = useMemo(
    () =>
      buildGenerationPlan({
        userPrompt: prompt,
        selectedStyle: designStyle,
        colorPreset,
        customColor,
        wantsText,
        qualityLevel: "standard",
        referenceImageUrl: refImage,
      }),
    [prompt, designStyle, colorPreset, customColor, wantsText, refImage],
  );
  const resetCanvasForModelChange = useCallback(() => {
    setElements([]);
    setSelectedElementId(null);
    setSelectedImage(null);
    setBackgroundImage(null);
    setCanvasDataUrl(null);
    setCasePreviewTextureUrl(null);
    setArPreviewAssets(null);
    setBgColor(DEFAULT_CASE_BG_COLOR);
    setHasEditedCaseBackground(false);
    setTextInput("");
    setSelectedColor("#ffffff");
    setFontSize(32);
    setFontFamily("Bricolage Grotesque");
    setCanvasResetRevision((revision) => revision + 1);
  }, [
    setBackgroundImage,
    setCanvasDataUrl,
    setElements,
    setSelectedElementId,
    setSelectedImage,
  ]);

  // Auto-load template when phone model changes
  useEffect(() => {
    if (!phoneModel) {
      previousTemplateIdRef.current = null;
      setSelectedTemplate(null);
      Promise.resolve().then(resetCanvasForModelChange);
      return;
    }

    const resolvedTemplate = currentTemplate;

    if (resolvedTemplate) {
      if (previousTemplateIdRef.current !== resolvedTemplate.id) {
        if (pendingModelResetRef.current === resolvedTemplate.id) {
          pendingModelResetRef.current = null;
        } else {
          Promise.resolve().then(resetCanvasForModelChange);
        }
      }
      previousTemplateIdRef.current = resolvedTemplate.id;
      setSelectedTemplate(resolvedTemplate);
      if (resolvedTemplate.id !== phoneModel) {
        setPhoneModel(resolvedTemplate.id);
      }
    } else {
      previousTemplateIdRef.current = null;
      setSelectedTemplate(null);
      Promise.resolve().then(resetCanvasForModelChange);
    }
  }, [
    currentTemplate,
    phoneModel,
    resetCanvasForModelChange,
    setPhoneModel,
    setSelectedTemplate,
  ]);

  // When AI image is selected, set it as background
  useEffect(() => {
    if (mode === "ai" && selectedImage) {
      setBackgroundImage(selectedImage);
    }
  }, [mode, selectedImage, setBackgroundImage]);

  const runGenerate = async (token: string) => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập mô tả thiết kế");
      return;
    }
    if (!phoneModel) {
      toast.error("Vui lòng chọn dòng máy");
      return;
    }

    setIsGenerating(true);
    try {
      const data = await aiApi.generateImage(
        {
          prompt,
          phoneModel,
          style: designStyle,
          colorPreset,
          customColor: colorPreset === "custom" ? customColor : undefined,
          wantsText:
            wantsText || aiGenerationPlan.classification.hasTextRequest,
          qualityLevel: "standard",
          promptMode: aiGenerationPlan.classification.recommendedMode,
          classification: aiGenerationPlan.classification,
          enhancedPromptDraft: aiGenerationPlan.enhancedPromptDraft,
          refImage: refImage || undefined,
          negativePrompt: aiGenerationPlan.negativePrompt,
          metadata: {
            originalPrompt: prompt,
            selectedStyle: designStyle,
            colorPreset,
            mode: aiGenerationPlan.classification.recommendedMode,
            qualityLevel: "standard",
          },
        },
        token,
      );
      if (data.designs && data.designs.length > 0) {
        const imageUrls = data.designs.map(
          (d: { imageUrl: string }) => d.imageUrl,
        );
        setGeneratedImages(imageUrls);
        setSelectedImage(imageUrls[0]);
        setBackgroundImage(imageUrls[0]);
        toast.success(
          `Đã tạo ${data.designs.length} thiết kế trong ${(data.durationMs / 1000).toFixed(1)}s ✨`,
        );
      }
    } catch (error: unknown) {
      const message = getFriendlyErrorMessage(
        error,
        "Không thể tạo thiết kế AI. Vui lòng thử lại sau! ⚙️",
      );
      toast.error(message);
    } finally {
      setIsGenerating(false);
      turnstileRef.current?.reset();
      setCaptchaToken(null);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Vui lòng nhập mô tả thiết kế");
      return;
    }
    if (!phoneModel) {
      toast.error("Vui lòng chọn dòng máy");
      return;
    }

    // Turnstile remains optional until the backend enforces it for AI generation.
    await runGenerate(captchaToken || "");
  };

  const handleAddToCart = async () => {
    // Require authentication before adding to cart
    if (!user) {
      toast.error("Vui lòng đăng nhập để thêm thiết kế vào giỏ hàng!");
      router.push("/login?next=/customize");
      return;
    }
    if (mode === "ai" && !selectedImage) {
      toast.error("Vui lòng generate và chọn một thiết kế trước!");
      return;
    }
    try {
      const designImageUrl =
        arPreviewAssets?.designImageUrl ||
        casePreviewTextureUrl ||
        (mode === "self" ? canvasDataUrl || "" : selectedImage || "");
      await useCartStore.getState().addItem(
        {
          id: `custom-${phoneModel}-${Date.now()}`,
          name: `Ốp lưng Customize - ${currentTemplate?.label || phoneModel}`,
          price: 150000,
          quantity: 1,
          imageUrl: mode === "self" ? canvasDataUrl || "" : selectedImage || "",
          phoneModel: currentTemplate?.label || phoneModel,
          customDesign: {
            phoneModelId: currentTemplate?.id || phoneModel,
            phoneModelLabel: currentTemplate?.label || phoneModel,
            caseColor: bgColor,
            templateVersion: CUSTOM_DESIGN_TEMPLATE_VERSION,
            caseShellVersion: CUSTOM_CASE_SHELL_VERSION,
            designImageUrl,
            arGlbUrl: arPreviewAssets?.glbUrl,
            arUsdzUrl: arPreviewAssets?.usdzUrl,
            mode,
          },
        },
        (useDesignStore.getState().user as unknown as { id: string })?.id,
      );
      toast.success("Đã thêm thiết kế tùy chỉnh vào giỏ hàng!");
      router.push("/cart");
    } catch {
      toast.error("Không thể thêm vào giỏ hàng");
    }
  };

  return (
    <main className="bg-background py-8">
      <div className="max-w-[1340px] mx-auto px-4 md:px-6">
        {/* ─── Top Controls ─── */}
        <div className="mb-6 flex flex-wrap items-center gap-3">
          {/* Category */}
          <div className="flex gap-2">
            {["Phone Cases", "Airpod Cases"].map((cat, i) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(i)}
                className={`h-10 rounded-lg px-4 text-sm font-medium transition-colors ${
                  selectedCategory === i
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Phone Model */}
          <Select
            value={phoneModel}
            onValueChange={(val) => {
              if (!val) return;
              if (val !== phoneModel) {
                resetCanvasForModelChange();
                pendingModelResetRef.current = val;
              }
              setSelectedTemplate(getTemplateById(val) ?? null);
              setPhoneModel(val);
            }}
          >
            <SelectTrigger
              className="h-10 w-56 text-sm font-semibold bg-card"
              data-testid="phone-model-select"
            >
              <SelectValue placeholder="Chọn dòng điện thoại">
                {currentTemplate?.label}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PHONE_CASE_TEMPLATES.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  {model.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Mode tabs */}
          <div className="ml-auto flex overflow-hidden rounded-lg border border-border">
            <button
              type="button"
              onClick={() => {
                setMode("ai");
                if (selectedImage) setBackgroundImage(selectedImage);
              }}
              className={`h-10 px-5 text-sm font-semibold transition-colors ${
                mode === "ai"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <Sparkles className="mr-1.5 inline h-4 w-4" />
              AI Generate
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("self");
                setBackgroundImage(null);
              }}
              className={`h-10 px-5 text-sm font-semibold transition-colors ${
                mode === "self"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Tự Custom
            </button>
          </div>
        </div>

        {/* ─── Main Layout: Sidebar + Canvas ─── */}
        <div className="grid min-w-0 gap-8 lg:grid-cols-[400px_minmax(0,1fr)]">
          {/* LEFT SIDEBAR */}
          <aside className="space-y-5 overflow-y-auto">
            {/* Header spacer to align with the Canvas header */}
            <div className="flex h-6 items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {mode === "ai" ? "Công cụ AI Design" : "Công cụ tự thiết kế"}
              </span>
            </div>

            {/* AI Generate section */}
            {mode === "ai" && (
              <div className="space-y-4 rounded-xl border border-border bg-card p-4">
                <h3 className="text-sm font-semibold text-foreground">
                  <Sparkles className="mr-1.5 inline h-4 w-4 text-primary" />
                  AI Generate
                </h3>

                {/* Upload / Reference Image Style Selection */}
                {refImage ? (
                  <div className="relative flex items-center gap-3 rounded-lg border border-border p-3 bg-secondary/30">
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md border border-border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={refImage}
                        alt="Reference style"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-foreground truncate">
                        Ảnh tham khảo phong cách
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        AI sẽ mô phỏng tone màu và mood của ảnh này.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveRefImage}
                      className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-sm"
                      title="Xóa hình tham khảo"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-secondary/50 text-foreground hover:bg-muted transition-colors">
                    <ImagePlus className="h-4 w-4 text-muted-foreground animate-pulse" />
                    <span className="text-xs font-medium">
                      {aiGenerationPlan.classification.isSpecificCharacter
                        ? "Tải ảnh mẫu nhân vật"
                        : "Tải hình tham khảo phong cách"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {aiGenerationPlan.classification.isSpecificCharacter
                        ? "Giúp AI bám visual nhân vật hơn"
                        : "Phân tích mood, màu sắc, art style"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleRefImageChange}
                    />
                  </label>
                )}

                {aiGenerationPlan.classification.userFacingMessage && (
                  <div className="flex gap-2 rounded-lg border border-(--mirai-sem-warning)/30 bg-(--mirai-sem-warning)/10 p-3 text-xs text-foreground">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-(--mirai-sem-warning)" />
                    <p className="leading-relaxed">
                      {aiGenerationPlan.classification.userFacingMessage}
                    </p>
                  </div>
                )}

                {/* Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">
                      Ý tưởng ngắn
                    </label>
                    <span className="text-[10px] text-muted-foreground">
                      {prompt.length}/220
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={prompt}
                      maxLength={220}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Ví dụ: mèo đen nằm trên mặt trăng"
                      className="h-24 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="flex h-24 w-20 flex-col items-center justify-center gap-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                    >
                      <Sparkles
                        className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                      />
                      {isGenerating ? "..." : "Tạo"}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    Phong cách
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {DESIGN_STYLE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDesignStyle(option.value)}
                        className={`rounded-lg border p-2 text-left transition-colors ${
                          designStyle === option.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="block text-xs font-semibold">
                          {option.label}
                        </span>
                        <span className="mt-0.5 line-clamp-1 block text-[10px]">
                          {option.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-foreground">
                    Màu chủ đạo
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {COLOR_PRESET_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setColorPreset(option.value)}
                        className={`flex items-center gap-2 rounded-lg border px-2 py-2 text-left text-xs transition-colors ${
                          colorPreset === option.value
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <span className="flex -space-x-1">
                          {option.swatches.map((swatch) => (
                            <span
                              key={swatch}
                              className="h-4 w-4 rounded-full border border-background"
                              style={{ backgroundColor: swatch }}
                            />
                          ))}
                        </span>
                        <span className="font-medium">{option.label}</span>
                      </button>
                    ))}
                  </div>

                  {colorPreset === "custom" && (
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                      <input
                        type="color"
                        value={customColor}
                        onChange={(e) => setCustomColor(e.target.value)}
                        className="h-7 w-8 cursor-pointer rounded border border-border bg-transparent"
                      />
                      <span className="font-mono text-xs uppercase text-muted-foreground">
                        {customColor}
                      </span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-foreground">
                      Chữ trên ảnh
                    </p>
                    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setWantsText(false)}
                        className={`h-9 text-xs font-semibold ${
                          !wantsText
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Không
                      </button>
                      <button
                        type="button"
                        onClick={() => setWantsText(true)}
                        className={`h-9 text-xs font-semibold ${
                          wantsText
                            ? "bg-primary text-primary-foreground"
                            : "bg-background text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        Có
                      </button>
                    </div>
                  </div>
                </div>

                {/* Hidden Turnstile Widget for AI Generation */}
                {shouldLoadTurnstile && (
                  <div className="hidden">
                    <Turnstile
                      ref={turnstileRef}
                      siteKey={
                        process.env.NODE_ENV === "development"
                          ? "1x00000000000000000000AA"
                          : process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
                      }
                      onSuccess={(token: string) => {
                        setCaptchaToken(token);
                        if (pendingGenerateRef.current) {
                          pendingGenerateRef.current = false;
                          void runGenerate(token);
                        }
                      }}
                      onExpire={() => setCaptchaToken(null)}
                      onError={() => setCaptchaToken(null)}
                      options={{
                        size: "invisible",
                      }}
                    />
                  </div>
                )}

                {/* Options */}
                {generatedImages.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold text-foreground">
                      Chọn mẫu ({generatedImages.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {generatedImages.map((imgUrl, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedImage(imgUrl);
                            setBackgroundImage(imgUrl);
                          }}
                          className={`aspect-[3/4] overflow-hidden rounded-lg border-2 transition-all ${
                            selectedImage === imgUrl
                              ? "border-primary ring-1 ring-primary"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={imgUrl}
                            alt={`Option ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === "self" && (
              <>
                {/* ── Upload hình ảnh ── */}
                <div className="rounded-xl border border-border bg-card p-4">
                  <label className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <ImagePlus className="h-4 w-4 text-primary" />
                    Thêm hình ảnh
                  </label>
                  <label className="flex h-16 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-secondary/50 text-xs text-foreground hover:bg-muted transition-colors">
                    <ImagePlus className="h-4 w-4" />
                    Click để chọn ảnh
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = URL.createObjectURL(file);
                          const img = new window.Image();
                          img.src = url;
                          img.onload = () => {
                            const imgRatio = img.width / img.height;
                            const canvasW = currentTemplate?.canvasWidth ?? 960;
                            const canvasH =
                              currentTemplate?.canvasHeight ?? 1200;
                            const maxW = canvasW * 0.8;
                            const maxH = canvasH * 0.6;

                            let w = maxW;
                            let h = maxW / imgRatio;
                            if (w / imgRatio > maxH) {
                              h = maxH;
                              w = maxH * imgRatio;
                            }

                            const imagePosition = getCenteredTemplatePosition(
                              currentTemplate,
                              w,
                              h,
                            );

                            addElement({
                              id: `img-${Date.now()}`,
                              type: "image",
                              imageUrl: url,
                              x: imagePosition.x,
                              y: imagePosition.y,
                              width: w,
                              height: h,
                            });
                            toast.success("Đã thêm ảnh vào canvas");
                          };
                        }
                      }}
                    />
                  </label>
                </div>

                {/* ── Thêm chữ ── */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Type className="h-4 w-4 text-primary" />
                    Thêm chữ
                  </h3>

                  {/* Text input + add button */}
                  <div className="flex gap-2">
                    <input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="Ví dụ: MIRAI"
                      className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!textInput.trim()) {
                          toast.error("Nhập nội dung chữ");
                          return;
                        }
                        const estimatedTextWidth = Math.min(
                          textInput.trim().length * fontSize * 0.62,
                          currentTemplate?.printAreaWidth
                            ? currentTemplate.printAreaWidth * 0.86
                            : 420,
                        );
                        const textPosition = getCenteredTemplatePosition(
                          currentTemplate,
                          estimatedTextWidth,
                          fontSize,
                        );
                        addElement({
                          id: `text-${Date.now()}`,
                          type: "text",
                          text: textInput,
                          x: textPosition.x,
                          y: textPosition.y,
                          fontSize,
                          fontFamily,
                          color: selectedColor,
                        });
                        setTextInput("");
                        toast.success("Đã thêm chữ");
                      }}
                      className="h-9 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground"
                    >
                      Thêm
                    </button>
                  </div>

                  {/* Font + Size row */}
                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-xs text-muted-foreground">
                      Font
                      <select
                        value={fontFamily}
                        onChange={(e) => handleFontChange(e.target.value)}
                        className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground font-medium"
                      >
                        <option value="Bricolage Grotesque">
                          Bricolage Grotesque
                        </option>
                        <option value="Montserrat">
                          Montserrat (Geometric)
                        </option>
                        <option value="Poppins">Poppins (Modern Clean)</option>
                        <option value="Inter">Inter (Minimalist)</option>
                        <option value="Playfair Display">
                          Playfair Display (Luxury Serif)
                        </option>
                        <option value="Cinzel">Cinzel (Roman Classic)</option>
                        <option value="Pacifico">
                          Pacifico (Retro Cursive)
                        </option>
                        <option value="Lobster">
                          Lobster (Vintage Script)
                        </option>
                        <option value="Oswald">
                          Oswald (Strong Condensed)
                        </option>
                        <option value="Anton">Anton (Impact Display)</option>
                        <option value="Caveat">Caveat (Cute Handwrite)</option>
                        <option value="Sacramento">
                          Sacramento (Elegant Script)
                        </option>
                      </select>
                    </label>
                    <label className="text-xs text-muted-foreground">
                      Cỡ chữ
                      <select
                        value={fontSize}
                        onChange={(e) =>
                          handleSizeChange(Number(e.target.value))
                        }
                        className="mt-1 h-8 w-full rounded-lg border border-border bg-background px-2 text-xs text-foreground"
                      >
                        {[16, 24, 32, 48, 64, 96].map((s) => (
                          <option key={s} value={s}>
                            {s}pt
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Text color: presets + RGB picker */}
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">
                      Màu chữ
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => handleColorChange(color)}
                            className={`h-6 w-6 rounded-full border transition-all ${selectedColor === color ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : "border-border hover:scale-105"}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      {/* RGB color picker */}
                      <div className="relative ml-auto">
                        <input
                          type="color"
                          value={selectedColor}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                        />
                        <div className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs text-muted-foreground">
                          <Palette className="h-3.5 w-3.5" />
                          <span className="font-mono text-[10px] uppercase">
                            {selectedColor}
                          </span>
                          <span
                            className="h-4 w-4 rounded border border-border"
                            style={{ backgroundColor: selectedColor }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ── Màu nền ốp lưng ── */}
                <div className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <Palette className="h-4 w-4 text-primary" />
                    Màu nền ốp lưng
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="flex flex-wrap gap-1.5">
                      {CASE_BG_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleCaseBackgroundChange(color)}
                          className={`h-7 w-7 rounded-lg border transition-all ${bgColor === color ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : "border-border hover:scale-105"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="relative ml-auto">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) =>
                          handleCaseBackgroundChange(e.target.value)
                        }
                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      />
                      <div className="flex h-8 items-center gap-1.5 rounded-lg border border-border bg-background px-2 text-xs text-muted-foreground">
                        <span className="font-mono text-[10px] uppercase">
                          {bgColor}
                        </span>
                        <span
                          className="h-4 w-4 rounded border border-border"
                          style={{ backgroundColor: bgColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Canvas guides toggle */}
                {currentTemplate && (
                  <div className="flex gap-2">
                    <Button
                      variant={showGuides ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowGuides(!showGuides)}
                      className="flex-1 text-xs"
                    >
                      {showGuides ? (
                        <Grid3X3 className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <Eye className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Guides
                    </Button>
                    <Button
                      variant={showCameraCutout ? "default" : "outline"}
                      size="sm"
                      onClick={() => setShowCameraCutout(!showCameraCutout)}
                      className="flex-1 text-xs"
                    >
                      {showCameraCutout ? (
                        <Camera className="mr-1.5 h-3.5 w-3.5" />
                      ) : (
                        <EyeOff className="mr-1.5 h-3.5 w-3.5" />
                      )}
                      Camera
                    </Button>
                  </div>
                )}

                {/* Layers */}
                {elements.length > 0 && (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <Layers className="h-3.5 w-3.5" /> Layers (
                      {elements.length})
                    </h3>
                    <div className="max-h-32 space-y-1 overflow-y-auto">
                      {elements.map((el) => (
                        <div
                          key={el.id}
                          onClick={() => setSelectedElementId(el.id)}
                          className={`flex cursor-pointer items-center justify-between rounded px-3 py-1.5 text-xs transition-colors ${selectedElementId === el.id ? "bg-primary/20 text-foreground" : "text-muted-foreground hover:bg-muted"}`}
                        >
                          <span>
                            {el.type === "text"
                              ? `T "${el.text?.slice(0, 15)}"`
                              : "🖼 Hình ảnh"}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeElement(el.id);
                            }}
                            className="text-destructive/60 hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>

          {/* RIGHT: Canvas + 3D Preview */}
          <section className="min-w-0 space-y-6">
            {/* Headers row (Canvas + 3D Preview) */}
            <div className="grid min-w-0 items-end gap-6 xl:grid-cols-2">
              {/* Canvas header */}
              <div className="flex items-center justify-between h-6">
                <div className="text-sm font-semibold text-foreground">
                  Canvas Editor 2D
                  {currentTemplate && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — {currentTemplate.label}
                    </span>
                  )}
                </div>
                {selectedElementId && (
                  <button
                    type="button"
                    onClick={() => removeElement(selectedElementId)}
                    className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Xoá element
                  </button>
                )}
              </div>

              {/* 3D Preview header (only on xl viewports) */}
              <div
                className="hidden h-6 items-center justify-between xl:flex"
                style={{ width: previewDisplayWidth }}
              >
                <h3 className="text-sm font-semibold text-foreground">
                  3D / AR Preview
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  Xoay · Zoom · AR
                </span>
              </div>
            </div>

            {/* Canvas + 3D side by side */}
            <div className="grid min-w-0 gap-6 xl:grid-cols-2">
              {/* Canvas */}
              <div className="min-w-0 flex flex-col items-center xl:items-stretch">
                <div
                  className="flex justify-center overflow-hidden rounded-2xl border border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:20px_20px]"
                  style={{
                    width: previewDisplayWidth,
                    maxWidth: "100%",
                    aspectRatio: `${previewDisplayWidth} / ${previewDisplayHeight}`,
                  }}
                >
                  <div className="w-fit rounded-lg border border-border/50 shadow-xl overflow-hidden mx-auto bg-card">
                    <DynamicDesignEditor
                      key={`${currentTemplate?.id ?? "no-template"}-${canvasResetRevision}`}
                      stageRef={stageRef}
                      onCanvasExport={setCanvasDataUrl}
                      onCasePreviewExport={setCasePreviewTextureUrl}
                      backgroundColor={bgColor}
                    />
                  </div>
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Click chọn → kéo di chuyển · Kéo góc để resize/xoay
                </p>

                {selectedElementId && (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-xs text-destructive/80 font-medium">
                      Đang chọn:{" "}
                      {selectedElement?.type === "text"
                        ? `Chữ "${selectedElement.text?.slice(0, 15)}..."`
                        : "Hình ảnh"}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeElement(selectedElementId)}
                      className="flex items-center gap-1.5 rounded-lg bg-destructive px-3.5 py-1.5 text-xs font-semibold text-destructive-foreground hover:bg-destructive/95 shadow-md shadow-destructive/10 transition-all hover:scale-105 active:scale-95"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Xoá Element Này
                    </button>
                  </div>
                )}
              </div>

              {/* 3D AR Preview - bigger */}
              <div className="min-w-0 flex flex-col items-center xl:items-stretch">
                {/* 3D Preview header (only shown when stacked, i.e., less than xl) */}
                <div className="xl:hidden flex items-center justify-between mb-3 h-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    3D / AR Preview
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Xoay · Zoom · AR
                  </span>
                </div>
                <div
                  className="flex max-w-full flex-col overflow-hidden rounded-2xl border border-border bg-card"
                  style={{
                    width: previewDisplayWidth,
                    maxWidth: "100%",
                    aspectRatio: `${previewDisplayWidth} / ${previewDisplayHeight}`,
                  }}
                >
                  <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-b from-muted/20 to-muted/5">
                    {modelUrl ? (
                      <DynamicPhoneCaseViewer
                        key={`${currentTemplate?.id ?? modelUrl}-${canvasResetRevision}`}
                        modelUrl={modelUrl}
                        textureUrl={casePreviewTextureUrl}
                        template={currentTemplate}
                        shouldShowCaseSurface={shouldShowCaseSurface}
                        shouldApplyCaseTexture={shouldApplyCaseTexture}
                        caseColor={bgColor}
                        onArAssetsChange={setArPreviewAssets}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                          <Camera className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                          Chưa chọn dòng máy
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Vui lòng chọn ở menu phía trên
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 border-t border-border pt-6">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-8 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <ShoppingCart className="h-4 w-4" />
                Đặt hàng ngay
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
