"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { assignments } from "@/data/dummy";
import { CheckCircle2, Clock, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const statusTone = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  submitted: "bg-brand-50 text-brand-700 border-brand-200",
  graded: "bg-success-50 text-success-600 border-emerald-200",
} as const;

const statusIcon = { pending: Clock, submitted: CheckCircle2, graded: Award } as const;

export default function AssignmentsPage() {
  return (
    <>
      <Topbar title="Assignments" />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>All assignments</CardTitle>
            <span className="text-xs text-ink-500">{assignments.length} total</span>
          </CardHeader>
          <CardBody className="pt-0">
            <ul className="divide-y divide-ink-100">
              {assignments.map((a, i) => {
                const Icon = statusIcon[a.status];
                return (
                  <li key={i} className="flex items-center gap-4 py-3.5">
                    <div className="h-10 w-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center text-xs font-semibold">
                      {a.course}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ink-900 truncate">{a.title}</div>
                      <div className="text-xs text-ink-500">{a.due}{a.grade ? ` · Grade ${a.grade}` : ""}</div>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium", statusTone[a.status])}>
                      <Icon className="h-3 w-3" />
                      {a.status}
                    </span>
                    <Button variant="outline" size="sm" className="ml-3">
                      {a.status === "pending" ? "Submit" : "View"}
                    </Button>
                  </li>
                );
              })}
            </ul>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
