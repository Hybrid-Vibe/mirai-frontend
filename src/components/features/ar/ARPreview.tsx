"use client";

import { motion } from "framer-motion";
import { X, Box, Smartphone, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Model-viewer needs to be imported only on the client
if (typeof window !== "undefined") {
  import("@google/model-viewer");
}

export function ARPreview({ onClose }: { onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8"
    >
      <div
        className="absolute inset-0 bg-foreground/90 backdrop-blur-xl"
        onClick={onClose}
      />

      <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-[3rem] border border-(--mirai-sem-border) glass shadow-[0_0_100px_var(--mirai-state-focus-ring)]">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-background/15 text-background transition-all hover:bg-background/30"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-8 left-8 z-10">
          <h2 className="flex items-center gap-3 font-heading text-2xl font-bold text-(--mirai-sem-background)">
            <Box className="h-6 w-6 text-(--mirai-sem-primary)" />
            Xem trước 3D & AR
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Xoay và zoom để xem chi tiết thiết kế của bạn.
          </p>
        </div>

        {/* Model Viewer Container */}
        <div className="w-full h-full flex items-center justify-center bg-grid opacity-30">
          {/* Placeholder for real 3D model */}
          <div className="flex flex-col items-center gap-6 text-center px-6">
            <div className="relative">
              <div className="h-64 w-32 rounded-[2.5rem] border-4 border-(--mirai-sem-accent)/45 bg-gradient-to-br from-(--mirai-sem-accent) to-(--mirai-sem-primary) opacity-25 animate-pulse" />
              <Smartphone className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-(--mirai-sem-primary)" />
            </div>
            <div>
              <p className="mb-2 text-lg font-bold text-(--mirai-sem-background)">
                Đang tải mô hình 3D...
              </p>
              <p className="max-w-xs text-sm text-muted-foreground">
                Tính năng AR Preview yêu cầu file .glb của ốp lưng. Đang được
                tích hợp.
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-(--mirai-sem-accent)/30 text-(--mirai-sem-background) hover:bg-(--mirai-sem-accent)/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Quét mã QR để xem AR trên điện thoại
            </Button>
          </div>
        </div>

        {/* Real model-viewer component (commented out as we don't have a .glb yet) */}
        {/* 
        <model-viewer
          src="/models/phone-case.glb"
          ios-src=""
          poster="poster.webp"
          alt="MIRAI Phone Case 3D Preview"
          shadow-intensity="1"
          camera-controls
          auto-rotate
          ar
          className="w-full h-full"
        ></model-viewer>
        */}
      </div>
    </motion.div>
  );
}
