"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDesignStore } from "@/lib/store";
import { aiApi, aiImageApi } from "@/lib/api-client";
import {
  Sparkles,
  Check,
  RefreshCw,
  Share2,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { GeneratedDesign } from "@/types/ai";

// ---------------------------------------------------------------------------
// Dynamic loading messages — Don Norman feedback principle
// Micro-UX: progression-aware text instead of static "loading..."
// ---------------------------------------------------------------------------
const LOADING_MESSAGES = [
  "MIRAI đang vẽ ốp cho bạn...",
  "AI đang phân tích prompt của bạn...",
  "Đang tạo biến thể thiết kế...",
  "Đang render 3 phiên bản...",
  "Sắp xong rồi...",
];

// ---------------------------------------------------------------------------
// Skeleton card — shown while AI generates
// ---------------------------------------------------------------------------
function SkeletonCard() {
  return (
    <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border-2 border-transparent bg-card">
      {/* Shimmer effect */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-secondary via-card to-secondary" />
      <div className="absolute inset-0 bg-grid opacity-10" />

      {/* Phone silhouette skeleton */}
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <div className="h-full w-full animate-pulse rounded-[3rem] border-4 border-border/30" />
      </div>

      {/* Bottom label skeleton */}
      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <div className="h-5 w-2/3 animate-pulse rounded-lg bg-border/30" />
        <div className="h-3 w-1/3 animate-pulse rounded-lg bg-border/20" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Error display — friendly, non-crashing error state
// ---------------------------------------------------------------------------
function ErrorDisplay({
  errorMessage,
  errorCode,
  onRetry,
  onGoBack,
}: {
  errorMessage: string;
  errorCode: string;
  onRetry: () => void;
  onGoBack: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-10 w-10 text-destructive" />
      </div>

      <h3 className="mb-2 text-center font-heading text-2xl font-bold text-foreground">
        {errorCode === "RATE_LIMITED"
          ? "Hệ thống AI đang quá tải"
          : "Không thể tạo thiết kế"}
      </h3>

      <p className="mb-8 max-w-md text-center text-muted-foreground">
        {errorMessage}
      </p>

      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onGoBack}
          className="rounded-2xl border-accent/30 px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>

        <Button
          onClick={onRetry}
          className="rounded-2xl bg-gradient-to-r from-(--mirai-sem-accent) to-(--mirai-sem-primary) px-8 font-bold text-(--mirai-sem-background) shadow-md hover:opacity-90"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Thử lại
        </Button>
      </div>
    </motion.div>
  );
}

// ======================================================================
// Main Component
// ======================================================================

export function GenerationDisplay({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [error, setError] = useState<{
    message: string;
    code: string;
  } | null>(null);
  const [designs, setDesigns] = useState<GeneratedDesign[]>([]);

  const {
    prompt,
    phoneModel,
    selectedImage,
    setSelectedImage,
    setGeneratedImages,
  } = useDesignStore();

  // Ref to prevent double-calls in StrictMode
  const hasFetchedRef = useRef(false);

  // -----------------------------------------------------------------------
  // Generate designs via API
  // -----------------------------------------------------------------------
  const generateDesigns = useCallback(async () => {
    setLoading(true);
    setProgress(0);
    setMessageIndex(0);
    setError(null);
    setDesigns([]);
    setSelectedImage(null);

    try {
      const response = await aiApi.generateImage({
        prompt,
        phoneModel: phoneModel || "iPhone 15",
      });

      // Store designs in local state + zustand
      setDesigns(response.designs);
      setGeneratedImages(response.designs.map((d) => d.imageUrl));

      // Sync with backend if user is logged in
      const user = useDesignStore.getState().user;
      if (user) {
        try {
          await aiImageApi.createAIImage({
            prompt,
            style: "default",
            width: 512,
            height: 512,
          });
          console.log(
            "[GenerationDisplay] Successfully saved AI Image to backend.",
          );
        } catch (backendErr) {
          console.error(
            "[GenerationDisplay] Failed to save AI Image to backend:",
            backendErr,
          );
          // Don't throw, we still want to show the generated images to the user
        }
      }

      // Complete the progress bar
      setProgress(100);
      setTimeout(() => setLoading(false), 500);

      toast.success(
        `Đã tạo ${response.designs.length} thiết kế trong ${(response.durationMs / 1000).toFixed(1)}s ✨`,
      );
    } catch (err: unknown) {
      console.error("[GenerationDisplay] Error:", err);

      // Extract error info from API response
      let errorMessage = "Đã xảy ra lỗi khi tạo thiết kế. Vui lòng thử lại.";
      let errorCode = "GENERATION_FAILED";

      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as {
          response?: { data?: { error?: string; code?: string } };
        };
        if (axiosErr.response?.data) {
          errorMessage = axiosErr.response.data.error || errorMessage;
          errorCode = axiosErr.response.data.code || errorCode;
        }
      }

      // Friendly error messages per code
      if (errorCode === "RATE_LIMITED") {
        errorMessage =
          "Hệ thống AI đang quá tải. Vui lòng thử lại sau ít phút 🙏";
        toast.error("AI đang quá tải — vui lòng đợi một chút rồi thử lại.");
      } else if (errorCode === "INVALID_PROMPT") {
        errorMessage = "Prompt không hợp lệ. Vui lòng nhập lại mô tả thiết kế.";
        toast.error("Prompt không hợp lệ — hãy thử mô tả chi tiết hơn.");
      } else {
        toast.error("Không thể tạo thiết kế — vui lòng thử lại.");
      }

      setError({ message: errorMessage, code: errorCode });
      setLoading(false);
    }
  }, [prompt, phoneModel, setSelectedImage, setGeneratedImages]);

  // -----------------------------------------------------------------------
  // Initial fetch on mount
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      generateDesigns();
    }
  }, [generateDesigns]);

  // -----------------------------------------------------------------------
  // Simulated progress bar + rotating messages (runs during API call)
  // Realistic ~3-5 second pacing, completes when API returns
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!loading || progress >= 100) return;

    // Progress: increment slower as it approaches 90% (feels more natural)
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Pause at 90% until API completes
        // Slow down as progress increases
        const increment = prev < 50 ? 3 : prev < 75 ? 2 : 1;
        return Math.min(prev + increment, 90);
      });
    }, 80);

    // Rotate loading messages every ~1.5 seconds
    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearInterval(messageInterval);
    };
  }, [loading, progress]);

  // -----------------------------------------------------------------------
  // Retry handler
  // -----------------------------------------------------------------------
  const handleRetry = () => {
    hasFetchedRef.current = false;
    generateDesigns();
  };

  const handleGoBack = () => {
    if (onBack) onBack();
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------
  return (
    <div className="mx-auto max-w-5xl">
      <AnimatePresence mode="wait">
        {/* === ERROR STATE === */}
        {error && !loading ? (
          <ErrorDisplay
            key="error"
            errorMessage={error.message}
            errorCode={error.code}
            onRetry={handleRetry}
            onGoBack={handleGoBack}
          />
        ) : loading ? (
          /* === LOADING STATE — Don Norman Feedback === */
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12"
          >
            {/* Animated spinner + dynamic text */}
            <div className="flex flex-col items-center justify-center pt-8">
              <div className="relative mb-8 h-32 w-32">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-r-2 border-t-2 border-(--mirai-sem-accent) glow-blue"
                />
                <div className="absolute inset-4 rounded-full border-b-2 border-l-2 border-(--mirai-sem-primary) opacity-50" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="h-10 w-10 animate-pulse text-(--mirai-sem-primary)" />
                </div>
              </div>

              {/* Dynamic loading messages */}
              <AnimatePresence mode="wait">
                <motion.h3
                  key={messageIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="mb-2 font-heading text-2xl font-bold text-foreground"
                >
                  {LOADING_MESSAGES[messageIndex]}
                </motion.h3>
              </AnimatePresence>

              <p className="mb-8 max-w-md text-center text-muted-foreground">
                AI đang phân tích prompt: &quot;{prompt}&quot;
              </p>

              {/* Progress bar */}
              <div className="h-2 w-full max-w-md overflow-hidden rounded-full bg-secondary">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                  className="h-full bg-gradient-to-r from-(--mirai-sem-accent) to-(--mirai-sem-primary) glow-blue"
                />
              </div>
              <div className="mt-2 font-mono font-bold text-(--mirai-sem-primary)">
                {progress}%
              </div>
            </div>

            {/* Skeleton cards — visual preview of incoming content */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`skeleton-${i}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15 }}
                >
                  <SkeletonCard />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          /* === SUCCESS STATE — Display generated designs === */
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {designs.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.15 }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedImage(design.id)}
                  className={`relative aspect-[3/4] cursor-pointer overflow-hidden rounded-3xl border-2 transition-all duration-500 ${
                    selectedImage === design.id
                      ? "border-(--mirai-sem-primary) glow-blue"
                      : "border-transparent grayscale-[0.5] hover:grayscale-0"
                  }`}
                >
                  {/* Generated AI image */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.imageUrl}
                    alt={`AI Design Variant ${index + 1}`}
                    className="absolute inset-0 h-full w-full object-cover"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Label */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="mb-1 text-lg font-bold text-white drop-shadow-lg">
                      Biến thể {index + 1}
                    </div>
                    <div className="line-clamp-2 text-xs text-white/70 drop-shadow">
                      {design.enhancedPrompt.slice(0, 80)}...
                    </div>
                  </div>

                  {/* Selection indicator */}
                  {selectedImage === design.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-(--mirai-sem-primary) shadow-lg"
                    >
                      <Check className="h-6 w-6 stroke-[3px] text-(--mirai-sem-text)" />
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 sm:flex-row">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground"
                onClick={handleRetry}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Tạo lại các mẫu khác
              </Button>

              <div className="flex w-full gap-4 sm:w-auto">
                <Button
                  variant="outline"
                  className="flex-1 rounded-2xl border-accent/30 text-foreground hover:bg-accent/10 sm:flex-none"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Chia sẻ
                </Button>
                <Button
                  disabled={!selectedImage}
                  onClick={onNext}
                  className="flex-1 rounded-2xl bg-accent px-8 py-6 font-bold text-background shadow-md hover:opacity-90 disabled:opacity-50 sm:flex-none"
                >
                  <RefreshCw className="mr-2 h-5 w-5" />
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
