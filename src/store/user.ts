"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type StudentProfile = {
  // Credential attributes — must match the studentportal/1.0 schema exactly.
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  date_of_birth: string;

  // Metadata
  /** When the credential was first issued (ms epoch). */
  issuedAt?: number;
  /** Credential reference shown on the issuance modal — e.g. "CRED-2026-A7F309". */
  credentialRef?: string;
};

type UserState = {
  profile: StudentProfile | null;
  setProfile: (p: StudentProfile) => void;
  clear: () => void;
};

export const useUser = create<UserState>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      clear: () => set({ profile: null }),
    }),
    { name: "studentportal.profile" }
  )
);
