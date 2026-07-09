import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variantStyles = {
  primary:
    "bg-[var(--color-primary)] text-white hover:opacity-90 shadow-md shadow-black/10",
  secondary:
    "bg-[var(--color-secondary)] text-white hover:opacity-90 shadow-md shadow-emerald-500/20",
  outline:
    "border-2 border-[var(--color-border)] bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]",
  ghost:
    "bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-alt)]",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 shadow-md shadow-red-500/20",
  gold:
    "bg-[var(--color-accent)] text-[var(--color-primary)] hover:opacity-90 shadow-md shadow-amber-500/20 font-semibold",
  glow:
    "bg-gradient-to-r from-worldcup-600 via-worldcup-500 to-worldcup-600 text-white shadow-[0_0_15px_rgba(14,165,233,0.5)] hover:shadow-[0_0_25px_rgba(14,165,233,0.7)] bg-[length:200%_auto] hover:bg-right font-bold transition-all duration-500",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-6 text-base gap-2.5",
  xl: "h-14 px-8 text-lg gap-3",
} as const;

type Variant = keyof typeof variantStyles;
type Size = keyof typeof sizeStyles;

interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "size" | "type" | "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  type?: "button" | "submit" | "reset";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      iconLeft,
      iconRight,
      className,
      children,
      disabled,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        whileHover={disabled || loading ? undefined : { scale: 1.02 }}
        whileTap={disabled || loading ? undefined : { scale: 0.98 }}
        className={cn(
          "relative inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-secondary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          iconLeft
        )}
        {children}
        {!loading && iconRight}
      </motion.button>
    );
  },
);

Button.displayName = "Button";
