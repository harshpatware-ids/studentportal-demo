"use client";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, LogOut } from "lucide-react";
import { useUser } from "@/store/user";
import { useRouter } from "next/navigation";
import { UserAvatar } from "@/components/UserAvatar";

export default function AccountPage() {
  const profile = useUser((s) => s.profile);
  const clear = useUser((s) => s.clear);
  const router = useRouter();

  const onLogout = () => {
    clear();
    router.replace("/login");
  };

  const fields: Array<{ label: string; value: string | undefined }> = [
    { label: "Full name", value: profile?.full_name },
    { label: "Email", value: profile?.email },
    { label: "Student ID", value: profile?.student_id },
    { label: "Department", value: profile?.department },
    {
      label: "Date of birth",
      value: profile?.date_of_birth
        ? new Date(profile.date_of_birth).toLocaleDateString()
        : undefined,
    },
  ];

  return (
    <>
      <Topbar title="Account" />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-auto">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified credential
            </span>
          </CardHeader>
          <CardBody>
            <div className="flex items-center gap-4">
              <UserAvatar
                size={72}
                name={profile?.full_name || "Demo Student"}
                className="ring-4 ring-brand-50 shadow-sm"
              />
              <div>
                <div className="text-lg font-semibold text-ink-900">
                  {profile?.full_name || "Demo Student"}
                </div>
                <div className="text-sm text-ink-500">
                  {profile?.department || "—"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.label} className="rounded-lg border border-ink-200 p-3">
                  <div className="text-[11px] font-medium text-ink-500">{f.label}</div>
                  <div className="text-sm text-ink-900 mt-0.5 truncate">{f.value || "—"}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credential</CardTitle>
          </CardHeader>
          <CardBody>
            <div className="rounded-lg border border-ink-200 px-4 py-3 flex items-center justify-between">
              <div>
                <div className="text-xs text-ink-500">Reference</div>
                <div className="font-mono text-sm text-ink-900">
                  {profile?.credentialRef || "CRED-2026-XXXXXX"}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-ink-500">Issued</div>
                <div className="text-sm text-ink-900">
                  {profile?.issuedAt ? new Date(profile.issuedAt).toLocaleDateString() : "—"}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session</CardTitle>
          </CardHeader>
          <CardBody>
            <Button variant="outline" onClick={onLogout}>
              <LogOut className="h-4 w-4" /> Log out
            </Button>
          </CardBody>
        </Card>
      </main>
    </>
  );
}
