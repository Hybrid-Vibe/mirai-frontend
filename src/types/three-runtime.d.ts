/* eslint-disable @typescript-eslint/no-explicit-any */

declare module "three" {
  export const DoubleSide: any;
  export const ClampToEdgeWrapping: any;
  export const RepeatWrapping: any;
  export const SRGBColorSpace: any;

  export class WebGLRenderer {
    constructor(parameters: {
      alpha?: boolean;
      antialias?: boolean;
      canvas?: HTMLCanvasElement;
    });
    domElement: HTMLCanvasElement;
    outputColorSpace: any;
    setPixelRatio(pixelRatio: number): void;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    render(scene: Scene, camera: PerspectiveCamera): void;
    dispose(): void;
  }

  export class Scene {
    add(object: any): void;
    traverse(callback: (node: unknown) => void): void;
  }

  export class PerspectiveCamera {
    constructor(fov: number, aspect: number, near: number, far: number);
    aspect: number;
    far: number;
    fov: number;
    near: number;
    position: Vector3;
    up: Vector3;
    lookAt(x: number, y: number, z: number): void;
    updateProjectionMatrix(): void;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    sub(vector: Vector3): this;
  }

  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
  }

  export class Box3 {
    setFromObject(object: any): this;
    getCenter(target: Vector3): Vector3;
    getSize(target: Vector3): Vector3;
  }

  export class HemisphereLight {
    constructor(skyColor?: any, groundColor?: any, intensity?: number);
  }

  export class DirectionalLight {
    constructor(color?: any, intensity?: number);
    position: Vector3;
  }

  export class PlaneGeometry {
    constructor(width?: number, height?: number);
    dispose(): void;
  }

  export class Path {
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): this;
    closePath(): this;
  }

  export class Shape extends Path {
    holes: Path[];
  }

  export class ExtrudeGeometry {
    constructor(
      shapes?: Shape | Shape[],
      options?: {
        bevelEnabled?: boolean;
        bevelSegments?: number;
        bevelSize?: number;
        bevelThickness?: number;
        curveSegments?: number;
        depth?: number;
        steps?: number;
        UVGenerator?: any;
      },
    );
    center(): this;
    computeVertexNormals(): void;
    dispose(): void;
  }

  export class MeshBasicMaterial {
    constructor(parameters?: {
      color?: any;
      depthWrite?: boolean;
      map?: any;
      side?: any;
      toneMapped?: boolean;
      transparent?: boolean;
    });
    map: any;
    needsUpdate: boolean;
    dispose(): void;
  }

  export class MeshStandardMaterial {
    constructor(parameters?: {
      color?: any;
      emissive?: any;
      emissiveIntensity?: number;
      map?: any;
      metalness?: number;
      roughness?: number;
      side?: any;
      transparent?: boolean;
    });
    color: {
      set(color: string | number): void;
    };
    emissive?: {
      set(color: string | number): void;
    };
    emissiveIntensity?: number;
    map: any;
    needsUpdate: boolean;
    dispose(): void;
  }

  export class Mesh {
    constructor(geometry?: any, material?: any);
    position: Vector3;
    renderOrder: number;
    rotation: {
      x: number;
      y: number;
      z: number;
    };
    visible: boolean;
  }

  export class TextureLoader {
    loadAsync(url: string): Promise<{
      center: Vector2;
      colorSpace: any;
      dispose(): void;
      flipY: boolean;
      needsUpdate: boolean;
      offset: Vector2;
      repeat: Vector2;
      rotation: number;
      wrapS: any;
      wrapT: any;
    }>;
  }
}

declare module "three/examples/jsm/loaders/GLTFLoader.js" {
  export class GLTFLoader {
    loadAsync(url: string): Promise<{
      scene: {
        position: import("three").Vector3;
        rotation: {
          x: number;
          y: number;
          z: number;
        };
        traverse(callback: (node: unknown) => void): void;
        updateMatrixWorld(force?: boolean): void;
      };
    }>;
  }
}

declare module "three/examples/jsm/controls/OrbitControls.js" {
  export class OrbitControls {
    constructor(
      camera: import("three").PerspectiveCamera,
      domElement: HTMLElement,
    );
    autoRotate: boolean;
    autoRotateSpeed: number;
    enableDamping: boolean;
    enablePan: boolean;
    target: import("three").Vector3;
    dispose(): void;
    update(): void;
  }
}

declare module "three/examples/jsm/exporters/GLTFExporter.js" {
  export class GLTFExporter {
    parse(
      input: any,
      onDone: (result: ArrayBuffer | Record<string, unknown>) => void,
      onError?: (error: unknown) => void,
      options?: {
        binary?: boolean;
        onlyVisible?: boolean;
      },
    ): void;
  }
}

declare module "three/examples/jsm/exporters/USDZExporter.js" {
  export class USDZExporter {
    parse(
      scene: any,
      onDone: (result: ArrayBuffer) => void,
      onError?: (error: unknown) => void,
      options?: {
        maxTextureSize?: number;
        onlyVisible?: boolean;
        quickLookCompatible?: boolean;
      },
    ): void;
  }
}
