import { cn, initials } from "@/lib/utils";

export function UserAvatar({
  name,
  size = 36,
  className,
  ring,
}: {
  name: string;
  size?: number;
  className?: string;
  ring?: string;
}) {
  const seed = encodeURIComponent((name || "Student").toLowerCase().replace(/\W+/g, "-"));
  const fallback = initials(name || "Student");
  return (
    <div
      className={cn(
        "relative rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-brand-600 text-white font-semibold flex items-center justify-center",
        ring,
        className
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      <span aria-hidden className="absolute inset-0 flex items-center justify-center">
        {fallback}
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.pravatar.cc/${Math.max(80, size * 2)}?u=${seed}`}
        alt={name || "Student"}
        className="relative h-full w-full object-cover"
        onError={(e) => {
          // Hide on error so the initials fallback stays visible.
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    </div>
  );
}
