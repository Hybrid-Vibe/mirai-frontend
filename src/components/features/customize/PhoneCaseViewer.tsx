"use client";

import { useEffect, useRef, useCallback } from "react";

// Import model-viewer only on client side
if (typeof window !== "undefined") {
  import("@google/model-viewer");
}

interface PhoneCaseViewerProps {
  modelUrl: string;
  textureUrl?: string | null;
  className?: string;
}

export default function PhoneCaseViewer({
  modelUrl,
  textureUrl,
  className = "",
}: PhoneCaseViewerProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewerRef = useRef<any>(null);
  const currentTextureUrlRef = useRef<string | null>(null);

  const applyTexture = useCallback(async (url: string) => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.model) return;

    try {
      const texture = await viewer.createTexture(url);
      const model = viewer.model;

      // Smart-detect strategy for Phone models:
      // Apply texture ONLY to materials that are likely the back/body of the phone.
      // We skip screens, camera lenses, glass, and buttons.
      const materials = model.materials;
      if (materials && materials.length > 0) {
        console.log(
          "[3D Viewer] Loaded materials:",
          materials.map((m: { name: string }) => m.name),
        );
        for (let i = 0; i < materials.length; i++) {
          const mat = materials[i];
          const name = (mat.name || "").toLowerCase();

          // Skip screens, lenses, cameras, logos, and glass parts
          const isFrontOrCamera =
            name.includes("screen") ||
            name.includes("display") ||
            name.includes("glass") ||
            name.includes("lens") ||
            name.includes("camera") ||
            name.includes("front") ||
            name.includes("logo") ||
            name.includes("flash") ||
            name.includes("speaker") ||
            name.includes("button") ||
            name.includes("frame") ||
            name.includes("wallpaper");

          if (!isFrontOrCamera && mat?.pbrMetallicRoughness) {
            mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          }
        }
      }

      currentTextureUrlRef.current = url;
    } catch (error) {
      console.error("Error applying texture to 3D model:", error);
    }
  }, []);

  const clearTexture = useCallback(() => {
    const viewer = viewerRef.current;
    if (!viewer || !viewer.model) {
      // If model not ready, just reset src to be sure
      if (viewer && modelUrl) viewer.src = modelUrl;
      currentTextureUrlRef.current = null;
      return;
    }

    try {
      const materials = viewer.model.materials;
      for (const mat of materials) {
        const name = (mat.name || "").toLowerCase();
        const isFrontOrCamera =
          name.includes("screen") ||
          name.includes("display") ||
          name.includes("glass") ||
          name.includes("lens") ||
          name.includes("camera") ||
          name.includes("front") ||
          name.includes("logo") ||
          name.includes("flash") ||
          name.includes("speaker") ||
          name.includes("button") ||
          name.includes("frame") ||
          name.includes("wallpaper");

        if (!isFrontOrCamera && mat.pbrMetallicRoughness) {
          mat.pbrMetallicRoughness.baseColorTexture.setTexture(null);
        }
      }
      currentTextureUrlRef.current = null;
    } catch (error) {
      console.error("Error clearing texture surgically:", error);
      if (modelUrl) viewer.src = modelUrl;
    }
  }, [modelUrl]);

  // When textureUrl changes, apply or clear
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      if (textureUrl) {
        applyTexture(textureUrl);
      }
    };

    // If model is already loaded and texture changes
    if (viewer.loaded) {
      if (textureUrl) {
        if (textureUrl !== currentTextureUrlRef.current) {
          applyTexture(textureUrl);
        }
      } else if (currentTextureUrlRef.current) {
        clearTexture();
      }
    }

    viewer.addEventListener("load", handleLoad);
    return () => {
      viewer.removeEventListener("load", handleLoad);
    };
  }, [textureUrl, applyTexture, clearTexture]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt="MIRAI Phone Case 3D Preview"
        camera-controls
        auto-rotate
        auto-rotate-delay={0}
        rotation-per-second="30deg"
        shadow-intensity="1"
        shadow-softness="0.5"
        exposure="1"
        camera-orbit="180deg 75deg 105%"
        interaction-prompt="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        loading="eager"
        style={{
          width: "100%",
          height: "100%",
          outline: "none",
          "--poster-color": "transparent",
        }}
      >
        {/* Loading indicator slot */}
        <div
          slot="progress-bar"
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary animate-pulse rounded-full w-1/2" />
          </div>
        </div>
      </model-viewer>
    </div>
  );
}
