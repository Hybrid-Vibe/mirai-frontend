/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * TypeScript declarations for @google/model-viewer Web Component.
 * Enables <model-viewer> JSX usage in React/Next.js without TS errors.
 */

import "react";

interface ModelViewerAttributes {
  src?: string;
  "ios-src"?: string;
  poster?: string;
  alt?: string;
  ar?: boolean | string;
  "ar-modes"?: string;
  "ar-scale"?: string;
  "camera-controls"?: boolean | string;
  "touch-action"?: string;
  "auto-rotate"?: boolean | string;
  "auto-rotate-delay"?: number | string;
  "rotation-per-second"?: string;
  "interaction-prompt"?: string;
  "shadow-intensity"?: number | string;
  "shadow-softness"?: number | string;
  exposure?: number | string;
  "environment-image"?: string;
  "camera-orbit"?: string;
  "camera-target"?: string;
  "field-of-view"?: string;
  "min-camera-orbit"?: string;
  "max-camera-orbit"?: string;
  "min-field-of-view"?: string;
  "max-field-of-view"?: string;
  bounds?: string;
  loading?: "auto" | "lazy" | "eager";
  reveal?: "auto" | "manual";
  "with-credentials"?: boolean | string;
  slot?: string;
  ref?: React.Ref<any>;
  className?: string;
  style?: React.CSSProperties & Record<string, any>;
  children?: React.ReactNode;
}

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}
