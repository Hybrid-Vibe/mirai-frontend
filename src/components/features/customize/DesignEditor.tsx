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
import type Konva from "konva";

const CANVAS_W = 400;
const CANVAS_H = 560;

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

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={image}
        x={element.x}
        y={element.y}
        width={
          element.width ||
          (image?.width ? Math.min(image.width, CANVAS_W * 0.8) : 200)
        }
        height={
          element.height ||
          (image?.height ? Math.min(image.height, CANVAS_H * 0.6) : 200)
        }
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

// ─── Main Design Editor ─────────────────────────────────────────
export default function DesignEditor({
  onCanvasExport,
  backgroundColor,
}: {
  onCanvasExport?: (dataUrl: string) => void;
  backgroundColor?: string;
}) {
  const { elements, selectedElementId, setSelectedElementId, updateElement } =
    useDesignStore();
  const [mounted, setMounted] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const exportTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  // Debounced canvas export for 3D preview
  const exportCanvas = useCallback(() => {
    if (!stageRef.current || !onCanvasExport) return;
    // Deselect elements before export to hide transformer handles
    const prevSelected = selectedElementId;
    setSelectedElementId(null);

    // Wait for next frame to render without transformer
    requestAnimationFrame(() => {
      if (!stageRef.current) return;
      const dataUrl = stageRef.current.toDataURL({ pixelRatio: 2 });
      onCanvasExport(dataUrl);
      // Restore selection
      if (prevSelected) setSelectedElementId(prevSelected);
    });
  }, [onCanvasExport, selectedElementId, setSelectedElementId]);

  // Auto-export when elements change
  useEffect(() => {
    if (!onCanvasExport) return;
    if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    exportTimerRef.current = setTimeout(exportCanvas, 300);
    return () => {
      if (exportTimerRef.current) clearTimeout(exportTimerRef.current);
    };
  }, [elements, exportCanvas, onCanvasExport]);

  // Click on empty area → deselect
  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementId(null);
    }
  };

  if (!mounted) return null;

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_W}
      height={CANVAS_H}
      className="w-full h-full"
      onClick={handleStageClick}
      onTap={(e) => {
        if (e.target === e.target.getStage()) setSelectedElementId(null);
      }}
    >
      <Layer>
        {/* Canvas background */}
        <Rect
          x={0}
          y={0}
          width={CANVAS_W}
          height={CANVAS_H}
          fill={backgroundColor || "#1a1a2e"}
          listening={false}
        />

        {/* Render all elements */}
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
    </Stage>
  );
}
