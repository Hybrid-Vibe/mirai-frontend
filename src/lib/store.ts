import { create } from "zustand";

export interface CanvasElement {
  id: string;
  type: "text" | "image";
  x: number;
  y: number;
  text?: string;
  fontSize?: number;
  color?: string;
  imageUrl?: string;
}

interface DesignState {
  phoneModel: string;
  prompt: string;
  generatedImages: string[];
  selectedImage: string | null;
  elements: CanvasElement[];

  setPhoneModel: (model: string) => void;
  setPrompt: (prompt: string) => void;
  setGeneratedImages: (images: string[]) => void;
  setSelectedImage: (image: string | null) => void;
  setElements: (elements: CanvasElement[]) => void;
  addElement: (element: CanvasElement) => void;
  reset: () => void;
}

export const useDesignStore = create<DesignState>((set) => ({
  phoneModel: "",
  prompt: "",
  generatedImages: [],
  selectedImage: null,
  elements: [],

  setPhoneModel: (phoneModel) => set({ phoneModel }),
  setPrompt: (prompt) => set({ prompt }),
  setGeneratedImages: (generatedImages) => set({ generatedImages }),
  setSelectedImage: (selectedImage) => set({ selectedImage }),
  setElements: (elements) => set({ elements }),
  addElement: (element) =>
    set((state) => ({ elements: [...state.elements, element] })),
  reset: () =>
    set({
      phoneModel: "",
      prompt: "",
      generatedImages: [],
      selectedImage: null,
      elements: [],
    }),
}));
