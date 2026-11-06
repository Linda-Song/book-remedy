"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
  title: string;
  right?: ReactNode; // small text before the arrow, e.g. the prescription number
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
};

export function CollapsibleCard({
  title,
  right,
  defaultOpen = true,
  className = "",
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className={`rounded-2xl border border-border-light ${className}`}
    >
      {/* The bar covers the card's 1px outline, so it is exactly as wide as the card */}
      <summary
        className={`-mx-px -mt-px flex cursor-pointer select-none list-none items-center justify-between bg-green px-6 py-2 text-xs font-extrabold tracking-[0.08em] text-white hover:brightness-95 [&::-webkit-details-marker]:hidden ${
          open ? "rounded-t-2xl" : "-mb-px rounded-2xl"
        }`}
      >
        <span>{title}</span>
        <span className="flex items-center gap-3">
          {right && (
            <span className="font-semibold tracking-normal opacity-80">
              {right}
            </span>
          )}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </summary>
      {children}
    </details>
  );
}
