"use client";

import * as React from "react";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

export function QrPanel({
  value,
  refreshIn,
  label,
  pulse = true,
  className,
}: {
  value: string;
  refreshIn?: number;
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  const mm = refreshIn != null ? String(Math.floor(refreshIn / 60)).padStart(2, "0") : "";
  const ss = refreshIn != null ? String(refreshIn % 60).padStart(2, "0") : "";

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative rounded-2xl border-2 border-dashed border-brand-300/70 bg-white p-4 shadow-[0_4px_24px_rgba(79,70,229,0.10)]">
        <div className="absolute -top-1 -left-1 h-6 w-6 rounded-tl-xl border-t-2 border-l-2 border-brand-500" aria-hidden />
        <div className="absolute -top-1 -right-1 h-6 w-6 rounded-tr-xl border-t-2 border-r-2 border-brand-500" aria-hidden />
        <div className="absolute -bottom-1 -left-1 h-6 w-6 rounded-bl-xl border-b-2 border-l-2 border-brand-500" aria-hidden />
        <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-br-xl border-b-2 border-r-2 border-brand-500" aria-hidden />
        {value ? (
          <QRCodeSVG
            value={value}
            size={208}
            bgColor="#ffffff"
            fgColor="#0f172a"
            level="M"
            includeMargin={false}
          />
        ) : (
          <div className="h-[208px] w-[208px] flex items-center justify-center text-sm text-ink-400">
            Preparing…
          </div>
        )}
      </div>

      {label && (
        <div className="flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5">
          <span className={cn("h-2 w-2 rounded-full bg-success-500", pulse && "animate-pulse")} />
          <span className="text-xs font-medium text-success-600">{label}</span>
        </div>
      )}

      {refreshIn != null && (
        <p className="text-xs text-ink-500 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          QR refreshes in <span className="font-mono text-ink-800">{mm}:{ss}</span>
        </p>
      )}
    </div>
  );
}
