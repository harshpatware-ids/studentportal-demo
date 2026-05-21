"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, ShieldCheck, Fingerprint, ScanLine } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Dialog } from "@/components/ui/Dialog";
import { QrPanel } from "@/components/QrPanel";
import { useUser } from "@/store/user";
import {
  createIssuanceOffer,
  getOfferStatus,
  isTerminalFailure,
  isTerminalSuccess,
  type StudentAttributes,
} from "@/lib/api";
import { POLL_INTERVAL_MS } from "@/lib/config";
import { UserAvatar } from "@/components/UserAvatar";

type FormState = StudentAttributes;

const DEPARTMENTS = [
  "Computer Science",
  "Electronics & Communication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Mathematics",
  "Physics",
  "Business Administration",
  "Economics",
  "Design",
  "Law",
];

export default function SignupPage() {
  const router = useRouter();
  const setProfile = useUser((s) => s.setProfile);

  const [form, setForm] = React.useState<FormState>({
    full_name: "",
    email: "",
    student_id: "",
    department: "",
    date_of_birth: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [invitationUrl, setInvitationUrl] = React.useState("");
  const [requestId, setRequestId] = React.useState("");
  const [credentialRef, setCredentialRef] = React.useState("");
  const [issued, setIssued] = React.useState(false);

  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((s) => ({ ...s, [field]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (
      !form.full_name ||
      !form.email ||
      !form.student_id ||
      !form.department ||
      !form.date_of_birth
    ) {
      setError("Please fill in every field.");
      return;
    }

    setSubmitting(true);
    try {
      const session = await createIssuanceOffer(form);
      setInvitationUrl(session.invitationUrl);
      setRequestId(session.requestId);
      setCredentialRef(buildCredentialRef(form.student_id));
      setModalOpen(true);

      setProfile({
        ...form,
        issuedAt: Date.now(),
        credentialRef: buildCredentialRef(form.student_id),
      });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(
        /Failed to communicate with service/i.test(msg)
          ? "The credential issuance service is temporarily unavailable. Please try again in a moment."
          : msg
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Poll issuance status while the QR modal is open.
  // `requestId` here is the credentialExchangeId returned by /oob-offer.
  React.useEffect(() => {
    if (!modalOpen || !requestId || issued) return;
    let alive = true;
    const tick = async () => {
      try {
        const s = await getOfferStatus(requestId);
        if (!alive) return;
        if (isTerminalSuccess(s.state)) {
          setIssued(true);
        } else if (isTerminalFailure(s.state)) {
          setError(`Issuance ${s.state}. Please try again.`);
        }
      } catch {
        /* transient — keep polling */
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [modalOpen, requestId, issued]);

  const resetForm = React.useCallback(() => {
    setForm({
      full_name: "",
      email: "",
      student_id: "",
      department: "",
      date_of_birth: "",
    });
    setInvitationUrl("");
    setRequestId("");
    setCredentialRef("");
    setIssued(false);
    setError(null);
  }, []);

  const onModalClose = () => {
    setModalOpen(false);
    resetForm();
  };

  const onConfirmScanned = () => {
    setModalOpen(false);
    resetForm();
    router.push("/login");
  };

  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2 bg-white">
      <BrandSide />

      <section className="flex flex-col p-6 sm:p-10 overflow-hidden min-w-0">
        <div className="flex items-center justify-between">
          <div className="lg:hidden">
            <Logo />
          </div>
          <div className="hidden lg:block" />
          <span className="text-xs text-ink-500">
            Already have an account?{" "}
            <Link href="/login" className="text-brand-600 font-medium hover:underline">
              Log in
            </Link>
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center min-h-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">
              Create your student account
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              Takes 30 seconds. You&apos;ll receive a QR credential to use for login.
            </p>

            <form className="mt-6 grid grid-cols-2 gap-3.5" onSubmit={submit} noValidate>
              <div className="col-span-2">
                <Input
                  label="Full name"
                  placeholder="e.g. john doe"
                  value={form.full_name}
                  onChange={onChange("full_name")}
                  autoComplete="name"
                />
              </div>
              <div className="col-span-2">
                <Input
                  label="University email"
                  type="email"
                  placeholder="john.doe@university.edu"
                  value={form.email}
                  onChange={onChange("email")}
                  autoComplete="email"
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Student ID"
                  placeholder="2024-CS-8412"
                  value={form.student_id}
                  onChange={onChange("student_id")}
                />
              </div>
              <div className="col-span-1">
                <Input
                  label="Date of birth"
                  type="date"
                  value={form.date_of_birth}
                  onChange={onChange("date_of_birth")}
                  max={new Date().toISOString().split("T")[0]}
                  autoComplete="bday"
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1.5">
                <label className="text-sm font-medium text-ink-700">
                  Department / Course
                </label>
                <select
                  value={form.department}
                  onChange={onChange("department")}
                  className="h-11 w-full rounded-lg border border-ink-200 bg-white px-3.5 text-sm text-ink-900 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 0.875rem center",
                    backgroundSize: "1em",
                  }}
                >
                  <option value="">Select your program…</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="col-span-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100">
                  {error}
                </div>
              )}

              <div className="col-span-2 mt-1">
                <Button type="submit" size="md" loading={submitting} className="w-full">
                  Create account &amp; issue credential
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <p className="mt-2 text-[11px] text-ink-500 text-center leading-relaxed">
                  By continuing you agree to the{" "}
                  <a href="#" className="underline">Terms</a> and{" "}
                  <a href="#" className="underline">Privacy Policy</a>.
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </section>

      <CredentialIssuanceModal
        open={modalOpen}
        invitationUrl={invitationUrl}
        credentialRef={credentialRef}
        issued={issued}
        onConfirmScanned={onConfirmScanned}
        onClose={onModalClose}
      />
    </div>
  );
}

function BrandSide() {
  return (
    <aside className="hidden lg:flex flex-col bg-lavender-100 relative overflow-hidden px-10 py-10 xl:px-14">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.18), transparent 50%), radial-gradient(circle at 100% 100%, rgba(168,85,247,0.14), transparent 50%)",
        }}
      />

      {/*
        All three blocks share one max-w-sm column so they line up to the
        same left edge — fixes the misaligned heading/card/testimonial.
        `justify-between` distributes vertical space between top/middle/bottom.
      */}
      <div className="relative w-full max-w-sm flex flex-col h-full justify-between gap-6">
        {/* Top: logo + heading */}
        <div>
          <Logo sublabel="" />
          <h2 className="mt-8 text-3xl xl:text-4xl font-semibold tracking-tight text-ink-900 leading-[1.1]">
            Join 12,000+
            <br />
            students.
          </h2>
          <p className="mt-3 text-sm text-ink-600 leading-relaxed">
            StudentPortal replaces forgettable passwords with a cryptographic
            credential that lives on your phone.
          </p>
        </div>

        {/* Middle: 3D floating credential preview */}
        <div className="relative flex items-center justify-center">
          <Credential3D />
        </div>

        {/* Bottom: testimonial */}
        <Testimonial />
      </div>
    </aside>
  );
}

/**
 * Floating, tilting credential preview card — no photos, same 3D-motion
 * theme as the Qr3D on /login. Mouse-follow parallax + idle float +
 * conic gradient glow.
 */
function Credential3D() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [12, -12]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-14, 14]), {
    stiffness: 200,
    damping: 22,
  });
  const glareX = useTransform(mx, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(my, [-0.5, 0.5], ["0%", "100%"]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <div
      className="relative w-full select-none"
      style={{ perspective: 1100 }}
    >
      {/* Rotating conic-gradient halo */}
      <motion.div
        aria-hidden
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 22, ease: "linear", repeat: Infinity }}
        className="absolute inset-0 -m-6 rounded-3xl blur-2xl opacity-60"
        style={{
          background:
            "conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #818cf8)",
        }}
      />

      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ y: [0, -10, 0] }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative cursor-grab active:cursor-grabbing"
      >
        {/* Soft drop shadow puddle */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 -bottom-6 h-8 w-3/4 rounded-full bg-ink-900/25 blur-2xl"
        />

        <div
          className="relative rounded-2xl bg-gradient-to-br from-ink-900 via-ink-800 to-brand-900 ring-1 ring-white/10 shadow-[0_30px_70px_-20px_rgba(15,23,42,0.6)] p-5 text-white"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Top row: brand + signed badge */}
          <div
            className="flex items-center justify-between"
            style={{ transform: "translateZ(30px)" }}
          >
            <div className="flex items-center gap-2">
              <span className="h-7 w-7 rounded-md bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                  <path d="M6 12v5c0 1 2 3 6 3s6-2 6-3v-5" />
                </svg>
              </span>
              <div className="leading-tight">
                <div className="text-[11px] font-semibold tracking-wide">StudentPortal</div>
                <div className="text-[9px] font-mono text-white/60">studentportal/1.0</div>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 ring-1 ring-emerald-300/40 px-2 py-0.5 text-[10px] font-medium text-emerald-200">
              <ShieldCheck className="h-3 w-3" /> Signed
            </span>
          </div>

          {/* Middle: floating QR plaque + attribute list */}
          <div
            className="mt-4 flex items-center gap-4"
            style={{ transform: "translateZ(45px)" }}
          >
            <div className="relative rounded-xl bg-white p-2 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.5)] ring-1 ring-white/40">
              <QRCodeSVG
                value="https://studentportal.app/preview"
                size={84}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin={false}
              />
            </div>
            <div className="flex-1 grid gap-1.5 text-[11px]">
              <Attr label="full_name" value="John Doe" />
              <Attr label="email" value="john@university.edu" />
              <Attr label="student_id" value="2024-CS-8412" />
              <Attr label="department" value="Computer Science" />
            </div>
          </div>

          {/* Bottom: footer */}
          <div
            className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-mono text-white/65"
            style={{ transform: "translateZ(20px)" }}
          >
            <span>CRED-2026-A7F309</span>
            <span className="flex items-center gap-1">
              <Fingerprint className="h-3 w-3" /> Tamper-evident
            </span>
          </div>

          {/* Cursor-tracking glare */}
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-2xl pointer-events-none mix-blend-overlay"
            style={{
              transform: "translateZ(60px)",
              background: useTransform(
                [glareX, glareY],
                ([gx, gy]) =>
                  `radial-gradient(circle at ${gx} ${gy}, rgba(255,255,255,0.35), transparent 50%)`
              ),
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function Attr({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[8px] font-mono uppercase tracking-wider text-white/50">{label}</div>
      <div className="text-[11px] font-medium text-white/95 truncate">{value}</div>
    </div>
  );
}

function Testimonial() {
  return (
    <div className="relative bg-white rounded-2xl p-4 shadow-lg ring-1 ring-ink-200/60 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <UserAvatar size={40} name="Sarah J." />
          <div>
            <div className="text-sm font-semibold text-ink-900">Sarah J.</div>
            <div className="text-[11px] text-ink-500">Class of &apos;24</div>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </span>
      </div>
      <p className="mt-3 text-xs text-ink-600 leading-relaxed italic">
        &ldquo;The QR credential process was seamless. I used it to access the
        library immediately after signing up.&rdquo;
      </p>
    </div>
  );
}

function CredentialIssuanceModal({
  open,
  invitationUrl,
  credentialRef,
  issued,
  onConfirmScanned,
  onClose,
}: {
  open: boolean;
  invitationUrl: string;
  credentialRef: string;
  issued: boolean;
  onConfirmScanned: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} dismissible={false}>
      <div className="p-7 flex flex-col items-center text-center">
        {!issued ? (
          // ─── Waiting state: show QR for the wallet to scan ───────────
          <>
            <div className="h-12 w-12 rounded-full bg-brand-100 ring-8 ring-brand-50 flex items-center justify-center mb-3">
              <ScanLine className="h-6 w-6 text-brand-600" />
            </div>
            <h2 className="text-lg font-semibold text-ink-900">
              Scan to receive your credential
            </h2>
            <p className="mt-1.5 text-xs text-ink-500 max-w-xs">
              Open the e-idStack app on your phone and scan this QR to store
              your credential. You&apos;ll use it to log in from now on.
            </p>

            <div className="mt-5 rounded-xl border-2 border-dashed border-brand-200 p-3.5 bg-brand-50/30">
              <QrPanel value={invitationUrl} />
              {credentialRef && (
                <div className="mt-2.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 font-mono text-xs text-ink-700">
                  {credentialRef}
                </div>
              )}
            </div>
          </>
        ) : (
          // ─── Success state: replaces the QR once status === done ─────
          <>
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="relative h-16 w-16 rounded-full bg-emerald-100 ring-8 ring-emerald-50 flex items-center justify-center mb-4"
            >
              <motion.div
                animate={{ scale: [1, 1.18, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 rounded-full bg-emerald-300/40"
              />
              <CheckCircle2 className="relative h-9 w-9 text-emerald-600" strokeWidth={2.25} />
            </motion.div>

            <h2 className="text-xl font-semibold text-ink-900">
              You&apos;re all set!
            </h2>
            <p className="mt-2 text-sm text-ink-600 max-w-xs leading-relaxed">
              Your credential has been issued and saved to your e-idStack wallet.
              You can now use it to log in to StudentPortal.
            </p>

            {credentialRef && (
              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="font-mono text-xs text-emerald-800">{credentialRef}</span>
              </div>
            )}

            <Button
              size="md"
              onClick={onConfirmScanned}
              className="mt-6 w-full"
            >
              Continue to login
              <ArrowRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Dialog>
  );
}

function buildCredentialRef(seed: string) {
  const year = new Date().getFullYear();
  const tail = (seed.replace(/[^A-Z0-9]/gi, "").slice(-6) || randomHex(6))
    .toUpperCase()
    .padStart(6, "0");
  return `CRED-${year}-${tail}`;
}

function randomHex(len: number) {
  return Array.from({ length: len })
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("")
    .toUpperCase();
}
