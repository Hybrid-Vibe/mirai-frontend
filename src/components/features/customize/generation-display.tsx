"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesignStore } from "@/lib/store";
import { Sparkles, Check, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockResults = [
  { id: "gen-1", color: "from-[#0066FF] to-[#00D4FF]", label: "Cyberpunk Glow" },
  { id: "gen-2", color: "from-[#7B2FFF] to-[#FF00D4]", label: "Ethereal Dream" },
  { id: "gen-3", color: "from-[#00D4FF] to-[#00FF87]", label: "Neon Nature" },
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
    <div className="max-w-5xl mx-auto">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative w-32 h-32 mb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 rounded-full border-t-2 border-r-2 border-[#0066FF] glow-blue"
              />
              <div className="absolute inset-4 rounded-full border-b-2 border-l-2 border-[#00D4FF] opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#00D4FF] animate-pulse" />
              </div>
            </div>

            <h3 className="font-heading text-2xl font-bold text-white mb-2">
              Đang dệt ý tưởng của bạn...
            </h3>
            <p className="text-[#6B85B0] mb-8 text-center max-w-md">
              AI của chúng tôi đang phân tích prompt: &quot;{prompt}&quot;
            </p>

            <div className="w-full max-w-md h-2 bg-[#0D1830] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-[#0066FF] to-[#00D4FF] glow-blue"
              />
            </div>
            <div className="mt-2 text-[#00D4FF] font-mono font-bold">{progress}%</div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {mockResults.map((result) => (
                <motion.div
                  key={result.id}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedImage(result.id)}
                  className={`relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-500 ${
                    selectedImage === result.id
                      ? "border-[#00D4FF] shadow-[0_0_40px_rgba(0,212,255,0.3)]"
                      : "border-transparent grayscale-[0.5] hover:grayscale-0"
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${result.color} opacity-80`} />
                  <div className="absolute inset-0 bg-grid opacity-20" />
                  
                  {/* Phone Silhouette Over Design */}
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                     <div className="w-full h-full border-4 border-white/20 rounded-[3rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]" />
                  </div>

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="text-white font-bold text-lg mb-1">{result.label}</div>
                    <div className="text-white/60 text-xs">AI Generated Variant</div>
                  </div>

                  {selectedImage === result.id && (
                    <div className="absolute top-6 right-6 w-10 h-10 bg-[#00D4FF] rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-[#050814] stroke-[3px]" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-8 border-t border-[rgba(0,102,255,0.1)]">
              <Button
                variant="ghost"
                className="text-[#6B85B0] hover:text-white"
                onClick={() => {
                  setLoading(true);
                  setProgress(0);
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Tạo lại các mẫu khác
              </Button>

              <div className="flex gap-4 w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 sm:flex-none border-[rgba(0,102,255,0.2)] text-white hover:bg-[rgba(0,102,255,0.05)] rounded-2xl"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Chia sẻ
                </Button>
                <Button
                  disabled={!selectedImage}
                  onClick={onNext}
                  className="flex-1 sm:flex-none bg-[#0066FF] hover:bg-[#3385FF] text-white font-bold px-8 py-6 rounded-2xl shadow-[0_8px_30px_rgba(0,102,255,0.4)] disabled:opacity-50"
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
