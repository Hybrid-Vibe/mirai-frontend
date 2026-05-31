"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";

interface LitWindow extends Window {
  litDisableWarning?: boolean;
  litDevMode?: boolean;
}

function setLitProdFlags() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  (window as LitWindow).litDisableWarning = true;
  (window as LitWindow).litDevMode = false;
}

// Safely import @google/model-viewer only on the client side
if (typeof window !== "undefined") {
  setLitProdFlags();
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
  const [viewerLoaded, setViewerLoaded] = useState(false);

  // Safely import @google/model-viewer only on the client side, avoiding duplicate registration
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (customElements.get("model-viewer")) {
        Promise.resolve().then(() => setViewerLoaded(true));
      } else {
        setLitProdFlags();
        import("@google/model-viewer")
          .then(() => {
            setViewerLoaded(true);
          })
          .catch((err) => {
            console.error("Failed to load @google/model-viewer:", err);
          });
      }
    }
  }, []);

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

  // When textureUrl changes or viewer finishes loading, apply or clear
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = () => {
      console.log("[3D Viewer] Model loaded successfully.");
      if (textureUrl && textureUrl !== currentTextureUrlRef.current) {
        applyTexture(textureUrl);
      }
    };

    const handleError = (event: Event) => {
      console.error("[3D Viewer] Error loading model:", event);
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
    viewer.addEventListener("error", handleError);

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [textureUrl, applyTexture, clearTexture, viewerLoaded]);

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      {!viewerLoaded ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-muted/20 to-muted/5 animate-pulse rounded-2xl">
          <div className="h-1 w-32 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary animate-pulse rounded-full w-2/3" />
          </div>
          <span className="text-xs text-muted-foreground mt-3 font-medium">
            Khởi tạo 3D Preview...
          </span>
        </div>
      ) : (
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
          environment-image="neutral"
          bounds="tight"
          interaction-prompt="auto"
          ar
          ar-modes="webxr scene-viewer quick-look"
          loading="eager"
          className="block w-full h-full outline-none"
          style={
            {
              width: "100%",
              height: "100%",
              display: "block",
              outline: "none",
              backgroundColor: "transparent",
              "--poster-color": "transparent",
            } as React.CSSProperties
          }
        >
          {/* Loading indicator slot */}
          <div
            slot="progress-bar"
            className="absolute bottom-4 left-1/2 -translate-x-1/2"
          >
            <div className="h-1 w-32 rounded-full bg-muted overflow-hidden border border-border">
              <div className="h-full bg-primary animate-pulse rounded-full w-1/2" />
            </div>
          </div>
        </model-viewer>
      )}
    </div>
  );
}
