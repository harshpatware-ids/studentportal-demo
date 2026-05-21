"use client";

import {
  GraduationCap,
  ClipboardCheck,
  FileText,
  CalendarDays,
  MapPin,
} from "lucide-react";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ScorecardChart } from "@/components/dashboard/ScorecardChart";
import {
  metrics,
  todaysTimetable,
  announcements,
  semesterScorecard,
  type TimetableSlot,
} from "@/data/dummy";
import { useUser } from "@/store/user";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const profile = useUser((s) => s.profile);
  const firstName =
    (profile?.full_name || "Harsh Patware").trim().split(/\s+/)[0] || "Student";

  return (
    <>
      <Topbar title="Dashboard" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink-900">
            {greeting()}, {firstName}
          </h2>
          <p className="mt-1 text-sm text-ink-500">Here&apos;s your week at a glance.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <MetricCard
            label="Current CGPA"
            value={metrics.cgpa.value}
            trend={metrics.cgpa.delta}
            icon={GraduationCap}
          />
          <MetricCard
            label="Attendance"
            value={metrics.attendance.label}
            icon={ClipboardCheck}
            bar={metrics.attendance.value}
          />
          <MetricCard
            label="Pending assignments"
            value={String(metrics.pendingAssignments.value)}
            sub={metrics.pendingAssignments.sub}
            icon={FileText}
          />
          <MetricCard
            label="Classes today"
            value={String(metrics.classesToday.value)}
            sub={metrics.classesToday.sub}
            icon={CalendarDays}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Today&apos;s timetable</CardTitle>
              <a href="/dashboard/timetable" className="text-xs font-medium text-brand-600 hover:underline">
                View full
              </a>
            </CardHeader>
            <CardBody className="pt-0">
              <ul className="divide-y divide-ink-100">
                {todaysTimetable.map((slot) => (
                  <TimetableRow key={slot.time + slot.code} slot={slot} />
                ))}
              </ul>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Announcements</CardTitle>
            </CardHeader>
            <CardBody className="pt-0 space-y-4">
              {announcements.map((a) => (
                <div key={a.from + a.ago} className="flex items-start gap-3">
                  <Avatar tone={a.avatarTone} name={a.from} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-ink-900 truncate">{a.from}</span>
                      <span className="text-[10px] text-ink-400 shrink-0">{a.ago}</span>
                    </div>
                    <p className="text-xs text-ink-600 mt-0.5 leading-relaxed line-clamp-2">{a.body}</p>
                  </div>
                </div>
              ))}
              <button className="mt-1 w-full rounded-lg border border-ink-200 text-xs font-medium text-ink-700 py-2 hover:bg-ink-50 transition">
                View all announcements
              </button>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Semester scorecard</CardTitle>
            <div className="flex items-center gap-4 text-xs">
              <LegendDot color="#4f46e5" label="Your Score" />
              <LegendDot color="#cbd5e1" label="Class Avg" />
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <ScorecardChart data={semesterScorecard} />
          </CardBody>
        </Card>
      </main>
    </>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const accentMap: Record<NonNullable<TimetableSlot["accent"]>, string> = {
  indigo: "bg-brand-500",
  amber: "bg-amber-500",
  emerald: "bg-success-500",
  rose: "bg-rose-500",
  slate: "bg-ink-300",
};

function TimetableRow({ slot }: { slot: TimetableSlot }) {
  if (slot.isBreak) {
    return (
      <li className="flex items-center gap-4 py-3 text-ink-400">
        <span className="w-20 font-mono text-xs">{slot.time}</span>
        <span className="text-sm italic">{slot.title}</span>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-4 py-3">
      <span className="w-20 font-mono text-xs text-ink-500">{slot.time}</span>
      <span className={cn("h-10 w-1 rounded-full shrink-0", accentMap[slot.accent ?? "indigo"])} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-ink-900">
          {slot.code}: {slot.title}
        </div>
        <div className="text-xs text-ink-500 flex items-center gap-1">
          <MapPin className="h-3 w-3" /> {slot.location}
        </div>
      </div>
    </li>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-500">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function Avatar({ tone, name }: { tone: "indigo" | "amber" | "emerald"; name: string }) {
  const ringMap = {
    indigo: "ring-brand-100",
    amber: "ring-amber-100",
    emerald: "ring-emerald-100",
  };
  const seed = encodeURIComponent(name.toLowerCase().replace(/\W+/g, "-"));
  return (
    <div className={`h-9 w-9 shrink-0 rounded-full overflow-hidden ring-2 ${ringMap[tone]}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.pravatar.cc/80?u=${seed}`}
        alt={name}
        className="h-full w-full object-cover"
      />
    </div>
  );
}
