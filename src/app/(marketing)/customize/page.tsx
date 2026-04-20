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
  "#8E5D5D",
  "#B5B5B5",
  "#2FC05D",
  "#14B8A6",
  "#0EA5E9",
  "#5B5FE6",
  "#B832D3",
  "#F43F5E",
  "#111827",
  "#FF8A00",
  "#FFE66D",
  "#F9A8D4",
  "#C4B5FD",
  "#99F6E4",
];

export default function CustomizePage() {
  const { phoneModel, setPhoneModel, prompt, setPrompt, selectedImage, setSelectedImage } = useDesignStore();
  const [mode, setMode] = useState<"ai" | "self">("ai");
  const [selectedColor, setSelectedColor] = useState(customColors[0]);

  return (
    <main className="bg-background py-12">
      <div className="page-shell">
        <p className="text-sm text-[#2F2E30]/70">Home / Customize</p>

        <div className="mb-8 mt-3 flex items-center gap-3">
          <span className="inline-block h-8 w-2 rounded-sm bg-[#4349E7]" />
          <h1 className="font-heading text-4xl font-semibold text-[#0F0F0F] md:text-5xl">Customize</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-[360px_1fr]">
          <section>
            <h2 className="mb-4 font-body text-lg font-semibold text-[#0F0F0F]">Preview thiết kế</h2>

            <div className="mx-auto flex h-[560px] w-[290px] items-center justify-center rounded-[44px] border-4 border-[#2F2E30] bg-gradient-to-b from-[#2F2E30] to-[#0F0F0F] p-5">
              <div
                className="flex h-full w-full items-center justify-center rounded-[34px] text-center font-heading text-6xl font-semibold"
                style={{
                  color: mode === "self" ? selectedColor : "#FFFFFF",
                  background: mode === "self" ? "linear-gradient(180deg, #3A3A3A 0%, #181818 100%)" : "linear-gradient(180deg, #4349E7 0%, #1E1E1E 100%)",
                }}
              >
                {mode === "self" ? "MIRAI" : "AI"}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${i === 2 ? "bg-[#48E1ED]" : "bg-[#D9D9D9]"}`}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="grid gap-3 md:grid-cols-4">
              {["Phone Cases", "Laptop Cases", "Airpod Cases", "Phụ kiện"].map((category, i) => (
                <button
                  key={category}
                  type="button"
                  className={`h-12 rounded-[4px] border text-sm font-medium ${
                    i === 0
                      ? "border-[#48E1ED] bg-[#48E1ED] text-[#0F0F0F]"
                      : "border-[color:var(--mirai-color-line)] bg-white text-[#0F0F0F]"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setPhoneModel("IPHONE 17 PRO MAX")}
              className="mt-4 flex h-12 w-full items-center justify-between rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white px-4 text-sm font-semibold text-[#0F0F0F]"
            >
              {phoneModel || "IPHONE 17 PRO MAX"}
              <ChevronDown className="h-5 w-5" />
            </button>

            <div className="mt-4 rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white">
              <div className="grid grid-cols-2">
                <button
                  type="button"
                  onClick={() => setMode("ai")}
                  className={`h-12 border-b text-sm font-semibold ${
                    mode === "ai" ? "bg-[#48E1ED] text-[#0F0F0F]" : "text-[#0F0F0F]"
                  }`}
                >
                  AI Generate
                </button>
                <button
                  type="button"
                  onClick={() => setMode("self")}
                  className={`h-12 border-b border-l text-sm font-semibold ${
                    mode === "self" ? "bg-[#48E1ED] text-[#0F0F0F]" : "text-[#0F0F0F]"
                  }`}
                >
                  Tự Custom
                </button>
              </div>

              {mode === "ai" ? (
                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F0F0F]">Upload hình ảnh</label>
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-[color:var(--mirai-color-line)] bg-[#F5F5F5] text-[#2F2E30]">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Kéo thả ảnh hoặc click để chọn</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F0F0F]">Prompt</label>
                    <div className="grid gap-3 md:grid-cols-[1fr_136px]">
                      <textarea
                        value={prompt}
                        onChange={(event) => setPrompt(event.target.value)}
                        placeholder="Mô tả phong cách bạn muốn tạo..."
                        className="h-28 w-full resize-none rounded-[4px] border border-[color:var(--mirai-color-line)] px-4 py-3 text-sm"
                      />
                      <button
                        type="button"
                        className="inline-flex h-28 items-center justify-center gap-2 rounded-[4px] bg-[#48E1ED] px-4 text-sm font-semibold text-[#0F0F0F]"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate
                      </button>
                    </div>
                  </div>

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-[#0F0F0F]">Option preview</h2>
                    <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
                      {previewOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setSelectedImage(option.id)}
                          className={`border p-3 text-center ${
                            selectedImage === option.id
                              ? "rounded-[4px] border-[#48E1ED] bg-[#48E1ED]/10"
                              : "rounded-[4px] border-[color:var(--mirai-color-line)]"
                          }`}
                        >
                          <div className="mx-auto mb-2 h-24 w-16 rounded-xl bg-gradient-to-br from-[#1F2937] to-[#6D28D9]" />
                          <span className="text-xs text-[#0F0F0F]">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-5 p-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F0F0F]">Upload hình ảnh</label>
                    <label className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-[4px] border border-dashed border-[color:var(--mirai-color-line)] bg-[#F5F5F5] text-[#2F2E30]">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Kéo thả ảnh hoặc click để chọn</span>
                      <input type="file" className="hidden" />
                    </label>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#0F0F0F]">Nội dung chữ</label>
                    <input
                      value={prompt}
                      onChange={(event) => setPrompt(event.target.value)}
                      placeholder="Ví dụ: SHARON"
                      className="h-11 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] px-4"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <label className="text-xs text-[#0F0F0F]">
                      Font
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] px-2">
                        <option>Bricolage Grotesque</option>
                        <option>Poppins</option>
                      </select>
                    </label>
                    <label className="text-xs text-[#0F0F0F]">
                      Size
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] px-2">
                        <option>12pt</option>
                        <option>16pt</option>
                        <option>20pt</option>
                        <option>28pt</option>
                      </select>
                    </label>
                    <label className="text-xs text-[#0F0F0F]">
                      Bố cục
                      <select className="mt-1 h-10 w-full rounded-[4px] border border-[color:var(--mirai-color-line)] px-2">
                        <option>Dọc</option>
                        <option>Ngang</option>
                        <option>Zigzag</option>
                      </select>
                    </label>
                  </div>

                  <div>
                    <h2 className="mb-3 text-sm font-semibold text-[#0F0F0F]">Màu chữ</h2>
                    <div className="flex flex-wrap gap-3">
                      {customColors.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setSelectedColor(color)}
                          className={`h-8 w-8 rounded-full border ${
                            selectedColor === color ? "ring-2 ring-[#48E1ED]" : "border-black/10"
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
                className="inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] border border-[color:var(--mirai-color-line)] bg-white px-6 text-sm font-semibold text-[#0F0F0F]"
              >
                Lưu thiết kế
              </button>
              <Link
                href="/cart"
                className="inline-flex h-12 min-w-44 items-center justify-center rounded-[4px] bg-[#48E1ED] px-6 text-sm font-semibold text-[#0F0F0F]"
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
