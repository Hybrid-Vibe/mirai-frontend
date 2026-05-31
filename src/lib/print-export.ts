// ----------------------------------------------------------------------
// Print Export Utilities
// Handles exporting the Konva canvas to print-ready files.
// Supports: PNG 300/600 DPI, transparent camera cutouts, preview exports.
// ----------------------------------------------------------------------

import type { PhoneCaseTemplate } from "@/constants/phone-templates";
import { cutoutToCanvasPx } from "@/constants/phone-templates";
import type Konva from "konva";

export interface ExportOptions {
  /** Phone case template with dimensions */
  template: PhoneCaseTemplate;
  /** Output format */
  format: "png" | "jpeg";
  /** Target DPI (300 standard, 600 for premium) */
  dpi: 300 | 600;
  /** Whether to include bleed area in output */
  includeBleed: boolean;
  /** Make camera cutout areas transparent */
  transparentCamera: boolean;
}

/**
 * Export the Konva stage as a print-ready image blob.
 *
 * Process:
 * 1. Render the stage at the target pixel ratio
 * 2. Optionally crop out bleed area
 * 3. Optionally make camera cutout areas transparent
 * 4. Return as Blob for download or upload
 */
export async function exportPrintReady(
  stage: Konva.Stage,
  options: ExportOptions,
): Promise<Blob> {
  const { template, format, dpi, includeBleed, transparentCamera } = options;

  // pixelRatio scales the output resolution
  // Since our canvas is already at 300 DPI dimensions, ratio of 1 = 300 DPI
  const pixelRatio = dpi / 300;

  // Get the raw data URL from Konva at full resolution
  const dataUrl = stage.toDataURL({
    pixelRatio,
    mimeType: format === "jpeg" ? "image/jpeg" : "image/png",
    quality: format === "jpeg" ? 0.95 : undefined,
  });

  // Load the exported image into a canvas for post-processing
  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot create canvas context");

  if (includeBleed) {
    // Full canvas including bleed
    canvas.width = template.canvasWidth * pixelRatio;
    canvas.height = template.canvasHeight * pixelRatio;
    ctx.drawImage(img, 0, 0);
  } else {
    // Crop to print area only (remove bleed)
    const bleedPx = template.bleedPx * pixelRatio;
    canvas.width = template.printAreaWidth * pixelRatio;
    canvas.height = template.printAreaHeight * pixelRatio;
    ctx.drawImage(
      img,
      bleedPx,
      bleedPx,
      canvas.width,
      canvas.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }

  // Make camera cutout areas transparent
  if (transparentCamera && format === "png") {
    const offsetX = includeBleed ? 0 : -(template.bleedPx * pixelRatio);
    const offsetY = includeBleed ? 0 : -(template.bleedPx * pixelRatio);

    for (const cutout of template.cameraCutouts) {
      const px = cutoutToCanvasPx(cutout, template);
      const scaledX = px.x * pixelRatio + offsetX;
      const scaledY = px.y * pixelRatio + offsetY;
      const scaledW = px.width * pixelRatio;
      const scaledH = px.height * pixelRatio;
      const scaledR = px.radius * pixelRatio;

      // Use composite operation to "erase" the camera area
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();

      if (cutout.shape === "circle") {
        const cx = scaledX + scaledW / 2;
        const cy = scaledY + scaledH / 2;
        ctx.arc(cx, cy, scaledW / 2, 0, Math.PI * 2);
      } else {
        // Rounded rectangle
        const r =
          cutout.shape === "pill" ? Math.min(scaledW, scaledH) / 2 : scaledR;
        ctx.moveTo(scaledX + r, scaledY);
        ctx.lineTo(scaledX + scaledW - r, scaledY);
        ctx.arcTo(
          scaledX + scaledW,
          scaledY,
          scaledX + scaledW,
          scaledY + r,
          r,
        );
        ctx.lineTo(scaledX + scaledW, scaledY + scaledH - r);
        ctx.arcTo(
          scaledX + scaledW,
          scaledY + scaledH,
          scaledX + scaledW - r,
          scaledY + scaledH,
          r,
        );
        ctx.lineTo(scaledX + r, scaledY + scaledH);
        ctx.arcTo(
          scaledX,
          scaledY + scaledH,
          scaledX,
          scaledY + scaledH - r,
          r,
        );
        ctx.lineTo(scaledX, scaledY + r);
        ctx.arcTo(scaledX, scaledY, scaledX + r, scaledY, r);
      }

      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  return canvasToBlob(canvas, format);
}

/**
 * Export a preview image — includes visual indicators like
 * a phone case outline around the design for customer viewing.
 */
export async function exportPreview(
  stage: Konva.Stage,
  template: PhoneCaseTemplate,
): Promise<Blob> {
  const pixelRatio = 1; // Preview is screen-resolution
  const padding = 40; // px padding around case

  const dataUrl = stage.toDataURL({
    pixelRatio,
    mimeType: "image/png",
  });

  const img = await loadImage(dataUrl);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Cannot create canvas context");

  // Preview size: print area + padding + case outline
  const caseWidth = template.printAreaWidth;
  const caseHeight = template.printAreaHeight;
  canvas.width = caseWidth + padding * 2;
  canvas.height = caseHeight + padding * 2;

  // Background
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Case outline (rounded rectangle)
  const caseRadius = 30;
  ctx.save();
  ctx.beginPath();
  roundedRect(ctx, padding, padding, caseWidth, caseHeight, caseRadius);
  ctx.clip();

  // Draw the design (cropped to print area, no bleed)
  const bleedPx = template.bleedPx;
  ctx.drawImage(
    img,
    bleedPx,
    bleedPx,
    template.printAreaWidth,
    template.printAreaHeight,
    padding,
    padding,
    caseWidth,
    caseHeight,
  );
  ctx.restore();

  // Case border
  ctx.beginPath();
  roundedRect(ctx, padding, padding, caseWidth, caseHeight, caseRadius);
  ctx.strokeStyle = "#333333";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Camera cutout indicators
  for (const cutout of template.cameraCutouts) {
    const px = cutoutToCanvasPx(cutout, template);
    // Offset: remove bleed, add padding
    const x = px.x - bleedPx + padding;
    const y = px.y - bleedPx + padding;

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();

    if (cutout.shape === "circle") {
      ctx.arc(
        x + px.width / 2,
        y + px.height / 2,
        px.width / 2,
        0,
        Math.PI * 2,
      );
    } else {
      const r =
        cutout.shape === "pill" ? Math.min(px.width, px.height) / 2 : px.radius;
      roundedRect(ctx, x, y, px.width, px.height, r);
    }
    ctx.fill();
    ctx.restore();

    // Re-draw camera border
    ctx.beginPath();
    if (cutout.shape === "circle") {
      ctx.arc(
        x + px.width / 2,
        y + px.height / 2,
        px.width / 2,
        0,
        Math.PI * 2,
      );
    } else {
      const r =
        cutout.shape === "pill" ? Math.min(px.width, px.height) / 2 : px.radius;
      roundedRect(ctx, x, y, px.width, px.height, r);
    }
    ctx.strokeStyle = "#666666";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  return canvasToBlob(canvas, "png");
}

/** Trigger a file download from a Blob */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generate a filename for print export.
 * Format: MIRAI_<model>_<timestamp>_<dpi>dpi.<ext>
 */
export function generatePrintFilename(
  template: PhoneCaseTemplate,
  options: ExportOptions,
): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const ext = options.format === "jpeg" ? "jpg" : "png";
  return `MIRAI_${template.id}_${timestamp}_${options.dpi}dpi.${ext}`;
}

// ─── Helpers ──────────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg",
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob from canvas"));
      },
      mimeType,
      format === "jpeg" ? 0.95 : undefined,
    );
  });
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
}
