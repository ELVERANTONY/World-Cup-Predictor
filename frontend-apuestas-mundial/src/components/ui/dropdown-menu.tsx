import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (v: boolean) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("Dropdown sub-components must be used within DropdownMenu");
  return ctx;
}

interface DropdownMenuProps {
  children: ReactNode;
}

export function DropdownMenu({ children }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={ref} className="relative inline-block">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

interface DropdownTriggerProps {
  children: ReactNode;
  className?: string;
  asChild?: boolean;
}

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ children, className, asChild = false }, ref) => {
    const { setOpen } = useDropdown();

    if (asChild) {
      return (
        <div className={cn("inline-flex", className)} onClick={() => setOpen(true)}>
          {children}
        </div>
      );
    }

    return (
      <button
        ref={ref}
        onClick={() => setOpen(true)}
        className={cn("inline-flex", className)}
      >
        {children}
      </button>
    );
  },
);

DropdownTrigger.displayName = "DropdownTrigger";

interface DropdownContentProps {
  className?: string;
  align?: "start" | "end";
  children?: ReactNode;
}

export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, align = "start", children }, ref) => {
    const { open, setOpen } = useDropdown();

    return (
      <AnimatePresence>
        {open && (
          <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => setOpen(false)}
            className={cn(
              "absolute top-full z-50 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-1 shadow-lg",
              align === "end" ? "right-0" : "left-0",
              className,
            )}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    );
  },
);

DropdownContent.displayName = "DropdownContent";

interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
}

export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ icon, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="menuitem"
        className={cn(
          "flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]",
          className,
        )}
        {...props}
      >
        {icon && (
          <span className="text-[var(--color-text-secondary)]">{icon}</span>
        )}
        {children}
      </div>
    );
  },
);

DropdownItem.displayName = "DropdownItem";

interface DropdownSeparatorProps extends HTMLAttributes<HTMLDivElement> {}

export const DropdownSeparator = forwardRef<HTMLDivElement, DropdownSeparatorProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("my-1 border-t border-[var(--color-border)]", className)}
        {...props}
      />
    );
  },
);

DropdownSeparator.displayName = "DropdownSeparator";
