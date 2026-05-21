"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { attendanceHeatmap } from "@/data/dummy";
import { cn } from "@/lib/utils";

const COURSE_ATTENDANCE = [
  { code: "CS301", title: "Advanced Algorithms", percent: 94, attended: 28, total: 30 },
  { code: "MA205", title: "Linear Algebra", percent: 90, attended: 27, total: 30 },
  { code: "SE410", title: "Software Engineering Lab", percent: 96, attended: 24, total: 25 },
  { code: "HU102", title: "Communication Skills", percent: 86, attended: 19, total: 22 },
  { code: "PH201", title: "Physics II", percent: 88, attended: 22, total: 25 },
  { code: "EC305", title: "Digital Logic", percent: 93, attended: 26, total: 28 },
];

const cellTone = {
  present: "bg-success-500",
  absent: "bg-danger-500/80",
  leave: "bg-amber-500/80",
  none: "bg-ink-100",
} as const;

export default function AttendancePage() {
  return (
    <>
      <Topbar title="Attendance" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly heatmap — April 2026</CardTitle>
              <div className="flex items-center gap-3 text-[11px]">
                <Legend color="bg-success-500" label="Present" />
                <Legend color="bg-danger-500/80" label="Absent" />
                <Legend color="bg-amber-500/80" label="Leave" />
              </div>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-7 gap-2">
                {attendanceHeatmap.map((cell, i) => (
                  <div
                    key={i}
                    title={`${cell.date}: ${cell.status}`}
                    className={cn("h-9 rounded-md", cellTone[cell.status])}
                  />
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Overall</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col items-center justify-center py-6">
                <RingPercent value={92} />
                <div className="mt-3 text-sm text-ink-600">Across all courses</div>
              </div>
              <div className="grid grid-cols-3 text-center gap-2 mt-2">
                <Stat label="Present" value="146" tone="text-success-600" />
                <Stat label="Absent" value="9" tone="text-danger-500" />
                <Stat label="Leave" value="3" tone="text-amber-500" />
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>By course</CardTitle>
          </CardHeader>
          <CardBody className="pt-0">
            <div className="space-y-4">
              {COURSE_ATTENDANCE.map((c) => (
                <div key={c.code}>
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="font-semibold text-ink-900">{c.code}</span>
                      <span className="text-ink-500"> · {c.title}</span>
                    </div>
                    <div className="text-xs text-ink-600">
                      {c.attended}/{c.total} · <span className="font-semibold text-ink-900">{c.percent}%</span>
                    </div>
                  </div>
                  <div className="mt-1.5 h-2 rounded-full bg-ink-100 overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-[width]",
                        c.percent >= 90 ? "bg-success-500" : c.percent >= 80 ? "bg-amber-500" : "bg-danger-500"
                      )}
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </main>
    </>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-500">
      <span className={cn("h-2.5 w-2.5 rounded-sm", color)} />
      {label}
    </span>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <div className={cn("text-xl font-semibold", tone)}>{value}</div>
      <div className="text-[10px] text-ink-500">{label}</div>
    </div>
  );
}

function RingPercent({ value }: { value: number }) {
  const radius = 56;
  const c = 2 * Math.PI * radius;
  const offset = c - (value / 100) * c;
  return (
    <div className="relative h-36 w-36">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={radius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="#4f46e5"
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold text-ink-900">{value}%</div>
        <div className="text-[10px] text-ink-500">attendance</div>
      </div>
    </div>
  );
}
