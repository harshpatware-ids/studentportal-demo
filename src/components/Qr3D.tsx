"use client";

import * as React from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { cn } from "@/lib/utils";

/**
 * Background-less, 3D-tilting QR.
 *
 *  - Renders a real scannable QR (qrcode.react) with NO surrounding card.
 *  - Soft conic-gradient glow halo behind it (decorative, sits beneath the cells).
 *  - Subtle continuous float + idle rotation via Framer Motion.
 *  - Mouse-follow parallax: cursor position over the QR drives rotateX/rotateY
 *    on a perspective transform — feels like a real 3D object you can nudge.
 *  - On click, kicks a quick "tap" spin so it feels interactive even without a
 *    mouse (tablets / demo presentations).
 */
export function Qr3D({
  value,
  size = 240,
  label,
  refreshIn,
  className,
}: {
  value: string;
  size?: number;
  label?: string;
  refreshIn?: number;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [tapKey, setTapKey] = React.useState(0);

  // Raw mouse-driven motion values (-0.5 → 0.5 across the QR)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring-smoothed tilts (degrees). Damping keeps it from feeling jittery.
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [16, -16]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), {
    stiffness: 200,
    damping: 22,
  });

  // Glare position based on cursor
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex flex-col items-center select-none",
        className
      )}
      style={{ perspective: 1000 }}
    >
      <div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        onClick={() => setTapKey((k) => k + 1)}
        className="relative cursor-grab active:cursor-grabbing"
        style={{ width: size + 32, height: size + 32 }}
      >
        {/* Conic-gradient halo — sits behind the QR, never touches it */}
        <motion.div
          aria-hidden
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 18, ease: "linear", repeat: Infinity }}
          className="absolute inset-0 rounded-full blur-2xl opacity-60"
          style={{
            background:
              "conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #818cf8)",
          }}
        />

        {/* Soft drop-shadow puddle below */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-0 h-6 rounded-full bg-ink-900/20 blur-xl"
          style={{ width: size * 0.7 }}
        />

        {/* Tilting + floating stage */}
        <motion.div
          key={tapKey}
          initial={{ rotateZ: 0 }}
          animate={{
            y: [0, -10, 0],
            rotateZ: tapKey === 0 ? [-1.5, 1.5, -1.5] : [0, 360],
          }}
          transition={{
            y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
            rotateZ:
              tapKey === 0
                ? { duration: 7, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.9, ease: "easeOut" },
          }}
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
              transformOrigin: "center",
            }}
            className="relative"
          >
            {/* The QR itself — only padding, no border, no card outline */}
            <div
              className="relative"
              style={{
                width: size,
                height: size,
                transformStyle: "preserve-3d",
              }}
            >
              {/* Tiny floating frame corners (depth cues) */}
              <Corner pos="tl" />
              <Corner pos="tr" />
              <Corner pos="bl" />
              <Corner pos="br" />

              {/* QR cells, slightly raised in z-space */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ transform: "translateZ(24px)" }}
              >
                {value ? (
                  <QRCodeSVG
                    value={value}
                    size={size}
                    bgColor="transparent"
                    fgColor="#0f172a"
                    level="M"
                    includeMargin={false}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full w-full text-xs text-ink-400">
                    Preparing…
                  </div>
                )}
              </div>

              {/* Subtle glare that tracks the cursor */}
              <motion.div
                aria-hidden
                className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-overlay"
                style={{
                  transform: "translateZ(40px)",
                  background: useTransform(
                    [glareX, glareY],
                    ([gx, gy]) =>
                      `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.55), transparent 45%)`
                  ),
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {label && (
        <div className="mt-3 flex items-center gap-2 rounded-full bg-success-50 px-3 py-1.5">
          <span className="h-2 w-2 rounded-full bg-success-500 animate-pulse" />
          <span className="text-xs font-medium text-success-600">{label}</span>
        </div>
      )}

      {refreshIn != null && (
        <p className="mt-2 text-xs text-ink-500 flex items-center gap-1.5">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          QR refreshes in{" "}
          <span className="font-mono text-ink-800">
            {String(Math.floor(refreshIn / 60)).padStart(2, "0")}:
            {String(refreshIn % 60).padStart(2, "0")}
          </span>
        </p>
      )}
    </div>
  );
}

function Corner({ pos }: { pos: "tl" | "tr" | "bl" | "br" }) {
  const base = "absolute h-5 w-5 border-brand-500/70";
  const map = {
    tl: "top-0 left-0 border-t-2 border-l-2 rounded-tl-md",
    tr: "top-0 right-0 border-t-2 border-r-2 rounded-tr-md",
    bl: "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md",
    br: "bottom-0 right-0 border-b-2 border-r-2 rounded-br-md",
  } as const;
  return (
    <span
      aria-hidden
      className={cn(base, map[pos])}
      style={{ transform: "translateZ(48px)" }}
    />
  );
}
