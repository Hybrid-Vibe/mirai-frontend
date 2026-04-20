import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-white hover:bg-destructive/80",
        outline: "text-foreground",
        brand:
          "border-[rgba(0,102,255,0.4)] bg-[rgba(0,102,255,0.15)] text-[#3385FF] hover:bg-[rgba(0,102,255,0.25)]",
        cyan:
          "border-[rgba(0,212,255,0.4)] bg-[rgba(0,212,255,0.15)] text-[#00D4FF] hover:bg-[rgba(0,212,255,0.25)]",
        hot:
          "border-transparent bg-gradient-to-r from-[#FF6B35] to-[#FF3D00] text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
