// ----------------------------------------------------------------------
// Phone Case Templates
// Each template defines the print-ready dimensions, camera cutouts,
// bleed zones, and safe zones for a specific phone model.
//
// All measurements are in millimeters (mm).
// Canvas pixel sizes are pre-computed at 300 DPI: px = mm * 300 / 25.4
// ----------------------------------------------------------------------

/** Shape definition for camera cutouts */
export interface CameraCutout {
  /** Shape type */
  shape: "circle" | "rounded-rect" | "pill";
  /** X position from left edge (mm) */
  x: number;
  /** Y position from top edge (mm) */
  y: number;
  /** Width (mm) */
  width: number;
  /** Height (mm) */
  height: number;
  /** Corner radius for rounded-rect (mm) */
  radius?: number;
}

/** Button position reference (for die-line guides) */
export interface ButtonPosition {
  side: "left" | "right";
  /** Y start from top (mm) */
  yStart: number;
  /** Y end from top (mm) */
  yEnd: number;
  label: string;
}

export type PreviewBackAxis = "x" | "y" | "z";

export interface PreviewBackSide {
  /** Optional explicit thin axis for model families whose back is not the default axis */
  thicknessAxis?: PreviewBackAxis;
  /** Which side of the thin axis is the phone back */
  sign: 1 | -1;
}

export type CasePreviewTextureRotation = 0 | 90 | 180 | 270;

export interface CasePreviewTextureTransform {
  /** Rotation applied to fallback case-plane texture in degrees */
  rotate: CasePreviewTextureRotation;
  /** Mirror texture horizontally on the fallback case plane */
  flipX?: boolean;
  /** Mirror texture vertically on the fallback case plane */
  flipY?: boolean;
}

export const PREVIEW_MAX_WIDTH = 420;
export const PREVIEW_MAX_HEIGHT = 620;

/** Complete phone case template for print production */
export interface PhoneCaseTemplate {
  /** Unique identifier matching PHONE_MODELS value */
  id: string;
  /** Display name */
  label: string;
  /** Print area width (mm) — case back surface */
  printWidth: number;
  /** Print area height (mm) — case back surface */
  printHeight: number;
  /** Bleed zone extension beyond print area (mm) */
  bleed: number;
  /** Safe zone inset from print edge (mm) — keep important content inside */
  safeZone: number;
  /** Camera cutout definitions */
  cameraCutouts: CameraCutout[];
  /** Button positions (optional, for reference lines) */
  buttons?: ButtonPosition[];
  /** Canvas width at 300 DPI (pixels) — includes bleed */
  canvasWidth: number;
  /** Canvas height at 300 DPI (pixels) — includes bleed */
  canvasHeight: number;
  /** Print area width at 300 DPI (pixels) — excludes bleed */
  printAreaWidth: number;
  /** Print area height at 300 DPI (pixels) — excludes bleed */
  printAreaHeight: number;
  /** Bleed in pixels at 300 DPI */
  bleedPx: number;
  /** Safe zone in pixels at 300 DPI */
  safeZonePx: number;
  /** GLB file name for 3D preview */
  glbFile: string;
  /** Material names that are safe to texture for 3D case mockup preview */
  casePreviewMaterialNames?: string[];
  /** Partial material-name matches that are safe to texture */
  casePreviewMaterialMatchers?: string[];
  /** Fallback back-facing side for 3D preview when material mapping is absent */
  previewBackSide?: PreviewBackSide;
  /** Fallback case-plane texture orientation for this GLB */
  casePreviewTextureTransform?: CasePreviewTextureTransform;
}

// Helper: convert mm to pixels at 300 DPI
function mmToPx(mm: number): number {
  return Math.round((mm * 300) / 25.4);
}

/** Create a template with auto-computed pixel values */
function createTemplate(
  config: Omit<
    PhoneCaseTemplate,
    | "canvasWidth"
    | "canvasHeight"
    | "printAreaWidth"
    | "printAreaHeight"
    | "bleedPx"
    | "safeZonePx"
  >,
): PhoneCaseTemplate {
  const bleedPx = mmToPx(config.bleed);
  return {
    ...config,
    printAreaWidth: mmToPx(config.printWidth),
    printAreaHeight: mmToPx(config.printHeight),
    canvasWidth: mmToPx(config.printWidth + config.bleed * 2),
    canvasHeight: mmToPx(config.printHeight + config.bleed * 2),
    bleedPx,
    safeZonePx: mmToPx(config.safeZone),
  };
}

// ======================================================================
// Template definitions
// Dimensions are approximate standard case sizes.
// Camera cutout positions are based on typical case molds.
// ======================================================================

const IPHONE_STANDARD_BLEED = 3; // mm
const IPHONE_STANDARD_SAFE = 5; // mm
const CASE_TEXTURE_FLIP_X = {
  rotate: 0,
  flipX: true,
} satisfies CasePreviewTextureTransform;
const CASE_TEXTURE_FLIP_Y = {
  rotate: 0,
  flipY: true,
} satisfies CasePreviewTextureTransform;

export const PHONE_CASE_TEMPLATES: PhoneCaseTemplate[] = [
  // --- iPhone 13 Series ---
  createTemplate({
    id: "iphone_13",
    label: "iPhone 13",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 5,
        y: 6,
        width: 24,
        height: 24,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_13.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_13_pro",
    label: "iPhone 13 Pro",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 27,
        height: 27,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_13_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  createTemplate({
    id: "iphone_13_pro_max",
    label: "iPhone 13 Pro Max",
    printWidth: 78,
    printHeight: 160,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 28,
        height: 28,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 38, yEnd: 53, label: "Power" },
      { side: "left", yStart: 33, yEnd: 41, label: "Silent" },
      { side: "left", yStart: 45, yEnd: 62, label: "Volume" },
    ],
    glbFile: "iphone_13_pro_max.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  // --- iPhone 14 Series ---
  createTemplate({
    id: "iphone_14",
    label: "iPhone 14",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 5,
        y: 6,
        width: 24,
        height: 24,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_14.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_14_pro",
    label: "iPhone 14 Pro",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 27,
        height: 27,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_14_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_14_pro_max",
    label: "iPhone 14 Pro Max",
    printWidth: 78,
    printHeight: 160,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 28,
        height: 28,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 38, yEnd: 53, label: "Power" },
      { side: "left", yStart: 33, yEnd: 41, label: "Silent" },
      { side: "left", yStart: 45, yEnd: 62, label: "Volume" },
    ],
    glbFile: "iphone_14_pro_max.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  // --- iPhone 15 Series ---
  createTemplate({
    id: "iphone_15",
    label: "iPhone 15",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 5,
        y: 6,
        width: 24,
        height: 24,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_15.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  createTemplate({
    id: "iphone_15_pro",
    label: "iPhone 15 Pro",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 27,
        height: 27,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Action" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_15_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_15_pro_max",
    label: "iPhone 15 Pro Max",
    printWidth: 78,
    printHeight: 160,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 28,
        height: 28,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 38, yEnd: 53, label: "Action" },
      { side: "left", yStart: 45, yEnd: 62, label: "Volume" },
    ],
    glbFile: "iphone_15_pro_max.glb",
    previewBackSide: { thicknessAxis: "x", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  // --- iPhone 16 Series ---
  createTemplate({
    id: "iphone_16",
    label: "iPhone 16",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 27,
        height: 27,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Action" },
      { side: "right", yStart: 72, yEnd: 82, label: "Camera Control" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_16.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_16_plus",
    label: "iPhone 16 Plus",
    printWidth: 78,
    printHeight: 160,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 28,
        height: 28,
        radius: 6,
      },
    ],
    buttons: [
      { side: "right", yStart: 38, yEnd: 53, label: "Action" },
      { side: "right", yStart: 78, yEnd: 88, label: "Camera Control" },
      { side: "left", yStart: 45, yEnd: 62, label: "Volume" },
    ],
    glbFile: "iphone_16_plus.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_16_pro",
    label: "iPhone 16 Pro",
    printWidth: 75,
    printHeight: 153,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 29,
        height: 29,
        radius: 7,
      },
    ],
    buttons: [
      { side: "right", yStart: 36, yEnd: 51, label: "Action" },
      { side: "right", yStart: 74, yEnd: 84, label: "Camera Control" },
      { side: "left", yStart: 43, yEnd: 60, label: "Volume" },
    ],
    glbFile: "iphone_16_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_16_pro_max",
    label: "iPhone 16 Pro Max",
    printWidth: 78,
    printHeight: 163,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 30,
        height: 30,
        radius: 7,
      },
    ],
    buttons: [
      { side: "right", yStart: 39, yEnd: 54, label: "Action" },
      { side: "right", yStart: 80, yEnd: 90, label: "Camera Control" },
      { side: "left", yStart: 46, yEnd: 64, label: "Volume" },
    ],
    glbFile: "iphone_16_pro_max.glb",
    previewBackSide: { thicknessAxis: "x", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  // --- iPhone 17 Series ---
  createTemplate({
    id: "iphone_17_air",
    label: "iPhone 17 Air",
    printWidth: 72,
    printHeight: 148,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 25,
        y: 4,
        width: 22,
        height: 22,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Action" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_17_air.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  createTemplate({
    id: "iphone_17_pro",
    label: "iPhone 17 Pro",
    printWidth: 75,
    printHeight: 153,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 3.5,
        y: 5,
        width: 68,
        height: 30,
        radius: 8,
      },
    ],
    buttons: [
      { side: "right", yStart: 36, yEnd: 51, label: "Action" },
      { side: "right", yStart: 74, yEnd: 84, label: "Camera Control" },
      { side: "left", yStart: 43, yEnd: 60, label: "Volume" },
    ],
    glbFile: "iphone_17_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  createTemplate({
    id: "iphone_17_pro_max",
    label: "iPhone 17 Pro Max",
    printWidth: 78,
    printHeight: 163,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 70,
        height: 30,
        radius: 8,
      },
    ],
    buttons: [
      { side: "right", yStart: 39, yEnd: 54, label: "Action" },
      { side: "right", yStart: 80, yEnd: 90, label: "Camera Control" },
      { side: "left", yStart: 46, yEnd: 64, label: "Volume" },
    ],
    glbFile: "iphone_17_pro_max.glb",
    previewBackSide: { thicknessAxis: "y", sign: 1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_X,
  }),

  // --- iPhone 12 Series ---
  createTemplate({
    id: "iphone_12_mini",
    label: "iPhone 12 Mini",
    printWidth: 66,
    printHeight: 132,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 23,
        height: 23,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 30, yEnd: 43, label: "Power" },
      { side: "left", yStart: 25, yEnd: 32, label: "Silent" },
      { side: "left", yStart: 36, yEnd: 50, label: "Volume" },
    ],
    glbFile: "iphone_12_mini.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  createTemplate({
    id: "iphone_12_pro",
    label: "iPhone 12 Pro",
    printWidth: 73,
    printHeight: 150,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 5,
        width: 25,
        height: 25,
        radius: 5,
      },
    ],
    buttons: [
      { side: "right", yStart: 35, yEnd: 50, label: "Power" },
      { side: "left", yStart: 30, yEnd: 38, label: "Silent" },
      { side: "left", yStart: 42, yEnd: 58, label: "Volume" },
    ],
    glbFile: "iphone_12_pro.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  // --- Samsung Series ---
  createTemplate({
    id: "samsung_galaxy_s21_ultra",
    label: "Samsung Galaxy S21 Ultra",
    printWidth: 78,
    printHeight: 166,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      {
        shape: "rounded-rect",
        x: 4,
        y: 6,
        width: 18,
        height: 42,
        radius: 8,
      },
    ],
    buttons: [
      { side: "right", yStart: 42, yEnd: 52, label: "Power" },
      { side: "right", yStart: 56, yEnd: 72, label: "Volume" },
    ],
    glbFile: "samsung_galaxy_s21_ultra.glb",
    previewBackSide: { thicknessAxis: "y", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),

  createTemplate({
    id: "samsung_galaxy_s25_ultra",
    label: "Samsung Galaxy S25 Ultra",
    printWidth: 78,
    printHeight: 163,
    bleed: IPHONE_STANDARD_BLEED,
    safeZone: IPHONE_STANDARD_SAFE,
    cameraCutouts: [
      { shape: "circle", x: 12, y: 12, width: 14, height: 14 },
      { shape: "circle", x: 12, y: 30, width: 14, height: 14 },
      { shape: "circle", x: 12, y: 48, width: 14, height: 14 },
      { shape: "circle", x: 30, y: 13, width: 8, height: 8 },
      { shape: "circle", x: 30, y: 31, width: 8, height: 8 },
    ],
    buttons: [
      { side: "right", yStart: 42, yEnd: 52, label: "Power" },
      { side: "right", yStart: 56, yEnd: 72, label: "Volume" },
    ],
    glbFile: "samsung_galaxy_s25_ultra.glb",
    casePreviewMaterialNames: ["Back glass"],
    previewBackSide: { thicknessAxis: "x", sign: -1 },
    casePreviewTextureTransform: CASE_TEXTURE_FLIP_Y,
  }),
];

/** Find template by phone model ID */
export function getTemplateById(id: string): PhoneCaseTemplate | undefined {
  return PHONE_CASE_TEMPLATES.find((t) => t.id === id);
}

/** Get all available template IDs */
export function getAvailableTemplateIds(): string[] {
  return PHONE_CASE_TEMPLATES.map((t) => t.id);
}

/**
 * Convert camera cutout mm coordinates to canvas pixel coordinates.
 * Accounts for bleed offset (cutout positions are relative to print area).
 */
export function cutoutToCanvasPx(
  cutout: CameraCutout,
  template: PhoneCaseTemplate,
): { x: number; y: number; width: number; height: number; radius: number } {
  return {
    x: mmToPx(cutout.x) + template.bleedPx,
    y: mmToPx(cutout.y) + template.bleedPx,
    width: mmToPx(cutout.width),
    height: mmToPx(cutout.height),
    radius: cutout.radius ? mmToPx(cutout.radius) : 0,
  };
}

/**
 * Scale factor to fit template canvas into a display viewport.
 * Returns ratio: displaySize / canvasSize
 */
export function getDisplayScale(
  template: PhoneCaseTemplate,
  viewportWidth: number,
  viewportHeight: number,
): number {
  const scaleX = viewportWidth / template.canvasWidth;
  const scaleY = viewportHeight / template.canvasHeight;
  return Math.min(scaleX, scaleY);
}
