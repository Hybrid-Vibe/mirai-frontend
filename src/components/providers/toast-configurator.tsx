"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Regular expression to strip emojis from the toast messages
const cleanMessage = (msg: unknown): unknown => {
  if (typeof msg === "string") {
    return msg
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}\u{2B50}\u{2B55}\u{23F0}\u{23F3}\u{231A}\u{231B}\u{25AA}\u{25AB}\u{25FB}-\u{25FE}\u{2B1B}\u{2B1C}\u{1F004}\u{1F0CF}\u{2702}\u{2705}\u{2708}\u{2709}\u{270A}-\u{270F}\u{2712}\u{2714}\u{2716}\u{271D}\u{2721}\u{2728}\u{2733}\u{2734}\u{2744}\u{2747}\u{274C}\u{274E}\u{2753}-\u{2757}\u{2763}\u{2764}\u{2795}-\u{2797}\u{27A1}\u{27B0}\u{27BF}\u{2934}\u{2935}\u{2B05}-\u{2B07}\u{2194}-\u{2199}\u{25C0}\u{25B6}\u{25FD}\u{25FE}\u{25FC}\u{25FB}]/gu,
        "",
      )
      .replace(/\s+/g, " ")
      .trim();
  }
  return msg;
};

let configured = false;

export function ToastConfigurator() {
  useEffect(() => {
    if (configured || typeof window === "undefined") return;

    try {
      const originalSuccess = toast.success;
      toast.success = (message, data) => {
        return originalSuccess(cleanMessage(message) as React.ReactNode, data);
      };

      const originalError = toast.error;
      toast.error = (message, data) => {
        return originalError(cleanMessage(message) as React.ReactNode, data);
      };

      const originalInfo = toast.info;
      toast.info = (message, data) => {
        return originalInfo(cleanMessage(message) as React.ReactNode, data);
      };

      const originalWarning = toast.warning;
      toast.warning = (message, data) => {
        return originalWarning(cleanMessage(message) as React.ReactNode, data);
      };

      const originalLoading = toast.loading;
      toast.loading = (message, data) => {
        return originalLoading(cleanMessage(message) as React.ReactNode, data);
      };

      const originalMessage = toast.message;
      toast.message = (message, data) => {
        return originalMessage(cleanMessage(message) as React.ReactNode, data);
      };

      const originalPromise = toast.promise;
      toast.promise = (promise, options) => {
        if (options) {
          if (typeof options.loading === "string") {
            options.loading = cleanMessage(options.loading) as React.ReactNode;
          }
          if (typeof options.success === "string") {
            options.success = cleanMessage(options.success) as
              | string
              | React.ReactNode
              | ((data: unknown) => React.ReactNode);
          } else if (typeof options.success === "function") {
            const originalSuccessFn = options.success;
            options.success = (res: unknown) =>
              cleanMessage(
                (originalSuccessFn as (data: unknown) => unknown)(res),
              ) as React.ReactNode;
          }
          if (typeof options.error === "string") {
            options.error = cleanMessage(options.error) as
              | string
              | React.ReactNode
              | ((data: unknown) => React.ReactNode);
          } else if (typeof options.error === "function") {
            const originalErrorFn = options.error;
            options.error = (err: unknown) =>
              cleanMessage(
                (originalErrorFn as (data: unknown) => unknown)(err),
              ) as React.ReactNode;
          }
        }
        return originalPromise(promise, options);
      };

      configured = true;
      console.log(
        "[ToastConfigurator] Sonner toast global monkey-patch applied successfully.",
      );
    } catch (e) {
      console.error("[ToastConfigurator] Failed to patch Sonner toast:", e);
    }
  }, []);

  return null;
}
