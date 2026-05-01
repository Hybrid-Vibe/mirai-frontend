"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesignStore } from "@/lib/store";
import { Sparkles, Check, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockResults = [
  {
    id: "gen-1",
    color: "from-(--mirai-sem-accent) to-(--mirai-sem-primary)",
    label: "Cyberpunk Glow",
  },
  {
    id: "gen-2",
    color: "from-(--mirai-sem-text) to-(--mirai-sem-accent)",
    label: "Ethereal Dream",
  },
  {
    id: "gen-3",
    color: "from-(--mirai-sem-primary) to-(--mirai-sem-success)",
    label: "Neon Nature",
  },
];

export function GenerationDisplay({ onNext }: { onNext: () => void }) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const { prompt, selectedImage, setSelectedImage } = useDesignStore();

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setLoading(false), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mx-auto max-w-5xl">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-8 h-32 w-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-r-2 border-t-2 border-(--mirai-sem-accent) glow-blue"
              />
              <div className="absolute inset-4 rounded-full border-b-2 border-l-2 border-(--mirai-sem-primary) opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="h-10 w-10 animate-pulse text-(--mirai-sem-primary)" />
              </div>
            </div>

            <h3 className="mb-2 font-heading text-2xl font-bold text-foreground">
              Đang dệt ý tưởng của bạn...
            </h3>
            <p className="mb-8 max-w-md text-center text-muted-foreground">
              AI của chúng tôi đang phân tích prompt: &quot;{prompt}&quot;
            </p>

            <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-secondary">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-(--mirai-sem-accent) to-(--mirai-sem-primary) glow-blue"
              />
            </div>
            <div className="mt-2 font-mono font-bold text-(--mirai-sem-primary)">
              {progress}%
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {mockResults.map((result) => (
                <motion.div
                  key={result.id}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedImage(result.id)}
                  className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                    selectedImage === result.id
                      ? "border-(--mirai-sem-primary) glow-blue"
                      : "border-transparent grayscale-[0.5] hover:grayscale-0"
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${result.color} opacity-80`}
                  />
                  <div className="absolute inset-0 bg-grid opacity-20" />

                  {/* Phone Silhouette Over Design */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <div className="h-full w-full rounded-[3rem] border-4 border-(--mirai-sem-border) shadow-inner" />
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="mb-1 text-lg font-bold text-(--mirai-sem-background)">
                      {result.label}
                    </div>
                    <div className="text-xs text-background/70">
                      AI Generated Variant
                    </div>
                  </div>

                  {selectedImage === result.id && (
                    <div className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-(--mirai-sem-primary) shadow-lg">
                      <Check className="h-6 w-6 stroke-[3px] text-(--mirai-sem-text)" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setLoading(true);
                  setProgress(0);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tạo lại các mẫu khác
              </Button>

              <div className="flex w-full gap-4 sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-accent/30 text-foreground hover:bg-accent/10 sm:flex-none"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button
                  disabled={!selectedImage}
                  onClick={onNext}
                  className="flex-1 rounded-2xl bg-accent px-8 py-6 font-bold text-background shadow-md hover:opacity-90 disabled:opacity-50 sm:flex-none"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Chỉnh sửa thiết kế
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
