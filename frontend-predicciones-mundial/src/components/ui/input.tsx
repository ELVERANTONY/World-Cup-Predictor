import {
  forwardRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  error?: string;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      iconLeft,
      iconRight,
      className,
      id,
      placeholder,
      onFocus,
      onBlur,
      ...props
    },
    ref,
  ) => {
    const [focused, setFocused] = useState(false);
    const hasValue =
      props.value !== undefined && props.value !== null && props.value !== "";
    const showFloating = focused || hasValue;

    return (
      <div className="relative w-full">
        {label && (
          <motion.label
            htmlFor={id}
            animate={{
              y: showFloating ? -28 : 0,
              scale: showFloating ? 0.85 : 1,
              color: error
                ? "var(--color-danger)"
                : focused
                  ? "var(--color-secondary)"
                  : "var(--color-text-secondary)",
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "pointer-events-none absolute left-0 top-2 origin-left text-sm text-[var(--color-text-secondary)]",
              iconLeft && "left-10",
            )}
          >
            {label}
          </motion.label>
        )}
        <div className="relative">
          {iconLeft && (
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
              {iconLeft}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            placeholder={placeholder || (label ? " " : placeholder)}
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            className={cn(
              "w-full rounded-xl border bg-[var(--color-surface)] px-4 py-2.5 text-sm text-[var(--color-text)] transition-all duration-300 placeholder:text-[var(--color-text-secondary)]/50 focus:outline-none",
              iconLeft && "pl-10",
              iconRight && "pr-10",
              error
                ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-2 focus:ring-[var(--color-danger)]/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                : "border-[var(--color-border)] focus:border-worldcup-500 focus:ring-2 focus:ring-worldcup-500/30 focus:shadow-[0_0_20px_rgba(14,165,233,0.3)]",
              className,
            )}
            {...props}
          />
          {iconRight && (
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1 text-xs text-[var(--color-danger)]"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
