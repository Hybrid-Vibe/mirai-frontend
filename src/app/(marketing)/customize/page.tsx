"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, ImagePlus, Sparkles } from "lucide-react";
import { useDesignStore } from "@/lib/store";

const previewOptions = [
  { id: "option-1", label: "Option 1" },
  { id: "option-2", label: "Option 2" },
  { id: "option-3", label: "Option 3" },
  { id: "option-4", label: "Option 4" },
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
    selectedImage,
    setSelectedImage,
  } = useDesignStore();
  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState(customColors[0]);

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
                  color: mode === "self" ? selectedColor : "var(--mirai-sem-surface)",
                  background:
                    mode === "self"
                      ? "linear-gradient(180deg, #2e2f38 0%, #0f1013 100%)"
                      : "linear-gradient(180deg, #6f75ff 0%, #272935 100%)",
                }}
              >
                <span className="absolute left-1/2 top-3 h-6 w-28 -translate-x-1/2 rounded-b-2xl bg-black/50" />
                {mode === "self" ? (prompt.trim() || "MIRAI") : "AI"}
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
                        className="inline-flex h-28 items-center justify-center gap-2 rounded-[4px] bg-(--mirai-sem-primary) px-4 text-sm font-semibold text-foreground"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-foreground">
                      Option preview
                    </h2>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      {previewOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedImage(option.id)}
                          className={`border p-3 text-center ${
                            selectedImage === option.id
                              ? "rounded-[4px] border-(--mirai-sem-primary) bg-(--mirai-sem-primary)/10"
                              : "rounded-[4px] border-(--mirai-color-line)"
                          }`}
                        >
                          <div className="mx-auto mb-2 h-24 w-16 rounded-xl border border-white/50 bg-gradient-to-br from-[#f4d6df] via-[#93a9ff] to-[#222b42]" />
                          <span className="text-xs text-foreground">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
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
                      Nội dung chữ
                    </label>
                    <input
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Ví dụ: SHARON"
                      className="h-11 w-full rounded-[4px] border border-(--mirai-color-line) px-4"
                    />
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
                className="inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] border border-(--mirai-color-line) bg-card px-6 text-sm font-semibold text-foreground"
              >
                Lưu thiết kế
              </button>
              <Link
                href="/cart"
                className="inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] bg-(--mirai-sem-primary) px-6 text-sm font-semibold text-foreground"
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
