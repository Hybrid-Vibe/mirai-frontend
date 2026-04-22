import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-foreground ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-foreground hover:bg-(--mirai-state-primary-hover) active:bg-(--mirai-state-active)",
        secondary:
          "bg-secondary text-foreground hover:bg-muted active:bg-secondary/80",
        outline:
          "border border-border bg-card text-foreground hover:bg-secondary active:bg-secondary/90",
        ghost: "bg-transparent text-foreground hover:bg-secondary active:bg-secondary/90",
        danger:
          "bg-destructive text-background hover:bg-destructive/90 active:bg-destructive/80",

        /* Legacy aliases kept to avoid regressions in existing usages. */
        default:
          "bg-primary text-foreground hover:bg-(--mirai-state-primary-hover) active:bg-(--mirai-state-active)",
        destructive:
          "bg-destructive text-background hover:bg-destructive/90 active:bg-destructive/80",
        link: "text-primary underline-offset-4 hover:underline",
        brand:
          "bg-accent text-background hover:bg-(--mirai-state-accent-hover) active:bg-(--mirai-state-active)",
      },
      size: {
        sm: "h-9 rounded-md px-3 type-caption",
        md: "h-10 rounded-lg px-4 type-body-sm",
        lg: "h-12 rounded-lg px-6 type-body-md",

        /* Legacy aliases */
        default: "h-10 rounded-lg px-4 type-body-sm",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 animate-spin"
              aria-hidden="true"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
                fill="none"
                stroke="currentColor"
                strokeOpacity="0.25"
                strokeWidth="3"
              />
              <path
                d="M21 12a9 9 0 0 0-9-9"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              />
            </svg>
            <span>{loadingText ?? children}</span>
          </span>
        ) : (
          children
        )}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
