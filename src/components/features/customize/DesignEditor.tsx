"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
  Stage,
  Layer,
  Text,
  Image as KonvaImage,
  Transformer,
  Rect,
} from "react-konva";
import useImage from "use-image";
import { useDesignStore, type CanvasElement } from "@/lib/store";
import { TemplateOverlay } from "@/components/features/editor/template-overlay";
import { getDisplayScale } from "@/constants/phone-templates";
import type Konva from "konva";

// Max viewport size for the editor display area
const VIEWPORT_MAX_W = 420;
const VIEWPORT_MAX_H = 620;
const EXPORT_PIXEL_RATIO = 1.5;

// ─── Draggable + Resizable Image ────────────────────────────────
function URLImage({
  element,
  isSelected,
  onSelect,
  onTransformEnd,
  onDragEnd,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransformEnd: (attrs: Partial<CanvasElement>) => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const [image] = useImage(element.imageUrl || "", "anonymous");
  const shapeRef = useRef<Konva.Image>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  // Compute initial size when image loads
  const canvasW = useDesignStore((s) => s.selectedTemplate?.canvasWidth ?? 960);
  const canvasH = useDesignStore(
    (s) => s.selectedTemplate?.canvasHeight ?? 1200,
  );

  // Auto-correct aspect ratio in store for old/undefined elements
  useEffect(() => {
    if (image && (!element.width || !element.height)) {
      const imgRatio = image.width / image.height;
      const maxW = canvasW * 0.8;
      const maxH = canvasH * 0.6;
      let w = maxW;
      let h = maxW / imgRatio;
      if (w / imgRatio > maxH) {
        h = maxH;
        w = maxH * imgRatio;
      }
      onTransformEnd({
        width: w,
        height: h,
      });
    }
  }, [image, element.width, element.height, canvasW, canvasH, onTransformEnd]);

  let drawW = element.width;
  let drawH = element.height;
  if (!drawW || !drawH) {
    if (image) {
      const imgRatio = image.width / image.height;
      const maxW = canvasW * 0.8;
      const maxH = canvasH * 0.6;
      drawW = maxW;
      drawH = maxW / imgRatio;
      if (drawW / imgRatio > maxH) {
        drawH = maxH;
        drawW = maxH * imgRatio;
      }
    } else {
      drawW = canvasW * 0.5;
      drawH = canvasH * 0.4;
    }
  }

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={drawW}
        height={drawH}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          onTransformEnd({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * node.scaleX()),
            height: Math.max(20, node.height() * node.scaleY()),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          keepRatio
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20 || newBox.height < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── Draggable + Resizable Text ─────────────────────────────────
function DraggableText({
  element,
  isSelected,
  onSelect,
  onTransformEnd,
  onDragEnd,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onTransformEnd: (attrs: Partial<CanvasElement>) => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const shapeRef = useRef<Konva.Text>(null);
  const trRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer()?.batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        ref={shapeRef}
        text={element.text || "Text"}
        x={element.x}
        y={element.y}
        fontSize={element.fontSize || 32}
        fontFamily={element.fontFamily || "Bricolage Grotesque"}
        fontStyle={element.fontStyle || "normal"}
        fill={element.color || "#ffffff"}
        rotation={element.rotation || 0}
        scaleX={element.scaleX || 1}
        scaleY={element.scaleY || 1}
        draggable
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onDragEnd(e.target.x(), e.target.y());
        }}
        onTransformEnd={() => {
          const node = shapeRef.current;
          if (!node) return;
          const newFontSize = Math.round(
            (element.fontSize || 32) * node.scaleX(),
          );
          onTransformEnd({
            x: node.x(),
            y: node.y(),
            fontSize: Math.max(8, newFontSize),
            rotation: node.rotation(),
            scaleX: 1,
            scaleY: 1,
          });
          node.scaleX(1);
          node.scaleY(1);
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={[
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right",
            "middle-left",
            "middle-right",
          ]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

// ─── Background Image Layer ─────────────────────────────────────
function BackgroundImageLayer({
  imageUrl,
  canvasWidth,
  canvasHeight,
}: {
  imageUrl: string;
  canvasWidth: number;
  canvasHeight: number;
}) {
  const [image] = useImage(imageUrl, "anonymous");

  if (!image) return null;

  // Cover-fit the image to canvas (like CSS background-size: cover)
  const imgRatio = image.width / image.height;
  const canvasRatio = canvasWidth / canvasHeight;

  let drawWidth: number;
  let drawHeight: number;
  let drawX: number;
  let drawY: number;

  if (imgRatio > canvasRatio) {
    // Image is wider — fit by height
    drawHeight = canvasHeight;
    drawWidth = canvasHeight * imgRatio;
    drawX = (canvasWidth - drawWidth) / 2;
    drawY = 0;
  } else {
    // Image is taller — fit by width
    drawWidth = canvasWidth;
    drawHeight = canvasWidth / imgRatio;
    drawX = 0;
    drawY = (canvasHeight - drawHeight) / 2;
  }

  return (
    <KonvaImage
      image={image}
      x={drawX}
      y={drawY}
      width={drawWidth}
      height={drawHeight}
      listening={false}
    />
  );
}

// ─── Main Design Editor ─────────────────────────────────────────
export default function DesignEditor({
  onCanvasExport,
  onCasePreviewExport,
  backgroundColor,
  stageRef: externalStageRef,
}: {
  onCanvasExport?: (dataUrl: string) => void;
  onCasePreviewExport?: (dataUrl: string) => void;
  backgroundColor?: string;
  stageRef?: React.RefObject<Konva.Stage | null>;
}) {
  const {
    elements,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    selectedTemplate,
    showGuides,
    showCameraCutout,
    backgroundImage,
  } = useDesignStore();

  const [mounted, setMounted] = useState(false);
  const internalStageRef = useRef<Konva.Stage>(null);
  const stageRef = externalStageRef || internalStageRef;
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Canvas dimensions from template, or fallback
  const canvasW = selectedTemplate?.canvasWidth ?? 960;
  const canvasH = selectedTemplate?.canvasHeight ?? 1200;

  const [viewportMaxW, setViewportMaxW] = useState(VIEWPORT_MAX_W);
  const [viewportMaxH, setViewportMaxH] = useState(VIEWPORT_MAX_H);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      if (w < 480) {
        setViewportMaxW(w - 48);
        setViewportMaxH((w - 48) * (620 / 420));
      } else if (w < 768) {
        setViewportMaxW(380);
        setViewportMaxH(380 * (620 / 420));
      } else {
        setViewportMaxW(VIEWPORT_MAX_W);
        setViewportMaxH(VIEWPORT_MAX_H);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Display scale: fit canvas into viewport
  const displayScale = selectedTemplate
    ? getDisplayScale(selectedTemplate, viewportMaxW, viewportMaxH)
    : Math.min(viewportMaxW / canvasW, viewportMaxH / canvasH);

  const displayW = Math.round(canvasW * displayScale);
  const displayH = Math.round(canvasH * displayScale);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Debounced canvas export for 3D preview
  const exportCanvas = useCallback(() => {
    if (!stageRef.current) return;
    if (!onCanvasExport && !onCasePreviewExport) return;

    const stage = stageRef.current;
    const previousScale = stage.scale();

    // Hide elements we don't want in the export
    const overlayLayer = stage.findOne("#overlay-layer");
    if (overlayLayer) overlayLayer.hide();

    const transformers = stage.find("Transformer");
    transformers.forEach((tr) => tr.hide());

    stage.scale({ x: 1, y: 1 });
    stage.batchDraw();

    // Export synchronous
    const dataUrl = stage.toDataURL({ pixelRatio: EXPORT_PIXEL_RATIO });
    onCanvasExport?.(dataUrl);

    if (selectedTemplate && onCasePreviewExport) {
      const printAreaDataUrl = stage.toDataURL({
        x: selectedTemplate.bleedPx,
        y: selectedTemplate.bleedPx,
        width: selectedTemplate.printAreaWidth,
        height: selectedTemplate.printAreaHeight,
        pixelRatio: EXPORT_PIXEL_RATIO,
      });

      onCasePreviewExport(printAreaDataUrl);
    }

    // Restore visibility
    stage.scale(previousScale);
    if (overlayLayer) overlayLayer.show();
    transformers.forEach((tr) => tr.show());
    stage.batchDraw();
  }, [onCanvasExport, onCasePreviewExport, selectedTemplate, stageRef]);

  // Auto-export when elements change
  useEffect(() => {
    if (!onCanvasExport) return;
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    exportTimerRef.current = setTimeout(exportCanvas, 300);
    return () => {
      if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    };
  }, [
    elements,
    backgroundImage,
    backgroundColor,
    exportCanvas,
    onCasePreviewExport,
    onCanvasExport,
  ]);

  // Click on empty area → deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementId(null);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative max-w-full" style={{ width: displayW }}>
      {/* Template info badge */}
      {selectedTemplate && (
        <div className="absolute -top-7 left-0 z-10 flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5 font-mono">
            {selectedTemplate.printWidth}×{selectedTemplate.printHeight}mm
          </span>
          <span className="rounded bg-secondary px-2 py-0.5 font-mono">
            {canvasW}×{canvasH}px @300 DPI
          </span>
        </div>
      )}

      <div
        className="overflow-hidden"
        style={{ width: displayW, height: displayH }}
      >
        <Stage
          ref={stageRef}
          width={canvasW}
          height={canvasH}
          scaleX={displayScale}
          scaleY={displayScale}
          style={{
            width: displayW,
            height: displayH,
          }}
          onClick={handleStageClick}
          onTap={(e) => {
            if (e.target === e.target.getStage()) setSelectedElementId(null);
          }}
        >
          {/* Layer 1: Background */}
          <Layer>
            {/* Solid background color */}
            <Rect
              x={0}
              y={0}
              width={canvasW}
              height={canvasH}
              fill={backgroundColor || "#1a1a2e"}
              listening={false}
            />

            {/* Background image (AI-generated or uploaded) */}
            {backgroundImage && (
              <BackgroundImageLayer
                imageUrl={backgroundImage}
                canvasWidth={canvasW}
                canvasHeight={canvasH}
              />
            )}
          </Layer>

          {/* Layer 2: User elements (text, images, stickers) */}
          <Layer>
            {elements.map((el) => {
              if (el.type === "text") {
                return (
                  <DraggableText
                    key={el.id}
                    element={el}
                    isSelected={selectedElementId === el.id}
                    onSelect={() => setSelectedElementId(el.id)}
                    onTransformEnd={(attrs) => updateElement(el.id, attrs)}
                    onDragEnd={(x, y) => updateElement(el.id, { x, y })}
                  />
                );
              }
              if (el.type === "image") {
                return (
                  <URLImage
                    key={el.id}
                    element={el}
                    isSelected={selectedElementId === el.id}
                    onSelect={() => setSelectedElementId(el.id)}
                    onTransformEnd={(attrs) => updateElement(el.id, attrs)}
                    onDragEnd={(x, y) => updateElement(el.id, { x, y })}
                  />
                );
              }
              return null;
            })}
          </Layer>

          {/* Layer 3: Template overlay (camera cutouts, guides) — NOT exported */}
          {selectedTemplate && (
            <Layer listening={false} id="overlay-layer">
              <TemplateOverlay
                template={selectedTemplate}
                showGuides={showGuides}
                showCameraCutout={showCameraCutout}
              />
            </Layer>
          )}
        </Stage>
      </div>

      {/* Legend (below canvas) */}
      {selectedTemplate && showGuides && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 border border-dashed border-red-500" />
            Bleed ({selectedTemplate.bleed}mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 border border-green-500" />
            Print area
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 border border-dashed border-blue-400" />
            Safe zone ({selectedTemplate.safeZone}mm)
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-4 bg-black/30" />
            Camera cutout
          </span>
        </div>
      )}
    </div>
  );
}
