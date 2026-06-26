"use client";

import { useDesignStore } from "@/lib/store";
import { AlertTriangle, Palette, Sparkles, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COLOR_PRESET_OPTIONS, DESIGN_STYLE_OPTIONS } from "@/types/ai";
import { buildGenerationPlan } from "@/lib/ai-generation";

const suggestions = [
  "Họa tiết hoa mẫu đơn xanh dương nghệ thuật trên nền gradient vàng chanh tươi mát",
  "Họa tiết bươm bướm vintage cổ điển tinh tế với hoa cỏ dại và lá xanh",
  "Tranh sơn dầu hoa tulip hồng pastel dịu dàng với nét vẽ cọ mộc mạc",
  "Bức vẽ minh họa chú cún đáng yêu phong cách hoạt hình vintage ngộ nghĩnh",
  "Họa tiết các chòm sao và ngôi sao nhỏ lấp lánh phong cách tối giản thanh lịch",
  "Họa tiết trái đào hồng dễ thương phong cách tranh màu nước",
  "Phong cảnh núi non tối giản phong cách Bắc Âu màu sắc dịu nhẹ",
  "Họa tiết vỏ sò và sóng biển màu kem thẩm mỹ thanh lịch",
];

export function PromptInput({ onNext }: { onNext: () => void }) {
  const {
    prompt,
    setPrompt,
    designStyle,
    setDesignStyle,
    colorPreset,
    setColorPreset,
    customColor,
    setCustomColor,
    wantsText,
    setWantsText,
  } = useDesignStore();
  const generationPlan = buildGenerationPlan({
    userPrompt: prompt,
    selectedStyle: designStyle,
    colorPreset,
    customColor,
    wantsText,
    qualityLevel: "standard",
  });

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="mx-auto max-w-3xl">
      {/* Prompt Input Textarea */}
      <div className="relative group">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-(--mirai-sem-accent) to-(--mirai-sem-primary) opacity-20 blur-lg transition-opacity group-focus-within:opacity-40" />
        <div className="relative">
          <textarea
            value={prompt}
            maxLength={220}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả ý tưởng ngắn, ví dụ: mèo đen nằm trên mặt trăng"
            className="h-48 w-full resize-none rounded-2xl border border-accent/20 bg-card p-6 text-lg text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
          <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
            {prompt.length}/220
          </div>
        </div>
      </div>

      {generationPlan.classification.userFacingMessage && (
        <div className="mt-5 flex gap-3 rounded-xl border border-(--mirai-sem-warning)/30 bg-(--mirai-sem-warning)/10 p-4 text-sm text-foreground">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-(--mirai-sem-warning)" />
          <p>{generationPlan.classification.userFacingMessage}</p>
        </div>
      )}

      <div className="mt-8 space-y-4">
        <div>
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Palette className="h-4 w-4 text-primary" />
            Phong cách
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {DESIGN_STYLE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setDesignStyle(option.value)}
                className={`rounded-xl border p-3 text-left transition-all ${
                  designStyle === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                }`}
              >
                <span className="block text-sm font-semibold">
                  {option.label}
                </span>
                <span className="mt-1 line-clamp-1 block text-xs">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-medium text-muted-foreground">
            Màu chủ đạo
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESET_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setColorPreset(option.value)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
                  colorPreset === option.value
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
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
                {option.label}
              </button>
            ))}
          </div>

          {colorPreset === "custom" && (
            <div className="mt-3 flex w-fit items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
              />
              <span className="font-mono text-sm uppercase text-muted-foreground">
                {customColor}
              </span>
            </div>
          )}
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-muted-foreground">
            Chữ trên ảnh
          </div>
          <div className="grid max-w-sm grid-cols-2 overflow-hidden rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setWantsText(false)}
              className={`h-11 text-sm font-semibold ${
                !wantsText
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Không
            </button>
            <button
              type="button"
              onClick={() => setWantsText(true)}
              className={`h-11 text-sm font-semibold ${
                wantsText
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Có
            </button>
          </div>
        </div>
      </div>

      {/* Suggestions */}
      <div className="mt-8">
        <div className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Gợi ý cho bạn:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer rounded-xl border-accent/20 bg-card px-4 py-2 text-muted-foreground transition-all hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-12 flex justify-end gap-4">
        {prompt && (
          <Button
            variant="ghost"
            onClick={() => setPrompt("")}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4 mr-2" />
            Xóa hết
          </Button>
        )}
        <Button
          size="lg"
          disabled={!prompt || prompt.length < 3}
          onClick={onNext}
          className="rounded-2xl bg-gradient-to-r from-(--mirai-sem-accent) to-(--mirai-sem-primary) px-12 py-6 font-bold text-(--mirai-sem-background) shadow-md transition-all duration-300 hover:opacity-90 disabled:opacity-50"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
