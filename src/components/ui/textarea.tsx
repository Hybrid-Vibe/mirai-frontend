import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const textareaVariants = cva(
  "w-full rounded-lg border bg-card text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-80",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        error:
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/35",
      },
      size: {
        sm: "min-h-20 px-3 py-2 type-body-sm",
        md: "min-h-24 px-3.5 py-2.5 type-body-sm",
        lg: "min-h-32 px-4 py-3 type-body-md",

        /* Legacy alias */
        default: "min-h-24 px-3.5 py-2.5 type-body-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface TextareaProps
  extends
    React.ComponentProps<"textarea">,
    VariantProps<typeof textareaVariants> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, variant, size, "aria-invalid": ariaInvalid, ...props },
    ref,
  ) => {
    const resolvedVariant = ariaInvalid ? "error" : variant;

    return (
      <textarea
        ref={ref}
        data-slot="textarea"
        data-variant={resolvedVariant ?? "default"}
        className={cn(
          textareaVariants({ variant: resolvedVariant, size }),
          className,
        )}
        aria-invalid={ariaInvalid}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
