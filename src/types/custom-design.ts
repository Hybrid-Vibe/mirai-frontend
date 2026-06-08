export type CustomDesignMode = "self" | "ai";

export interface CustomDesignMetadata {
  phoneModelId: string;
  phoneModelLabel: string;
  caseColor?: string;
  templateVersion?: string;
  caseShellVersion?: string;
  designImageUrl?: string;
  arGlbUrl?: string;
  arUsdzUrl?: string;
  mode: CustomDesignMode;
}
