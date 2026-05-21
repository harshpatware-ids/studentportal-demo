"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { ScorecardChart } from "@/components/dashboard/ScorecardChart";
import { semesterScorecard } from "@/data/dummy";

const SEMESTERS = [
  { name: "Sem 1", cgpa: 8.4 },
  { name: "Sem 2", cgpa: 8.6 },
  { name: "Sem 3", cgpa: 8.5 },
  { name: "Sem 4", cgpa: 8.7 },
  { name: "Sem 5", cgpa: 8.7 },
];

export default function ScorecardPage() {
  return (
    <>
      <Topbar title="Scorecard" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Semester scorecard</CardTitle>
            <div className="flex items-center gap-4 text-xs text-ink-500">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-brand-600" /> Your Score
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-ink-300" /> Class Avg
              </span>
            </div>
          </CardHeader>
          <CardBody className="pt-2">
            <ScorecardChart data={semesterScorecard} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>CGPA progression</CardTitle>
            <span className="text-xs text-ink-500">All semesters</span>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {SEMESTERS.map((s) => (
                <div key={s.name} className="rounded-lg border border-ink-200 p-4">
                  <div className="text-xs text-ink-500">{s.name}</div>
                  <div className="mt-1 text-2xl font-semibold text-ink-900">{s.cgpa.toFixed(2)}</div>
                  <div className="mt-3 h-1.5 bg-ink-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-600" style={{ width: `${(s.cgpa / 10) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subject-wise grades — Spring 2026</CardTitle>
          </CardHeader>
          <CardBody className="pt-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-medium text-ink-500 text-left">
                  <th className="py-2">Course</th>
                  <th className="py-2">Marks</th>
                  <th className="py-2">Class Avg</th>
                  <th className="py-2">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {semesterScorecard.map((row) => (
                  <tr key={row.subject}>
                    <td className="py-3 font-medium text-ink-900">{row.subject}</td>
                    <td className="py-3 text-ink-700">{row.you}</td>
                    <td className="py-3 text-ink-500">{row.avg}</td>
                    <td className="py-3">
                      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        {row.you >= 90 ? "A+" : row.you >= 85 ? "A" : row.you >= 75 ? "B+" : "B"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
