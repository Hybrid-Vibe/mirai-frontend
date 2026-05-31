"use client";

import { Rect, Group, Line, Shape } from "react-konva";
import type { PhoneCaseTemplate } from "@/constants/phone-templates";
import { cutoutToCanvasPx } from "@/constants/phone-templates";

interface TemplateOverlayProps {
  template: PhoneCaseTemplate;
  showGuides: boolean;
  showCameraCutout: boolean;
}

/**
 * Konva overlay layer that renders:
 * 1. Camera cutout masks (semi-transparent dark overlay with holes)
 * 2. Bleed zone guide lines (dashed red)
 * 3. Safe zone guide lines (dotted blue)
 *
 * This layer sits on top of user content and is excluded during print export.
 */
export function TemplateOverlay({
  template,
  showGuides,
  showCameraCutout,
}: TemplateOverlayProps) {
  const { canvasWidth, canvasHeight, bleedPx, safeZonePx } = template;

  return (
    <Group listening={false}>
      {/* Camera cutout overlay — dark mask with transparent holes */}
      {showCameraCutout &&
        template.cameraCutouts.map((cutout, i) => {
          const px = cutoutToCanvasPx(cutout, template);

          return (
            <Group key={`cutout-${i}`}>
              {/* The cutout shape: composite fill to show the hole */}
              <Shape
                sceneFunc={(context, shape) => {
                  context.beginPath();

                  if (cutout.shape === "circle") {
                    const cx = px.x + px.width / 2;
                    const cy = px.y + px.height / 2;
                    const r = px.width / 2;
                    context.arc(cx, cy, r, 0, Math.PI * 2, false);
                  } else if (
                    cutout.shape === "rounded-rect" ||
                    cutout.shape === "pill"
                  ) {
                    const r =
                      cutout.shape === "pill"
                        ? Math.min(px.width, px.height) / 2
                        : px.radius;
                    // Draw rounded rectangle path
                    context.moveTo(px.x + r, px.y);
                    context.lineTo(px.x + px.width - r, px.y);
                    context.arcTo(
                      px.x + px.width,
                      px.y,
                      px.x + px.width,
                      px.y + r,
                      r,
                    );
                    context.lineTo(px.x + px.width, px.y + px.height - r);
                    context.arcTo(
                      px.x + px.width,
                      px.y + px.height,
                      px.x + px.width - r,
                      px.y + px.height,
                      r,
                    );
                    context.lineTo(px.x + r, px.y + px.height);
                    context.arcTo(
                      px.x,
                      px.y + px.height,
                      px.x,
                      px.y + px.height - r,
                      r,
                    );
                    context.lineTo(px.x, px.y + r);
                    context.arcTo(px.x, px.y, px.x + r, px.y, r);
                  }

                  context.closePath();
                  context.fillStrokeShape(shape);
                }}
                fill="rgba(0, 0, 0, 0.35)"
                stroke="#ff4444"
                strokeWidth={2}
                dash={[6, 4]}
              />

              {/* Label */}
              {/* Camera icon hint - small rectangle at top-left of cutout */}
              <Rect
                x={px.x - 1}
                y={px.y - 16}
                width={60}
                height={14}
                fill="rgba(255, 68, 68, 0.85)"
                cornerRadius={3}
              />
            </Group>
          );
        })}

      {/* Bleed zone guide — dashed red rectangle at canvas edge */}
      {showGuides && (
        <>
          {/* Bleed zone border (outer edge of canvas = total area including bleed) */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            stroke="#ff4444"
            strokeWidth={2}
            dash={[10, 6]}
            listening={false}
          />

          {/* Print area border (inside bleed) — solid green */}
          <Rect
            x={bleedPx}
            y={bleedPx}
            width={canvasWidth - bleedPx * 2}
            height={canvasHeight - bleedPx * 2}
            stroke="#00cc66"
            strokeWidth={2}
            listening={false}
          />

          {/* Safe zone border (inside print area) — dotted blue */}
          <Rect
            x={bleedPx + safeZonePx}
            y={bleedPx + safeZonePx}
            width={canvasWidth - (bleedPx + safeZonePx) * 2}
            height={canvasHeight - (bleedPx + safeZonePx) * 2}
            stroke="#4488ff"
            strokeWidth={1.5}
            dash={[4, 4]}
            listening={false}
          />

          {/* Corner marks for bleed area */}
          {[
            // Top-left
            [0, bleedPx, bleedPx, bleedPx],
            [bleedPx, 0, bleedPx, bleedPx],
            // Top-right
            [canvasWidth - bleedPx, bleedPx, canvasWidth, bleedPx],
            [canvasWidth - bleedPx, 0, canvasWidth - bleedPx, bleedPx],
            // Bottom-left
            [0, canvasHeight - bleedPx, bleedPx, canvasHeight - bleedPx],
            [bleedPx, canvasHeight - bleedPx, bleedPx, canvasHeight],
            // Bottom-right
            [
              canvasWidth - bleedPx,
              canvasHeight - bleedPx,
              canvasWidth,
              canvasHeight - bleedPx,
            ],
            [
              canvasWidth - bleedPx,
              canvasHeight - bleedPx,
              canvasWidth - bleedPx,
              canvasHeight,
            ],
          ].map((points, i) => (
            <Line
              key={`mark-${i}`}
              points={points}
              stroke="#ff4444"
              strokeWidth={1}
              opacity={0.6}
              listening={false}
            />
          ))}
        </>
      )}
    </Group>
  );
}
