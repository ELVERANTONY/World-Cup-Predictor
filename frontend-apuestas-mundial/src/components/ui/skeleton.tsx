import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = "text",
      width,
      height,
      className,
      ...props
    },
    ref,
  ) => {
    const variantStyles = {
      text: "h-4 w-full rounded-md",
      circular: "rounded-full",
      rectangular: "rounded-xl",
      card: "h-48 w-full rounded-2xl",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "skeleton",
          variantStyles[variant],
          className,
        )}
        style={{ width, height }}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";
