"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { BookOpen, FileDown, Video, Library } from "lucide-react";

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Course materials",
    body: "Slides, notes, and reading lists per course.",
    image: "https://picsum.photos/seed/sv-books/640/360",
  },
  {
    icon: Video,
    title: "Lecture recordings",
    body: "Catch up on missed classes with full archives.",
    image: "https://picsum.photos/seed/sv-lecture/640/360",
  },
  {
    icon: FileDown,
    title: "Downloadable transcripts",
    body: "Generate verified transcripts as PDF.",
    image: "https://picsum.photos/seed/sv-transcript/640/360",
  },
  {
    icon: Library,
    title: "Library catalog",
    body: "Search books, journals, and check loan status.",
    image: "https://picsum.photos/seed/sv-library/640/360",
  },
];

export default function ResourcesPage() {
  return (
    <>
      <Topbar title="Resources" />
      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Quick access</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {RESOURCES.map((r) => (
                <a
                  key={r.title}
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="group flex flex-col rounded-xl border border-ink-200 overflow-hidden hover:border-brand-300 hover:shadow-md transition-all"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-ink-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-900/40 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 h-9 w-9 rounded-lg bg-white/95 text-brand-600 flex items-center justify-center shadow-sm">
                      <r.icon className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-semibold text-ink-900">{r.title}</div>
                    <div className="text-xs text-ink-500 mt-0.5">{r.body}</div>
                  </div>
                </a>
              ))}
            </div>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
