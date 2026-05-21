"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type Block = {
  code: string;
  title: string;
  room: string;
  start: number; // hour offset from 8am
  span: number; // hours
  tone: "indigo" | "amber" | "emerald" | "rose";
};

const HOURS = ["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const SCHEDULE: Record<string, Block[]> = {
  Mon: [
    { code: "CS301", title: "Advanced Algorithms", room: "Room 402", start: 1, span: 1, tone: "indigo" },
    { code: "MA205", title: "Linear Algebra", room: "Hall B", start: 3, span: 1, tone: "amber" },
    { code: "SE410", title: "SE Lab", room: "Lab 3", start: 6, span: 2, tone: "emerald" },
  ],
  Tue: [
    { code: "PH201", title: "Physics II", room: "Hall A", start: 2, span: 1, tone: "rose" },
    { code: "CS301", title: "Tutorial", room: "Room 405", start: 4, span: 1, tone: "indigo" },
    { code: "HU102", title: "Comm. Skills", room: "Seminar 1", start: 7, span: 1, tone: "amber" },
  ],
  Wed: [
    { code: "MA205", title: "Linear Algebra", room: "Hall B", start: 1, span: 1, tone: "amber" },
    { code: "EC305", title: "Digital Logic", room: "Lab 1", start: 3, span: 2, tone: "emerald" },
    { code: "CS301", title: "Adv. Algorithms", room: "Room 402", start: 6, span: 1, tone: "indigo" },
  ],
  Thu: [
    { code: "SE410", title: "SE Lab", room: "Lab 3", start: 2, span: 2, tone: "emerald" },
    { code: "HU102", title: "Comm. Skills", room: "Seminar 1", start: 5, span: 1, tone: "amber" },
    { code: "PH201", title: "Physics Lab", room: "Phy Lab", start: 7, span: 2, tone: "rose" },
  ],
  Fri: [
    { code: "CS301", title: "Adv. Algorithms", room: "Room 402", start: 1, span: 1, tone: "indigo" },
    { code: "MA205", title: "Tutorial", room: "Room 207", start: 3, span: 1, tone: "amber" },
    { code: "EC305", title: "Digital Logic", room: "Lab 1", start: 5, span: 1, tone: "emerald" },
  ],
};

const tones = {
  indigo: "bg-brand-100 border-brand-300 text-brand-800",
  amber: "bg-amber-100 border-amber-300 text-amber-900",
  emerald: "bg-emerald-100 border-emerald-300 text-emerald-900",
  rose: "bg-rose-100 border-rose-300 text-rose-900",
};

export default function TimetablePage() {
  return (
    <>
      <Topbar title="Timetable" />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Week view — Spring 2026</CardTitle>
            <span className="text-xs text-ink-500">Week 7 of 16</span>
          </CardHeader>
          <CardBody className="overflow-x-auto">
            <div className="min-w-[800px] grid grid-cols-[80px_repeat(5,1fr)] gap-2">
              {/* Empty corner */}
              <div />
              {DAYS.map((d) => (
                <div key={d} className="text-xs font-semibold text-ink-600 text-center pb-2 border-b border-ink-200">
                  {d}
                </div>
              ))}

              {HOURS.map((hr, hrIdx) => (
                <Row key={hr} hour={hr} hourIdx={hrIdx} />
              ))}
            </div>
          </CardBody>
        </Card>
      </main>
    </>
  );

  function Row({ hour, hourIdx }: { hour: string; hourIdx: number }) {
    return (
      <>
        <div className="text-[11px] font-mono text-ink-400 pt-2">{hour}</div>
        {DAYS.map((d) => {
          const block = (SCHEDULE[d] ?? []).find((b) => b.start === hourIdx);
          if (block) {
            return (
              <div
                key={d + hourIdx}
                className={cn(
                  "rounded-lg border-l-4 px-3 py-2 min-h-[44px] flex flex-col justify-center",
                  tones[block.tone]
                )}
                style={{ gridRow: `span ${block.span}` }}
              >
                <div className="text-xs font-semibold leading-tight">{block.code}</div>
                <div className="text-[11px] opacity-80 truncate">{block.title}</div>
                <div className="text-[10px] opacity-60">{block.room}</div>
              </div>
            );
          }
          // If a previous-hour block spans into this cell, skip rendering it (CSS span handles it).
          const spannedFrom = (SCHEDULE[d] ?? []).find(
            (b) => b.start < hourIdx && b.start + b.span > hourIdx
          );
          if (spannedFrom) return null;

          return <div key={d + hourIdx} className="border-b border-ink-100 min-h-[44px]" />;
        })}
      </>
    );
  }
}
