"use client";

import { Stage, Layer, Image as KonvaImage, Text as KonvaText } from "react-konva";
import useImage from "use-image";
import { useDesignStore } from "@/lib/store";

const EditorCanvas = () => {
  const { selectedImage, elements, setElements } = useDesignStore();
  const [img] = useImage(selectedImage ? `https://placehold.co/600x800/0066FF/FFF?text=Design+${selectedImage}` : "");

  return (
    <div className="w-full h-full flex items-center justify-center bg-[#050814] rounded-[3rem] overflow-hidden border-8 border-[rgba(255,255,255,0.05)] shadow-2xl relative">
      <Stage
        width={300}
        height={600}
        className="bg-black shadow-2xl"
      >
        <Layer>
          {img && (
            <KonvaImage
              image={img}
              width={300}
              height={600}
              id="background"
            />
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
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-[#050814] rounded-b-2xl z-10 pointer-events-none" />
    </div>
  );
};

export default EditorCanvas;
