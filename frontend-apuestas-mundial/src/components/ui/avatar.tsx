import { forwardRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { generateInitials } from "@/utils/formatters";

const sizeStyles = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
} as const;

const indicatorSizes = {
  sm: "h-2 w-2 right-0 bottom-0",
  md: "h-2.5 w-2.5 right-0 bottom-0",
  lg: "h-3 w-3 right-0.5 bottom-0.5",
  xl: "h-3.5 w-3.5 right-0.5 bottom-0.5",
} as const;

type AvatarSize = keyof typeof sizeStyles;

interface AvatarProps extends ImgHTMLAttributes<HTMLImageElement> {
  size?: AvatarSize;
  name?: string;
  online?: boolean;
  ring?: boolean;
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      size = "md",
      name = "",
      src,
      alt,
      online,
      ring = false,
      className,
      ...props
    },
    ref,
  ) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className="relative inline-flex shrink-0">
        {src && !imgError ? (
          <img
            ref={ref}
            src={src}
            alt={alt || name}
            onError={() => setImgError(true)}
            className={cn(
              "rounded-full object-cover",
              sizeStyles[size],
              ring && "ring-2 ring-[var(--color-secondary)] ring-offset-2 ring-offset-[var(--color-surface)]",
              className,
            )}
            {...props}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-full bg-[var(--color-primary)] font-medium text-white",
              sizeStyles[size],
              ring && "ring-2 ring-[var(--color-secondary)] ring-offset-2 ring-offset-[var(--color-surface)]",
              className,
            )}
          >
            {generateInitials(name || "?")}
          </div>
        )}
        {online !== undefined && (
          <span
            className={cn(
              "absolute block rounded-full border-2 border-[var(--color-surface)]",
              indicatorSizes[size],
              online ? "bg-emerald-500" : "bg-[var(--color-text-secondary)]",
            )}
          />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";
