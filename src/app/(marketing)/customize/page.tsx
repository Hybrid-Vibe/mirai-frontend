"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ImagePlus, Sparkles, Type } from "lucide-react";
import dynamic from "next/dynamic";
import { toast } from "sonner";

const DynamicDesignEditor = dynamic(
  () => import("@/components/features/customize/DesignEditor"),
  {
    ssr: false,
    loading: () => (
      <div className="animate-pulse bg-muted w-full h-full rounded-[3rem]" />
    ),
  },
);
import { useDesignStore } from "@/lib/store";

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
  } = useDesignStore();
  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState(customColors[0]);
  const [isGenerating, setIsGenerating] = useState(false);

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
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, phoneModel }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tạo thiết kế");
      }

      if (data.designs && data.designs.length > 0) {
        const imageUrls = data.designs.map(
          (d: { imageUrl: string }) => d.imageUrl,
        );
        setGeneratedImages(imageUrls);
        setSelectedImage(imageUrls[0]);
        toast.success("Đã tạo thiết kế thành công!");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="bg-background py-10">
      <div className="page-shell">
        <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
          <section>
            <h2 className="mb-5 font-body text-lg font-semibold text-foreground">
              Preview thiết kế
            </h2>

            <div className="mx-auto flex h-[560px] w-[280px] items-center justify-center rounded-[44px] border-[6px] border-[#222] bg-gradient-to-b from-[#545454] to-[#1f1f1f] p-4 shadow-[0_24px_40px_rgba(15,15,15,0.2)]">
              <div
                className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[34px] text-center font-heading text-6xl font-semibold"
                style={{
                  color:
                    mode === "self"
                      ? selectedColor
                      : "var(--mirai-sem-surface)",
                  background:
                    mode === "self"
                      ? "linear-gradient(180deg, #2e2f38 0%, #0f1013 100%)"
                      : "linear-gradient(180deg, #6f75ff 0%, #272935 100%)",
                }}
              >
                <span className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black/50 z-10" />
                {mode === "self" ? (
                  <DynamicDesignEditor />
                ) : selectedImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={selectedImage}
                    alt="Generated Design"
                    className="h-full w-full object-cover"
                  />
                ) : isGenerating ? (
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8 animate-pulse text-(--mirai-sem-primary)" />
                    <span className="text-sm font-medium text-white/80 font-body">
                      Đang vẽ...
                    </span>
                  </div>
                ) : (
                  "AI"
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${i === 2 ? "bg-(--mirai-sem-primary)" : "bg-(--mirai-sem-surface-muted)"}`}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="grid gap-3 md:grid-cols-4">
              {["Phone Cases", "Laptop Cases", "Airpod Cases", "Phụ kiện"].map(
                (category, i) => (
                  <button
                    key={category}
                    type="button"
                    className={`h-12 rounded-[4px] border text-sm font-medium ${
                      i === 0
                        ? "border-(--mirai-sem-primary) bg-(--mirai-sem-primary) text-foreground"
                        : "border-(--mirai-color-line) bg-card text-foreground"
                    }`}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>

            <button
              type="button"
              onClick={() => setPhoneModel("IPHONE 17 PRO MAX")}
              className="mt-4 flex h-12 w-full items-center justify-between rounded-[4px] border border-(--mirai-color-line) bg-card px-4 text-sm font-semibold text-foreground"
            >
              {phoneModel || "IPHONE 17 PRO MAX"}
              <ChevronDown className="h-5 w-5" />
            </button>

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
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Upload hình ảnh
                    </label>
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-(--mirai-color-line) bg-(--mirai-sem-surface-muted) text-foreground hover:bg-muted transition-colors">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">
                        Kéo thả ảnh hoặc click để chọn
                      </span>
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
                              y: 100,
                            });
                            toast.success("Đã thêm ảnh vào thiết kế");
                          }
                        }}
                      />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">
                      Nội dung chữ
                    </label>
                    <div className="flex gap-2">
                      <input
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Ví dụ: SHARON"
                        className="h-11 flex-1 rounded-[4px] border border-(--mirai-color-line) px-4"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!prompt.trim()) {
                            toast.error("Vui lòng nhập nội dung chữ");
                            return;
                          }
                          addElement({
                            id: `text-${Date.now()}`,
                            type: "text",
                            text: prompt,
                            x: 50,
                            y: 200,
                            fontSize: 32,
                            color: selectedColor,
                          });
                          toast.success("Đã thêm chữ vào thiết kế");
                        }}
                        className="h-11 px-4 bg-(--mirai-color-surface-muted) hover:bg-muted rounded-[4px] border border-(--mirai-color-line) flex items-center justify-center transition-colors"
                      >
                        <Type className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-xs text-foreground">
                      Font
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-(--mirai-color-line) px-2">
                        <option>Bricolage Grotesque</option>
                        <option>Poppins</option>
                      </select>
                    </label>
                    <label className="text-xs text-foreground">
                      Size
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-(--mirai-color-line) px-2">
                        <option>12pt</option>
                        <option>16pt</option>
                        <option>20pt</option>
                        <option>28pt</option>
                      </select>
                    </label>
                    <label className="text-xs text-foreground">
                      Bố cục
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-(--mirai-color-line) px-2">
                        <option>Dọc</option>
                        <option>Ngang</option>
                        <option>Zigzag</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                      Màu chữ
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {[
                        "#0f0f0f",
                        "#ffffff",
                        "#4349e7",
                        "#48e1ed",
                        "#db4444",
                        "#2fc05d",
                        "#ffad33",
                        "#e7b6ff",
                        "#f39ab6",
                        "#9fa0ad",
                        ...customColors,
                      ].map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`h-8 w-8 rounded-full border ${
                            selectedColor === color
                              ? "ring-2 ring-(--mirai-sem-primary)"
                              : "border-black/10"
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

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
