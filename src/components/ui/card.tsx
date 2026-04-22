import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const cardVariants = cva(
  "group/card flex flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-all",
  {
    variants: {
      variant: {
        default: "shadow-none",
        elevated: "shadow-(--mirai-shadow-sm)",
        interactive:
          "cursor-pointer shadow-(--mirai-shadow-sm) hover:-translate-y-0.5 hover:shadow-(--mirai-shadow-md) focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
      },
      padding: {
        none: "gap-0 py-0",
        sm: "gap-3 py-3",
        md: "gap-4 py-4",
        lg: "gap-5 py-5",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  },
);

type LegacySize = "default" | "sm";

interface CardProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof cardVariants> {
  size?: LegacySize;
}

function Card({
  className,
  size,
  variant,
  padding,
  ...props
}: CardProps) {
  const resolvedPadding = padding ?? (size === "sm" ? "sm" : "md");

  return (
    <div
      data-slot="card"
      data-size={size ?? "default"}
      data-padding={resolvedPadding}
      data-variant={variant ?? "default"}
      className={cn(
        cardVariants({ variant, padding: resolvedPadding }),
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-4 group-data-[padding=none]/card:px-0 group-data-[padding=none]/card:[.border-b]:pb-0 group-data-[padding=sm]/card:px-3 group-data-[padding=sm]/card:[.border-b]:pb-3 group-data-[padding=lg]/card:px-5 group-data-[padding=lg]/card:[.border-b]:pb-5",
        className,
      )}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "type-body-md font-semibold leading-snug group-data-[padding=sm]/card:type-body-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("type-body-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-4 group-data-[padding=none]/card:px-0 group-data-[padding=sm]/card:px-3 group-data-[padding=lg]/card:px-5",
        className,
      )}
      {...props}
    />
  );
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl border-t bg-muted/50 p-4 group-data-[padding=none]/card:p-0 group-data-[padding=sm]/card:p-3 group-data-[padding=lg]/card:p-5",
        className,
      )}
      {...props}
    />
  );
}

export {
  Card,
  cardVariants,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
