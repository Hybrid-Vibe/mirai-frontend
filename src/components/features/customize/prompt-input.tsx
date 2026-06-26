"use client";

import { useDesignStore } from "@/lib/store";
import { Wand2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  const { prompt, setPrompt } = useDesignStore();

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
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả ý tưởng của bạn (ví dụ: 'Cô gái anime phong cách cyberpunk với tóc xanh dương'...)"
            className="h-48 w-full resize-none rounded-2xl border border-accent/20 bg-card p-6 text-lg text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all"
          />
          <div className="absolute bottom-4 right-4 text-sm text-muted-foreground">
            {prompt.length}/200
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
