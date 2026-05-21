"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  CalendarDays,
  Award,
  ClipboardCheck,
  FileText,
  BookOpen,
  UserCircle2,
  type LucideIcon,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { UserAvatar } from "@/components/UserAvatar";
import { useUser } from "@/store/user";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon };

const PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard/timetable", label: "Timetable", icon: CalendarDays },
  { href: "/dashboard/scorecard", label: "Scorecard", icon: Award },
  { href: "/dashboard/attendance", label: "Attendance", icon: ClipboardCheck },
  { href: "/dashboard/assignments", label: "Assignments", icon: FileText },
];

const SECONDARY: NavItem[] = [
  { href: "/dashboard/resources", label: "Resources", icon: BookOpen },
  { href: "/dashboard/account", label: "Account", icon: UserCircle2 },
];

export function Sidebar() {
  const pathname = usePathname();
  const profile = useUser((s) => s.profile);

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-ink-200 bg-white h-screen sticky top-0">
      <div className="px-5 py-5">
        <Logo />
      </div>

      <nav className="flex-1 px-3 pb-3 flex flex-col gap-1">
        {PRIMARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}

        <div className="mt-auto" />

        <div className="border-t border-ink-200 my-3" />
        {SECONDARY.map((item) => (
          <NavLink key={item.href} item={item} active={isActive(pathname, item.href)} />
        ))}
      </nav>

      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 rounded-lg bg-ink-50 px-3 py-2.5">
          <UserAvatar size={32} name={profile?.full_name || "Harsh Patware"} />
          <div className="min-w-0">
            <div className="text-xs font-semibold text-ink-900 truncate">
              {profile?.full_name || "Harsh Patware"}
            </div>
            <div className="text-[10px] text-ink-500 truncate">
              {profile?.department || "Computer Science"}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-brand-50 text-brand-700"
          : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
      )}
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </Link>
  );
}

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}
