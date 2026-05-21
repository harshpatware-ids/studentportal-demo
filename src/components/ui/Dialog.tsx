"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  children,
  /**
   * When true (default), the dialog can be dismissed via the backdrop click
   * or the Escape key. Set to false for flows where the dialog should only
   * close via an explicit action (e.g. the X button or a primary CTA).
   */
  dismissible = true,
  /** Show the floating close (X) button in the top-right corner. */
  showClose = true,
  /** Width of the dialog. Use `lg` for credential / template previews. */
  size = "md",
}: {
  open: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  dismissible?: boolean;
  showClose?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const widthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  }[size];
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (dismissible && e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, dismissible]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop — clickable only when `dismissible`, otherwise a non-interactive scrim */}
      {dismissible ? (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm transition-opacity"
          style={{ animation: "sv-fade 160ms ease-out both" }}
        />
      ) : (
        <div
          aria-hidden
          className="absolute inset-0 bg-ink-900/40 backdrop-blur-sm"
          style={{ animation: "sv-fade 160ms ease-out both" }}
        />
      )}

      <div
        className={cn(
          "relative w-full rounded-xl-card bg-white shadow-xl",
          widthClass,
          "transition-transform"
        )}
        style={{ animation: "sv-pop 180ms ease-out both" }}
      >
        {showClose && (
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-8 w-8 rounded-full text-ink-500 hover:text-ink-900 hover:bg-ink-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
}
