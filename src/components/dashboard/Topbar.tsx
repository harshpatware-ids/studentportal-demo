"use client";

import { Bell, Mail, Moon, Search } from "lucide-react";
import { useUser } from "@/store/user";
import { UserAvatar } from "@/components/UserAvatar";

export function Topbar({ title }: { title: string }) {
  const profile = useUser((s) => s.profile);

  return (
    <header className="h-16 border-b border-ink-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
      </div>
      <div className="flex items-center gap-1.5">
        <button className="hidden md:inline-flex items-center gap-2 rounded-lg border border-ink-200 px-3 h-9 text-xs text-ink-500 hover:bg-ink-50 transition-colors mr-2">
          <Search className="h-3.5 w-3.5" />
          <span>Search…</span>
          <span className="ml-2 rounded border border-ink-200 bg-ink-50 px-1 text-[10px] font-mono">⌘K</span>
        </button>
        <IconBtn aria-label="Notifications"><Bell className="h-4 w-4" /></IconBtn>
        <IconBtn aria-label="Messages"><Mail className="h-4 w-4" /></IconBtn>
        <IconBtn aria-label="Theme"><Moon className="h-4 w-4" /></IconBtn>
        <UserAvatar
          size={36}
          name={profile?.full_name || "Student"}
          className="ml-2 ring-2 ring-white shadow-sm"
        />
      </div>
    </header>
  );
}

function IconBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 transition-colors"
    />
  );
}
