import * as React from "react";
import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "w-full min-w-0 rounded-lg border bg-card text-foreground placeholder:text-muted-foreground transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground disabled:opacity-80",
  {
    variants: {
      variant: {
        default: "border-input focus-visible:border-ring",
        error:
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/35",
      },
      size: {
        sm: "h-9 px-3 type-body-sm",
        md: "h-10 px-3.5 type-body-sm",
        lg: "h-12 px-4 type-body-md",

        /* Legacy alias */
        default: "h-10 px-3.5 type-body-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

export interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  htmlSize?: number;
}

function Input({
  className,
  type,
  variant,
  size,
  htmlSize,
  "aria-invalid": ariaInvalid,
  ...props
}: InputProps) {
  const resolvedVariant = ariaInvalid ? "error" : variant;

  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-variant={resolvedVariant ?? "default"}
      className={cn(
        inputVariants({ variant: resolvedVariant, size }),
        className,
      )}
      size={htmlSize}
      aria-invalid={ariaInvalid}
      {...props}
    />
  );
}

export { Input, inputVariants };
