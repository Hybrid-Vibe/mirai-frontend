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
      <div className="absolute inset-0 bg-[#050814]/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative w-full max-w-4xl aspect-video glass rounded-[3rem] border border-[rgba(0,102,255,0.3)] overflow-hidden shadow-[0_0_100px_rgba(0,102,255,0.2)]">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 transition-all z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="absolute top-8 left-8 z-10">
           <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-3">
              <Box className="w-6 h-6 text-[#00D4FF]" />
              Xem trước 3D & AR
           </h2>
           <p className="text-[#6B85B0] text-sm mt-1">Xoay và zoom để xem chi tiết thiết kế của bạn.</p>
        </div>

        {/* Model Viewer Container */}
        <div className="w-full h-full flex items-center justify-center bg-grid opacity-30">
           {/* Placeholder for real 3D model */}
           <div className="flex flex-col items-center gap-6 text-center px-6">
              <div className="relative">
                 <div className="w-32 h-64 rounded-[2.5rem] border-4 border-[rgba(0,102,255,0.5)] bg-gradient-to-br from-[#0066FF] to-[#00D4FF] opacity-20 glow-blue animate-pulse" />
                 <Smartphone className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-[#00D4FF]" />
              </div>
              <div>
                 <p className="text-white font-bold text-lg mb-2">Đang tải mô hình 3D...</p>
                 <p className="text-[#6B85B0] text-sm max-w-xs">Tính năng AR Preview yêu cầu file .glb của ốp lưng. Đang được tích hợp.</p>
              </div>
              <Button variant="outline" className="border-[rgba(0,102,255,0.2)] text-white hover:bg-[rgba(0,102,255,0.05)] rounded-2xl">
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
