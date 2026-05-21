import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * StudentPortal mark — graduation cap glyph in a rounded indigo square,
 * paired with the wordmark. The glyph is a clean SVG so it works in both
 * the header and as the basis for the favicon.
 */
export function LogoMark({
  size = 40,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm shadow-brand-200/60",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        width={Math.round(size * 0.6)}
        height={Math.round(size * 0.6)}
      >
        <path d="M22 10 12 5 2 10l10 5 10-5Z" />
        <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
      </svg>
    </span>
  );
}

export function Logo({
  size = "md",
  className,
  showWordmark = true,
  sublabel = "Academic Portal",
  /**
   * Destination when the logo is clicked. Defaults to the landing page.
   * Pass `null` to render as a non-clickable element (e.g. inside another link).
   */
  href = "/",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
  showWordmark?: boolean;
  sublabel?: string;
  href?: string | null;
}) {
  const dot = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const title =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";

  const content = (
    <>
      <LogoMark size={dot} />
      {showWordmark && (
        <span className="flex flex-col leading-tight">
          <span className={cn("font-semibold text-ink-900 tracking-tight", title)}>
            StudentPortal
          </span>
          {sublabel && (
            <span className="text-[11px] text-ink-500 uppercase tracking-wider font-medium">
              {sublabel}
            </span>
          )}
        </span>
      )}
    </>
  );

  const baseClasses = cn("flex items-center gap-2.5", className);

  if (href) {
    return (
      <Link
        href={href}
        aria-label="StudentPortal — go to home"
        className={cn(
          baseClasses,
          "rounded-lg transition-opacity hover:opacity-85 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2"
        )}
      >
        {content}
      </Link>
    );
  }

  return <div className={baseClasses}>{content}</div>;
}
