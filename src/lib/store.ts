import { create } from "zustand";
import type { PhoneCaseTemplate } from "@/constants/phone-templates";
import type { DesignStyle } from "@/types/ai";

export interface CanvasElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: string;
  color?: string;
  imageUrl?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role?: string;
}

interface DesignState {
  phoneModel: string;
  prompt: string;
  designStyle: DesignStyle;
  generatedImages: string[];
  selectedImage: string | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
  canvasDataUrl: string | null;
  user: User | null;
  isAuthLoading: boolean;

  // --- Template & Canvas 2D state ---
  selectedTemplate: PhoneCaseTemplate | null;
  showGuides: boolean;
  showCameraCutout: boolean;
  backgroundImage: string | null;

  setPhoneModel: (model: string) => void;
  setPrompt: (prompt: string) => void;
  setDesignStyle: (style: DesignStyle) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string | null) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  setCanvasDataUrl: (url: string | null) => void;
  setUser: (user: User | null) => void;
  setAuthLoading: (loading: boolean) => void;

  // --- Template & Canvas 2D actions ---
  setSelectedTemplate: (template: PhoneCaseTemplate | null) => void;
  setShowGuides: (show: boolean) => void;
  setShowCameraCutout: (show: boolean) => void;
  setBackgroundImage: (url: string | null) => void;

  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  phoneModel: "",
  prompt: "",
  designStyle: "pop-art-floral",
  generatedImages: [],
  selectedImage: null,
  elements: [],
  selectedElementId: null,
  canvasDataUrl: null,
  user: null,
  isAuthLoading: true,

  // --- Template & Canvas 2D defaults ---
  selectedTemplate: null,
  showGuides: true,
  showCameraCutout: true,
  backgroundImage: null,

  setPhoneModel: (phoneModel) => set({ phoneModel }),
  setPrompt: (prompt) => set({ prompt }),
  setDesignStyle: (designStyle) => set({ designStyle }),
  setGeneratedImages: (generatedImages) => set({ generatedImages }),
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  setElements: (elements) => set({ elements }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  updateElement: (id, updates) =>
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el,
      ),
    })),
  removeElement: (id) =>
    set((state) => ({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId:
        state.selectedElementId === id ? null : state.selectedElementId,
    })),
  setSelectedElementId: (selectedElementId) => set({ selectedElementId }),
  setCanvasDataUrl: (canvasDataUrl) => set({ canvasDataUrl }),
  setUser: (user) => set({ user }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),

  // --- Template & Canvas 2D actions ---
  setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
  setShowGuides: (showGuides) => set({ showGuides }),
  setShowCameraCutout: (showCameraCutout) => set({ showCameraCutout }),
  setBackgroundImage: (backgroundImage) => set({ backgroundImage }),

  reset: () =>
    set({
      phoneModel: "",
      prompt: "",
      designStyle: "pop-art-floral",
      generatedImages: [],
      selectedImage: null,
      elements: [],
      selectedElementId: null,
      canvasDataUrl: null,
      selectedTemplate: null,
      showGuides: true,
      showCameraCutout: true,
      backgroundImage: null,
    }),
}));
