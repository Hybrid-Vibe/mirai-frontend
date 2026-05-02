import { create } from "zustand";

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
}

interface DesignState {
  phoneModel: string;
  prompt: string;
  generatedImages: string[];
  selectedImage: string | null;
  elements: CanvasElement[];
  selectedElementId: string | null;
  canvasDataUrl: string | null;
  user: User | null;

  setPhoneModel: (model: string) => void;
  setPrompt: (prompt: string) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string | null) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  removeElement: (id: string) => void;
  setSelectedElementId: (id: string | null) => void;
  setCanvasDataUrl: (url: string | null) => void;
  setUser: (user: User | null) => void;
  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  phoneModel: "",
  prompt: "",
  generatedImages: [],
  selectedImage: null,
  elements: [],
  selectedElementId: null,
  canvasDataUrl: null,
  user: null,

  setPhoneModel: (phoneModel) => set({ phoneModel }),
  setPrompt: (prompt) => set({ prompt }),
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
  reset: () =>
    set({
      phoneModel: "",
      prompt: "",
      generatedImages: [],
      selectedImage: null,
      elements: [],
      selectedElementId: null,
      canvasDataUrl: null,
    }),
}));
