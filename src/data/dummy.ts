/**
 * Static data for the dashboard. Swap with real backend data later.
 */

export type TimetableSlot = {
  time: string;
  code: string;
  title: string;
  location: string;
  isBreak?: boolean;
  accent?: "indigo" | "amber" | "emerald" | "rose" | "slate";
};

export const todaysTimetable: TimetableSlot[] = [
  {
    time: "09:00 AM",
    code: "CS301",
    title: "Advanced Algorithms",
    location: "Room 402, Science Block",
    accent: "indigo",
  },
  {
    time: "11:00 AM",
    code: "MA205",
    title: "Linear Algebra",
    location: "Hall B, Main Building",
    accent: "amber",
  },
  { time: "01:00 PM", code: "", title: "Lunch Break", location: "", isBreak: true },
  {
    time: "02:00 PM",
    code: "SE410",
    title: "Software Engineering Lab",
    location: "Computer Lab 3",
    accent: "emerald",
  },
  {
    time: "04:30 PM",
    code: "HU102",
    title: "Communication Skills",
    location: "Seminar Room 1",
    accent: "rose",
  },
];

export type Announcement = {
  from: string;
  ago: string;
  body: string;
  avatarTone: "indigo" | "amber" | "emerald";
};

export const announcements: Announcement[] = [
  {
    from: "Prof. Davis",
    ago: "2h ago",
    body: "Midterm syllabus updated for CS301. Please review module 4 thoroughly before the exam.",
    avatarTone: "indigo",
  },
  {
    from: "Admin Office",
    ago: "1d ago",
    body: "Library hours extended for the upcoming reading week. Open until 11 PM all weekdays.",
    avatarTone: "amber",
  },
  {
    from: "Dr. Smith",
    ago: "2d ago",
    body: "Guest lecture on AI ethics scheduled for Friday. Attendance is mandatory for SE410 students.",
    avatarTone: "emerald",
  },
];

export type ScorecardEntry = { subject: string; you: number; avg: number };

export const semesterScorecard: ScorecardEntry[] = [
  { subject: "CS301", you: 88, avg: 72 },
  { subject: "MA205", you: 92, avg: 75 },
  { subject: "SE410", you: 85, avg: 78 },
  { subject: "HU102", you: 79, avg: 70 },
  { subject: "PH201", you: 83, avg: 68 },
  { subject: "EC305", you: 90, avg: 74 },
];

export const metrics = {
  cgpa: { value: "8.7", delta: "+0.2 trend" },
  attendance: { value: 92, label: "92%" },
  pendingAssignments: { value: 3, sub: "Next due in 2 days" },
  classesToday: { value: 5, sub: "Next at 11:00 AM" },
};

export type AttendanceCell = { date: string; status: "present" | "absent" | "leave" | "none" };

/** A simple month heatmap — 5 weeks x 7 days. */
export const attendanceHeatmap: AttendanceCell[] = Array.from({ length: 35 }).map((_, i) => {
  const day = i + 1;
  const cycle = i % 11;
  let status: AttendanceCell["status"] = "present";
  if (cycle === 4) status = "absent";
  else if (cycle === 9) status = "leave";
  if (i >= 30) status = "none";
  return { date: `Day ${day}`, status };
});

export type Assignment = {
  course: string;
  title: string;
  due: string;
  status: "pending" | "submitted" | "graded";
  grade?: string;
};

export const assignments: Assignment[] = [
  { course: "CS301", title: "Greedy Algorithms — Problem Set 4", due: "Due in 2 days", status: "pending" },
  { course: "MA205", title: "Eigenvalues Worksheet", due: "Due in 5 days", status: "pending" },
  { course: "SE410", title: "Sprint 2 Retrospective Report", due: "Due in 1 week", status: "pending" },
  { course: "HU102", title: "Persuasive Essay", due: "Submitted yesterday", status: "submitted" },
  { course: "CS301", title: "Graph Theory Quiz", due: "Graded", status: "graded", grade: "A" },
];
