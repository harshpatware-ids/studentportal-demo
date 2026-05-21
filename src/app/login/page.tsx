"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Smartphone, ScanLine, Zap, KeyRound, ArrowRight, ShieldCheck } from "lucide-react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { QRCodeSVG } from "qrcode.react";

import { Logo } from "@/components/Logo";
import { QrPanel } from "@/components/QrPanel";
import { Button } from "@/components/ui/Button";
import { useUser, type StudentProfile } from "@/store/user";
import {
  createProofRequest,
  getProofStatus,
  isTerminalFailure,
  isTerminalSuccess,
} from "@/lib/api";
import {
  POLL_INTERVAL_MS,
  QR_REFRESH_SECONDS,
  QR_WAIT_TIMEOUT_MS,
} from "@/lib/config";

export default function LoginPage() {
  return (
    <div className="h-screen overflow-hidden grid lg:grid-cols-2 bg-white">
      <FormSide />
      <InstructionsSide />
    </div>
  );
}

function FormSide() {
  const router = useRouter();
  const setProfile = useUser((s) => s.setProfile);
  const cachedProfile = useUser((s) => s.profile);

  const [invitationUrl, setInvitationUrl] = React.useState("");
  const [requestId, setRequestId] = React.useState("");
  const [refreshIn, setRefreshIn] = React.useState(QR_REFRESH_SECONDS);
  const [error, setError] = React.useState<string | null>(null);

  const newSession = React.useCallback(async () => {
    setError(null);
    try {
      const s = await createProofRequest();
      setInvitationUrl(s.invitationUrl);
      setRequestId(s.requestId);
      setRefreshIn(QR_REFRESH_SECONDS);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setError(
        /Failed to communicate with service/i.test(msg)
          ? "Verification service unavailable. Retrying…"
          : msg
      );
    }
  }, []);

  React.useEffect(() => {
    void newSession();
  }, [newSession]);

  React.useEffect(() => {
    const id = setInterval(() => {
      setRefreshIn((n) => {
        if (n <= 1) {
          void newSession();
          return QR_REFRESH_SECONDS;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [newSession]);

  React.useEffect(() => {
    if (!requestId) return;
    let alive = true;
    const startedAt = Date.now();

    const tick = async () => {
      if (Date.now() - startedAt > QR_WAIT_TIMEOUT_MS) {
        setError("Verification timed out. Generate a new QR.");
        return;
      }
      try {
        const s = await getProofStatus(requestId);
        if (!alive) return;
        if (isTerminalSuccess(s.state)) {
          const claimed = extractProfile(s.attributes, cachedProfile);
          if (claimed) setProfile(claimed);
          router.replace("/dashboard");
        } else if (isTerminalFailure(s.state)) {
          setError(`Verification ${s.state}. Try again.`);
        }
      } catch {
      }
    };

    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [requestId, router, setProfile, cachedProfile]);

  return (
    <section className="flex flex-col p-6 sm:p-10 overflow-hidden min-w-0">
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <Logo sublabel="" />
        <span className="text-xs text-ink-500">
          New here?{" "}
          <Link href="/signup" className="text-brand-600 font-medium hover:underline">
            Sign up
          </Link>
        </span>
      </motion.div>

      <div className="flex-1 flex items-center justify-center min-h-0">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm flex flex-col items-center text-center"
        >
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">Scan to login</h1>
          <p className="mt-1.5 text-sm text-ink-500 max-w-xs">
            Open your authenticator app and scan the code below to sign in instantly.
          </p>

          <motion.div
            className="mt-6 p-5 rounded-2xl bg-brand-50/40 border-2 border-dashed border-brand-100 relative"
            whileHover={{ scale: 1.01 }}
          >
            <QrPanel
              value={invitationUrl}
              refreshIn={refreshIn}
              label="Waiting for scan…"
            />
            <motion.div
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-3 -right-3 h-9 w-9 bg-brand-600 rounded-full flex items-center justify-center text-white shadow-lg"
            >
              <ScanLine className="h-4 w-4" />
            </motion.div>
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100"
            >
              {error}
            </motion.div>
          )}

          <div className="mt-6 w-full flex items-center gap-3 text-[10px] text-ink-400 font-medium uppercase tracking-widest">
            <div className="h-px flex-1 bg-ink-200" />
            <span>or</span>
            <div className="h-px flex-1 bg-ink-200" />
          </div>

          <motion.button
            whileHover={{ y: -1 }}
            type="button"
            onClick={() => void newSession()}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            <KeyRound className="h-4 w-4" />
            Use recovery code
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}

function InstructionsSide() {
  return (
    <aside className="hidden lg:flex flex-col justify-center gap-8 p-10 bg-lavender-100 relative overflow-hidden min-w-0">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 30%, rgba(99,102,241,0.12) 0%, transparent 60%)",
        }}
      />

      <div className="relative">
        <PhoneScan3D />
      </div>

      <div className="relative max-w-sm mx-auto flex flex-col gap-2.5 w-full">
        <Step
          n={1}
          icon={Smartphone}
          title="Open the e-idStack mobile app"
          body="Launch e-idStack on your phone — the wallet that holds your StudentPortal credential."
          delay={0.2}
        />
        <Step
          n={2}
          icon={ScanLine}
          title="Scan the QR through it"
          body="Tap the scan icon and frame the QR code on this screen with your camera."
          delay={0.3}
        />
        <Step
          n={3}
          icon={Zap}
          title="Share your credential"
          body="Confirm in the app to share your verified credential — you&apos;ll be logged in instantly."
          delay={0.4}
        />
      </div>
    </aside>
  );
}

function Step({
  n,
  icon: Icon,
  title,
  body,
  delay,
}: {
  n: number;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-start gap-3 rounded-xl bg-white/85 backdrop-blur px-3 py-2.5 border border-white/60 shadow-sm"
    >
      <div className="h-7 w-7 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-semibold shrink-0">
        {n}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Icon className="h-3.5 w-3.5 text-brand-600" />
          {title}
        </div>
        <p className="mt-0.5 text-xs text-ink-600 leading-relaxed">{body}</p>
      </div>
    </motion.div>
  );
}

/**
 * Interactive 3D phone-scanning-QR illustration — no photos.
 *  - Tilted phone shape that follows the cursor on a perspective transform
 *  - A real QR rendered on the "screen" (decorative URL)
 *  - Sweeping scan-line beam that travels down the QR continuously
 *  - Animated "Scanned" check appears mid-cycle as feedback
 *  - Conic-gradient halo + drop-puddle shadow share the Qr3D motion language
 */
function PhoneScan3D() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [14, -14]), {
    stiffness: 200,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-16, 16]), {
    stiffness: 200,
    damping: 22,
  });

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
      className="relative w-full max-w-sm mx-auto select-none"
      style={{ perspective: 1100 }}
    >
      {/* Rotating conic-gradient halo */}
      <motion.div
        aria-hidden
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, ease: "linear", repeat: Infinity }}
        className="absolute inset-0 -m-6 rounded-full blur-2xl opacity-55"
        style={{
          background:
            "conic-gradient(from 0deg, #818cf8, #c084fc, #f472b6, #818cf8)",
        }}
      />

      {/* Drop puddle shadow */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 -bottom-6 h-8 w-3/4 rounded-full bg-ink-900/25 blur-2xl"
      />

      <motion.div
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        animate={{ y: [0, -10, 0] }}
        transition={{ y: { duration: 5, repeat: Infinity, ease: "easeInOut" } }}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative flex justify-center cursor-grab active:cursor-grabbing"
      >
        {/* Phone */}
        <div
          className="relative w-44 h-[300px] rounded-[2.2rem] bg-ink-900 ring-1 ring-ink-700 shadow-[0_30px_60px_-20px_rgba(15,23,42,0.55)] p-2 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Notch */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-20 h-5 rounded-full bg-ink-950 ring-1 ring-ink-700/60 z-10" />

          {/* Screen */}
          <div
            className="relative h-full w-full rounded-[1.7rem] bg-white flex flex-col items-center justify-center p-4"
            style={{ transform: "translateZ(20px)" }}
          >
            {/* Top status pill */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2 py-0.5 text-[9px] font-semibold text-brand-700">
              <span className="h-1  rounded-full bg-emerald-500" />
              Scan to login
            </div>

            {/* QR plaque (real QR for realism) */}
            <div className="relative mt-5">
              <QRCodeSVG
                value="https://studentportal.app/preview"
                size={120}
                bgColor="#ffffff"
                fgColor="#0f172a"
                level="M"
                includeMargin={false}
              />

              {/* Scanning beam */}
              <motion.div
                aria-hidden
                animate={{ y: [0, 120, 0], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-0 right-0 h-[3px] rounded-full"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, #6366f1, transparent)",
                  boxShadow: "0 0 12px rgba(99,102,241,0.85)",
                }}
              />

              {/* Corner brackets */}
              <span className="absolute -top-1 -left-1 h-3 w-3 border-t-2 border-l-2 border-brand-500 rounded-tl" />
              <span className="absolute -top-1 -right-1 h-3 w-3 border-t-2 border-r-2 border-brand-500 rounded-tr" />
              <span className="absolute -bottom-1 -left-1 h-3 w-3 border-b-2 border-l-2 border-brand-500 rounded-bl" />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 border-b-2 border-r-2 border-brand-500 rounded-br" />
            </div>

            {/* "Verified" pulse */}
            <motion.div
              animate={{ opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, times: [0, 0.5, 0.8, 1] }}
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 ring-1 ring-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700"
            >
              <ShieldCheck className="h-3 w-3" />
              Verified
            </motion.div>
          </div>

          {/* Reflection sweep on the phone body */}
          <motion.div
            aria-hidden
            animate={{ x: ["-50%", "150%"] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 bottom-0 w-1/2 pointer-events-none"
            style={{
              background:
                "linear-gradient(100deg, transparent 30%, rgba(255,255,255,0.18) 50%, transparent 70%)",
              transform: "translateZ(35px)",
            }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function extractProfile(
  attrs: Record<string, string | undefined> | undefined,
  fallback: StudentProfile | null
): StudentProfile | null {
  if (!attrs && !fallback) return null;
  const full_name = attrs?.full_name ?? fallback?.full_name ?? "";
  const email = attrs?.email ?? fallback?.email ?? "";
  const student_id = attrs?.student_id ?? fallback?.student_id ?? "";
  const department = attrs?.department ?? fallback?.department ?? "";
  const date_of_birth = attrs?.date_of_birth ?? fallback?.date_of_birth ?? "";
  if (!full_name) return fallback;
  return {
    full_name,
    email,
    student_id,
    department,
    date_of_birth,
    issuedAt: fallback?.issuedAt ?? Date.now(),
    credentialRef: fallback?.credentialRef,
  };
}
