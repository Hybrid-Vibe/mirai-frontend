"use client";

import Link from "next/link";
import { useState } from "react";
import { ImagePlus, Sparkles, Type, Trash2, Layers } from "lucide-react";
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

const DynamicDesignEditor = dynamic(
  () => import("@/components/features/customize/DesignEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-muted w-full h-full rounded-[3rem]" />
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

import { useDesignStore } from "@/lib/store";

const SUPABASE_STORAGE_URL =
  "https://stuwtmcljxqhdlsawtif.supabase.co/storage/v1/object/public/phone-models";

const PHONE_MODELS = [
  {
    label: "iPhone 12 Mini",
    value: "iphone_12_mini",
    glbFile: "iphone_12_mini.glb",
  },
  {
    label: "iPhone 12 Pro",
    value: "iphone_12_pro",
    glbFile: "iphone_12_pro.glb",
  },
  { label: "iPhone 13", value: "iphone_13", glbFile: "iphone_13.glb" },
  {
    label: "iPhone 13 Pro",
    value: "iphone_13_pro",
    glbFile: "iphone_13_pro.glb",
  },
  {
    label: "iPhone 13 Pro Max",
    value: "iphone_13_pro_max",
    glbFile: "iphone_13_pro_max.glb",
  },
  { label: "iPhone 14", value: "iphone_14", glbFile: "iphone_14.glb" },
  {
    label: "iPhone 14 Pro",
    value: "iphone_14_pro",
    glbFile: "iphone_14_pro.glb",
  },
  {
    label: "iPhone 14 Pro Max",
    value: "iphone_14_pro_max",
    glbFile: "iphone_14_pro_max.glb",
  },
  { label: "iPhone 15", value: "iphone_15", glbFile: "iphone_15.glb" },
  {
    label: "iPhone 15 Pro",
    value: "iphone_15_pro",
    glbFile: "iphone_15_pro.glb",
  },
  {
    label: "iPhone 15 Pro Max",
    value: "iphone_15_pro_max",
    glbFile: "iphone_15_pro_max.glb",
  },
  { label: "iPhone 16", value: "iphone_16", glbFile: "iphone_16.glb" },
  {
    label: "iPhone 16 Plus",
    value: "iphone_16_plus",
    glbFile: "iphone_16_plus.glb",
  },
  {
    label: "iPhone 16 Pro",
    value: "iphone_16_pro",
    glbFile: "iphone_16_pro.glb",
  },
  {
    label: "iPhone 16 Pro Max",
    value: "iphone_16_pro_max",
    glbFile: "iphone_16_pro_max.glb",
  },
  {
    label: "iPhone 17 Air",
    value: "iphone_17_air",
    glbFile: "iphone_17_air.glb",
  },
  {
    label: "iPhone 17 Pro",
    value: "iphone_17_pro",
    glbFile: "iphone_17_pro.glb",
  },
  {
    label: "iPhone 17 Pro Max",
    value: "iphone_17_pro_max",
    glbFile: "iphone_17_pro_max.glb",
  },
  {
    label: "Samsung Galaxy S21 Ultra",
    value: "samsung_galaxy_s21_ultra",
    glbFile: "samsung_galaxy_s21_ultra.glb",
  },
  {
    label: "Samsung Galaxy S25 Ultra",
    value: "samsung_galaxy_s25_ultra",
    glbFile: "samsung_galaxy_s25_ultra.glb",
  },
];

const customColors = [
  "var(--mirai-sem-primary)",
  "var(--mirai-sem-accent)",
  "var(--mirai-sem-text)",
  "var(--mirai-sem-background)",
  "var(--mirai-sem-danger)",
  "var(--mirai-sem-success)",
  "var(--mirai-sem-warning)",
  "var(--mirai-sem-text-muted)",
];

export default function CustomizePage() {
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
    removeElement,
    elements,
    selectedElementId,
    setSelectedElementId,
    canvasDataUrl,
    setCanvasDataUrl,
  } = useDesignStore();
  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState(customColors[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [bgColor, setBgColor] = useState("#1a1a2e");
  const [fontSize, setFontSize] = useState(32);
  const [fontFamily, setFontFamily] = useState("Bricolage Grotesque");

  // Derive model URL from selected phoneModel
  const currentPhoneConfig = PHONE_MODELS.find((m) => m.value === phoneModel);
  const modelUrl = currentPhoneConfig
    ? `${SUPABASE_STORAGE_URL}/${currentPhoneConfig.glbFile}`
    : null;

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
      const data = await aiApi.generateImage({
        prompt,
        phoneModel,
      });

      if (data.designs && data.designs.length > 0) {
        const imageUrls = data.designs.map(
          (d: { imageUrl: string }) => d.imageUrl,
        );
        setGeneratedImages(imageUrls);
        setSelectedImage(imageUrls[0]);
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

  return (
    <main className="bg-background py-10">
      <div className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          {/* LEFT: 3D Preview Panel */}
          <section>
            <h2 className="mb-5 font-body text-lg font-semibold text-foreground">
              Preview thiết kế
            </h2>

            <div className="relative w-full aspect-[3/4] rounded-2xl border border-(--mirai-color-line) bg-gradient-to-b from-muted/30 to-muted/10 overflow-hidden">
              {modelUrl ? (
                <DynamicPhoneCaseViewer
                  modelUrl={modelUrl}
                  textureUrl={mode === "self" ? canvasDataUrl : selectedImage}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center px-6">
                  <div className="space-y-3">
                    <div className="mx-auto h-32 w-20 rounded-[2rem] border-4 border-primary/20 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                      <span className="text-3xl font-bold text-primary/40">
                        3D
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Chọn dòng điện thoại bên phải
                      <br />
                      để xem model 3D ốp lưng
                    </p>
                  </div>
                </div>
              )}
            </div>

            {modelUrl && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                🖱️ Kéo để xoay · Scroll để zoom · Trên mobile: hỗ trợ AR
              </p>
            )}
          </section>

          {/* RIGHT: Controls Panel */}
          <section>
            {/* Category Tabs — only Phone Cases & Airpod Cases */}
            <div className="grid gap-3 md:grid-cols-2">
              {["Phone Cases", "Airpod Cases"].map((category, i) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(i)}
                  className={`h-12 rounded-[4px] border text-sm font-medium transition-colors ${
                    selectedCategory === i
                      ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary) text-foreground"
                      : "border-(--mirai-color-line) bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Phone Model Dropdown */}
            <div className="mt-4">
              <Select
                value={phoneModel}
                onValueChange={(val) => val && setPhoneModel(val)}
              >
                <SelectTrigger className="h-12 w-full text-sm font-semibold bg-card">
                  <SelectValue placeholder="Chọn dòng điện thoại">
                    {PHONE_MODELS.find((m) => m.value === phoneModel)?.label}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {PHONE_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Mode Tabs: AI Generate / Tự Custom */}
            <div className="mt-4 rounded-[4px] border border-(--mirai-color-line) bg-card">
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`h-12 border-b text-sm font-semibold ${
                    mode === "ai"
                      ? "bg-(--mirai-sem-primary) text-foreground"
                      : "text-foreground"
                  }`}
                >
                  AI Generate
                </button>
                <button
                  type="button"
                  onClick={() => setMode("self")}
                  className={`h-12 border-b border-l text-sm font-semibold ${
                    mode === "self"
                      ? "bg-(--mirai-sem-primary) text-foreground"
                      : "text-foreground"
                  }`}
                >
                  Tự Custom
                </button>
              </div>

              {mode === "ai" ? (
                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Upload hình ảnh
                    </label>
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-(--mirai-color-line) bg-(--mirai-sem-surface-muted) text-foreground">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">
                        Kéo thả ảnh hoặc click để chọn
                      </span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Prompt
                    </label>
                    <div className="grid gap-3 md:grid-cols-[1fr_136px]">
                      <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Mô tả phong cách bạn muốn tạo..."
                        className="h-28 w-full resize-none rounded-[4px] border border-(--mirai-color-line) px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="inline-flex h-28 items-center justify-center gap-2 rounded-[4px] bg-(--mirai-sem-primary) px-4 text-sm font-semibold text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles
                          className={`h-4 w-4 ${isGenerating ? "animate-spin" : ""}`}
                        />
                        {isGenerating ? "Đang vẽ..." : "Generate"}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                      Option preview
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                      {generatedImages.length > 0 ? (
                        generatedImages.map((imageUrl, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setSelectedImage(imageUrl)}
                            className={`border p-2 text-center overflow-hidden relative ${
                              selectedImage === imageUrl
                                ? "rounded-[4px] border-(--mirai-sem-primary) ring-1 ring-(--mirai-sem-primary)"
                                : "rounded-[4px] border-(--mirai-color-line)"
                            }`}
                          >
                            <div className="mx-auto h-28 w-full rounded-md border border-white/10 bg-muted overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={imageUrl}
                                alt={`Option ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs text-foreground mt-2 block font-medium">
                              Option {index + 1}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center text-sm text-muted-foreground border border-dashed rounded-[4px]">
                          Chưa có thiết kế nào.
                          <br />
                          Nhập mô tả và nhấn Generate để tạo!
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-6">
                  {/* 2D Canvas Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-semibold text-foreground">
                        Canvas Editor
                      </label>
                      {selectedElementId && (
                        <button
                          type="button"
                          onClick={() => removeElement(selectedElementId)}
                          className="flex items-center gap-1 text-xs text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Xoá
                        </button>
                      )}
                    </div>
                    <div
                      className="rounded-lg border border-(--mirai-color-line) overflow-hidden bg-[#1a1a2e]"
                      style={{ maxHeight: 340 }}
                    >
                      <div
                        style={{
                          transform: "scale(0.72)",
                          transformOrigin: "top left",
                          width: 400,
                          height: 340,
                        }}
                      >
                        <DynamicDesignEditor
                          onCanvasExport={setCanvasDataUrl}
                          backgroundColor={bgColor}
                        />
                      </div>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Click chọn → kéo di chuyển · Kéo góc để resize/xoay
                    </p>
                  </div>

                  {/* Upload Image */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Upload hình ảnh
                    </label>
                    <label className="flex h-20 w-full cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[4px] border border-dashed border-(--mirai-color-line) bg-(--mirai-sem-surface-muted) text-foreground hover:bg-muted transition-colors">
                      <ImagePlus className="h-4 w-4" />
                      <span className="text-xs">Click để chọn ảnh</span>
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

                  {/* Add Text */}
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Thêm chữ
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        placeholder="Ví dụ: MIRAI"
                        className="h-10 flex-1 rounded-[4px] border border-(--mirai-color-line) px-3 text-sm"
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
                        className="h-10 px-3 bg-(--mirai-sem-primary) hover:bg-(--mirai-sem-primary)/80 rounded-[4px] flex items-center gap-1.5 text-sm font-medium transition-colors"
                      >
                        <Type className="h-4 w-4" /> Thêm
                      </button>
                    </div>
                  </div>

                  {/* Font / Size / BG Color */}
                  <div className="grid gap-3 grid-cols-3">
                    <label className="text-xs text-foreground">
                      Font
                      <select
                        value={fontFamily}
                        onChange={(e) => setFontFamily(e.target.value)}
                        className="mt-1 h-9 w-full rounded-[4px] border border-(--mirai-color-line) px-2 text-xs"
                      >
                        <option>Bricolage Grotesque</option>
                        <option>Poppins</option>
                        <option>Inter</option>
                        <option>Arial</option>
                        <option>Georgia</option>
                      </select>
                    </label>
                    <label className="text-xs text-foreground">
                      Size
                      <select
                        value={fontSize}
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="mt-1 h-9 w-full rounded-[4px] border border-(--mirai-color-line) px-2 text-xs"
                      >
                        <option value={16}>16pt</option>
                        <option value={24}>24pt</option>
                        <option value={32}>32pt</option>
                        <option value={48}>48pt</option>
                        <option value={64}>64pt</option>
                      </select>
                    </label>
                    <label className="text-xs text-foreground">
                      Nền
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        className="mt-1 h-9 w-full rounded-[4px] border border-(--mirai-color-line) cursor-pointer"
                      />
                    </label>
                  </div>

                  {/* Color Picker */}
                  <div>
                    <h2 className="mb-2 text-sm font-semibold text-foreground">
                      Màu chữ
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "#ffffff",
                        "#0f0f0f",
                        "#4349e7",
                        "#48e1ed",
                        "#db4444",
                        "#2fc05d",
                        "#ffad33",
                        "#e7b6ff",
                        "#f39ab6",
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`h-7 w-7 rounded-full border ${selectedColor === color ? "ring-2 ring-(--mirai-sem-primary)" : "border-black/10"}`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Elements Layer List */}
                  {elements.length > 0 && (
                    <div>
                      <h2 className="mb-2 text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Layers (
                        {elements.length})
                      </h2>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {elements.map((el) => (
                          <div
                            key={el.id}
                            onClick={() => setSelectedElementId(el.id)}
                            className={`flex items-center justify-between px-3 py-1.5 rounded text-xs cursor-pointer transition-colors ${selectedElementId === el.id ? "bg-(--mirai-sem-primary)/20 text-foreground" : "hover:bg-muted text-muted-foreground"}`}
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
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (mode === "self") {
                    toast.success("Thiết kế đã được lưu vào bộ sưu tập!");
                    return;
                  }
                  if (!selectedImage) {
                    toast.error(
                      "Vui lòng generate và chọn một thiết kế trước!",
                    );
                    return;
                  }
                  toast.success("Thiết kế đã được lưu vào bộ sưu tập!");
                }}
                className={`inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] border border-(--mirai-color-line) bg-card px-6 text-sm font-semibold text-foreground transition-opacity ${mode !== "self" && !selectedImage ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"}`}
              >
                Lưu thiết kế
              </button>
              <Link
                href={mode === "self" || selectedImage ? "/cart" : "#"}
                onClick={(e) => {
                  if (mode !== "self" && !selectedImage) {
                    e.preventDefault();
                    toast.error(
                      "Vui lòng generate và chọn một thiết kế trước!",
                    );
                  }
                }}
                className={`inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground transition-opacity ${mode !== "self" && !selectedImage ? "opacity-50 cursor-not-allowed" : "hover:bg-(--mirai-sem-primary)/90"}`}
              >
                Đặt hàng ngay
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
