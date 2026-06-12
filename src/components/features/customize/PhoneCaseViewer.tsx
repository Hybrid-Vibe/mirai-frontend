"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle, Smartphone } from "lucide-react";
import type { PhoneCaseTemplate } from "@/constants/phone-templates";
import { cn } from "@/lib/utils";
import type { Scene, Vector3 } from "three";

interface LitWindow extends Window {
  litDisableWarning?: boolean;
  litDevMode?: boolean;
}

interface MaterialTextureSlot {
  texture?: unknown;
  setTexture: (texture: unknown | null) => void;
}

type RgbaFactor = [number, number, number, number];

interface ModelPbrMetallicRoughness {
  baseColorTexture?: MaterialTextureSlot;
  baseColorFactor?: Readonly<RgbaFactor>;
  metallicFactor?: number;
  roughnessFactor?: number;
  setBaseColorFactor?: (rgba: RgbaFactor | string) => void;
  setMetallicFactor?: (value: number) => void;
  setRoughnessFactor?: (value: number) => void;
}

interface ModelMaterial {
  name?: string;
  pbrMetallicRoughness?: ModelPbrMetallicRoughness;
}

interface ModelViewerElement extends HTMLElement {
  src: string;
  iosSrc?: string;
  loaded?: boolean;
  model?: {
    materials?: ModelMaterial[];
  };
  activateAR?: () => Promise<void>;
  createTexture?: (url: string) => Promise<unknown>;
  updateComplete?: Promise<unknown>;
}

interface ThreeMaterialLike {
  name?: string;
  map?: unknown | null;
  color?: ThreeColorLike;
  emissive?: ThreeColorLike;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  toneMapped?: boolean;
  needsUpdate?: boolean;
}

interface ThreeColorLike {
  clone?: () => ThreeColorLike;
  copy?: (color: ThreeColorLike) => ThreeColorLike;
  set?: (color: string | number) => unknown;
}

interface ModelMaterialOriginalProps {
  baseColorFactor?: RgbaFactor;
  metallicFactor?: number;
  roughnessFactor?: number;
}

interface ThreeMaterialOriginalProps {
  color?: ThreeColorLike;
  emissive?: ThreeColorLike;
  emissiveIntensity?: number;
  metalness?: number;
  roughness?: number;
  toneMapped?: boolean;
}

interface ThreeMeshLike {
  isMesh?: boolean;
  material?: ThreeMaterialLike | ThreeMaterialLike[];
}

interface ThreePositionAttributeLike {
  count: number;
  getX: (index: number) => number;
  getY: (index: number) => number;
  getZ: (index: number) => number;
}

interface ThreeGeometryLike {
  attributes?: {
    position?: ThreePositionAttributeLike;
  };
}

interface ThreeGeometryMeshLike {
  geometry?: ThreeGeometryLike;
  localToWorld?: (vector: Vector3) => Vector3;
  updateMatrixWorld?: (force?: boolean) => void;
}

type AxisName = "x" | "y" | "z";

interface PhoneModelAxes {
  widthAxis: AxisName;
  heightAxis: AxisName;
  thicknessAxis: AxisName;
}

interface CaseSurfacePlacement extends PhoneModelAxes {
  backSign: 1 | -1;
  planeHeight: number;
  planeWidth: number;
  shellDepth: number;
  sideWrapDepth: number;
  sideWrapHeight: number;
  sideWrapPosition: Record<AxisName, number>;
  sideWrapWidth: number;
  position: Record<AxisName, number>;
}

interface CaseCameraHardwareBounds {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

interface CaseCameraHardwareCutout {
  centerX: number;
  centerY: number;
  radius: number;
}

interface CaseProjectedBounds {
  maxX: number;
  maxY: number;
  minX: number;
  minY: number;
}

interface CaseLocalBounds extends CaseProjectedBounds {
  maxZ: number;
  minZ: number;
}

interface CaseModelOutline {
  centerX: number;
  centerY: number;
  cornerRadius: number;
  height: number;
  width: number;
}

interface CaseBodyDepthMetrics {
  backZ: number;
  frontZ: number;
  thickness: number;
}

type CaseSideCutoutEdge = "top" | "right" | "bottom" | "left";
type CaseSideCutoutKind = "generic" | "mic" | "port" | "sim" | "speaker";
type CaseSideCornerName =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";
type CaseSideCornerSign = -1 | 1;

interface CaseSideCutout {
  centerX: number;
  centerY: number;
  edge: CaseSideCutoutEdge;
  height: number;
  kind?: CaseSideCutoutKind;
  preserveSeparate?: boolean;
  radius: number;
  width: number;
}

interface CaseSideWallInterval {
  end: number;
  start: number;
}

interface CaseSideCorner {
  name: CaseSideCornerName;
  signX: CaseSideCornerSign;
  signY: CaseSideCornerSign;
}

interface CaseButtonRelief {
  centerY: number;
  edge: Extract<CaseSideCutoutEdge, "left" | "right">;
  height: number;
  protrusion: number;
  radius: number;
  sideDepth: number;
}

interface ThreeMeshMaterialEntry {
  mesh: unknown;
  materials: ThreeMaterialLike[];
}

interface CaseSurfaceRotation {
  x: number;
  y: number;
  z: number;
}

interface CasePoint3 {
  x: number;
  y: number;
  z: number;
}

interface CaseFitMetrics {
  buttonReliefs: CaseButtonRelief[];
  cameraClusterBounds: CaseProjectedBounds | null;
  cameraHardwareBounds: CaseCameraHardwareBounds | null;
  cameraHardwareCutouts: CaseCameraHardwareCutout[];
  frontOpeningBounds: CaseProjectedBounds | null;
  iphoneCameraIslandBounds: CaseProjectedBounds | null;
  modelOutline: CaseModelOutline | null;
  placement: CaseSurfacePlacement;
  sideFeatureCutouts: CaseSideCutout[];
  sideWrapCornerRadius: number;
  sideWrapLipDepth: number;
}

interface ThreeCaseMaterialLike {
  color?: ThreeColorLike;
  emissive?: ThreeColorLike;
  emissiveIntensity?: number;
  map?: unknown | null;
  needsUpdate?: boolean;
  dispose?: () => void;
}

interface ThreeCaseMeshLike {
  visible: boolean;
  position: {
    set: (x: number, y: number, z: number) => void;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
  renderOrder?: number;
}

interface ThreeCaseGroupLike extends ThreeCaseMeshLike {
  add: (object: unknown) => void;
}

interface ThreeVector2Like {
  x: number;
  y: number;
  set?: (x: number, y: number) => unknown;
}

interface ThreeTextureLike {
  center?: ThreeVector2Like;
  colorSpace?: unknown;
  flipY?: boolean;
  needsUpdate?: boolean;
  offset?: ThreeVector2Like;
  repeat?: ThreeVector2Like;
  rotation?: number;
  wrapS?: unknown;
  wrapT?: unknown;
  dispose?: () => void;
}

interface PhoneCaseViewerProps {
  modelUrl: string;
  textureUrl?: string | null;
  template?: PhoneCaseTemplate | null;
  shouldShowCaseSurface?: boolean;
  shouldApplyCaseTexture?: boolean;
  caseColor?: string;
  className?: string;
  onArAssetsChange?: (assets: PhoneCaseArAssets | null) => void;
}

export interface PhoneCaseArAssets {
  designImageUrl: string;
  glbUrl: string;
  usdzUrl: string;
}

interface ThreePathLike {
  moveTo: (x: number, y: number) => unknown;
  lineTo: (x: number, y: number) => unknown;
  quadraticCurveTo: (cpx: number, cpy: number, x: number, y: number) => unknown;
  closePath: () => unknown;
}

const DEFAULT_CASE_COLOR = "#1a1a2e";
const CASE_SHELL_BACK_SCALE = 1.01;
const CASE_SHELL_DEPTH_RATIO = 0.045;
const CASE_SHELL_MIN_DEPTH_RATIO = 0.002;
const CASE_SHELL_MAX_DEPTH_RATIO = 0.009;
const CASE_SIDE_WRAP_OUTER_SCALE = 1.016;
const CASE_SIDE_WRAP_DEPTH_RATIO = 1.015;
const CASE_SIDE_WRAP_WALL_RATIO = 0.014;
const CASE_OUTLINE_PADDING_RATIO = 0.0025;
const CASE_SHELL_MODEL_OVERLAP_RATIO = 0.0015;
const CASE_BACK_SURFACE_LIFT_RATIO = 0.004;
const CASE_SHELL_FIT_CLEARANCE_RATIO = 0.008;
const CASE_CAMERA_BAR_PADDING_RATIO = 0.02;
const CASE_CAMERA_CIRCLE_PADDING_RATIO = 0.02;
const CASE_FRONT_OPENING_PADDING_RATIO = 0.012;
const CASE_SIDE_FEATURE_EDGE_THRESHOLD_RATIO = 0.16;
const CASE_SIDE_FEATURE_PADDING_RATIO = 0.006;
const CASE_BUTTON_RELIEF_HEIGHT_RATIO = 0.052;
const CASE_BUTTON_RELIEF_PROTRUSION_RATIO = 0.0065;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function setLitProdFlags() {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  (window as LitWindow).litDisableWarning = true;
  (window as LitWindow).litDevMode = false;
}

function revokeArAssets(assets: PhoneCaseArAssets | null) {
  if (!assets) return;
  URL.revokeObjectURL(assets.glbUrl);
  URL.revokeObjectURL(assets.usdzUrl);
}

if (typeof window !== "undefined") {
  setLitProdFlags();
  void import("@google/model-viewer/lib/model-viewer.js");
}

function getMaterialKey(material: ModelMaterial) {
  return (material.name || "").trim().toLowerCase();
}

function getThreeMaterialKey(material: ThreeMaterialLike) {
  return (material.name || "").trim().toLowerCase();
}

function getCaseMaterials(
  materials: ModelMaterial[] | undefined,
  template: PhoneCaseTemplate | null | undefined,
) {
  if (!materials?.length || !template) return [];

  const exactNames = new Set(
    (template.casePreviewMaterialNames ?? []).map((name) =>
      name.trim().toLowerCase(),
    ),
  );
  const matchers = (template.casePreviewMaterialMatchers ?? []).map((matcher) =>
    matcher.trim().toLowerCase(),
  );

  if (exactNames.size === 0 && matchers.length === 0) return [];

  return materials.filter((material) => {
    const key = getMaterialKey(material);
    if (!key || !material.pbrMetallicRoughness?.baseColorTexture) return false;
    return (
      exactNames.has(key) || matchers.some((matcher) => key.includes(matcher))
    );
  });
}

function getCaseThreeMaterials(
  materials: ThreeMaterialLike[],
  template: PhoneCaseTemplate | null | undefined,
) {
  if (!materials.length || !template) return [];

  const exactNames = new Set(
    (template.casePreviewMaterialNames ?? []).map((name) =>
      name.trim().toLowerCase(),
    ),
  );
  const matchers = (template.casePreviewMaterialMatchers ?? []).map((matcher) =>
    matcher.trim().toLowerCase(),
  );

  if (exactNames.size === 0 && matchers.length === 0) return [];

  return materials.filter((material) => {
    const key = (material.name || "").trim().toLowerCase();
    return Boolean(
      key &&
      (exactNames.has(key) ||
        matchers.some((matcher) => key.includes(matcher))),
    );
  });
}

function setThreeMaterialMap(
  material: ThreeMaterialLike,
  texture: unknown | null,
) {
  material.map = texture;
  material.needsUpdate = true;
}

function setCaseSurfaceTexture(
  material: ThreeCaseMaterialLike,
  texture: ThreeTextureLike | null,
) {
  material.map = texture;
  material.needsUpdate = true;
}

function syncCaseSolidMaterial(
  material: ThreeCaseMaterialLike | null,
  color: string,
  emissiveIntensity = 0.18,
) {
  if (!material) return;
  material.color?.set?.(color);
  material.emissive?.set?.(color);
  if (typeof material.emissiveIntensity === "number") {
    material.emissiveIntensity = emissiveIntensity;
  }
  material.needsUpdate = true;
}

function syncCaseTextureMaterial(material: ThreeCaseMaterialLike | null) {
  if (!material) return;
  material.color?.set?.(0xffffff);
  material.emissive?.set?.(0x000000);
  if (typeof material.emissiveIntensity === "number") {
    material.emissiveIntensity = 0;
  }
  material.needsUpdate = true;
}

function setCaseSurfaceVisibility(
  mesh: ThreeCaseMeshLike | null,
  visible: boolean,
) {
  if (!mesh) return;
  mesh.visible = visible;
}

function applyCaseShellTextureSettings(texture: ThreeTextureLike) {
  texture.center?.set?.(0, 0);
  if (texture.center) {
    texture.center.x = 0;
    texture.center.y = 0;
  }

  texture.rotation = 0;

  texture.repeat?.set?.(1, 1);
  if (texture.repeat) {
    texture.repeat.x = 1;
    texture.repeat.y = 1;
  }

  texture.offset?.set?.(0, 0);
  if (texture.offset) {
    texture.offset.x = 0;
    texture.offset.y = 0;
  }

  texture.needsUpdate = true;
}

function getAxisValue(vector: Record<AxisName, number>, axis: AxisName) {
  return vector[axis];
}

function getMeshEntryKey(entry: ThreeMeshMaterialEntry) {
  const meshName = ((entry.mesh as { name?: string }).name || "").toLowerCase();
  const materialNames = entry.materials
    .map((material) => material.name || "")
    .join(" ")
    .toLowerCase();
  return `${meshName} ${materialNames}`;
}

function getCaseSurfaceRotation(placement: CaseSurfacePlacement) {
  const rotation = { x: 0, y: 0, z: 0 } satisfies CaseSurfaceRotation;

  if (placement.thicknessAxis === "y") {
    rotation.x = placement.backSign > 0 ? -Math.PI / 2 : Math.PI / 2;
    rotation.z = placement.backSign > 0 ? Math.PI : 0;
    return rotation;
  }

  if (placement.thicknessAxis === "x") {
    if (placement.widthAxis === "y" && placement.heightAxis === "z") {
      rotation.y = placement.backSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      rotation.z = placement.backSign > 0 ? Math.PI / 2 : -Math.PI / 2;
      return rotation;
    }

    rotation.y = placement.backSign > 0 ? Math.PI / 2 : -Math.PI / 2;
  }

  return rotation;
}

function getCaseLocalPoint(point: CasePoint3, placement: CaseSurfacePlacement) {
  const delta = {
    x: point.x - placement.position.x,
    y: point.y - placement.position.y,
    z: point.z - placement.position.z,
  } satisfies Record<AxisName, number>;
  let localXSign = 1;

  if (placement.thicknessAxis === "y") {
    localXSign = -placement.backSign;
  } else if (
    placement.thicknessAxis === "x" &&
    placement.widthAxis === "y" &&
    placement.heightAxis === "z"
  ) {
    localXSign = placement.backSign;
  }

  return {
    x: localXSign * getAxisValue(delta, placement.widthAxis),
    y: getAxisValue(delta, placement.heightAxis),
    z:
      placement.thicknessAxis === "z"
        ? getAxisValue(delta, placement.thicknessAxis)
        : placement.backSign * getAxisValue(delta, placement.thicknessAxis),
  } satisfies CasePoint3;
}

function getCaseWorldDeltaForLocalOffset(
  placement: CaseSurfacePlacement,
  localX: number,
  localY: number,
) {
  const delta = { x: 0, y: 0, z: 0 } satisfies Record<AxisName, number>;
  let localXSign = 1;

  if (placement.thicknessAxis === "y") {
    localXSign = -placement.backSign;
  } else if (
    placement.thicknessAxis === "x" &&
    placement.widthAxis === "y" &&
    placement.heightAxis === "z"
  ) {
    localXSign = placement.backSign;
  }

  delta[placement.widthAxis] = localX / localXSign;
  delta[placement.heightAxis] = localY;
  return delta;
}

function projectMeshBoundsToCaseLocal(
  THREE: typeof import("three"),
  entry: ThreeMeshMaterialEntry,
  placement: CaseSurfacePlacement,
) {
  const box = new THREE.Box3().setFromObject(entry.mesh);
  const boxBounds = box as unknown as {
    max: Record<AxisName, number>;
    min: Record<AxisName, number>;
  };
  const localPoints = [
    { x: boxBounds.min.x, y: boxBounds.min.y, z: boxBounds.min.z },
    { x: boxBounds.min.x, y: boxBounds.min.y, z: boxBounds.max.z },
    { x: boxBounds.min.x, y: boxBounds.max.y, z: boxBounds.min.z },
    { x: boxBounds.min.x, y: boxBounds.max.y, z: boxBounds.max.z },
    { x: boxBounds.max.x, y: boxBounds.min.y, z: boxBounds.min.z },
    { x: boxBounds.max.x, y: boxBounds.min.y, z: boxBounds.max.z },
    { x: boxBounds.max.x, y: boxBounds.max.y, z: boxBounds.min.z },
    { x: boxBounds.max.x, y: boxBounds.max.y, z: boxBounds.max.z },
  ].map((point) => getCaseLocalPoint(point, placement));

  return {
    minX: Math.min(...localPoints.map((point) => point.x)),
    maxX: Math.max(...localPoints.map((point) => point.x)),
    minY: Math.min(...localPoints.map((point) => point.y)),
    maxY: Math.max(...localPoints.map((point) => point.y)),
    minZ: Math.min(...localPoints.map((point) => point.z)),
    maxZ: Math.max(...localPoints.map((point) => point.z)),
  } satisfies CaseLocalBounds;
}

function projectMeshVerticesToCaseLocal(
  THREE: typeof import("three"),
  entry: ThreeMeshMaterialEntry,
  placement: CaseSurfacePlacement,
) {
  const mesh = entry.mesh as ThreeGeometryMeshLike;
  const position = mesh.geometry?.attributes?.position;
  if (!position || typeof mesh.localToWorld !== "function") return [];

  mesh.updateMatrixWorld?.(true);

  const points: CasePoint3[] = [];
  const step = Math.max(1, Math.floor(position.count / 1200));

  for (let index = 0; index < position.count; index += step) {
    const worldPoint = new THREE.Vector3(
      position.getX(index),
      position.getY(index),
      position.getZ(index),
    );
    mesh.localToWorld(worldPoint);

    if (
      !Number.isFinite(worldPoint.x) ||
      !Number.isFinite(worldPoint.y) ||
      !Number.isFinite(worldPoint.z)
    ) {
      continue;
    }

    points.push(
      getCaseLocalPoint(
        { x: worldPoint.x, y: worldPoint.y, z: worldPoint.z },
        placement,
      ),
    );
  }

  return points;
}

function getProjectedWidth(bounds: CaseProjectedBounds) {
  return bounds.maxX - bounds.minX;
}

function getProjectedHeight(bounds: CaseProjectedBounds) {
  return bounds.maxY - bounds.minY;
}

function getProjectedArea(bounds: CaseProjectedBounds) {
  return getProjectedWidth(bounds) * getProjectedHeight(bounds);
}

function isGeometryOutlineCandidate(
  bounds: CaseProjectedBounds,
  placement: CaseSurfacePlacement,
) {
  const width = getProjectedWidth(bounds);
  const height = getProjectedHeight(bounds);
  const area = width * height;
  const planeArea = placement.planeWidth * placement.planeHeight;

  return (
    width >= placement.planeWidth * 0.65 &&
    height >= placement.planeHeight * 0.65 &&
    area >= planeArea * 0.42
  );
}

function mergeProjectedBounds(bounds: CaseProjectedBounds[]) {
  if (bounds.length === 0) return null;

  return bounds.reduce<CaseProjectedBounds>(
    (merged, current) => ({
      minX: Math.min(merged.minX, current.minX),
      maxX: Math.max(merged.maxX, current.maxX),
      minY: Math.min(merged.minY, current.minY),
      maxY: Math.max(merged.maxY, current.maxY),
    }),
    { ...bounds[0] },
  );
}

function clampProjectedBoundsToShell(
  bounds: CaseProjectedBounds,
  width: number,
  height: number,
  padding: number,
) {
  return {
    minX: clamp(bounds.minX, -width / 2 + padding, width / 2 - padding),
    maxX: clamp(bounds.maxX, -width / 2 + padding, width / 2 - padding),
    minY: clamp(bounds.minY, -height / 2 + padding, height / 2 - padding),
    maxY: clamp(bounds.maxY, -height / 2 + padding, height / 2 - padding),
  } satisfies CaseProjectedBounds;
}

function getProjectedCenterX(bounds: CaseProjectedBounds) {
  return (bounds.minX + bounds.maxX) / 2;
}

function getProjectedCenterY(bounds: CaseProjectedBounds) {
  return (bounds.minY + bounds.maxY) / 2;
}

function scaleProjectedBounds(
  bounds: CaseProjectedBounds | null,
  xScale: number,
  yScale: number,
) {
  if (!bounds) return null;

  return {
    minX: bounds.minX * xScale,
    maxX: bounds.maxX * xScale,
    minY: bounds.minY * yScale,
    maxY: bounds.maxY * yScale,
  } satisfies CaseProjectedBounds;
}

function scaleSideCutouts(
  cutouts: CaseSideCutout[],
  xScale: number,
  yScale: number,
) {
  return cutouts.map((cutout) => {
    const width = cutout.width * xScale;
    const height = cutout.height * yScale;

    return {
      ...cutout,
      centerX: cutout.centerX * xScale,
      centerY: cutout.centerY * yScale,
      height,
      radius: Math.min(width, height) / 2,
      width,
    } satisfies CaseSideCutout;
  });
}

function isIphoneTemplate(template: PhoneCaseTemplate | null | undefined) {
  return Boolean(template?.id.startsWith("iphone_"));
}

function isCaseOutlineEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(button|volume|power|action|silent|mute|key|camera|selfie|lens|flash|lidar|sensor|microphone|mic|speaker|grill|port|usb|charger|charging|lightning|type.?c|sim|tray|wallpaper|logo|decal|brand)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(back|body|frame|glass|screen|display|bezel|housing|chassis|touch|lcd|oled|titanium|aluminum)/.test(
    key,
  );
}

function isCaseCornerRadiusReferenceEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(button|camera|lens|flash|lidar|microphone|speaker|port|sim|tray|usb|logo|wallpaper)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(back|body|frame|glass|screen|display|front.?glass|touch|lcd|oled|titanium|aluminum)/.test(
    key,
  );
}

function isCaseFitReferenceEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(button|camera|lens|flash|lidar|microphone|speaker|port|sim|tray|usb|logo|wallpaper|notch|dynamic island)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(back|body|frame|housing|chassis|glass|screen|display|front.?glass|touch|lcd|oled|titanium|aluminum)/.test(
    key,
  );
}

function isCameraIslandEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(front|selfie|body|button|display|screen|speaker|port|sim|tray|usb|frame)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(camera.?module|cam_glass|camera island|camera bump|camera glass)/.test(
    key,
  );
}

function isNamedCameraClusterEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(front|selfie|body|button|display|screen|speaker|port|sim|tray|usb|frame|wallpaper)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(camera|cam[_ -]?glass|camera.?module|camera island|camera bump|lens|flash|lidar|back_mic|lum)/.test(
    key,
  );
}

function isIphoneCameraCandidateEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(front|selfie|body|button|display|screen|speaker|port|sim|tray|usb|wallpaper|logo)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(camera|cam[_ -]?glass|camera.?module|lens|flash|lidar|back_mic|camera filter|mirror filter|sapphire|metalframe|metal frame|metal camera|plastic camera)/.test(
    key,
  );
}

function getModelCornerRadiusRatio(
  template: PhoneCaseTemplate | null | undefined,
) {
  if (template?.id.includes("samsung")) return 0.045;
  return 0.105;
}

function getMedianValue(values: number[]) {
  if (values.length === 0) return null;

  const sortedValues = [...values].sort((left, right) => left - right);
  const middleIndex = Math.floor(sortedValues.length / 2);

  if (sortedValues.length % 2 === 1) {
    return sortedValues[middleIndex] ?? null;
  }

  const leftValue = sortedValues[middleIndex - 1];
  const rightValue = sortedValues[middleIndex];

  if (typeof leftValue !== "number" || typeof rightValue !== "number") {
    return null;
  }

  return (leftValue + rightValue) / 2;
}

function getQuantileValue(values: number[], quantile: number) {
  if (values.length === 0) return null;

  const sortedValues = [...values].sort((left, right) => left - right);
  const clampedQuantile = clamp(quantile, 0, 1);
  const index = (sortedValues.length - 1) * clampedQuantile;
  const lowerIndex = Math.floor(index);
  const upperIndex = Math.ceil(index);
  const lowerValue = sortedValues[lowerIndex];
  const upperValue = sortedValues[upperIndex];

  if (typeof lowerValue !== "number" || typeof upperValue !== "number") {
    return null;
  }

  return lowerValue + (upperValue - lowerValue) * (index - lowerIndex);
}

function getRobustBoundsFromPoints(
  points: CasePoint3[],
  insetQuantile = 0.008,
) {
  if (points.length < 8) return null;

  const minX = getQuantileValue(
    points.map((point) => point.x),
    insetQuantile,
  );
  const maxX = getQuantileValue(
    points.map((point) => point.x),
    1 - insetQuantile,
  );
  const minY = getQuantileValue(
    points.map((point) => point.y),
    insetQuantile,
  );
  const maxY = getQuantileValue(
    points.map((point) => point.y),
    1 - insetQuantile,
  );
  const minZ = getQuantileValue(
    points.map((point) => point.z),
    Math.max(insetQuantile, 0.02),
  );
  const maxZ = getQuantileValue(
    points.map((point) => point.z),
    1 - Math.max(insetQuantile, 0.02),
  );

  if (
    typeof minX !== "number" ||
    typeof maxX !== "number" ||
    typeof minY !== "number" ||
    typeof maxY !== "number" ||
    typeof minZ !== "number" ||
    typeof maxZ !== "number" ||
    maxX <= minX ||
    maxY <= minY ||
    maxZ <= minZ
  ) {
    return null;
  }

  return { minX, maxX, minY, maxY, minZ, maxZ } satisfies CaseLocalBounds;
}

function getCaseReferenceLocalPoints(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
  includeScreenFallback = false,
) {
  const entries = meshEntries.filter((entry) =>
    includeScreenFallback
      ? isCaseFitReferenceEntry(entry)
      : isCaseOutlineEntry(entry),
  );
  const fallbackEntries =
    entries.length > 0
      ? entries
      : meshEntries.filter(isCaseCornerRadiusReferenceEntry);

  return fallbackEntries.flatMap((entry) =>
    projectMeshVerticesToCaseLocal(THREE, entry, placement),
  );
}

function getSmallestMeaningfulDistance(
  distances: number[],
  minimumDistance: number,
) {
  const sortedDistances = distances
    .filter(
      (distance) => Number.isFinite(distance) && distance >= minimumDistance,
    )
    .sort((left, right) => left - right);

  return sortedDistances[0] ?? null;
}

function estimateCaseCornerRadiusFromGeometry(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
  bounds: CaseProjectedBounds,
  template: PhoneCaseTemplate | null | undefined,
) {
  const width = getProjectedWidth(bounds);
  const height = getProjectedHeight(bounds);
  const minDim = Math.min(width, height);
  if (minDim <= 0) return null;

  const referencePoints = meshEntries
    .filter(isCaseCornerRadiusReferenceEntry)
    .flatMap((entry) => projectMeshVerticesToCaseLocal(THREE, entry, placement))
    .filter(
      (point) =>
        point.x >= bounds.minX - minDim * 0.02 &&
        point.x <= bounds.maxX + minDim * 0.02 &&
        point.y >= bounds.minY - minDim * 0.02 &&
        point.y <= bounds.maxY + minDim * 0.02,
    );

  if (referencePoints.length < 12) return null;

  const edgeBand = minDim * 0.012;
  const minRadius = minDim * 0.025;
  const maxRadius = minDim * (template?.id.includes("samsung") ? 0.09 : 0.18);
  const cornerSigns: Array<{ signX: -1 | 1; signY: -1 | 1 }> = [
    { signX: -1, signY: 1 },
    { signX: 1, signY: 1 },
    { signX: -1, signY: -1 },
    { signX: 1, signY: -1 },
  ];
  const cornerEstimates: number[] = [];

  for (const corner of cornerSigns) {
    const topDistances: number[] = [];
    const sideDistances: number[] = [];

    for (const point of referencePoints) {
      const distanceX =
        corner.signX > 0 ? bounds.maxX - point.x : point.x - bounds.minX;
      const distanceY =
        corner.signY > 0 ? bounds.maxY - point.y : point.y - bounds.minY;

      if (
        distanceX < -edgeBand ||
        distanceY < -edgeBand ||
        distanceX > maxRadius * 1.8 ||
        distanceY > maxRadius * 1.8
      ) {
        continue;
      }

      if (distanceY <= edgeBand && distanceX <= maxRadius) {
        topDistances.push(distanceX);
      }

      if (distanceX <= edgeBand && distanceY <= maxRadius) {
        sideDistances.push(distanceY);
      }
    }

    const topRadius = getSmallestMeaningfulDistance(topDistances, edgeBand);
    const sideRadius = getSmallestMeaningfulDistance(sideDistances, edgeBand);
    const estimate =
      topRadius && sideRadius
        ? (topRadius + sideRadius) / 2
        : (topRadius ?? sideRadius);

    if (typeof estimate === "number") {
      cornerEstimates.push(clamp(estimate, minRadius, maxRadius));
    }
  }

  if (cornerEstimates.length < 2) return null;

  const radius = getMedianValue(cornerEstimates);
  return typeof radius === "number"
    ? clamp(radius, minRadius, maxRadius)
    : null;
}

function createCaseModelOutlineFromBounds(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
  bounds: CaseProjectedBounds,
  template: PhoneCaseTemplate | null | undefined,
) {
  const baseWidth = getProjectedWidth(bounds);
  const baseHeight = getProjectedHeight(bounds);
  if (baseWidth <= 0 || baseHeight <= 0) return null;

  const minDim = Math.min(baseWidth, baseHeight);
  const clearance = minDim * CASE_SHELL_FIT_CLEARANCE_RATIO;
  const width = baseWidth + clearance * 2;
  const height = baseHeight + clearance * 2;
  const fallbackCornerRadius =
    Math.min(width, height) * getModelCornerRadiusRatio(template);
  const cornerRadius = template?.disableCornerRadiusEstimation
    ? fallbackCornerRadius
    : (estimateCaseCornerRadiusFromGeometry(
        THREE,
        meshEntries,
        placement,
        bounds,
        template,
      ) ?? fallbackCornerRadius);

  return {
    centerX: (bounds.minX + bounds.maxX) / 2,
    centerY: (bounds.minY + bounds.maxY) / 2,
    cornerRadius,
    height,
    width,
  } satisfies CaseModelOutline;
}

function getPhoneModelAxes(
  size: Record<AxisName, number>,
  preferredThicknessAxis?: AxisName,
): PhoneModelAxes {
  if (preferredThicknessAxis) {
    const remainingAxes = (["x", "y", "z"] as AxisName[])
      .filter((axis) => axis !== preferredThicknessAxis)
      .sort(
        (left, right) => getAxisValue(size, left) - getAxisValue(size, right),
      );

    return {
      thicknessAxis: preferredThicknessAxis,
      widthAxis: remainingAxes[0],
      heightAxis: remainingAxes[1],
    };
  }

  const sortedAxes = (["x", "y", "z"] as AxisName[]).sort(
    (left, right) => getAxisValue(size, left) - getAxisValue(size, right),
  );

  return {
    thicknessAxis: sortedAxes[0],
    widthAxis: sortedAxes[1],
    heightAxis: sortedAxes[2],
  };
}

function getCaseSurfaceSize(
  maxWidth: number,
  maxHeight: number,
  template: PhoneCaseTemplate | null | undefined,
) {
  const aspectRatio = template
    ? template.printWidth / template.printHeight
    : 78 / 163;

  // We want the case to completely cover the phone model.
  // Instead of scaling down (contain), we scale up (cover) to ensure both dimensions
  // are at least as large as the phone model while maintaining the template aspect ratio.
  let width = maxWidth;
  let height = width / aspectRatio;

  if (height < maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return { width, height };
}

function getCaseModelOutline(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
  template: PhoneCaseTemplate | null | undefined,
) {
  const robustPointBounds = getRobustBoundsFromPoints(
    getCaseReferenceLocalPoints(THREE, meshEntries, placement),
  );

  if (
    robustPointBounds &&
    getProjectedWidth(robustPointBounds) >= placement.planeWidth * 0.52 &&
    getProjectedHeight(robustPointBounds) >= placement.planeHeight * 0.52
  ) {
    const robustOutline = createCaseModelOutlineFromBounds(
      THREE,
      meshEntries,
      placement,
      robustPointBounds,
      template,
    );

    if (robustOutline) return robustOutline;
  }

  let outlineCandidates = meshEntries
    .filter(isCaseOutlineEntry)
    .map((entry) => ({
      bounds: projectMeshBoundsToCaseLocal(THREE, entry, placement),
      entry,
    }))
    .filter(
      (candidate) =>
        getProjectedWidth(candidate.bounds) > 0 &&
        getProjectedHeight(candidate.bounds) > 0,
    )
    .sort(
      (left, right) =>
        getProjectedArea(right.bounds) - getProjectedArea(left.bounds),
    );

  if (outlineCandidates.length === 0) {
    outlineCandidates = meshEntries
      .map((entry) => ({
        bounds: projectMeshBoundsToCaseLocal(THREE, entry, placement),
        entry,
      }))
      .filter((candidate) =>
        isGeometryOutlineCandidate(candidate.bounds, placement),
      )
      .sort(
        (left, right) =>
          getProjectedArea(right.bounds) - getProjectedArea(left.bounds),
      );
  }

  const bestBounds = outlineCandidates[0]?.bounds;

  if (!bestBounds) return null;

  const padding =
    Math.min(getProjectedWidth(bestBounds), getProjectedHeight(bestBounds)) *
    CASE_OUTLINE_PADDING_RATIO;

  return createCaseModelOutlineFromBounds(
    THREE,
    meshEntries,
    placement,
    {
      minX: bestBounds.minX - padding,
      maxX: bestBounds.maxX + padding,
      minY: bestBounds.minY - padding,
      maxY: bestBounds.maxY + padding,
    },
    template,
  );
}

function applyModelOutlineToPlacement(
  placement: CaseSurfacePlacement,
  outline: CaseModelOutline | null,
) {
  if (!outline) return placement;

  const sideWrapClearance =
    Math.min(outline.width, outline.height) * CASE_SHELL_MODEL_OVERLAP_RATIO;
  const centerOffset = getCaseWorldDeltaForLocalOffset(
    placement,
    outline.centerX,
    outline.centerY,
  );

  // Ensure the outline never shrinks the case dimensions below the initial
  // scaled phone size. The initial placement.planeWidth/Height and
  // sideWrapWidth/Height are already scaled by CASE_SHELL_BACK_SCALE and
  // CASE_SIDE_WRAP_OUTER_SCALE respectively to guarantee full phone coverage.
  return {
    ...placement,
    planeHeight: Math.max(outline.height, placement.planeHeight),
    planeWidth: Math.max(outline.width, placement.planeWidth),
    sideWrapHeight: Math.max(
      outline.height + sideWrapClearance,
      placement.sideWrapHeight,
    ),
    sideWrapWidth: Math.max(
      outline.width + sideWrapClearance,
      placement.sideWrapWidth,
    ),
    position: {
      x: placement.position.x + centerOffset.x,
      y: placement.position.y + centerOffset.y,
      z: placement.position.z + centerOffset.z,
    },
    sideWrapPosition: {
      x: placement.sideWrapPosition.x + centerOffset.x,
      y: placement.sideWrapPosition.y + centerOffset.y,
      z: placement.sideWrapPosition.z + centerOffset.z,
    },
  } satisfies CaseSurfacePlacement;
}

function getLowerHalfZBounds(
  points: CasePoint3[],
  planeHeight: number,
  insetQuantile = 0.02,
) {
  // Filter to points in the lower half of the phone (below the upper camera zone)
  const lowerPoints = points.filter((p) => p.y < -planeHeight * 0.15);
  const targetPoints = lowerPoints.length >= 8 ? lowerPoints : points;

  const zValues = targetPoints.map((p) => p.z).sort((a, b) => a - b);
  if (zValues.length === 0) return null;

  const minZ =
    zValues[Math.floor(zValues.length * insetQuantile)] ?? zValues[0];
  const maxZ =
    zValues[Math.floor(zValues.length * (1 - insetQuantile))] ??
    zValues[zValues.length - 1];

  return { minZ, maxZ };
}

function getCaseBodyDepthMetrics(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const points = getCaseReferenceLocalPoints(
    THREE,
    meshEntries,
    placement,
    true,
  );
  if (points.length < 8) return null;

  const lowerBounds = getLowerHalfZBounds(points, placement.planeHeight, 0.02);
  if (!lowerBounds) return null;

  const thickness = lowerBounds.maxZ - lowerBounds.minZ;
  const minExpectedThickness =
    Math.min(placement.planeWidth, placement.planeHeight) * 0.025;

  if (thickness < minExpectedThickness) {
    const robustBounds = getRobustBoundsFromPoints(points, 0.02);
    if (!robustBounds) return null;
    const robustThickness = robustBounds.maxZ - robustBounds.minZ;
    if (robustThickness < minExpectedThickness) return null;
    return {
      backZ: robustBounds.maxZ,
      frontZ: robustBounds.minZ,
      thickness: robustThickness,
    } satisfies CaseBodyDepthMetrics;
  }

  return {
    backZ: lowerBounds.maxZ,
    frontZ: lowerBounds.minZ,
    thickness,
  } satisfies CaseBodyDepthMetrics;
}

function getCaseWorldThicknessAxisValueFromLocalZ(
  placement: CaseSurfacePlacement,
  localZ: number,
) {
  const sign = placement.thicknessAxis === "z" ? 1 : placement.backSign;
  return placement.position[placement.thicknessAxis] + sign * localZ;
}

function getCasePositionThicknessAxisForLocalZ(
  placement: CaseSurfacePlacement,
  worldAxisValue: number,
  localZ: number,
) {
  const sign = placement.thicknessAxis === "z" ? 1 : placement.backSign;
  return worldAxisValue - sign * localZ;
}

function applyBodyDepthToPlacement(
  placement: CaseSurfacePlacement,
  bodyDepth: CaseBodyDepthMetrics | null,
) {
  if (!bodyDepth) return placement;

  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const overlap = minDim * CASE_SHELL_MODEL_OVERLAP_RATIO;
  const backSurfaceLift = minDim * CASE_BACK_SURFACE_LIFT_RATIO;
  const backAxisValue = getCaseWorldThicknessAxisValueFromLocalZ(
    placement,
    bodyDepth.backZ,
  );
  const frontAxisValue = getCaseWorldThicknessAxisValueFromLocalZ(
    placement,
    bodyDepth.frontZ,
  );
  const sideWrapDepth = clamp(
    Math.abs(backAxisValue - frontAxisValue) + overlap * 2,
    placement.sideWrapDepth * 0.92,
    placement.sideWrapDepth * 1.02,
  );
  // ExtrudeGeometry adds bevelThickness to both ends, and geometry.center() shifts it.
  // The inner surface is actually at -(shellDepth / 2 + bevelThickness).
  const bevelThickness = Math.min(placement.shellDepth * 0.18, minDim * 0.006);
  const desiredBackLocalZ =
    -placement.shellDepth / 2 - bevelThickness + overlap;
  const position = { ...placement.position };
  const sideWrapPosition = { ...placement.sideWrapPosition };

  position[placement.thicknessAxis] =
    getCasePositionThicknessAxisForLocalZ(
      placement,
      backAxisValue,
      desiredBackLocalZ,
    ) +
    placement.backSign * backSurfaceLift;
  sideWrapPosition[placement.thicknessAxis] =
    (backAxisValue + frontAxisValue) / 2;

  return {
    ...placement,
    position,
    sideWrapDepth,
    sideWrapPosition,
  } satisfies CaseSurfacePlacement;
}

function addRoundedRectPath(
  path: ThreePathLike,
  left: number,
  bottom: number,
  width: number,
  height: number,
  radius: number,
  clockwise: boolean,
) {
  const right = left + width;
  const top = bottom + height;
  const safeRadius = Math.min(radius, width / 2, height / 2);

  if (clockwise) {
    path.moveTo(left + safeRadius, top);
    path.lineTo(right - safeRadius, top);
    path.quadraticCurveTo(right, top, right, top - safeRadius);
    path.lineTo(right, bottom + safeRadius);
    path.quadraticCurveTo(right, bottom, right - safeRadius, bottom);
    path.lineTo(left + safeRadius, bottom);
    path.quadraticCurveTo(left, bottom, left, bottom + safeRadius);
    path.lineTo(left, top - safeRadius);
    path.quadraticCurveTo(left, top, left + safeRadius, top);
    path.closePath();
    return;
  }

  path.moveTo(left + safeRadius, bottom);
  path.lineTo(right - safeRadius, bottom);
  path.quadraticCurveTo(right, bottom, right, bottom + safeRadius);
  path.lineTo(right, top - safeRadius);
  path.quadraticCurveTo(right, top, right - safeRadius, top);
  path.lineTo(left + safeRadius, top);
  path.quadraticCurveTo(left, top, left, top - safeRadius);
  path.lineTo(left, bottom + safeRadius);
  path.quadraticCurveTo(left, bottom, left + safeRadius, bottom);
  path.closePath();
}

function createRoundedRectHolePath(
  THREE: typeof import("three"),
  left: number,
  bottom: number,
  width: number,
  height: number,
  radius: number,
) {
  const path = new THREE.Path();
  addRoundedRectPath(path, left, bottom, width, height, radius, true);
  return path;
}

function createCaseUvGenerator(
  THREE: typeof import("three"),
  width: number,
  height: number,
) {
  const clampUv = (value: number) => Math.min(Math.max(value, 0), 1);
  const getUv = (vertices: ArrayLike<number>, index: number) => {
    const x = vertices[index * 3] ?? 0;
    const y = vertices[index * 3 + 1] ?? 0;
    return new THREE.Vector2(
      clampUv((x + width / 2) / width),
      clampUv(1 - (y + height / 2) / height),
    );
  };

  return {
    generateTopUV(
      _geometry: unknown,
      vertices: ArrayLike<number>,
      indexA: number,
      indexB: number,
      indexC: number,
    ) {
      return [
        getUv(vertices, indexA),
        getUv(vertices, indexB),
        getUv(vertices, indexC),
      ];
    },
    generateSideWallUV() {
      return [
        new THREE.Vector2(0, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, 1),
        new THREE.Vector2(0, 1),
      ];
    },
  };
}

function createCaseShellGeometry(
  THREE: typeof import("three"),
  template: PhoneCaseTemplate | null | undefined,
  width: number,
  height: number,
  depth: number,
  cornerRadius: number,
  cameraHardwareBounds?: CaseCameraHardwareBounds | null,
  cameraHardwareCutouts?: CaseCameraHardwareCutout[],
  cameraClusterBounds?: CaseProjectedBounds | null,
  iphoneCameraIslandBounds?: CaseProjectedBounds | null,
) {
  const shape = new THREE.Shape();
  addRoundedRectPath(
    shape,
    -width / 2,
    -height / 2,
    width,
    height,
    cornerRadius,
    false,
  );

  if (template) {
    const xScale = width / template.printWidth;
    const yScale = height / template.printHeight;
    const radiusScale = Math.min(xScale, yScale);
    const cutoutPadding = Math.min(width, height) * 0.006;
    const getTemplateCutoutBounds = (
      cutout: PhoneCaseTemplate["cameraCutouts"][number],
    ) => {
      const cutoutWidth = cutout.width * xScale;
      const cutoutHeight = cutout.height * yScale;
      const left = -width / 2 + cutout.x * xScale;
      const top = height / 2 - cutout.y * yScale;

      return {
        minX: left,
        maxX: left + cutoutWidth,
        minY: top - cutoutHeight,
        maxY: top,
      } satisfies CaseProjectedBounds;
    };
    const singleCameraCutout =
      template.cameraCutouts.length === 1 &&
      template.cameraCutouts[0]?.shape !== "circle"
        ? template.cameraCutouts[0]
        : null;
    const singleCameraBarBounds = singleCameraCutout
      ? mergeProjectedBounds(
          [
            getTemplateCutoutBounds(singleCameraCutout),
            isIphoneTemplate(template)
              ? iphoneCameraIslandBounds
              : cameraHardwareBounds,
            isIphoneTemplate(template) ? null : cameraClusterBounds,
          ].filter(Boolean) as CaseProjectedBounds[],
        )
      : null;

    const hardwareCutouts =
      template.cameraCutouts.every((cutout) => cutout.shape === "circle") &&
      cameraHardwareCutouts?.length
        ? cameraHardwareCutouts
        : null;

    if (hardwareCutouts) {
      for (const cutout of hardwareCutouts) {
        const cutoutRadius =
          cutout.radius +
          Math.min(width, height) * CASE_CAMERA_CIRCLE_PADDING_RATIO;

        shape.holes.push(
          createRoundedRectHolePath(
            THREE,
            cutout.centerX - cutoutRadius,
            cutout.centerY - cutoutRadius,
            cutoutRadius * 2,
            cutoutRadius * 2,
            cutoutRadius,
          ),
        );
      }
    } else if (singleCameraBarBounds) {
      const cameraPadding =
        Math.min(width, height) * CASE_CAMERA_BAR_PADDING_RATIO;
      const paddedBounds = clampProjectedBoundsToShell(
        {
          minX: singleCameraBarBounds.minX - cameraPadding,
          maxX: singleCameraBarBounds.maxX + cameraPadding,
          minY: singleCameraBarBounds.minY - cameraPadding,
          maxY: singleCameraBarBounds.maxY + cameraPadding,
        },
        width,
        height,
        cameraPadding * 0.25,
      );
      const cameraWidth = getProjectedWidth(paddedBounds);
      const cameraHeight = getProjectedHeight(paddedBounds);
      const cameraLeft = paddedBounds.minX;
      const cameraBottom = paddedBounds.minY;
      const cameraRadius =
        singleCameraCutout!.shape === "pill"
          ? Math.min(cameraWidth, cameraHeight) * 0.5
          : singleCameraCutout!.radius
            ? singleCameraCutout!.radius * radiusScale + cameraPadding * 0.25
            : Math.min(cameraWidth, cameraHeight) * 0.22;

      if (cameraWidth > 0 && cameraHeight > 0) {
        shape.holes.push(
          createRoundedRectHolePath(
            THREE,
            cameraLeft,
            cameraBottom,
            cameraWidth,
            cameraHeight,
            cameraRadius,
          ),
        );
      }
    } else if (cameraClusterBounds) {
      const cameraPadding =
        Math.min(width, height) * CASE_CAMERA_BAR_PADDING_RATIO;
      const paddedBounds = clampProjectedBoundsToShell(
        {
          minX: cameraClusterBounds.minX - cameraPadding,
          maxX: cameraClusterBounds.maxX + cameraPadding,
          minY: cameraClusterBounds.minY - cameraPadding,
          maxY: cameraClusterBounds.maxY + cameraPadding,
        },
        width,
        height,
        cameraPadding * 0.25,
      );
      const cameraWidth = getProjectedWidth(paddedBounds);
      const cameraHeight = getProjectedHeight(paddedBounds);
      const cameraLeft = paddedBounds.minX;
      const cameraBottom = paddedBounds.minY;
      const cameraRadius = Math.min(cameraWidth, cameraHeight) * 0.18;

      if (cameraWidth > 0 && cameraHeight > 0) {
        shape.holes.push(
          createRoundedRectHolePath(
            THREE,
            cameraLeft,
            cameraBottom,
            cameraWidth,
            cameraHeight,
            cameraRadius,
          ),
        );
      }
    } else {
      for (const cutout of template.cameraCutouts) {
        const cutoutWidth = cutout.width * xScale + cutoutPadding * 2;
        const cutoutHeight = cutout.height * yScale + cutoutPadding * 2;
        const left = -width / 2 + cutout.x * xScale - cutoutPadding;
        const top = height / 2 - cutout.y * yScale + cutoutPadding;
        const bottom = top - cutoutHeight;

        const radius =
          cutout.shape === "circle" || cutout.shape === "pill"
            ? Math.min(cutoutWidth, cutoutHeight) / 2
            : (cutout.radius ?? 0) * radiusScale + cutoutPadding;

        shape.holes.push(
          createRoundedRectHolePath(
            THREE,
            left,
            bottom,
            cutoutWidth,
            cutoutHeight,
            radius,
          ),
        );
      }
    }
  }

  const bevelSize = Math.min(depth * 0.12, Math.min(width, height) * 0.004);
  const bevelThickness = Math.min(
    depth * 0.18,
    Math.min(width, height) * 0.006,
  );
  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize,
    bevelThickness,
    curveSegments: 18,
    depth,
    steps: 1,
    UVGenerator: createCaseUvGenerator(THREE, width, height),
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function isCameraHardwareEntry(entry: ThreeMeshMaterialEntry) {
  const meshName = ((entry.mesh as { name?: string }).name || "").toLowerCase();
  const materialNames = entry.materials
    .map((material) => material.name || "")
    .join(" ")
    .toLowerCase();
  const key = `${meshName} ${materialNames}`;

  if (/(body|button|display|screen|speaker|screw|usb|front|selfie)/.test(key)) {
    return false;
  }

  return /(camera|lens|flash|lidar|back_mic)/.test(key);
}

function isBackSurfaceReferenceEntry(entry: ThreeMeshMaterialEntry) {
  return (
    isCameraIslandEntry(entry) ||
    isNamedCameraClusterEntry(entry) ||
    isCameraHardwareEntry(entry)
  );
}

function isBackCameraHardwareEntry(entry: ThreeMeshMaterialEntry) {
  const meshName = ((entry.mesh as { name?: string }).name || "").toLowerCase();
  const materialNames = entry.materials
    .map((material) => material.name || "")
    .join(" ")
    .toLowerCase();
  const key = `${meshName} ${materialNames}`;

  if (/(front|selfie)/.test(key)) {
    return false;
  }

  return (
    /^camera_\d+_(glass|lens|ring|frame|filter|base)$/.test(meshName) ||
    /(camera ring|camera lens|camera glass|lens glass|lens frame|metal lens|camera frame|camera filter|flash|lidar|back_mic)/.test(
      key,
    )
  );
}

function isNearCaseBackSurface(
  bounds: CaseLocalBounds,
  placement: CaseSurfacePlacement,
) {
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const depthLimit = Math.max(
    placement.shellDepth * 8,
    Math.min(placement.planeWidth, placement.planeHeight) * 0.08,
  );

  return Math.abs(centerZ) <= depthLimit;
}

function isNearIphoneCameraPlane(
  bounds: CaseLocalBounds,
  placement: CaseSurfacePlacement,
) {
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const depthLimit = Math.max(
    placement.shellDepth * 14,
    Math.min(placement.planeWidth, placement.planeHeight) * 0.18,
  );

  return Math.abs(centerZ) <= depthLimit;
}

function isOnBackSkinPlane(
  bounds: CaseLocalBounds,
  placement: CaseSurfacePlacement,
) {
  const centerZ = (bounds.minZ + bounds.maxZ) / 2;
  const depthLimit = Math.max(
    placement.shellDepth * 3,
    Math.min(placement.planeWidth, placement.planeHeight) * 0.025,
  );

  return Math.abs(centerZ) <= depthLimit;
}

function getProjectedBoundsDistance(
  left: CaseProjectedBounds,
  right: CaseProjectedBounds,
) {
  const horizontalGap = Math.max(
    0,
    Math.max(left.minX, right.minX) - Math.min(left.maxX, right.maxX),
  );
  const verticalGap = Math.max(
    0,
    Math.max(left.minY, right.minY) - Math.min(left.maxY, right.maxY),
  );

  return Math.hypot(horizontalGap, verticalGap);
}

function getBestCameraClusterBounds(
  boundsList: CaseProjectedBounds[],
  placement: CaseSurfacePlacement,
) {
  if (boundsList.length === 0) return null;

  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const clusterGap = minDim * 0.22;
  const clusters: CaseProjectedBounds[][] = [];

  for (const bounds of boundsList) {
    const matchingCluster = clusters.find((cluster) =>
      cluster.some(
        (clusterBounds) =>
          getProjectedBoundsDistance(clusterBounds, bounds) <= clusterGap,
      ),
    );

    if (matchingCluster) {
      matchingCluster.push(bounds);
    } else {
      clusters.push([bounds]);
    }
  }

  const rankedClusters = clusters
    .map((cluster) => {
      const merged = mergeProjectedBounds(cluster);
      const centerY = merged ? getProjectedCenterY(merged) : 0;
      const topBias = centerY > -placement.planeHeight * 0.12 ? 1 : 0;
      const area = merged ? getProjectedArea(merged) : 0;

      return {
        area,
        bounds: merged,
        count: cluster.length,
        score: cluster.length * 100 + topBias * 25 + area,
      };
    })
    .filter(
      (
        cluster,
      ): cluster is {
        area: number;
        bounds: CaseProjectedBounds;
        count: number;
        score: number;
      } => Boolean(cluster.bounds),
    )
    .sort((left, right) => right.score - left.score);

  return rankedClusters[0]?.bounds ?? null;
}

function getCameraHardwareBounds(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const bounds: CaseCameraHardwareBounds = {
    maxX: Number.NEGATIVE_INFINITY,
    maxY: Number.NEGATIVE_INFINITY,
    minX: Number.POSITIVE_INFINITY,
    minY: Number.POSITIVE_INFINITY,
  };
  let hasBounds = false;

  for (const entry of meshEntries) {
    if (!isCameraHardwareEntry(entry)) continue;

    const entryBounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);
    if (!isNearCaseBackSurface(entryBounds, placement)) continue;

    bounds.minX = Math.min(bounds.minX, entryBounds.minX);
    bounds.maxX = Math.max(bounds.maxX, entryBounds.maxX);
    bounds.minY = Math.min(bounds.minY, entryBounds.minY);
    bounds.maxY = Math.max(bounds.maxY, entryBounds.maxY);
    hasBounds = true;
  }

  return hasBounds ? bounds : null;
}

function getIphoneCameraIslandBounds(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const planeArea = placement.planeWidth * placement.planeHeight;
  const isUsableCameraBounds = (bounds: CaseLocalBounds) => {
    const width = getProjectedWidth(bounds);
    const height = getProjectedHeight(bounds);
    const area = width * height;
    const centerY = getProjectedCenterY(bounds);
    const longestSide = Math.max(width, height);

    return (
      width > 0 &&
      height > 0 &&
      area > 0 &&
      area <= planeArea * 0.13 &&
      longestSide <= minDim * 0.58 &&
      centerY >= -placement.planeHeight * 0.08 &&
      isNearIphoneCameraPlane(bounds, placement)
    );
  };
  const namedCandidateBounds = meshEntries
    .filter(isIphoneCameraCandidateEntry)
    .map((entry) => projectMeshBoundsToCaseLocal(THREE, entry, placement))
    .filter(isUsableCameraBounds);

  if (namedCandidateBounds.length > 0) {
    return getBestCameraClusterBounds(namedCandidateBounds, placement);
  }

  const geometryCandidateBounds = meshEntries
    .map((entry) => {
      const key = getMeshEntryKey(entry);
      const bounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);

      return { bounds, key };
    })
    .filter(({ bounds, key }) => {
      if (
        /(front|selfie|body|button|display|screen|speaker|port|sim|tray|usb|wallpaper|logo)/.test(
          key,
        )
      ) {
        return false;
      }

      return isUsableCameraBounds(bounds);
    })
    .map(({ bounds }) => bounds);

  return getBestCameraClusterBounds(geometryCandidateBounds, placement);
}

function isGeometryCameraCandidate(
  THREE: typeof import("three"),
  entry: ThreeMeshMaterialEntry,
  placement: CaseSurfacePlacement,
) {
  const key = getMeshEntryKey(entry);
  if (
    /(body|frame|button|display|screen|speaker|port|sim|tray|usb|wallpaper)/.test(
      key,
    )
  ) {
    return false;
  }

  const bounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);
  const width = getProjectedWidth(bounds);
  const height = getProjectedHeight(bounds);
  const area = width * height;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const planeArea = placement.planeWidth * placement.planeHeight;
  const maxCandidateSize =
    Math.min(placement.planeWidth, placement.planeHeight) * 0.45;

  if (width <= 0 || height <= 0 || area <= 0) return false;
  if (width > maxCandidateSize || height > maxCandidateSize) return false;
  if (area > planeArea * 0.08) return false;
  if (centerY < -placement.planeHeight * 0.05) return false;
  return isNearCaseBackSurface(bounds, placement);
}

function getCameraClusterBounds(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const namedBounds = meshEntries
    .filter(
      (entry) => isCameraIslandEntry(entry) || isNamedCameraClusterEntry(entry),
    )
    .map((entry) => projectMeshBoundsToCaseLocal(THREE, entry, placement))
    .filter(
      (bounds) =>
        getProjectedWidth(bounds) > 0 && getProjectedHeight(bounds) > 0,
    )
    .filter((bounds) => isNearCaseBackSurface(bounds, placement));

  if (namedBounds.length > 0) {
    return getBestCameraClusterBounds(namedBounds, placement);
  }

  const geometryBounds = meshEntries
    .filter((entry) => isGeometryCameraCandidate(THREE, entry, placement))
    .map((entry) => projectMeshBoundsToCaseLocal(THREE, entry, placement))
    .filter(
      (bounds) =>
        getProjectedWidth(bounds) > 0 && getProjectedHeight(bounds) > 0,
    );

  return getBestCameraClusterBounds(geometryBounds, placement);
}

function getCameraHardwareCutouts(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const cutouts: CaseCameraHardwareCutout[] = [];
  const minDim = Math.min(placement.planeWidth, placement.planeHeight);

  for (const entry of meshEntries) {
    if (!isBackCameraHardwareEntry(entry)) continue;

    const bounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);
    if (!isNearCaseBackSurface(bounds, placement)) continue;

    const projectedWidth = getProjectedWidth(bounds);
    const projectedHeight = getProjectedHeight(bounds);
    const longestSide = Math.max(projectedWidth, projectedHeight);
    const shortestSide = Math.min(projectedWidth, projectedHeight);
    const aspectRatio = longestSide / Math.max(shortestSide, Number.EPSILON);

    if (projectedWidth <= 0 || projectedHeight <= 0) continue;
    if (aspectRatio > 1.45) continue;
    if (longestSide > minDim * 0.38) continue;

    const radius = Math.max(projectedWidth, projectedHeight) / 2;

    if (radius <= 0) continue;

    cutouts.push({
      centerX: (bounds.minX + bounds.maxX) / 2,
      centerY: (bounds.minY + bounds.maxY) / 2,
      radius,
    });
  }

  return cutouts
    .sort((left, right) => right.radius - left.radius)
    .reduce<CaseCameraHardwareCutout[]>((merged, cutout) => {
      const duplicate = merged.find((existing) => {
        const distance = Math.hypot(
          existing.centerX - cutout.centerX,
          existing.centerY - cutout.centerY,
        );
        return distance < Math.min(existing.radius, cutout.radius) * 0.5;
      });

      if (!duplicate) {
        merged.push(cutout);
      }

      return merged;
    }, []);
}

function isFrontOpeningEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(camera|lens|flash|lidar|button|speaker|microphone|mic|port|usb|sim|tray|body|frame|back|wallpaper|logo)/.test(
      key,
    )
  ) {
    return false;
  }

  return /(screen|display|front.?glass|touch|lcd|oled)/.test(key);
}

function getFrontOpeningBounds(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const openingBounds = meshEntries
    .filter(isFrontOpeningEntry)
    .map((entry) => projectMeshBoundsToCaseLocal(THREE, entry, placement))
    .filter((bounds) => {
      const width = getProjectedWidth(bounds);
      const height = getProjectedHeight(bounds);

      return (
        width >= placement.planeWidth * 0.52 &&
        height >= placement.planeHeight * 0.52 &&
        getProjectedArea(bounds) >=
          placement.planeWidth * placement.planeHeight * 0.3
      );
    })
    .sort((left, right) => getProjectedArea(right) - getProjectedArea(left));

  return openingBounds[0] ?? null;
}

function isNamedSideFeatureEntry(entry: ThreeMeshMaterialEntry) {
  const key = getMeshEntryKey(entry);

  if (
    /(camera|lens|flash|lidar|screen|display|front|selfie|body|frame|back|wallpaper|logo)/.test(
      key,
    )
  ) {
    return false;
  }

  if (/(button|volume|power|action|camera.?control|silent|mute)/.test(key)) {
    return false;
  }

  return /(port|usb|charger|charging|lightning|type.?c|speaker|grill|mic|microphone|sim|tray)/.test(
    key,
  );
}

function getNamedSideFeatureKind(
  entry: ThreeMeshMaterialEntry,
): CaseSideCutoutKind | null {
  const key = getMeshEntryKey(entry);

  if (/(speaker|grill)/.test(key)) return "speaker";
  if (/(mic|microphone)/.test(key)) return "mic";
  if (/(sim|tray)/.test(key)) return "sim";
  if (/(port|usb|charger|charging|lightning|type.?c)/.test(key)) return "port";

  return null;
}

function getCaseSideCutoutEdge(
  bounds: CaseProjectedBounds,
  placement: CaseSurfacePlacement,
) {
  const centerX = getProjectedCenterX(bounds);
  const centerY = getProjectedCenterY(bounds);
  const distances: Array<{ edge: CaseSideCutoutEdge; value: number }> = [
    { edge: "left", value: Math.abs(centerX + placement.planeWidth / 2) },
    { edge: "right", value: Math.abs(placement.planeWidth / 2 - centerX) },
    { edge: "bottom", value: Math.abs(centerY + placement.planeHeight / 2) },
    { edge: "top", value: Math.abs(placement.planeHeight / 2 - centerY) },
  ];

  distances.sort((left, right) => left.value - right.value);
  const closest = distances[0];
  const threshold =
    Math.min(placement.planeWidth, placement.planeHeight) *
    CASE_SIDE_FEATURE_EDGE_THRESHOLD_RATIO;

  return closest && closest.value <= threshold ? closest.edge : null;
}

function isGeometrySideFeatureCandidate(
  THREE: typeof import("three"),
  entry: ThreeMeshMaterialEntry,
  placement: CaseSurfacePlacement,
) {
  const key = getMeshEntryKey(entry);

  if (
    /(camera|lens|flash|lidar|screen|display|front|selfie|body|frame|back|wallpaper|logo)/.test(
      key,
    )
  ) {
    return false;
  }

  const bounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);
  const width = getProjectedWidth(bounds);
  const height = getProjectedHeight(bounds);
  const area = width * height;
  const planeArea = placement.planeWidth * placement.planeHeight;
  const minDim = Math.min(placement.planeWidth, placement.planeHeight);

  if (width <= 0 || height <= 0 || area <= 0) return false;
  if (width > placement.planeWidth * 0.38) return false;
  if (height > placement.planeHeight * 0.22) return false;
  if (area > planeArea * 0.035) return false;
  if (isOnBackSkinPlane(bounds, placement)) return false;
  if (!getCaseSideCutoutEdge(bounds, placement)) return false;

  return width >= minDim * 0.01 || height >= minDim * 0.01;
}

function getSideCutoutVisualSpec(
  kind: CaseSideCutoutKind | undefined,
  minDim: number,
) {
  switch (kind) {
    case "port":
      return {
        height: minDim * 0.032,
        maxAlongRatio: 0.34,
        minAlong: minDim * 0.2,
        pad: minDim * 0.002,
        width: minDim * 0.2,
      };
    case "speaker":
      return {
        height: minDim * 0.024,
        maxAlongRatio: 0.08,
        minAlong: minDim * 0.018,
        pad: minDim * 0.0015,
        width: minDim * 0.018,
      };
    case "mic":
      return {
        height: minDim * 0.014,
        maxAlongRatio: 0.06,
        minAlong: minDim * 0.014,
        pad: minDim * 0.001,
        width: minDim * 0.014,
      };
    case "sim":
      return {
        height: minDim * 0.018,
        maxAlongRatio: 0.22,
        minAlong: minDim * 0.08,
        pad: minDim * 0.002,
        width: minDim * 0.08,
      };
    default:
      return {
        height: minDim * 0.018,
        maxAlongRatio: 0.18,
        minAlong: minDim * 0.022,
        pad: minDim * 0.002,
        width: minDim * 0.022,
      };
  }
}

function createSideCutoutFromBounds(
  bounds: CaseProjectedBounds,
  edge: CaseSideCutoutEdge,
  placement: CaseSurfacePlacement,
  kind: CaseSideCutoutKind = "generic",
) {
  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const spec = getSideCutoutVisualSpec(kind, minDim);
  const padding = minDim * CASE_SIDE_FEATURE_PADDING_RATIO;
  const width = Math.max(getProjectedWidth(bounds) + padding * 2, spec.width);
  const height = Math.max(
    getProjectedHeight(bounds) + padding * 2,
    spec.height,
  );

  return {
    centerX: getProjectedCenterX(bounds),
    centerY: getProjectedCenterY(bounds),
    edge,
    height,
    kind,
    radius: Math.min(width, height) / 2,
    width,
  } satisfies CaseSideCutout;
}

function mergeTwoSideCutouts(left: CaseSideCutout, right: CaseSideCutout) {
  const minX = Math.min(
    left.centerX - left.width / 2,
    right.centerX - right.width / 2,
  );
  const maxX = Math.max(
    left.centerX + left.width / 2,
    right.centerX + right.width / 2,
  );
  const minY = Math.min(
    left.centerY - left.height / 2,
    right.centerY - right.height / 2,
  );
  const maxY = Math.max(
    left.centerY + left.height / 2,
    right.centerY + right.height / 2,
  );
  const width = maxX - minX;
  const height = maxY - minY;

  return {
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
    edge: left.edge,
    height,
    kind: left.kind === right.kind ? left.kind : "generic",
    preserveSeparate: left.preserveSeparate || right.preserveSeparate,
    radius: Math.min(width, height) / 2,
    width,
  } satisfies CaseSideCutout;
}

function getSideCutoutInterval(cutout: CaseSideCutout) {
  if (cutout.edge === "top" || cutout.edge === "bottom") {
    return {
      end: cutout.centerX + cutout.width / 2,
      start: cutout.centerX - cutout.width / 2,
    };
  }

  return {
    end: cutout.centerY + cutout.height / 2,
    start: cutout.centerY - cutout.height / 2,
  };
}

function mergeSideCutouts(cutouts: CaseSideCutout[]) {
  const merged: CaseSideCutout[] = [];
  const edges: CaseSideCutoutEdge[] = ["top", "right", "bottom", "left"];

  for (const edge of edges) {
    const edgeCutouts = cutouts
      .filter((cutout) => cutout.edge === edge)
      .sort(
        (left, right) =>
          getSideCutoutInterval(left).start -
          getSideCutoutInterval(right).start,
      );

    for (const cutout of edgeCutouts) {
      const current = merged[merged.length - 1];

      if (!current || current.edge !== edge) {
        merged.push(cutout);
        continue;
      }

      const currentInterval = getSideCutoutInterval(current);
      const nextInterval = getSideCutoutInterval(cutout);
      const shouldKeepSeparate =
        current.preserveSeparate ||
        cutout.preserveSeparate ||
        Boolean(current.kind && cutout.kind && current.kind !== cutout.kind);
      const mergeGap =
        Math.max(
          currentInterval.end - currentInterval.start,
          nextInterval.end - nextInterval.start,
        ) * 0.42;

      if (
        !shouldKeepSeparate &&
        nextInterval.start - currentInterval.end <= mergeGap
      ) {
        merged[merged.length - 1] = mergeTwoSideCutouts(current, cutout);
      } else {
        merged.push(cutout);
      }
    }
  }

  return merged;
}

function getSideFeatureCutouts(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  placement: CaseSurfacePlacement,
) {
  const cutouts: CaseSideCutout[] = [];

  for (const entry of meshEntries) {
    const namedSideFeature = isNamedSideFeatureEntry(entry);
    const geometrySideFeature =
      !namedSideFeature &&
      isGeometrySideFeatureCandidate(THREE, entry, placement);

    if (!namedSideFeature && !geometrySideFeature) continue;

    const bounds = projectMeshBoundsToCaseLocal(THREE, entry, placement);
    const edge = getCaseSideCutoutEdge(bounds, placement);
    if (!edge) continue;
    if (geometrySideFeature && isOnBackSkinPlane(bounds, placement)) continue;

    // Filter out features that are entirely on the front face or back face of the device.
    // Screen receivers (earpieces) or camera elements sit on the front/back faces,
    // whereas actual frame features (like USB ports, speaker grills, mics, SIM trays) sit in the middle.
    const sign = placement.thicknessAxis === "z" ? 1 : placement.backSign;
    const sideWrapCenterZ =
      sign *
      (placement.sideWrapPosition[placement.thicknessAxis] -
        placement.position[placement.thicknessAxis]);
    const localMinZ = bounds.minZ - sideWrapCenterZ;
    const localMaxZ = bounds.maxZ - sideWrapCenterZ;

    if (localMaxZ < -placement.sideWrapDepth * 0.25) continue;
    if (localMinZ > placement.sideWrapDepth * 0.25) continue;

    cutouts.push(
      createSideCutoutFromBounds(
        bounds,
        edge,
        placement,
        namedSideFeature
          ? (getNamedSideFeatureKind(entry) ?? "generic")
          : "generic",
      ),
    );
  }

  return mergeSideCutouts(cutouts);
}

function getTemplateButtonCenterY(
  button: NonNullable<PhoneCaseTemplate["buttons"]>[number],
  template: PhoneCaseTemplate,
  placement: CaseSurfacePlacement,
) {
  const yScale = placement.planeHeight / template.printHeight;
  return (
    placement.planeHeight / 2 - ((button.yStart + button.yEnd) / 2) * yScale
  );
}

function removeButtonLikeSideCutouts(
  template: PhoneCaseTemplate | null | undefined,
  placement: CaseSurfacePlacement,
  cutouts: CaseSideCutout[],
) {
  if (!template?.buttons?.length) return cutouts;

  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const yScale = placement.planeHeight / template.printHeight;

  return cutouts.filter((cutout) => {
    if (cutout.edge !== "left" && cutout.edge !== "right") return true;

    const matchesTemplateButton = template.buttons?.some((button) => {
      if (button.side !== cutout.edge) return false;

      const centerY = getTemplateButtonCenterY(button, template, placement);
      const buttonHeight = Math.abs(button.yEnd - button.yStart) * yScale;
      return (
        Math.abs(cutout.centerY - centerY) <=
        Math.max(buttonHeight, cutout.height, minDim * 0.045)
      );
    });

    if (!matchesTemplateButton) return true;

    return cutout.kind === "sim";
  });
}

function addFallbackBottomOpenings(
  cutouts: CaseSideCutout[],
  placement: CaseSurfacePlacement,
) {
  const minDim = Math.min(placement.planeWidth, placement.planeHeight);
  const portSpec = getSideCutoutVisualSpec("port", minDim);
  const speakerSpec = getSideCutoutVisualSpec("speaker", minDim);
  const micSpec = getSideCutoutVisualSpec("mic", minDim);
  const bottomPortWidth = portSpec.width;
  const bottomPortHeight = portSpec.height;
  const hasVisibleBottomPort = cutouts.some(
    (cutout) =>
      cutout.edge === "bottom" &&
      (cutout.kind === "port" || cutout.width >= bottomPortWidth * 0.72) &&
      cutout.width >= bottomPortWidth * 0.72 &&
      cutout.height >= bottomPortHeight * 0.45,
  );

  if (!hasVisibleBottomPort) {
    cutouts.push({
      centerX: 0,
      centerY: -placement.planeHeight / 2,
      edge: "bottom",
      height: bottomPortHeight,
      kind: "port",
      preserveSeparate: true,
      radius: bottomPortHeight / 2,
      width: bottomPortWidth,
    });
  }

  const hasSpeakerOrMic = cutouts.some(
    (cutout) =>
      cutout.edge === "bottom" &&
      (cutout.kind === "speaker" || cutout.kind === "mic"),
  );

  if (hasSpeakerOrMic) return;

  const slotWidth = speakerSpec.width;
  const slotHeight = speakerSpec.height;
  const slotGap = minDim * 0.018;
  const micSize = micSpec.width;
  const slotStart = bottomPortWidth / 2 + minDim * 0.055;
  const micStart = bottomPortWidth / 2 + minDim * 0.064;
  const maxCenterX = placement.planeWidth / 2 - slotWidth / 2;
  const speakerSlotCenters = [-2, -1, 0].map(
    (index) => -(slotStart + Math.abs(index) * (slotWidth + slotGap)),
  );
  const micSlotCenters = [0, 1].map(
    (index) => micStart + index * (micSize + slotGap),
  );

  for (const centerX of speakerSlotCenters) {
    if (Math.abs(centerX) > maxCenterX) continue;
    cutouts.push({
      centerX,
      centerY: -placement.planeHeight / 2,
      edge: "bottom",
      height: slotHeight,
      kind: "speaker",
      preserveSeparate: true,
      radius: slotHeight / 2,
      width: slotWidth,
    });
  }

  for (const centerX of micSlotCenters) {
    if (Math.abs(centerX) > maxCenterX) continue;
    cutouts.push({
      centerX,
      centerY: -placement.planeHeight / 2,
      edge: "bottom",
      height: micSize,
      kind: "mic",
      preserveSeparate: true,
      radius: micSize / 2,
      width: micSize,
    });
  }
}

function withFallbackSideCutouts(
  template: PhoneCaseTemplate | null | undefined,
  placement: CaseSurfacePlacement,
  detectedCutouts: CaseSideCutout[],
) {
  const cutouts = removeButtonLikeSideCutouts(template, placement, [
    ...detectedCutouts,
  ]);

  addFallbackBottomOpenings(cutouts, placement);

  return mergeSideCutouts(cutouts);
}

function getSideWrapWallThickness(width: number, height: number) {
  return Math.min(width, height) * CASE_SIDE_WRAP_WALL_RATIO;
}

function getSafeSideWrapCornerRadius(
  width: number,
  height: number,
  wallThickness: number,
  cornerRadius: number,
) {
  const minRadius = wallThickness * 1.2;
  const maxRadius = Math.max(
    minRadius,
    Math.min(width, height) / 2 - wallThickness * 0.8,
  );

  return clamp(cornerRadius, minRadius, maxRadius);
}

function getSideCutoutAlongCenter(cutout: CaseSideCutout) {
  return cutout.edge === "top" || cutout.edge === "bottom"
    ? cutout.centerX
    : cutout.centerY;
}

function getSideCutoutAlongSize(cutout: CaseSideCutout) {
  return cutout.edge === "top" || cutout.edge === "bottom"
    ? cutout.width
    : cutout.height;
}

function getSideWallSolidIntervals(
  edge: CaseSideCutoutEdge,
  width: number,
  height: number,
  wallThickness: number,
  cornerRadius: number,
  cutouts: CaseSideCutout[],
) {
  const alongLength = edge === "top" || edge === "bottom" ? width : height;
  const minDim = Math.min(width, height);
  const cornerInset = Math.max(cornerRadius, wallThickness * 0.5);
  const min = -alongLength / 2 + cornerInset;
  const max = alongLength / 2 - cornerInset;

  if (max <= min) return [];

  const openings = cutouts
    .filter((cutout) => cutout.edge === edge)
    .map((cutout) => {
      const visualSpec = getSideCutoutVisualSpec(cutout.kind, minDim);
      const size = clamp(
        getSideCutoutAlongSize(cutout) + visualSpec.pad * 2,
        visualSpec.minAlong,
        alongLength * visualSpec.maxAlongRatio,
      );
      const center = clamp(
        getSideCutoutAlongCenter(cutout),
        min + size / 2,
        max - size / 2,
      );

      return {
        end: Math.min(max, center + size / 2),
        start: Math.max(min, center - size / 2),
      } satisfies CaseSideWallInterval;
    })
    .filter(
      (opening) =>
        opening.end - opening.start >
        Math.max(wallThickness * 0.28, minDim * 0.003),
    )
    .sort((left, right) => left.start - right.start);

  const mergedOpenings: CaseSideWallInterval[] = [];
  for (const opening of openings) {
    const current = mergedOpenings[mergedOpenings.length - 1];
    if (!current || opening.start > current.end) {
      mergedOpenings.push(opening);
    } else {
      current.end = Math.max(current.end, opening.end);
    }
  }

  const solidIntervals: CaseSideWallInterval[] = [];
  let cursor = min;

  for (const opening of mergedOpenings) {
    if (opening.start - cursor > wallThickness * 0.42) {
      solidIntervals.push({ start: cursor, end: opening.start });
    }
    cursor = Math.max(cursor, opening.end);
  }

  if (max - cursor > wallThickness * 0.42) {
    solidIntervals.push({ start: cursor, end: max });
  }

  return solidIntervals;
}

function createSideWallCornerGeometry(
  THREE: typeof import("three"),
  width: number,
  height: number,
  depth: number,
  wallThickness: number,
  cornerRadius: number,
  corner: CaseSideCorner,
) {
  const shape = new THREE.Shape();
  const outerRadius = getSafeSideWrapCornerRadius(
    width,
    height,
    wallThickness,
    cornerRadius,
  );
  const innerRadius = Math.max(
    outerRadius - wallThickness,
    wallThickness * 0.35,
  );
  const outerCenterX = corner.signX * (width / 2 - outerRadius);
  const outerCenterY = corner.signY * (height / 2 - outerRadius);
  const outerHorizontal = {
    x: outerCenterX,
    y: outerCenterY + corner.signY * outerRadius,
  };
  const outerVertical = {
    x: outerCenterX + corner.signX * outerRadius,
    y: outerCenterY,
  };
  const innerHorizontal = {
    x: outerCenterX,
    y: outerCenterY + corner.signY * innerRadius,
  };
  const innerVertical = {
    x: outerCenterX + corner.signX * innerRadius,
    y: outerCenterY,
  };

  shape.moveTo(innerHorizontal.x, innerHorizontal.y);
  shape.lineTo(outerHorizontal.x, outerHorizontal.y);
  shape.quadraticCurveTo(
    (corner.signX * width) / 2,
    (corner.signY * height) / 2,
    outerVertical.x,
    outerVertical.y,
  );
  shape.lineTo(innerVertical.x, innerVertical.y);
  shape.quadraticCurveTo(
    corner.signX * (width / 2 - wallThickness),
    corner.signY * (height / 2 - wallThickness),
    innerHorizontal.x,
    innerHorizontal.y,
  );
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: Math.min(wallThickness * 0.1, depth * 0.025),
    bevelThickness: Math.min(wallThickness * 0.12, depth * 0.035),
    curveSegments: 24,
    depth,
    steps: 1,
  });

  geometry.computeVertexNormals();
  return geometry;
}

function createSideWallSegmentGeometry(
  THREE: typeof import("three"),
  width: number,
  height: number,
  depth: number,
) {
  const shape = new THREE.Shape();
  const safeWidth = Math.max(width, Number.EPSILON);
  const safeHeight = Math.max(height, Number.EPSILON);
  const minSide = Math.min(safeWidth, safeHeight);

  addRoundedRectPath(
    shape,
    -safeWidth / 2,
    -safeHeight / 2,
    safeWidth,
    safeHeight,
    minSide * 0.28,
    false,
  );

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(minSide * 0.08, depth * 0.025),
    bevelThickness: Math.min(minSide * 0.1, depth * 0.035),
    curveSegments: 12,
    depth,
    steps: 1,
  });

  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function createSideWallSegmentGroup(
  THREE: typeof import("three"),
  width: number,
  height: number,
  depth: number,
  wallThickness: number,
  cornerRadius: number,
  sideCutouts: CaseSideCutout[],
  material: unknown,
) {
  const GroupCtor = (
    THREE as unknown as { Group: new () => ThreeCaseGroupLike }
  ).Group;
  const group = new GroupCtor();
  const edges: CaseSideCutoutEdge[] = ["top", "right", "bottom", "left"];

  for (const edge of edges) {
    const isHorizontalEdge = edge === "top" || edge === "bottom";
    const intervals = getSideWallSolidIntervals(
      edge,
      width,
      height,
      wallThickness,
      cornerRadius,
      sideCutouts,
    );

    for (const interval of intervals) {
      const length = interval.end - interval.start;
      const geometry = createSideWallSegmentGeometry(
        THREE,
        isHorizontalEdge ? length : wallThickness,
        isHorizontalEdge ? wallThickness : length,
        depth,
      );
      const mesh = new THREE.Mesh(geometry, material);
      const center = (interval.start + interval.end) / 2;

      if (isHorizontalEdge) {
        mesh.position.set(
          center,
          edge === "top"
            ? height / 2 - wallThickness / 2
            : -height / 2 + wallThickness / 2,
          0,
        );
      } else {
        mesh.position.set(
          edge === "right"
            ? width / 2 - wallThickness / 2
            : -width / 2 + wallThickness / 2,
          center,
          0,
        );
      }

      mesh.renderOrder = 9;
      group.add(mesh);
    }
  }

  const corners: CaseSideCorner[] = [
    { name: "top-left", signX: -1, signY: 1 },
    { name: "top-right", signX: 1, signY: 1 },
    { name: "bottom-left", signX: -1, signY: -1 },
    { name: "bottom-right", signX: 1, signY: -1 },
  ];

  for (const corner of corners) {
    const geometry = createSideWallCornerGeometry(
      THREE,
      width,
      height,
      depth,
      wallThickness,
      cornerRadius,
      corner,
    );
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, -depth / 2);
    mesh.renderOrder = 9;
    group.add(mesh);
  }

  return group;
}

function createSideWrapGroup(
  THREE: typeof import("three"),
  lipGeometry: unknown,
  placement: CaseSurfacePlacement,
  sideCutouts: CaseSideCutout[],
  material: unknown,
  lipDepth: number,
  cornerRadius: number,
) {
  const GroupCtor = (
    THREE as unknown as { Group: new () => ThreeCaseGroupLike }
  ).Group;
  const group = new GroupCtor();
  const wallThickness = getSideWrapWallThickness(
    placement.sideWrapWidth,
    placement.sideWrapHeight,
  );
  const lipMesh = new THREE.Mesh(lipGeometry, material);
  const safeCornerRadius = getSafeSideWrapCornerRadius(
    placement.sideWrapWidth,
    placement.sideWrapHeight,
    wallThickness,
    cornerRadius,
  );
  const sideWallGroup = createSideWallSegmentGroup(
    THREE,
    placement.sideWrapWidth,
    placement.sideWrapHeight,
    placement.sideWrapDepth,
    wallThickness,
    safeCornerRadius,
    sideCutouts,
    material,
  );

  lipMesh.position.set(0, 0, -placement.sideWrapDepth / 2 + lipDepth / 2);
  lipMesh.renderOrder = 9;
  group.add(sideWallGroup);
  group.add(lipMesh);

  return group;
}

function createSideWrapGeometry(
  THREE: typeof import("three"),
  width: number,
  height: number,
  depth: number,
  cornerRadius: number,
  frontOpeningBounds?: CaseProjectedBounds | null,
) {
  const shape = new THREE.Shape();
  const wallThickness = getSideWrapWallThickness(width, height);
  const safeCornerRadius = getSafeSideWrapCornerRadius(
    width,
    height,
    wallThickness,
    cornerRadius,
  );
  const openingPadding =
    Math.min(width, height) * CASE_FRONT_OPENING_PADDING_RATIO;
  let innerCenterX = 0;
  let innerCenterY = 0;
  let innerWidth = Math.max(width - wallThickness * 2, width * 0.72);
  let innerHeight = Math.max(height - wallThickness * 2, height * 0.72);

  if (frontOpeningBounds) {
    innerWidth = clamp(
      getProjectedWidth(frontOpeningBounds) + openingPadding * 2,
      width * 0.68,
      width - wallThickness * 1.35,
    );
    innerHeight = clamp(
      getProjectedHeight(frontOpeningBounds) + openingPadding * 2,
      height * 0.68,
      height - wallThickness * 1.35,
    );
    innerCenterX = clamp(
      getProjectedCenterX(frontOpeningBounds),
      -width / 2 + innerWidth / 2 + wallThickness * 0.25,
      width / 2 - innerWidth / 2 - wallThickness * 0.25,
    );
    innerCenterY = clamp(
      getProjectedCenterY(frontOpeningBounds),
      -height / 2 + innerHeight / 2 + wallThickness * 0.25,
      height / 2 - innerHeight / 2 - wallThickness * 0.25,
    );
  }

  const innerRadius = Math.max(safeCornerRadius - wallThickness, wallThickness);

  addRoundedRectPath(
    shape,
    -width / 2,
    -height / 2,
    width,
    height,
    safeCornerRadius,
    false,
  );
  shape.holes.push(
    createRoundedRectHolePath(
      THREE,
      innerCenterX - innerWidth / 2,
      innerCenterY - innerHeight / 2,
      innerWidth,
      innerHeight,
      innerRadius,
    ),
  );

  const bevelSize = Math.min(wallThickness * 0.22, depth * 0.045);
  const bevelThickness = Math.min(wallThickness * 0.26, depth * 0.06);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize,
    bevelThickness,
    curveSegments: 18,
    depth,
    steps: 1,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

function getCaseButtonReliefs(
  template: PhoneCaseTemplate | null | undefined,
  placement: CaseSurfacePlacement,
) {
  if (!template?.buttons?.length) return [];

  const minDim = Math.min(placement.sideWrapWidth, placement.sideWrapHeight);
  const yScale = placement.sideWrapHeight / template.printHeight;
  const sideDepth = clamp(
    placement.sideWrapDepth * 0.44,
    minDim * 0.022,
    minDim * 0.065,
  );
  const protrusion = Math.max(
    minDim * CASE_BUTTON_RELIEF_PROTRUSION_RATIO,
    placement.sideWrapDepth * 0.035,
  );

  return template.buttons.map((button) => {
    const centerY =
      placement.sideWrapHeight / 2 -
      ((button.yStart + button.yEnd) / 2) * yScale;
    const height = Math.max(
      Math.abs(button.yEnd - button.yStart) * yScale,
      minDim * CASE_BUTTON_RELIEF_HEIGHT_RATIO,
    );

    return {
      centerY,
      edge: button.side,
      height,
      protrusion,
      radius: Math.min(sideDepth, height) / 2,
      sideDepth,
    } satisfies CaseButtonRelief;
  });
}

function createSideButtonReliefGeometry(
  THREE: typeof import("three"),
  relief: CaseButtonRelief,
) {
  const shape = new THREE.Shape();
  addRoundedRectPath(
    shape,
    -relief.sideDepth / 2,
    -relief.height / 2,
    relief.sideDepth,
    relief.height,
    relief.radius,
    false,
  );

  const geometry = new THREE.ExtrudeGeometry(shape, {
    bevelEnabled: true,
    bevelSegments: 3,
    bevelSize: Math.min(relief.protrusion * 0.45, relief.sideDepth * 0.12),
    bevelThickness: Math.min(relief.protrusion * 0.65, relief.sideDepth * 0.18),
    curveSegments: 12,
    depth: relief.protrusion,
    steps: 1,
  });

  geometry.center();
  (geometry as unknown as { rotateY?: (angle: number) => void }).rotateY?.(
    relief.edge === "right" ? Math.PI / 2 : -Math.PI / 2,
  );
  geometry.computeVertexNormals();
  return geometry;
}

function createSideButtonReliefGroup(
  THREE: typeof import("three"),
  reliefs: CaseButtonRelief[],
  placement: CaseSurfacePlacement,
  material: unknown,
) {
  const GroupCtor = (
    THREE as unknown as { Group: new () => ThreeCaseGroupLike }
  ).Group;
  const group = new GroupCtor();

  for (const relief of reliefs) {
    const geometry = createSideButtonReliefGeometry(THREE, relief);
    const mesh = new THREE.Mesh(geometry, material);
    const direction = relief.edge === "right" ? 1 : -1;
    mesh.position.set(
      direction * (placement.sideWrapWidth / 2 + relief.protrusion * 0.46),
      relief.centerY,
      0,
    );
    mesh.renderOrder = 11;
    group.add(mesh);
  }

  return group;
}

function getCaseSurfacePlacement(
  size: Record<AxisName, number>,
  targetCenters: Record<AxisName, number>[],
  template: PhoneCaseTemplate | null | undefined,
): CaseSurfacePlacement {
  const axes = getPhoneModelAxes(
    size,
    template?.previewBackSide?.thicknessAxis,
  );
  const targetCenterAverage =
    targetCenters.reduce(
      (total, center) => total + getAxisValue(center, axes.thicknessAxis),
      0,
    ) / Math.max(targetCenters.length, 1);
  const getTargetCenterAxisAverage = (axis: AxisName) =>
    targetCenters.reduce(
      (total, center) => total + getAxisValue(center, axis),
      0,
    ) / Math.max(targetCenters.length, 1);
  const autoDetectedBackSign: 1 | -1 =
    targetCenters.length > 0
      ? targetCenterAverage < 0
        ? -1
        : 1
      : (template?.previewBackSide?.sign ?? 1);
  // If the template explicitly provides a sign hint, always honour it
  // (auto-detection can be fooled by symmetrical models or unusual pivot origins)
  const backSign: 1 | -1 =
    template?.previewBackSide?.sign ?? autoDetectedBackSign;
  const maxDim = Math.max(size.x, size.y, size.z, 1);
  const surfaceSize = getCaseSurfaceSize(
    getAxisValue(size, axes.widthAxis) * CASE_SHELL_BACK_SCALE,
    getAxisValue(size, axes.heightAxis) * CASE_SHELL_BACK_SCALE,
    template,
  );
  const thicknessSize = getAxisValue(size, axes.thicknessAxis);
  const modelOverlap =
    Math.min(surfaceSize.width, surfaceSize.height) *
    CASE_SHELL_MODEL_OVERLAP_RATIO;
  const sideWrapWidth =
    getAxisValue(size, axes.widthAxis) * CASE_SIDE_WRAP_OUTER_SCALE;
  const sideWrapHeight =
    getAxisValue(size, axes.heightAxis) * CASE_SIDE_WRAP_OUTER_SCALE;
  const shellDepth = Math.min(
    Math.max(
      thicknessSize * CASE_SHELL_DEPTH_RATIO,
      maxDim * CASE_SHELL_MIN_DEPTH_RATIO,
    ),
    maxDim * CASE_SHELL_MAX_DEPTH_RATIO,
  );
  const sideWrapDepth = thicknessSize * CASE_SIDE_WRAP_DEPTH_RATIO;
  const position = { x: 0, y: 0, z: 0 };
  const sideWrapPosition = { x: 0, y: 0, z: 0 };
  if (targetCenters.length > 0) {
    position[axes.widthAxis] = getTargetCenterAxisAverage(axes.widthAxis);
    position[axes.heightAxis] = getTargetCenterAxisAverage(axes.heightAxis);
    sideWrapPosition[axes.widthAxis] = position[axes.widthAxis];
    sideWrapPosition[axes.heightAxis] = position[axes.heightAxis];
  }
  position[axes.thicknessAxis] =
    backSign * (thicknessSize / 2 + shellDepth / 2 - modelOverlap);
  sideWrapPosition[axes.thicknessAxis] =
    backSign * (thicknessSize / 2 - sideWrapDepth / 2 - modelOverlap);

  return {
    ...axes,
    backSign,
    planeHeight: surfaceSize.height,
    planeWidth: surfaceSize.width,
    shellDepth,
    sideWrapDepth,
    sideWrapHeight,
    sideWrapPosition,
    sideWrapWidth,
    position,
  };
}

function getCaseFitMetrics(
  THREE: typeof import("three"),
  meshEntries: ThreeMeshMaterialEntry[],
  basePlacement: CaseSurfacePlacement,
  template: PhoneCaseTemplate | null | undefined,
) {
  const modelOutline = getCaseModelOutline(
    THREE,
    meshEntries,
    basePlacement,
    template,
  );
  const outlinePlacement = applyModelOutlineToPlacement(
    basePlacement,
    modelOutline,
  );
  const placement = applyBodyDepthToPlacement(
    outlinePlacement,
    getCaseBodyDepthMetrics(THREE, meshEntries, outlinePlacement),
  );
  const cameraHardwareBounds = getCameraHardwareBounds(
    THREE,
    meshEntries,
    placement,
  );
  const cameraHardwareCutouts = getCameraHardwareCutouts(
    THREE,
    meshEntries,
    placement,
  );
  const cameraClusterBounds = getCameraClusterBounds(
    THREE,
    meshEntries,
    placement,
  );
  const iphoneCameraIslandBounds =
    isIphoneTemplate(template) && !template?.disableCameraIslandDetection
      ? getIphoneCameraIslandBounds(THREE, meshEntries, placement)
      : null;
  const sideWrapXScale =
    placement.sideWrapWidth / Math.max(placement.planeWidth, Number.EPSILON);
  const sideWrapYScale =
    placement.sideWrapHeight / Math.max(placement.planeHeight, Number.EPSILON);
  const frontOpeningBounds = scaleProjectedBounds(
    getFrontOpeningBounds(THREE, meshEntries, placement),
    sideWrapXScale,
    sideWrapYScale,
  );
  const sideFeatureCutouts = scaleSideCutouts(
    withFallbackSideCutouts(
      template,
      placement,
      getSideFeatureCutouts(THREE, meshEntries, placement),
    ),
    sideWrapXScale,
    sideWrapYScale,
  );
  const buttonReliefs = getCaseButtonReliefs(template, placement);
  const sideWrapCornerRadius =
    (modelOutline?.cornerRadius ??
      Math.min(placement.planeWidth, placement.planeHeight) *
        getModelCornerRadiusRatio(template)) * sideWrapXScale;
  const sideWrapMinDim = Math.min(
    placement.sideWrapWidth,
    placement.sideWrapHeight,
  );
  const sideWrapLipDepth = Math.min(
    placement.sideWrapDepth * 0.4,
    Math.max(placement.sideWrapDepth * 0.14, sideWrapMinDim * 0.005),
  );

  return {
    buttonReliefs,
    cameraClusterBounds,
    cameraHardwareBounds,
    cameraHardwareCutouts,
    frontOpeningBounds,
    iphoneCameraIslandBounds,
    modelOutline,
    placement,
    sideFeatureCutouts,
    sideWrapCornerRadius,
    sideWrapLipDepth,
  } satisfies CaseFitMetrics;
}

function applyCaseSurfaceRotation(
  mesh: ThreeCaseMeshLike,
  placement: CaseSurfacePlacement,
) {
  const rotation = getCaseSurfaceRotation(placement);
  mesh.rotation.x = rotation.x;
  mesh.rotation.y = rotation.y;
  mesh.rotation.z = rotation.z;
}

function applyCaseSurfacePlacement(
  mesh: ThreeCaseMeshLike,
  placement: CaseSurfacePlacement,
) {
  mesh.position.set(
    placement.position.x,
    placement.position.y,
    placement.position.z,
  );
  applyCaseSurfaceRotation(mesh, placement);
}

function applySideWrapPlacement(
  mesh: ThreeCaseMeshLike,
  placement: CaseSurfacePlacement,
) {
  mesh.position.set(
    placement.sideWrapPosition.x,
    placement.sideWrapPosition.y,
    placement.sideWrapPosition.z,
  );
  applyCaseSurfaceRotation(mesh, placement);
}

function setCameraForBackPreview(
  camera: {
    far: number;
    fov: number;
    near: number;
    position: { set: (x: number, y: number, z: number) => void };
    up: { set: (x: number, y: number, z: number) => void };
    lookAt: (x: number, y: number, z: number) => void;
    updateProjectionMatrix: () => void;
  },
  placement: CaseSurfacePlacement,
  cameraDistance: number,
  target: CasePoint3 = { x: 0, y: 0, z: 0 },
) {
  const cameraPosition = { ...target };
  cameraPosition[placement.thicknessAxis] =
    target[placement.thicknessAxis] + placement.backSign * cameraDistance;

  const cameraUp = { x: 0, y: 0, z: 0 };
  cameraUp[placement.heightAxis] = 1;

  camera.up.set(cameraUp.x, cameraUp.y, cameraUp.z);
  camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
  camera.near = Math.max(cameraDistance / 100, 0.01);
  camera.far = cameraDistance * 100;
  camera.lookAt(target.x, target.y, target.z);
  camera.updateProjectionMatrix();
}

function cloneRgbaFactor(value: Readonly<RgbaFactor> | undefined) {
  if (!value) return undefined;
  return [value[0], value[1], value[2], value[3]] satisfies RgbaFactor;
}

function captureModelMaterialProps(material: ModelMaterial) {
  const pbr = material.pbrMetallicRoughness;

  return {
    baseColorFactor: cloneRgbaFactor(pbr?.baseColorFactor),
    metallicFactor: pbr?.metallicFactor,
    roughnessFactor: pbr?.roughnessFactor,
  } satisfies ModelMaterialOriginalProps;
}

function applyNeutralModelMaterialBase(material: ModelMaterial) {
  const pbr = material.pbrMetallicRoughness;

  pbr?.setBaseColorFactor?.([1, 1, 1, 1]);
  pbr?.setMetallicFactor?.(0);
  pbr?.setRoughnessFactor?.(0.82);
}

function restoreModelMaterialProps(
  material: ModelMaterial,
  originalProps: ModelMaterialOriginalProps | undefined,
) {
  if (!originalProps) return;

  const pbr = material.pbrMetallicRoughness;

  if (originalProps.baseColorFactor) {
    pbr?.setBaseColorFactor?.(originalProps.baseColorFactor);
  }

  if (typeof originalProps.metallicFactor === "number") {
    pbr?.setMetallicFactor?.(originalProps.metallicFactor);
  }

  if (typeof originalProps.roughnessFactor === "number") {
    pbr?.setRoughnessFactor?.(originalProps.roughnessFactor);
  }
}

function restoreThreeMaterialProps(
  material: ThreeMaterialLike,
  originalProps: ThreeMaterialOriginalProps | undefined,
) {
  if (!originalProps) return;

  if (originalProps.color) {
    material.color?.copy?.(originalProps.color);
  }

  if (originalProps.emissive) {
    material.emissive?.copy?.(originalProps.emissive);
  }

  if (typeof originalProps.emissiveIntensity === "number") {
    material.emissiveIntensity = originalProps.emissiveIntensity;
  }

  if (typeof originalProps.metalness === "number") {
    material.metalness = originalProps.metalness;
  }

  if (typeof originalProps.roughness === "number") {
    material.roughness = originalProps.roughness;
  }

  if (typeof originalProps.toneMapped === "boolean") {
    material.toneMapped = originalProps.toneMapped;
  }

  material.needsUpdate = true;
}

function CaseSkinOverlay({
  template,
  textureUrl,
  caseColor,
}: {
  template: PhoneCaseTemplate;
  textureUrl?: string | null;
  caseColor: string;
}) {
  return (
    <div
      data-case-skin-overlay
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
    >
      <div
        className="relative overflow-hidden border border-white/45 shadow-2xl shadow-black/20 ring-1 ring-black/10"
        style={{
          height: "76%",
          maxHeight: "560px",
          aspectRatio: `${template.printWidth} / ${template.printHeight}`,
          borderRadius: "28px",
          backgroundColor: textureUrl ? undefined : caseColor,
          backgroundImage: textureUrl ? `url(${textureUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_12%,rgba(255,255,255,0.16),transparent_34%),linear-gradient(90deg,rgba(255,255,255,0.1),transparent_24%,transparent_76%,rgba(0,0,0,0.18))]" />
        {template.cameraCutouts.map((cutout, index) => {
          const borderRadius =
            cutout.shape === "circle" || cutout.shape === "pill"
              ? "999px"
              : `${cutout.radius ?? 8}px`;

          return (
            <div
              key={`${cutout.shape}-${index}`}
              className="absolute border border-white/35 bg-card shadow-inner"
              style={{
                left: `${(cutout.x / template.printWidth) * 100}%`,
                top: `${(cutout.y / template.printHeight) * 100}%`,
                width: `${(cutout.width / template.printWidth) * 100}%`,
                height: `${(cutout.height / template.printHeight) * 100}%`,
                borderRadius,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function PhoneCaseViewer({
  modelUrl,
  textureUrl,
  template,
  shouldShowCaseSurface = false,
  shouldApplyCaseTexture = false,
  caseColor = DEFAULT_CASE_COLOR,
  className = "",
  onArAssetsChange,
}: PhoneCaseViewerProps) {
  const viewerRef = useRef<ModelViewerElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const threeSceneRef = useRef<Scene | null>(null);
  const threeCaseMeshRef = useRef<ThreeCaseMeshLike | null>(null);
  const threeCaseMaterialRef = useRef<ThreeCaseMaterialLike | null>(null);
  const threeCaseSideMaterialRef = useRef<ThreeCaseMaterialLike | null>(null);
  const threeSideWrapMeshRef = useRef<ThreeCaseMeshLike | null>(null);
  const threeSideWrapMaterialRef = useRef<ThreeCaseMaterialLike | null>(null);
  const threeButtonReliefGroupRef = useRef<ThreeCaseMeshLike | null>(null);
  const threeButtonReliefMaterialsRef = useRef<ThreeCaseMaterialLike[]>([]);
  const threeCasePlacementRef = useRef<CaseSurfacePlacement | null>(null);
  const threeCaseTextureRef = useRef<ThreeTextureLike | null>(null);
  const threeTargetMaterialsRef = useRef<ThreeMaterialLike[]>([]);
  const originalThreeMapsRef = useRef<Map<string, unknown | null>>(new Map());
  const originalThreeMaterialPropsRef = useRef<
    Map<string, ThreeMaterialOriginalProps>
  >(new Map());
  const currentThreeTextureUrlRef = useRef<string | null>(null);
  const targetMaterialsRef = useRef<ModelMaterial[]>([]);
  const originalTexturesRef = useRef<Map<string, unknown | null>>(new Map());
  const originalMaterialPropsRef = useRef<
    Map<string, ModelMaterialOriginalProps>
  >(new Map());
  const currentTextureUrlRef = useRef<string | null>(null);
  const arAssetsRef = useRef<PhoneCaseArAssets | null>(null);
  const arExportIdRef = useRef(0);
  const caseColorRef = useRef(caseColor);
  const shouldShowCaseSurfaceRef = useRef(shouldShowCaseSurface);
  const [threeSceneReady, setThreeSceneReady] = useState(false);
  const [modelViewerReady, setModelViewerReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [textureError, setTextureError] = useState<string | null>(null);
  const [arError, setArError] = useState<string | null>(null);
  const [isExportingAr, setIsExportingAr] = useState(false);
  const [arAssets, setArAssets] = useState<PhoneCaseArAssets | null>(null);
  const [showCaseSkinFallback, setShowCaseSkinFallback] = useState(false);

  const replaceArAssets = useCallback(
    (nextAssets: PhoneCaseArAssets | null) => {
      revokeArAssets(arAssetsRef.current);
      arAssetsRef.current = nextAssets;
      setArAssets(nextAssets);
      onArAssetsChange?.(nextAssets);
    },
    [onArAssetsChange],
  );

  const clearArAssets = useCallback(() => {
    arExportIdRef.current += 1;
    replaceArAssets(null);
    setArError(null);
    setIsExportingAr(false);
  }, [replaceArAssets]);

  useEffect(() => {
    return () => {
      revokeArAssets(arAssetsRef.current);
      arAssetsRef.current = null;
      onArAssetsChange?.(null);
    };
  }, [onArAssetsChange]);

  useEffect(() => {
    shouldShowCaseSurfaceRef.current = shouldShowCaseSurface;
  }, [shouldShowCaseSurface]);

  useEffect(() => {
    caseColorRef.current = caseColor;
    const caseMaterial = threeCaseMaterialRef.current;
    const sideMaterial = threeCaseSideMaterialRef.current;
    const sideWrapMaterial = threeSideWrapMaterialRef.current;
    const buttonReliefMaterials = threeButtonReliefMaterialsRef.current;

    if (caseMaterial && !currentThreeTextureUrlRef.current) {
      caseMaterial.color?.set?.(caseColor);
    }

    if (sideMaterial) {
      sideMaterial.color?.set?.(caseColor);
      sideMaterial.needsUpdate = true;
    }

    if (sideWrapMaterial) {
      sideWrapMaterial.color?.set?.(caseColor);
      sideWrapMaterial.needsUpdate = true;
    }

    for (const material of buttonReliefMaterials) {
      material.color?.set?.(caseColor);
    }
  }, [caseColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    let disposed = false;
    let frameId = 0;
    let loadedByThree = false;
    let cleanupScene: (() => void) | null = null;
    const previousCursor = canvas.style.cursor;
    const handlePointerDown = () => {
      canvas.style.cursor = "grabbing";
    };
    const handlePointerUp = () => {
      canvas.style.cursor = "grab";
    };

    canvas.style.cursor = "grab";
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    const fallbackTimer = window.setTimeout(() => {
      if (!loadedByThree && !disposed) {
        setShowCaseSkinFallback(true);
      }
    }, 8000);

    const loadModel = async () => {
      const THREE = await import("three");
      const { GLTFLoader } =
        await import("three/examples/jsm/loaders/GLTFLoader.js");
      const { OrbitControls } =
        await import("three/examples/jsm/controls/OrbitControls.js");

      if (disposed) return;

      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        canvas,
      });
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const scene = new THREE.Scene();
      threeSceneRef.current = scene;
      const camera = new THREE.PerspectiveCamera(30, 1, 0.01, 1000);
      const controls = new OrbitControls(camera, renderer.domElement);
      const tunedControls = controls as unknown as {
        dampingFactor: number;
        enableZoom: boolean;
        maxDistance: number;
        maxPolarAngle: number;
        minDistance: number;
        minPolarAngle: number;
        rotateSpeed: number;
        touches: { ONE: number; TWO: number };
        zoomSpeed: number;
      };
      controls.enableDamping = true;
      tunedControls.dampingFactor = 0.12;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.35;
      tunedControls.rotateSpeed = 1.0;
      tunedControls.zoomSpeed = 1.2;
      tunedControls.enableZoom = true;
      controls.enablePan = false;
      // Constrain vertical rotation to prevent flipping upside-down
      tunedControls.minPolarAngle = Math.PI * 0.05;
      tunedControls.maxPolarAngle = Math.PI * 0.95;
      // Touch gestures: ONE finger = rotate, TWO fingers = dolly/zoom
      tunedControls.touches = { ONE: 0 /* ROTATE */, TWO: 3 /* DOLLY_PAN */ };

      scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 3.0));
      const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
      keyLight.position.set(3, 4, 5);
      camera.add(keyLight);
      const fillLight = new THREE.DirectionalLight(0xffffff, 1.4);
      fillLight.position.set(-4, 2, 3);
      camera.add(fillLight);
      scene.add(camera);

      const setSize = () => {
        const { clientWidth, clientHeight } = container;
        if (clientWidth === 0 || clientHeight === 0) return;
        renderer.setSize(clientWidth, clientHeight, false);
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
      };

      const resizeObserver = new ResizeObserver(setSize);
      resizeObserver.observe(container);
      setSize();

      const gltf = await new GLTFLoader().loadAsync(modelUrl);
      if (disposed) {
        renderer.dispose();
        return;
      }

      const root = gltf.scene;
      if (template?.modelRotation) {
        root.rotation.x = template.modelRotation.x;
        root.rotation.y = template.modelRotation.y;
        root.rotation.z = template.modelRotation.z;
      } else {
        root.rotation.x = Math.PI / 2;
      }
      const materials = new Set<ThreeMaterialLike>();
      const meshEntries: ThreeMeshMaterialEntry[] = [];
      root.traverse((node: unknown) => {
        const mesh = node as unknown as ThreeMeshLike;
        if (!mesh.isMesh || !mesh.material) return;
        const meshMaterials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material];
        meshMaterials.forEach((material) => materials.add(material));
        meshEntries.push({ mesh: node, materials: meshMaterials });
      });

      const targetMaterials = getCaseThreeMaterials(
        Array.from(materials),
        template,
      );
      threeTargetMaterialsRef.current = targetMaterials;
      originalThreeMapsRef.current.clear();
      originalThreeMaterialPropsRef.current.clear();
      currentThreeTextureUrlRef.current = null;

      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      root.position.sub(center);
      root.updateMatrixWorld?.(true);
      scene.add(root);

      const targetMaterialSet = new Set(targetMaterials);
      const materialTargetCenters = meshEntries
        .filter((entry) =>
          entry.materials.some((material) => targetMaterialSet.has(material)),
        )
        .map((entry) =>
          new THREE.Box3()
            .setFromObject(entry.mesh)
            .getCenter(new THREE.Vector3()),
        );
      const cameraTargetCenters =
        materialTargetCenters.length > 0
          ? []
          : meshEntries
              .filter(isBackSurfaceReferenceEntry)
              .map((entry) =>
                new THREE.Box3()
                  .setFromObject(entry.mesh)
                  .getCenter(new THREE.Vector3()),
              );
      const targetCenters =
        materialTargetCenters.length > 0
          ? materialTargetCenters
          : cameraTargetCenters;
      const baseCasePlacement = getCaseSurfacePlacement(
        size,
        targetCenters,
        template,
      );
      const fitMetrics = getCaseFitMetrics(
        THREE,
        meshEntries,
        baseCasePlacement,
        template,
      );
      const casePlacement = fitMetrics.placement;
      const caseGeometry = createCaseShellGeometry(
        THREE,
        template,
        casePlacement.planeWidth,
        casePlacement.planeHeight,
        casePlacement.shellDepth,
        fitMetrics.modelOutline?.cornerRadius ??
          Math.min(casePlacement.planeWidth, casePlacement.planeHeight) *
            getModelCornerRadiusRatio(template),
        fitMetrics.cameraHardwareBounds,
        fitMetrics.cameraHardwareCutouts,
        fitMetrics.cameraClusterBounds,
        fitMetrics.iphoneCameraIslandBounds,
      );
      const sideWrapGeometry = createSideWrapGeometry(
        THREE,
        casePlacement.sideWrapWidth,
        casePlacement.sideWrapHeight,
        fitMetrics.sideWrapLipDepth,
        fitMetrics.sideWrapCornerRadius,
        fitMetrics.frontOpeningBounds,
      );
      const caseMaterial = new THREE.MeshStandardMaterial({
        color: caseColorRef.current,
        emissive: caseColorRef.current,
        emissiveIntensity: 0.18,
        side: THREE.DoubleSide,
        transparent: true,
        metalness: 0.04,
        roughness: 0.78,
      });
      const caseSideMaterial = new THREE.MeshStandardMaterial({
        color: caseColorRef.current,
        emissive: caseColorRef.current,
        emissiveIntensity: 0.16,
        side: THREE.DoubleSide,
        metalness: 0.12,
        roughness: 0.64,
      });
      const sideWrapMaterial = new THREE.MeshStandardMaterial({
        color: caseColorRef.current,
        emissive: caseColorRef.current,
        emissiveIntensity: 0.16,
        side: THREE.DoubleSide,
        metalness: 0.12,
        roughness: 0.64,
      });
      const buttonReliefMaterial = new THREE.MeshStandardMaterial({
        color: caseColorRef.current,
        emissive: caseColorRef.current,
        emissiveIntensity: 0.1,
        metalness: 0.08,
        roughness: 0.52,
      });
      const sideWrapMesh = createSideWrapGroup(
        THREE,
        sideWrapGeometry,
        casePlacement,
        fitMetrics.sideFeatureCutouts,
        sideWrapMaterial,
        fitMetrics.sideWrapLipDepth,
        fitMetrics.sideWrapCornerRadius,
      );
      sideWrapMesh.visible = shouldShowCaseSurfaceRef.current;
      applySideWrapPlacement(sideWrapMesh, casePlacement);
      sideWrapMesh.renderOrder = 9;
      scene.add(sideWrapMesh);

      const buttonReliefGroup = createSideButtonReliefGroup(
        THREE,
        fitMetrics.buttonReliefs,
        casePlacement,
        buttonReliefMaterial,
      );
      buttonReliefGroup.visible =
        shouldShowCaseSurfaceRef.current && fitMetrics.buttonReliefs.length > 0;
      applySideWrapPlacement(buttonReliefGroup, casePlacement);
      buttonReliefGroup.renderOrder = 11;
      scene.add(buttonReliefGroup);

      const caseMesh = new THREE.Mesh(caseGeometry, [
        caseMaterial,
        caseSideMaterial,
      ]);
      caseMesh.visible = shouldShowCaseSurfaceRef.current;
      applyCaseSurfacePlacement(caseMesh, casePlacement);
      caseMesh.renderOrder = 10;
      scene.add(caseMesh);
      threeCaseMeshRef.current = caseMesh;
      threeCaseMaterialRef.current = caseMaterial;
      threeCaseSideMaterialRef.current = caseSideMaterial;
      threeSideWrapMeshRef.current = sideWrapMesh;
      threeSideWrapMaterialRef.current = sideWrapMaterial;
      threeButtonReliefGroupRef.current = buttonReliefGroup;
      threeButtonReliefMaterialsRef.current = [buttonReliefMaterial];
      threeCasePlacementRef.current = casePlacement;
      threeCaseTextureRef.current = null;

      const previewBounds = new THREE.Box3().setFromObject(root);
      const expandPreviewBounds = (object: unknown) => {
        const objectBounds = new THREE.Box3().setFromObject(object);
        const previewBox = previewBounds as unknown as {
          max: Record<AxisName, number>;
          min: Record<AxisName, number>;
        };
        const nextBox = objectBounds as unknown as {
          max: Record<AxisName, number>;
          min: Record<AxisName, number>;
        };

        for (const axis of ["x", "y", "z"] as AxisName[]) {
          previewBox.min[axis] = Math.min(
            previewBox.min[axis],
            nextBox.min[axis],
          );
          previewBox.max[axis] = Math.max(
            previewBox.max[axis],
            nextBox.max[axis],
          );
        }
      };
      expandPreviewBounds(sideWrapMesh);
      expandPreviewBounds(buttonReliefGroup);
      expandPreviewBounds(caseMesh);
      const previewCenter = previewBounds.getCenter(new THREE.Vector3());
      const previewSize = previewBounds.getSize(new THREE.Vector3());
      const verticalFov = (camera.fov * Math.PI) / 180;
      const horizontalFov =
        2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
      const fitRatio = 0.78;
      const distanceForWidth =
        getAxisValue(
          previewSize as unknown as Record<AxisName, number>,
          casePlacement.widthAxis,
        ) /
        (2 * Math.tan(horizontalFov / 2) * fitRatio);
      const distanceForHeight =
        getAxisValue(
          previewSize as unknown as Record<AxisName, number>,
          casePlacement.heightAxis,
        ) /
        (2 * Math.tan(verticalFov / 2) * fitRatio);
      const cameraDistance = Math.max(distanceForHeight, distanceForWidth);
      const previewTarget = {
        x: previewCenter.x,
        y: previewCenter.y,
        z: previewCenter.z,
      } satisfies CasePoint3;
      setCameraForBackPreview(
        camera,
        casePlacement,
        cameraDistance,
        previewTarget,
      );
      tunedControls.minDistance = cameraDistance * 0.55;
      tunedControls.maxDistance = cameraDistance * 2.2;
      controls.target.set(previewTarget.x, previewTarget.y, previewTarget.z);
      controls.update();

      loadedByThree = true;
      setThreeSceneReady(true);
      setShowCaseSkinFallback(false);
      setModelError(null);
      setTextureError(null);

      const animate = () => {
        if (disposed) return;
        controls.update();
        renderer.render(scene, camera);
        frameId = window.requestAnimationFrame(animate);
      };
      animate();

      cleanupScene = () => {
        window.cancelAnimationFrame(frameId);
        resizeObserver.disconnect();
        controls.dispose();
        scene.traverse((node: unknown) => {
          const mesh = node as unknown as ThreeMeshLike & {
            geometry?: { dispose: () => void };
          };
          mesh.geometry?.dispose();
          if (!mesh.material) return;
          const meshMaterials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          meshMaterials.forEach((material) => {
            const disposable = material as ThreeMaterialLike & {
              dispose?: () => void;
            };
            disposable.dispose?.();
          });
        });
        renderer.dispose();
        threeSceneRef.current = null;
        threeCaseMeshRef.current = null;
        threeCaseMaterialRef.current = null;
        threeCaseSideMaterialRef.current = null;
        threeSideWrapMeshRef.current = null;
        threeSideWrapMaterialRef.current = null;
        threeButtonReliefGroupRef.current = null;
        threeButtonReliefMaterialsRef.current = [];
        threeCasePlacementRef.current = null;
        threeCaseTextureRef.current = null;
      };
    };

    setThreeSceneReady(false);
    setShowCaseSkinFallback(false);
    setModelError(null);
    setTextureError(null);
    setArError(null);
    setIsExportingAr(false);
    clearArAssets();
    threeSceneRef.current = null;
    threeTargetMaterialsRef.current = [];
    threeCaseMeshRef.current = null;
    threeCaseMaterialRef.current = null;
    threeCaseSideMaterialRef.current = null;
    threeSideWrapMeshRef.current = null;
    threeSideWrapMaterialRef.current = null;
    threeButtonReliefGroupRef.current = null;
    threeButtonReliefMaterialsRef.current = [];
    threeCasePlacementRef.current = null;
    threeCaseTextureRef.current?.dispose?.();
    threeCaseTextureRef.current = null;
    originalThreeMapsRef.current.clear();
    originalThreeMaterialPropsRef.current.clear();
    currentThreeTextureUrlRef.current = null;

    loadModel().catch((error: unknown) => {
      if (disposed) return;
      console.error("[3D Viewer] Three.js GLB load failed:", error);
      setThreeSceneReady(false);
      setShowCaseSkinFallback(true);
      setModelError("Không thể tải model 3D từ Supabase.");
    });

    return () => {
      disposed = true;
      window.clearTimeout(fallbackTimer);
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      canvas.style.cursor = previousCursor;
      cleanupScene?.();
    };
  }, [clearArAssets, modelUrl, template]);

  const clearTexture = useCallback(() => {
    const targetMaterials = targetMaterialsRef.current;

    for (const material of targetMaterials) {
      const textureSlot = material.pbrMetallicRoughness?.baseColorTexture;
      if (!textureSlot) continue;
      const materialKey = getMaterialKey(material);
      const originalTexture = originalTexturesRef.current.get(materialKey);
      textureSlot.setTexture(originalTexture ?? null);
      restoreModelMaterialProps(
        material,
        originalMaterialPropsRef.current.get(materialKey),
      );
    }

    currentTextureUrlRef.current = null;
  }, []);

  const clearThreeTexture = useCallback((keepSurfaceVisible = false) => {
    const caseMaterial = threeCaseMaterialRef.current;
    const sideMaterial = threeCaseSideMaterialRef.current;
    const sideWrapMaterial = threeSideWrapMaterialRef.current;
    const buttonReliefMaterials = threeButtonReliefMaterialsRef.current;
    const caseMesh = threeCaseMeshRef.current;
    const sideWrapMesh = threeSideWrapMeshRef.current;
    const buttonReliefGroup = threeButtonReliefGroupRef.current;

    if (caseMaterial) {
      threeCaseTextureRef.current?.dispose?.();
      threeCaseTextureRef.current = null;
      setCaseSurfaceTexture(caseMaterial, null);
      syncCaseSolidMaterial(caseMaterial, caseColorRef.current);
    }

    syncCaseSolidMaterial(sideMaterial, caseColorRef.current, 0.72);
    syncCaseSolidMaterial(sideWrapMaterial, caseColorRef.current, 0.72);

    for (const material of buttonReliefMaterials) {
      syncCaseSolidMaterial(material, caseColorRef.current, 0.32);
    }

    setCaseSurfaceVisibility(caseMesh, keepSurfaceVisible);
    setCaseSurfaceVisibility(sideWrapMesh, keepSurfaceVisible);
    setCaseSurfaceVisibility(buttonReliefGroup, keepSurfaceVisible);

    const targetMaterials = threeTargetMaterialsRef.current;

    for (const material of targetMaterials) {
      const materialKey = getThreeMaterialKey(material);
      setThreeMaterialMap(
        material,
        originalThreeMapsRef.current.get(materialKey) ?? null,
      );
      restoreThreeMaterialProps(
        material,
        originalThreeMaterialPropsRef.current.get(materialKey),
      );
    }

    currentThreeTextureUrlRef.current = null;
  }, []);

  const exportArAssets = useCallback(
    async (designImageUrl: string) => {
      const scene = threeSceneRef.current;
      const caseMesh = threeCaseMeshRef.current;
      const exportId = arExportIdRef.current + 1;
      arExportIdRef.current = exportId;

      if (!scene || !caseMesh || !caseMesh.visible) {
        replaceArAssets(null);
        return;
      }

      setIsExportingAr(true);
      setArError(null);

      try {
        const { GLTFExporter } =
          await import("three/examples/jsm/exporters/GLTFExporter.js");
        const { USDZExporter } =
          await import("three/examples/jsm/exporters/USDZExporter.js");

        const glbBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          new GLTFExporter().parse(
            scene,
            (result) => {
              if (result instanceof ArrayBuffer) {
                resolve(result);
                return;
              }
              reject(new Error("GLTFExporter did not return a binary GLB."));
            },
            reject,
            { binary: true, onlyVisible: true },
          );
        });

        const usdzBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
          new USDZExporter().parse(scene, resolve, reject, {
            onlyVisible: true,
            quickLookCompatible: true,
            maxTextureSize: 1024,
          });
        });

        const nextAssets = {
          designImageUrl,
          glbUrl: URL.createObjectURL(
            new Blob([glbBuffer], { type: "model/gltf-binary" }),
          ),
          usdzUrl: URL.createObjectURL(
            new Blob([usdzBuffer], { type: "model/vnd.usdz+zip" }),
          ),
        };

        if (arExportIdRef.current !== exportId) {
          revokeArAssets(nextAssets);
          return;
        }

        replaceArAssets(nextAssets);
      } catch (error) {
        console.error("[3D Viewer] Error exporting AR assets:", error);
        if (arExportIdRef.current === exportId) {
          replaceArAssets(null);
          setArError("Không thể tạo AR có thiết kế cho phiên này.");
        }
      } finally {
        if (arExportIdRef.current === exportId) {
          setIsExportingAr(false);
        }
      }
    },
    [replaceArAssets],
  );

  const applyThreeTexture = useCallback(
    async (url: string) => {
      const caseMaterial = threeCaseMaterialRef.current;
      const caseMesh = threeCaseMeshRef.current;
      const sideWrapMesh = threeSideWrapMeshRef.current;
      const buttonReliefGroup = threeButtonReliefGroupRef.current;

      if (!caseMaterial || !caseMesh) {
        setTextureError("Không thể khởi tạo mesh ốp 3D cho model này.");
        return;
      }

      try {
        const THREE = await import("three");
        const texture = await new THREE.TextureLoader().loadAsync(url);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.flipY = false;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        applyCaseShellTextureSettings(texture);
        texture.needsUpdate = true;

        threeCaseTextureRef.current?.dispose?.();
        threeCaseTextureRef.current = texture;
        syncCaseTextureMaterial(caseMaterial);
        setCaseSurfaceTexture(caseMaterial, texture);
        setCaseSurfaceVisibility(caseMesh, true);
        setCaseSurfaceVisibility(sideWrapMesh, true);
        setCaseSurfaceVisibility(buttonReliefGroup, true);

        currentThreeTextureUrlRef.current = url;
        setTextureError(null);
        void exportArAssets(url);
      } catch (error) {
        console.error(
          "[3D Viewer] Error applying case surface texture:",
          error,
        );
        setTextureError("Không thể áp thiết kế lên model 3D.");
      }
    },
    [exportArAssets],
  );

  const applyTexture = useCallback(async (url: string) => {
    const viewer = viewerRef.current;
    const targetMaterials = targetMaterialsRef.current;

    if (
      !viewer?.model ||
      typeof viewer.createTexture !== "function" ||
      targetMaterials.length === 0
    ) {
      return;
    }

    try {
      const texture = await viewer.createTexture(url);

      for (const material of targetMaterials) {
        const textureSlot = material.pbrMetallicRoughness?.baseColorTexture;
        if (!textureSlot) continue;

        const materialKey = getMaterialKey(material);
        if (!originalTexturesRef.current.has(materialKey)) {
          originalTexturesRef.current.set(
            materialKey,
            textureSlot.texture ?? null,
          );
          originalMaterialPropsRef.current.set(
            materialKey,
            captureModelMaterialProps(material),
          );
        }

        textureSlot.setTexture(texture);
        applyNeutralModelMaterialBase(material);
      }

      currentTextureUrlRef.current = url;
      setTextureError(null);
    } catch (error) {
      console.error("[3D Viewer] Error applying case texture:", error);
      setTextureError("Không thể áp thiết kế lên model 3D.");
    }
  }, []);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleLoad = async () => {
      await viewer.updateComplete?.catch(() => undefined);
      const targetMaterials = getCaseMaterials(
        viewer.model?.materials,
        template,
      );
      targetMaterialsRef.current = targetMaterials;
      originalTexturesRef.current.clear();
      originalMaterialPropsRef.current.clear();
      currentTextureUrlRef.current = null;
      setModelViewerReady(true);

      if (process.env.NODE_ENV === "development") {
        console.log(
          "[3D Viewer] Model loaded. Case materials:",
          targetMaterials.map((material) => material.name),
        );
      }
    };

    const handleError = () => {
      setModelViewerReady(false);
    };

    viewer.addEventListener("load", handleLoad);
    viewer.addEventListener("error", handleError);

    if (viewer.loaded) {
      void handleLoad();
    }

    return () => {
      viewer.removeEventListener("load", handleLoad);
      viewer.removeEventListener("error", handleError);
    };
  }, [template]);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    clearTexture();
    targetMaterialsRef.current = [];
    originalTexturesRef.current.clear();
    originalMaterialPropsRef.current.clear();
    currentTextureUrlRef.current = null;

    const nextModelViewerSrc = arAssets?.glbUrl ?? modelUrl;
    viewer.setAttribute("class", cn("mirai-model-viewer", className));
    viewer.setAttribute("src", nextModelViewerSrc);
    viewer.setAttribute("ar", "");
    viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    viewer.src = nextModelViewerSrc;
    if (arAssets?.usdzUrl) {
      viewer.setAttribute("ios-src", arAssets.usdzUrl);
      viewer.iosSrc = arAssets.usdzUrl;
    } else {
      viewer.removeAttribute("ios-src");
      viewer.iosSrc = undefined;
    }

    Promise.resolve().then(() => {
      setModelViewerReady(false);
      setModelError(null);
      setTextureError(null);
    });

    const syncSourceFrame = window.requestAnimationFrame(() => {
      const currentViewer = viewerRef.current;
      if (!currentViewer) return;
      currentViewer.setAttribute("src", nextModelViewerSrc);
      currentViewer.src = nextModelViewerSrc;
    });

    return () => {
      window.cancelAnimationFrame(syncSourceFrame);
    };
  }, [arAssets, className, clearTexture, modelUrl]);

  useEffect(() => {
    if (!threeSceneReady) return;

    if (!shouldShowCaseSurface) {
      clearTexture();
      clearThreeTexture(false);
      Promise.resolve().then(() => {
        clearArAssets();
        setTextureError(null);
      });
      return;
    }

    if (!shouldApplyCaseTexture || !textureUrl) {
      clearTexture();
      clearThreeTexture(true);
      Promise.resolve().then(() => {
        clearArAssets();
        setTextureError(null);
      });
      return;
    }

    if (textureUrl !== currentThreeTextureUrlRef.current) {
      applyThreeTexture(textureUrl);
    }

    if (
      modelViewerReady &&
      viewerRef.current?.model &&
      textureUrl !== currentTextureUrlRef.current
    ) {
      applyTexture(textureUrl);
    }
  }, [
    applyTexture,
    applyThreeTexture,
    clearArAssets,
    clearTexture,
    clearThreeTexture,
    modelViewerReady,
    shouldApplyCaseTexture,
    shouldShowCaseSurface,
    threeSceneReady,
    textureUrl,
  ]);

  const overlayTextureUrl = shouldApplyCaseTexture ? textureUrl : null;
  const shouldShowCaseSkin = Boolean(
    template && (modelError || showCaseSkinFallback),
  );
  const modelViewerSrc = arAssets?.glbUrl ?? modelUrl;
  const modelViewerIosSrc = arAssets?.usdzUrl;
  const canOpenDesignedAr = Boolean(arAssets && !isExportingAr);

  const handleOpenAr = useCallback(async () => {
    if (!arAssets) {
      setArError("Hãy thêm thiết kế để tạo AR preview có design.");
      return;
    }

    try {
      await viewerRef.current?.activateAR?.();
    } catch (error) {
      console.error("[3D Viewer] Error activating AR:", error);
      setArError("Thiết bị hoặc trình duyệt hiện chưa mở được AR.");
    }
  }, [arAssets]);

  return (
    <div className={cn("absolute inset-0 h-full w-full", className)}>
      {modelError && !template && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-card/95 p-6 text-center">
          <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
          <p className="text-sm font-semibold text-foreground">{modelError}</p>
          <p className="mt-1 max-w-64 text-xs text-muted-foreground">
            Vui lòng thử chọn lại mẫu điện thoại hoặc kiểm tra file GLB.
          </p>
        </div>
      )}

      {modelError && template && !shouldShowCaseSkin && (
        <div className="absolute left-4 right-4 top-4 z-20 flex items-start gap-2 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <span>{modelError}</span>
        </div>
      )}

      {textureError && shouldApplyCaseTexture && (
        <div className="absolute left-4 right-4 top-14 z-20 rounded-lg border border-destructive/25 bg-card/95 px-3 py-2 text-xs text-destructive shadow-sm">
          {textureError}
        </div>
      )}

      {arError && (
        <div className="absolute left-4 right-4 top-24 z-20 rounded-lg border border-border bg-card/95 px-3 py-2 text-xs text-muted-foreground shadow-sm">
          {arError}
        </div>
      )}

      <canvas
        ref={canvasRef}
        aria-label="MIRAI Phone 3D Preview"
        className="absolute inset-0 z-[1] h-full w-full"
      />

      <model-viewer
        key={modelViewerSrc}
        ref={viewerRef}
        src={modelViewerSrc}
        ios-src={modelViewerIosSrc}
        alt="MIRAI Phone Case 3D Preview"
        camera-controls
        auto-rotate
        auto-rotate-delay={0}
        rotation-per-second="30deg"
        shadow-intensity="1"
        shadow-softness="0.5"
        exposure="0.85"
        environment-image="neutral"
        camera-orbit="0deg 75deg 105%"
        field-of-view="30deg"
        bounds="tight"
        interaction-prompt="auto"
        ar
        ar-modes="webxr scene-viewer quick-look"
        loading="eager"
        style={
          {
            width: "100%",
            height: "100%",
            display: "block",
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
            outline: "none",
            backgroundColor: "transparent",
            "--poster-color": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          slot="progress-bar"
          className="absolute bottom-4 left-1/2 -translate-x-1/2"
        >
          <div className="h-1 w-32 overflow-hidden rounded-full border border-border bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
      </model-viewer>

      <button
        type="button"
        onClick={handleOpenAr}
        disabled={!canOpenDesignedAr}
        className="absolute bottom-4 right-4 z-20 inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-card/95 px-3 text-xs font-semibold text-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Smartphone className="h-3.5 w-3.5 text-primary" />
        {isExportingAr
          ? "Đang tạo AR"
          : canOpenDesignedAr
            ? "Xem AR"
            : "AR cần design"}
      </button>

      {shouldShowCaseSkin && template && (
        <CaseSkinOverlay
          template={template}
          textureUrl={overlayTextureUrl}
          caseColor={caseColor}
        />
      )}
    </div>
  );
}
