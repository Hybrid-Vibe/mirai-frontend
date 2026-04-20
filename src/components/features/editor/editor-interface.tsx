"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useDesignStore } from "@/lib/store";
import { Type, Image as ImageIcon, MousePointer2, Layers, Trash2, Plus, ShoppingCart, Share2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ARPreview } from "@/components/features/ar/ARPreview";
import { AnimatePresence } from "framer-motion";

// Import Konva editor dynamically to avoid SSR issues
const KonvaEditor = dynamic(() => import("./konva-editor"), { ssr: false });

export function EditorInterface() {
  const { elements, addElement, setElements } = useDesignStore();
  const [activeTab, setActiveTab] = useState<"text" | "elements" | "layers">("text");
  const [showAR, setShowAR] = useState(false);

  const addText = () => {
    addElement({
      id: `text-${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      text: "Nhập chữ ở đây",
      fontSize: 24,
      color: "#ffffff",
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Sidebar Tools */}
      <div className="w-full lg:w-80 glass border border-[rgba(0,102,255,0.2)] rounded-3xl overflow-hidden shrink-0">
        <div className="flex border-b border-[rgba(0,102,255,0.1)]">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "text" ? "bg-[rgba(0,102,255,0.1)] text-[#00D4FF]" : "text-[#6B85B0] hover:text-[#A0B4D8]"
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Chữ</span>
          </button>
          <button
            onClick={() => setActiveTab("elements")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "elements" ? "bg-[rgba(0,102,255,0.1)] text-[#00D4FF]" : "text-[#6B85B0] hover:text-[#A0B4D8]"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Sticker</span>
          </button>
          <button
            onClick={() => setActiveTab("layers")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "layers" ? "bg-[rgba(0,102,255,0.1)] text-[#00D4FF]" : "text-[#6B85B0] hover:text-[#A0B4D8]"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Lớp</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "text" && (
            <div className="space-y-6">
              <Button 
                onClick={addText}
                className="w-full bg-[#0066FF] hover:bg-[#3385FF] text-white font-bold py-6 rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm văn bản
              </Button>
              
              <div className="grid grid-cols-1 gap-3">
                 <div className="text-xs text-[#6B85B0] font-bold uppercase tracking-widest">Mẫu chữ</div>
                 {["Modern", "Retro", "Neon", "Cyber"].map(style => (
                    <div key={style} className="p-3 bg-[#0D1830] border border-[rgba(255,255,255,0.05)] rounded-xl cursor-pointer hover:border-[#00D4FF] transition-all">
                       <span className="text-white font-heading">{style} Text</span>
                    </div>
                 ))}
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-4">
              {elements.length === 0 ? (
                <div className="py-10 text-center text-[#6B85B0] text-sm italic">
                  Chưa có lớp nào
                </div>
              ) : (
                elements.map(el => (
                  <div key={el.id} className="flex items-center justify-between p-3 bg-[#0D1830] rounded-xl border border-[rgba(255,255,255,0.05)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[rgba(0,102,255,0.1)] flex items-center justify-center">
                        <Type className="w-4 h-4 text-[#0066FF]" />
                      </div>
                      <span className="text-xs text-white font-medium truncate max-w-30">
                        {el.text || "Element"}
                      </span>
                    </div>
                    <button 
                      onClick={() => setElements(elements.filter(item => item.id !== el.id))}
                      className="text-[#4A5D7E] hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Editor Canvas Area */}
      <div className="flex-1 w-full flex flex-col gap-6">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
             <Badge variant="brand" className="py-1.5 px-4 rounded-xl">
               <MousePointer2 className="w-3 h-3 mr-2" />
               Chế độ chỉnh sửa
             </Badge>
          </div>
          <div className="flex items-center gap-2">
             <Button 
               variant="outline" 
               size="sm" 
               onClick={() => setShowAR(true)}
               className="border-[rgba(0,102,255,0.3)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.1)] rounded-xl"
             >
                <Box className="w-4 h-4 mr-2" />
                Xem AR
             </Button>
             <Separator orientation="vertical" className="h-6 bg-[rgba(255,255,255,0.1)]" />
             <Button variant="ghost" size="sm" className="text-[#6B85B0] hover:text-white">Hoàn tác</Button>
             <Button variant="ghost" size="sm" className="text-[#6B85B0] hover:text-white">Làm lại</Button>
          </div>
        </div>

        <div className="flex-1 flex justify-center py-4 bg-dots rounded-[3rem] border border-[rgba(0,102,255,0.1)] overflow-hidden">
           <KonvaEditor />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6">
           <div className="text-sm text-[#6B85B0]">
              Tất cả thay đổi đã được lưu tự động
           </div>
           <div className="flex gap-4 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none border-[rgba(0,102,255,0.2)] text-white hover:bg-[rgba(0,102,255,0.05)] rounded-2xl px-8">
                 <Share2 className="w-4 h-4 mr-2" />
                 Lưu nháp
              </Button>
              <Button className="flex-1 sm:flex-none bg-[#00D4FF] hover:bg-[#33DDFF] text-[#050814] font-bold px-10 py-6 rounded-2xl shadow-[0_8px_30px_rgba(0,212,255,0.4)]">
                 <ShoppingCart className="w-5 h-5 mr-2" />
                 Hoàn tất & Đặt hàng
              </Button>
           </div>
        </div>

        <AnimatePresence>
          {showAR && <ARPreview onClose={() => setShowAR(false)} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
