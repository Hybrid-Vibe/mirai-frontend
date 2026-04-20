"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/stores/theme-store";

export function useTheme() {
  const theme = useThemeStore((state) => state.theme);
  const initialized = useThemeStore((state) => state.initialized);
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  useEffect(() => {
    if (!initialized) {
      initializeTheme();
    }
  }, [initialized, initializeTheme]);

  return {
    theme,
    initialized,
    setTheme,
    toggleTheme,
  };
}
