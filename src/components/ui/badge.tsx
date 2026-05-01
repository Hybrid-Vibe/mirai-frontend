import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 type-caption font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        primary:
          "border-transparent bg-primary text-foreground hover:bg-(--mirai-state-primary-hover)",
        accent:
          "border-transparent bg-accent text-background hover:bg-(--mirai-state-accent-hover)",
        muted: "border-transparent bg-secondary text-foreground hover:bg-muted",
        danger:
          "border-transparent bg-destructive text-background hover:bg-destructive/90",
        success:
          "border-transparent bg-(--mirai-sem-success) text-(--mirai-sem-text)",
        warning:
          "border-transparent bg-(--mirai-sem-warning) text-(--mirai-sem-text)",
        outline: "border-border bg-transparent text-foreground",

        /* Legacy aliases kept to avoid regressions in current screens. */
        default:
          "border-transparent bg-primary text-foreground hover:bg-(--mirai-state-primary-hover)",
        secondary:
          "border-transparent bg-secondary text-foreground hover:bg-muted",
        destructive:
          "border-transparent bg-destructive text-background hover:bg-destructive/90",
        brand:
          "border-(--mirai-sem-accent)/35 bg-(--mirai-sem-accent)/12 text-(--mirai-sem-accent) hover:bg-(--mirai-sem-accent)/18",
        cyan: "border-(--mirai-sem-primary)/45 bg-(--mirai-sem-primary)/14 text-(--mirai-sem-primary) hover:bg-(--mirai-sem-primary)/20",
        hot: "border-transparent bg-(--mirai-sem-warning) text-(--mirai-sem-text) hover:brightness-95",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
