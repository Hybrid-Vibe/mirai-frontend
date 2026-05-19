"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
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
import type Konva from "konva";

import { useDesignStore } from "@/lib/store";
import { useCartStore } from "@/stores/cart-store";
import {
  PHONE_CASE_TEMPLATES,
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
    selectedElementId,
    setSelectedElementId,
    canvasDataUrl,
    setCanvasDataUrl,
    selectedTemplate,
    setSelectedTemplate,
    showGuides,
    setShowGuides,
    showCameraCutout,
    setShowCameraCutout,
    setBackgroundImage,
  } = useDesignStore();

  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [isGenerating, setIsGenerating] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Bricolage Grotesque");
  const [selectedCategory, setSelectedCategory] = useState(0);

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
  const currentTemplate = selectedTemplate;
  const modelUrl = currentTemplate
    ? `${SUPABASE_STORAGE_URL}/${currentTemplate.glbFile}`
    : null;

  // Auto-load template when phone model changes
  useEffect(() => {
    if (phoneModel) {
      const template = getTemplateById(phoneModel);
      if (template) {
        setSelectedTemplate(template);
      }
    } else {
      setSelectedTemplate(null);
    }
  }, [phoneModel, setSelectedTemplate]);

  // When AI image is selected, set it as background
  useEffect(() => {
    if (mode === "ai" && selectedImage) {
      setBackgroundImage(selectedImage);
    }
  }, [mode, selectedImage, setBackgroundImage]);

  const handleGenerate = async () => {
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
      const data = await aiApi.generateImage({ prompt, phoneModel });
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
      let message = "Có lỗi xảy ra. Vui lòng thử lại.";
      if (error && typeof error === "object" && "response" in error) {
        const axiosErr = error as {
          response?: { data?: { error?: string; code?: string } };
        };
        const code = axiosErr.response?.data?.code;
        if (code === "RATE_LIMITED") {
          message = "Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút 🙏";
        } else if (code === "INVALID_PROMPT") {
          message = "Prompt không hợp lệ — hãy thử mô tả chi tiết hơn.";
        } else if (axiosErr.response?.data?.error) {
          message = axiosErr.response.data.error;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCart = async () => {
    if (mode === "ai" && !selectedImage) {
      toast.error("Vui lòng generate và chọn một thiết kế trước!");
      return;
    }
    try {
      await useCartStore.getState().addItem(
        {
          id: `custom-${phoneModel}-${Date.now()}`,
          name: `Ốp lưng Customize - ${currentTemplate?.label || phoneModel}`,
          price: 150000,
          quantity: 1,
          imageUrl: mode === "self" ? canvasDataUrl || "" : selectedImage || "",
          phoneModel: currentTemplate?.label || phoneModel,
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
            onValueChange={(val) => val && setPhoneModel(val)}
          >
            <SelectTrigger className="h-10 w-56 text-sm font-semibold bg-card">
              <SelectValue placeholder="Chọn dòng điện thoại">
                {PHONE_CASE_TEMPLATES.find((m) => m.id === phoneModel)?.label}
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
        <div className="grid gap-8 lg:grid-cols-[400px_1fr]">
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

                {/* Upload */}
                <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-secondary/50 text-foreground hover:bg-muted transition-colors">
                  <ImagePlus className="h-4 w-4" />
                  <span className="text-xs">Upload hình tham khảo</span>
                  <input type="file" className="hidden" />
                </label>

                {/* Prompt */}
                <div className="flex gap-2">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Mô tả phong cách bạn muốn tạo..."
                    className="h-20 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isGenerating || !prompt.trim()}
                    className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg bg-primary text-sm font-semibold text-primary-foreground disabled:opacity-50"
                  >
                    <Sparkles
                      className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                    />
                    {isGenerating ? "..." : "Tạo"}
                  </button>
                </div>

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
                          addElement({
                            id: `img-${Date.now()}`,
                            type: "image",
                            imageUrl: url,
                            x: 50,
                            y: 80,
                          });
                          toast.success("Đã thêm ảnh vào canvas");
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
                        addElement({
                          id: `text-${Date.now()}`,
                          type: "text",
                          text: textInput,
                          x: 80,
                          y: 200,
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
                          onClick={() => setBgColor(color)}
                          className={`h-7 w-7 rounded-lg border transition-all ${bgColor === color ? "ring-2 ring-primary ring-offset-1 ring-offset-background scale-110" : "border-border hover:scale-105"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="relative ml-auto">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
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
                {selectedTemplate && (
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
          <section className="space-y-6">
            {/* Headers row (Canvas + 3D Preview) */}
            <div className="grid gap-6 xl:grid-cols-[1fr_380px] items-end">
              {/* Canvas header */}
              <div className="flex items-center justify-between h-6">
                <div className="text-sm font-semibold text-foreground">
                  Canvas Editor 2D
                  {selectedTemplate && (
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      — {selectedTemplate.label}
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
              <div className="hidden xl:flex items-center justify-between h-6">
                <h3 className="text-sm font-semibold text-foreground">
                  3D / AR Preview
                </h3>
                <span className="text-[10px] text-muted-foreground">
                  Xoay · Zoom · AR
                </span>
              </div>
            </div>

            {/* Canvas + 3D side by side */}
            <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
              {/* Canvas */}
              <div>
                <div className="flex justify-center rounded-2xl border border-border bg-[repeating-conic-gradient(#80808015_0%_25%,transparent_0%_50%)] bg-[length:20px_20px] p-6">
                  <div className="w-fit rounded-lg border border-border/50 shadow-xl overflow-hidden mx-auto bg-card">
                    <DynamicDesignEditor
                      stageRef={stageRef}
                      onCanvasExport={setCanvasDataUrl}
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
              <div>
                {/* 3D Preview header (only shown when stacked, i.e., less than xl) */}
                <div className="xl:hidden flex items-center justify-between mb-3 h-6">
                  <h3 className="text-sm font-semibold text-foreground">
                    3D / AR Preview
                  </h3>
                  <span className="text-[10px] text-muted-foreground">
                    Xoay · Zoom · AR
                  </span>
                </div>
                <div className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col h-full">
                  <div className="relative aspect-[3/4] w-full bg-gradient-to-b from-muted/20 to-muted/5 flex-1 flex items-center justify-center">
                    {modelUrl ? (
                      <DynamicPhoneCaseViewer
                        modelUrl={modelUrl}
                        textureUrl={canvasDataUrl}
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
                onClick={() =>
                  toast.success("Thiết kế đã được lưu vào bộ sưu tập!")
                }
                className="inline-flex h-11 items-center justify-center rounded-lg border border-border bg-card px-6 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Lưu thiết kế
              </button>
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
