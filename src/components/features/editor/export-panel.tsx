"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileImage,
  Settings2,
  Eye,
  Printer,
  Check,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type Konva from "konva";
import type { PhoneCaseTemplate } from "@/constants/phone-templates";
import {
  exportPrintReady,
  exportPreview,
  downloadFile,
  generatePrintFilename,
} from "@/lib/print-export";
import type { ExportOptions } from "@/lib/print-export";

interface ExportPanelProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  template: PhoneCaseTemplate;
}

export function ExportPanel({ stageRef, template }: ExportPanelProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [exportDone, setExportDone] = useState<string | null>(null);

  // Export settings
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [dpi, setDpi] = useState<300 | 600>(300);
  const [includeBleed, setIncludeBleed] = useState(true);
  const [transparentCamera, setTransparentCamera] = useState(true);

  const handleExportPrint = async () => {
    if (!stageRef.current) {
      toast.error("Canvas chưa sẵn sàng");
      return;
    }

    setIsExporting(true);
    setExportDone(null);

    try {
      const options: ExportOptions = {
        template,
        format,
        dpi,
        includeBleed,
        transparentCamera,
      };

      const blob = await exportPrintReady(stageRef.current, options);
      const filename = generatePrintFilename(template, options);
      downloadFile(blob, filename);

      const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
      setExportDone("print");
      toast.success(`Đã xuất file in ${dpi} DPI (${sizeMB} MB) — ${filename}`);
    } catch (err) {
      console.error("[ExportPanel] Print export failed:", err);
      toast.error("Xuất file thất bại. Vui lòng thử lại.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPreview = async () => {
    if (!stageRef.current) {
      toast.error("Canvas chưa sẵn sàng");
      return;
    }

    setIsExporting(true);
    setExportDone(null);

    try {
      const blob = await exportPreview(stageRef.current, template);
      const filename = `MIRAI_${template.id}_preview.png`;
      downloadFile(blob, filename);

      setExportDone("preview");
      toast.success("Đã xuất file preview");
    } catch (err) {
      console.error("[ExportPanel] Preview export failed:", err);
      toast.error("Xuất preview thất bại.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Printer className="h-4 w-4 text-primary" />
          Xuất file
        </h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Tuỳ chỉnh
          <ChevronDown
            className={`h-3 w-3 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Advanced settings */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 rounded-lg border border-border bg-secondary/50 p-3">
              {/* Format */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Định dạng</span>
                <div className="flex gap-1">
                  {(["png", "jpeg"] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFormat(f)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        format === f
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {f.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* DPI */}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">DPI</span>
                <div className="flex gap-1">
                  {([300, 600] as const).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDpi(d)}
                      className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                        dpi === d
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Include bleed */}
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Bao gồm bleed
                </span>
                <input
                  type="checkbox"
                  checked={includeBleed}
                  onChange={(e) => setIncludeBleed(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              {/* Transparent camera */}
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Camera trong suốt
                </span>
                <input
                  type="checkbox"
                  checked={transparentCamera}
                  onChange={(e) => setTransparentCamera(e.target.checked)}
                  className="h-4 w-4 accent-primary"
                />
              </label>

              {/* Template info */}
              <div className="border-t border-border pt-2">
                <div className="text-[10px] text-muted-foreground">
                  Template: {template.label} · {template.printWidth}×
                  {template.printHeight}mm · Bleed {template.bleed}mm
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Output: {Math.round(template.canvasWidth * (dpi / 300))}×
                  {Math.round(template.canvasHeight * (dpi / 300))}px @ {dpi}{" "}
                  DPI
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Export buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={handleExportPreview}
          className="flex-1 rounded-lg border-border text-xs"
        >
          {isExporting && exportDone !== "preview" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : exportDone === "preview" ? (
            <Check className="mr-1.5 h-3.5 w-3.5 text-green-500" />
          ) : (
            <Eye className="mr-1.5 h-3.5 w-3.5" />
          )}
          Preview
        </Button>

        <Button
          size="sm"
          disabled={isExporting}
          onClick={handleExportPrint}
          className="flex-1 rounded-lg bg-gradient-to-r from-primary to-accent text-xs font-bold text-primary-foreground"
        >
          {isExporting && exportDone !== "print" ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : exportDone === "print" ? (
            <Check className="mr-1.5 h-3.5 w-3.5" />
          ) : (
            <Download className="mr-1.5 h-3.5 w-3.5" />
          )}
          File in {dpi} DPI
        </Button>
      </div>

      {/* Quick info */}
      <div className="flex items-start gap-2 rounded-lg bg-blue-500/5 p-2.5">
        <FileImage className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-400" />
        <p className="text-[10px] leading-relaxed text-muted-foreground">
          <strong className="text-foreground">File in</strong>: PNG {dpi} DPI,
          kích thước {template.printWidth}×{template.printHeight}mm
          {transparentCamera && ", vùng camera trong suốt"}
          {includeBleed && `, bleed ${template.bleed}mm`}. Gửi trực tiếp cho
          xưởng in.
        </p>
      </div>
    </div>
  );
}
