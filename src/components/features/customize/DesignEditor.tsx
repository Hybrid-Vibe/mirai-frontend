"use client";

import { useEffect, useState } from "react";
import { Stage, Layer, Text, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { useDesignStore, type CanvasElement } from "@/lib/store";

// Helper component to render images safely in Konva
const URLImage = ({ element }: { element: CanvasElement }) => {
  const [image] = useImage(element.imageUrl || "", "anonymous");
  return (
    <KonvaImage
      image={image}
      x={element.x}
      y={element.y}
      draggable
      onDragEnd={() => {
        // Here we could update the store with new x,y if needed
      }}
    />
  );
};

export default function DesignEditor() {
  const { elements, selectedImage } = useDesignStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <Stage width={280} height={560} className="w-full h-full">
      <Layer>
        {/* Background if any selected from AI */}
        {selectedImage && (
          <URLImage element={{ imageUrl: selectedImage, x: 0, y: 0 }} />
        )}

        {/* User Added Elements */}
        {elements.map((el) => {
          if (el.type === "text") {
            return (
              <Text
                key={el.id}
                text={el.text}
                x={el.x}
                y={el.y}
                fontSize={el.fontSize || 24}
                fill={el.color || "black"}
                draggable
              />
            );
          }
          if (el.type === "image") {
            return <URLImage key={el.id} element={el} />;
          }
          return null;
        })}
      </Layer>
    </Stage>
  );
}
