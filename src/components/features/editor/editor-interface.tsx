"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useDesignStore } from "@/lib/store";
import {
  Type,
  Image as ImageIcon,
  MousePointer2,
  Layers,
  Trash2,
  Plus,
  ShoppingCart,
  Share2,
  Box,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ARPreview } from "@/components/features/ar/ARPreview";
import { AnimatePresence } from "framer-motion";

// Import Konva editor dynamically to avoid SSR issues
const KonvaEditor = dynamic(() => import("./konva-editor"), { ssr: false });

export function EditorInterface() {
  const { elements, addElement, setElements } = useDesignStore();
  const [activeTab, setActiveTab] = useState<"text" | "elements" | "layers">(
    "text",
  );
  const [showAR, setShowAR] = useState(false);

  const addText = () => {
    addElement({
      id: `text-${Date.now()}`,
      type: "text",
      x: 100,
      y: 100,
      text: "Nhập chữ ở đây",
      fontSize: 24,
      color: "var(--mirai-sem-background)",
    });
  };

  return (
    <div className="flex flex-col items-start gap-8 lg:flex-row">
      {/* Sidebar Tools */}
      <div className="w-full shrink-0 overflow-hidden rounded-3xl border border-border glass lg:w-80">
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "text"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Chữ
            </span>
          </button>
          <button
            onClick={() => setActiveTab("elements")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "elements"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Sticker
            </span>
          </button>
          <button
            onClick={() => setActiveTab("layers")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-all ${
              activeTab === "layers"
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              Lớp
            </span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === "text" && (
            <div className="space-y-6">
              <Button
                onClick={addText}
                className="w-full rounded-2xl bg-accent py-6 font-bold text-background hover:opacity-90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Thêm văn bản
              </Button>

              <div className="grid grid-cols-1 gap-3">
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Mẫu chữ
                </div>
                {["Modern", "Retro", "Neon", "Cyber"].map((style) => (
                  <div
                    key={style}
                    className="cursor-pointer rounded-xl border border-border bg-secondary p-3 transition-all hover:border-primary"
                  >
                    <span className="font-heading text-foreground">
                      {style} Text
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "layers" && (
            <div className="space-y-4">
              {elements.length === 0 ? (
                <div className="py-10 text-center text-sm italic text-muted-foreground">
                  Chưa có lớp nào
                </div>
              ) : (
                elements.map((el) => (
                  <div
                    key={el.id}
                    className="flex items-center justify-between rounded-xl border border-border bg-secondary p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15">
                        <Type className="h-4 w-4 text-primary" />
                      </div>
                      <span className="max-w-30 truncate text-xs font-medium text-foreground">
                        {el.text || "Element"}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setElements(
                          elements.filter((item) => item.id !== el.id),
                        )
                      }
                      className="text-muted-foreground transition-colors hover:text-destructive"
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
      <div className="flex w-full flex-1 flex-col gap-6">
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
              className="rounded-xl border-accent/40 text-accent hover:bg-accent/10"
            >
              <Box className="w-4 h-4 mr-2" />
              Xem AR
            </Button>
            <Separator
              orientation="vertical"
              className="h-6 bg-border"
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Hoàn tác
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              Làm lại
            </Button>
          </div>
        </div>

        <div className="flex flex-1 justify-center overflow-hidden rounded-[3rem] border border-border bg-dots py-4">
          <KonvaEditor />
        </div>

        <div className="flex flex-col items-center justify-between gap-6 pt-6 sm:flex-row">
          <div className="text-sm text-muted-foreground">
            Tất cả thay đổi đã được lưu tự động
          </div>
          <div className="flex w-full gap-4 sm:w-auto">
            <Button
              variant="outline"
              className="flex-1 rounded-2xl border-accent/30 px-8 text-foreground hover:bg-accent/10 sm:flex-none"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Lưu nháp
            </Button>
            <Button className="flex-1 rounded-2xl bg-primary px-10 py-6 font-bold text-foreground shadow-md hover:opacity-90 sm:flex-none">
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
