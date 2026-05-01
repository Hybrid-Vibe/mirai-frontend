"use client";

import {
  Stage,
  Layer,
  Image as KonvaImage,
  Text as KonvaText,
} from "react-konva";
import useImage from "use-image";
import { useDesignStore } from "@/lib/store";

const EditorCanvas = () => {
  const { selectedImage, elements, setElements } = useDesignStore();
  const [img] = useImage(
    selectedImage
      ? `https://placehold.co/600x800?text=Design+${selectedImage}`
      : "",
  );

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[3rem] border-8 border-(--mirai-sem-border) bg-(--mirai-sem-text) shadow-2xl">
      <Stage
        width={300}
        height={600}
        className="bg-(--mirai-sem-text) shadow-2xl"
      >
        <Layer>
          {img && (
            <KonvaImage image={img} width={300} height={600} id="background" />
          )}
          {elements.map((el, i) => {
            if (el.type === "text") {
              return (
                <KonvaText
                  key={el.id}
                  id={el.id}
                  text={el.text}
                  x={el.x}
                  y={el.y}
                  fill={el.color}
                  fontSize={el.fontSize}
                  draggable
                  onDragEnd={(e) => {
                    const newEls = [...elements];
                    newEls[i] = { ...el, x: e.target.x(), y: e.target.y() };
                    setElements(newEls);
                  }}
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Phone Notch Overlay */}
      <div className="pointer-events-none absolute left-1/2 top-0 z-10 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-(--mirai-sem-text)" />
    </div>
  );
};

export default EditorCanvas;
