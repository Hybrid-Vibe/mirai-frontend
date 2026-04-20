"use client";

import { useDesignStore } from "@/lib/store";
import { Wand2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const suggestions = [
  "Anime cyberpunk girl with blue hair",
  "Vaporwave aesthetic sunset beach",
  "Minimalist geometric line art black & gold",
  "Cute pastel cat in space",
  "Abstract marble fluid art purple",
  "Vintage 90s retro pattern vibrant",
  "Dark gothic forest with bioluminescence",
  "Cyber-organic textures green neon",
];

export function PromptInput({ onNext }: { onNext: () => void }) {
  const { prompt, setPrompt } = useDesignStore();

  const handleSuggestionClick = (suggestion: string) => {
    setPrompt(suggestion);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#0066FF] to-[#00D4FF] rounded-2xl opacity-20 group-focus-within:opacity-40 blur-lg transition-opacity" />
        <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Mô tả ý tưởng của bạn (ví dụ: 'Cô gái anime phong cách cyberpunk với tóc xanh dương'...)"
            className="w-full h-48 bg-[#0A0F1E] border border-[rgba(0,102,255,0.2)] rounded-2xl p-6 text-white text-lg placeholder-[#4A5D7E] focus:outline-none focus:border-[#0066FF] focus:ring-1 focus:ring-[#0066FF] transition-all resize-none"
          />
          <div className="absolute bottom-4 right-4 text-[#4A5D7E] text-sm">
            {prompt.length}/200
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 mb-4 text-[#A0B4D8] text-sm font-medium">
          <Sparkles className="w-4 h-4 text-[#00D4FF]" />
          Gợi ý cho bạn:
        </div>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <Badge
              key={suggestion}
              variant="outline"
              onClick={() => handleSuggestionClick(suggestion)}
              className="cursor-pointer py-2 px-4 rounded-xl border-[rgba(0,102,255,0.2)] bg-[#0A0F1E] text-[#A0B4D8] hover:text-[#00D4FF] hover:border-[#00D4FF] hover:bg-[rgba(0,212,255,0.05)] transition-all"
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex justify-end mt-12 gap-4">
        {prompt && (
          <Button
            variant="ghost"
            onClick={() => setPrompt("")}
            className="text-[#6B85B0] hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            Xóa hết
          </Button>
        )}
        <Button
          size="lg"
          disabled={!prompt || prompt.length < 3}
          onClick={onNext}
          className="bg-gradient-to-r from-[#0066FF] to-[#00D4FF] hover:from-[#3385FF] hover:to-[#00D4FF] text-white font-bold px-12 py-6 rounded-2xl shadow-[0_8px_30px_rgba(0,102,255,0.4)] disabled:opacity-50 transition-all duration-300"
        >
          <Wand2 className="w-5 h-5 mr-2" />
          Tiếp tục
        </Button>
      </div>
    </div>
  );
}
