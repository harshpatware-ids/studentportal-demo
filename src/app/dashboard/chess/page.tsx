"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown,
  Trophy,
  Clock,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Eye,
} from "lucide-react";

import { Topbar } from "@/components/dashboard/Topbar";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { QrPanel } from "@/components/QrPanel";
import { UserAvatar } from "@/components/UserAvatar";
import { useUser } from "@/store/user";
import {
  createChessOffer,
  getOfferStatus,
  getPredefinedTemplate,
  isTerminalFailure,
  isTerminalSuccess,
} from "@/lib/api";
import { POLL_INTERVAL_MS } from "@/lib/config";

const CHESS_TEMPLATE_ID = 91;
const CHESS_BADGE_S3_KEY = "e-id-templates/3a0152d8-87f7-4430-b4a9-89155ab13499-badge-3.html";

const GAME_DURATION = 5; // seconds
const OPPONENT_NAME = "John";

/**
 * 8×8 board state — uses Unicode chess pieces. Position arrays are
 * tagged with `file` (a–h) / `rank` (1–8) so we can drive smooth piece
 * translations via Framer Motion when a move plays.
 */
type Piece = {
  id: string;
  glyph: string;
  color: "w" | "b";
  file: number; // 0..7
  rank: number; // 0..7
};

const INITIAL_PIECES: Piece[] = [
  // White back rank
  ...["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"].map((g, i) => ({
    id: `w-back-${i}`,
    glyph: g,
    color: "w" as const,
    file: i,
    rank: 0,
  })),
  // White pawns
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `w-pawn-${i}`,
    glyph: "♙",
    color: "w" as const,
    file: i,
    rank: 1,
  })),
  // Black pawns
  ...Array.from({ length: 8 }).map((_, i) => ({
    id: `b-pawn-${i}`,
    glyph: "♟",
    color: "b" as const,
    file: i,
    rank: 6,
  })),
  // Black back rank
  ...["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"].map((g, i) => ({
    id: `b-back-${i}`,
    glyph: g,
    color: "b" as const,
    file: i,
    rank: 7,
  })),
];

// Italian-opening style: a few moves visible during the 5s game
const SCRIPT: Array<{ at: number; pieceId: string; toFile: number; toRank: number }> = [
  { at: 800, pieceId: "w-pawn-4", toFile: 4, toRank: 3 }, // e2 → e4
  { at: 1700, pieceId: "b-pawn-4", toFile: 4, toRank: 4 }, // e7 → e5
  { at: 2700, pieceId: "w-back-6", toFile: 5, toRank: 2 }, // Ng1 → Nf3
  { at: 3700, pieceId: "b-back-1", toFile: 2, toRank: 5 }, // Nb8 → Nc6
];

export default function ChessPage() {
  const router = useRouter();
  const profile = useUser((s) => s.profile);
  const winnerName = (profile?.full_name || "Harsh Patware").trim();

  // `gameKey` drives the timer + move-script effects. Bump it to restart
  // cleanly (cleanup tears down the old interval/timeouts, then the effects
  // re-mount fresh).
  const [gameKey, setGameKey] = React.useState(0);

  const [pieces, setPieces] = React.useState<Piece[]>(INITIAL_PIECES);
  const [timeLeft, setTimeLeft] = React.useState(GAME_DURATION);
  const [gameOver, setGameOver] = React.useState(false);
  const [showOverModal, setShowOverModal] = React.useState(false);
  const [lastMove, setLastMove] = React.useState<{ from: string; to: string } | null>(null);

  // Claim/issuance state
  const [claiming, setClaiming] = React.useState(false);
  const [issuanceModalOpen, setIssuanceModalOpen] = React.useState(false);
  const [invitationUrl, setInvitationUrl] = React.useState("");
  const [requestId, setRequestId] = React.useState("");
  const [issued, setIssued] = React.useState(false);
  const [claimError, setClaimError] = React.useState<string | null>(null);

  // Preview credential state
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Tick timer
  React.useEffect(() => {
    const start = Date.now();
    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, GAME_DURATION - Math.floor(elapsed / 1000));
      setTimeLeft(remaining);
      if (elapsed >= GAME_DURATION * 1000) {
        clearInterval(tick);
        setGameOver(true);
        setShowOverModal(true);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [gameKey]);

  // Run scripted moves
  React.useEffect(() => {
    const timeouts = SCRIPT.map((mv) =>
      setTimeout(() => {
        setPieces((prev) => {
          const updated = prev.map((p) =>
            p.id === mv.pieceId ? { ...p, file: mv.toFile, rank: mv.toRank } : p
          );
          const moved = prev.find((p) => p.id === mv.pieceId);
          if (moved) {
            setLastMove({
              from: squareLabel(moved.file, moved.rank),
              to: squareLabel(mv.toFile, mv.toRank),
            });
          }
          return updated;
        });
      }, mv.at)
    );
    return () => timeouts.forEach(clearTimeout);
  }, [gameKey]);

  // Poll issuance status while modal is open.
  React.useEffect(() => {
    if (!issuanceModalOpen || !requestId || issued) return;
    let alive = true;
    const tick = async () => {
      try {
        const s = await getOfferStatus(requestId);
        if (!alive) return;
        if (isTerminalSuccess(s.state)) setIssued(true);
        else if (isTerminalFailure(s.state)) setClaimError(`Issuance ${s.state}. Try again.`);
      } catch {
        /* transient */
      }
    };
    const id = setInterval(tick, POLL_INTERVAL_MS);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [issuanceModalOpen, requestId, issued]);

  const claimCertificate = async () => {
    setClaimError(null);
    setClaiming(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 10);
      const expiresAt = expires.toISOString().split("T")[0];

      const session = await createChessOffer({
        nameOfPerson: winnerName,
        nameOfCourse: "Chess Competition",
        dateOfIssuance: today,
        placeOfIssuance: "Online Arena",
        issuerName: "StudentPortal",
        expiresAt,
      });

      setInvitationUrl(session.invitationUrl);
      setRequestId(session.requestId);
      setShowOverModal(false);
      setIssuanceModalOpen(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error.";
      setClaimError(
        /Failed to communicate with service/i.test(msg)
          ? "The issuance service is temporarily unavailable. Please try again."
          : msg
      );
    } finally {
      setClaiming(false);
    }
  };

  const playAgain = () => {
    setPieces(INITIAL_PIECES);
    setTimeLeft(GAME_DURATION);
    setGameOver(false);
    setShowOverModal(false);
    setLastMove(null);
    setIssued(false);
    setInvitationUrl("");
    setRequestId("");
    setClaimError(null);
    // Bumping the key tears down + re-runs the timer & move effects above.
    setGameKey((k) => k + 1);
  };

  return (
    <>
      <Topbar title="Chess Competition" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr_320px] gap-6">
          {/* ── Board side ───────────────────────────────────────── */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                Live Match
              </CardTitle>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 ring-1 ring-amber-200 px-2.5 py-1 text-amber-700 font-semibold">
                  <Sparkles className="h-3 w-3" />
                  Round 1 of 1
                </span>
              </div>
            </CardHeader>
            <CardBody>
              <PlayerStrip
                name={OPPONENT_NAME}
                tag="Bot · Easy"
                side="opponent"
                active={!gameOver && timeLeft > 0 && timeLeft % 2 === 0}
              />
              <Board pieces={pieces} />
              <PlayerStrip
                name={winnerName}
                tag="You"
                side="you"
                active={!gameOver && timeLeft > 0 && timeLeft % 2 === 1}
              />
            </CardBody>
          </Card>

          {/* ── Status side ──────────────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardBody className="flex flex-col items-center text-center pt-6">
                <div className="text-xs font-semibold uppercase tracking-wider text-ink-500">Time remaining</div>
                <div className="relative mt-2">
                  <CountdownRing seconds={GAME_DURATION} timeLeft={timeLeft} />
                </div>
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-500">
                  <Clock className="h-3.5 w-3.5" />
                  {gameOver ? "Match complete" : "Match in progress"}
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Match log</CardTitle>
              </CardHeader>
              <CardBody className="pt-0 text-xs text-ink-600 space-y-2 font-mono">
                <LogLine n={1} text={`White (${winnerName.split(/\s+/)[0]}) seated`} />
                <LogLine n={2} text={`Black (${OPPONENT_NAME}) seated`} />
                {lastMove && <LogLine n={3} text={`Move ${lastMove.from} → ${lastMove.to}`} />}
                {gameOver && (
                  <LogLine n={4} text={`Checkmate · winner: ${winnerName}`} highlight />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Prize</CardTitle>
              </CardHeader>
              <CardBody className="pt-0">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div className="text-xs text-ink-600 leading-relaxed">
                    Win and you&apos;ll receive a verifiable
                    <span className="font-semibold text-ink-900"> Chess Competition </span>
                    credential, signed and ready to share.
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setPreviewOpen(true)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  Preview credential
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
      </main>

      {/* ───── Game-over modal ────────────────────────────────── */}
      <GameOverModal
        open={showOverModal}
        winner={winnerName}
        loser={OPPONENT_NAME}
        onClaim={claimCertificate}
        onPlayAgain={playAgain}
        onPreview={() => setPreviewOpen(true)}
        claiming={claiming}
        error={claimError}
        onClose={() => setShowOverModal(false)}
      />

      {/* ───── Credential preview modal (renders template HTML) ── */}
      <PreviewCredentialDialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />

      {/* ───── Credential issuance / QR modal ─────────────────── */}
      <ChessIssuanceModal
        open={issuanceModalOpen}
        invitationUrl={invitationUrl}
        winner={winnerName}
        issued={issued}
        onClose={() => {
          setIssuanceModalOpen(false);
          setIssued(false);
          setInvitationUrl("");
          setRequestId("");
        }}
        onDone={() => {
          setIssuanceModalOpen(false);
          router.push("/dashboard");
        }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────── */

function Board({ pieces }: { pieces: Piece[] }) {
  return (
    <div className="mx-auto my-4 w-full max-w-[520px] aspect-square rounded-2xl overflow-hidden shadow-[0_12px_40px_-10px_rgba(15,23,42,0.25)] ring-1 ring-ink-200">
      <div
        className="relative grid grid-cols-8 grid-rows-8 h-full w-full"
        style={{
          backgroundImage:
            "linear-gradient(45deg, #1e293b 25%, transparent 25%), linear-gradient(-45deg, #1e293b 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1e293b 75%), linear-gradient(-45deg, transparent 75%, #1e293b 75%)",
        }}
      >
        {Array.from({ length: 64 }).map((_, idx) => {
          const f = idx % 8;
          const r = 7 - Math.floor(idx / 8);
          const light = (f + r) % 2 === 0;
          return (
            <div
              key={idx}
              className={
                light
                  ? "bg-amber-50 relative"
                  : "bg-amber-700/85 relative"
              }
            >
              {/* corner labels for a/h and 1/8 */}
              {f === 0 && (
                <span className="absolute top-0.5 left-1 text-[9px] font-mono font-semibold opacity-60"
                  style={{ color: light ? "#92400e" : "#fef3c7" }}>
                  {r + 1}
                </span>
              )}
              {r === 0 && (
                <span className="absolute bottom-0.5 right-1 text-[9px] font-mono font-semibold opacity-60"
                  style={{ color: light ? "#92400e" : "#fef3c7" }}>
                  {"abcdefgh"[f]}
                </span>
              )}
            </div>
          );
        })}

        {/* Pieces — absolutely positioned within the board, animate with framer-motion */}
        <div className="absolute inset-0">
          {pieces.map((p) => (
            <motion.div
              key={p.id}
              initial={false}
              animate={{
                left: `${(p.file / 8) * 100}%`,
                top: `${((7 - p.rank) / 8) * 100}%`,
              }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="absolute flex items-center justify-center select-none pointer-events-none"
              style={{
                width: "12.5%",
                height: "12.5%",
                fontSize: "min(7.5vw, 44px)",
                lineHeight: 1,
                color: p.color === "w" ? "#fafaff" : "#0f172a",
                textShadow:
                  p.color === "w"
                    ? "0 1px 2px rgba(0,0,0,0.35), 0 0 1px rgba(0,0,0,0.4)"
                    : "0 1px 1px rgba(255,255,255,0.4)",
              }}
            >
              {p.glyph}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayerStrip({
  name,
  tag,
  side,
  active,
}: {
  name: string;
  tag: string;
  side: "you" | "opponent";
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-lg px-3 py-2 mb-3 last:mb-0 last:mt-3 ${
        active ? "bg-amber-50 ring-1 ring-amber-200" : "bg-ink-50"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <UserAvatar size={32} name={name} />
        <div className="leading-tight">
          <div className="text-sm font-semibold text-ink-900">{name}</div>
          <div className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">{tag}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {active && (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            thinking
          </span>
        )}
        <span className="text-[10px] font-mono text-ink-400">{side === "you" ? "WHITE" : "BLACK"}</span>
      </div>
    </div>
  );
}

function CountdownRing({ seconds, timeLeft }: { seconds: number; timeLeft: number }) {
  const r = 44;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, timeLeft / seconds);
  const offset = c - pct * c;
  return (
    <div className="relative h-28 w-28">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} stroke="#e2e8f0" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50"
          cy="50"
          r={r}
          stroke="#f59e0b"
          strokeWidth="8"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.25 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl font-semibold text-ink-900 font-mono">{timeLeft}</div>
        <div className="text-[10px] uppercase tracking-wider text-ink-500 font-medium">sec</div>
      </div>
    </div>
  );
}

function LogLine({ n, text, highlight }: { n: number; text: string; highlight?: boolean }) {
  return (
    <div className={`flex items-start gap-2 ${highlight ? "text-amber-700 font-semibold" : ""}`}>
      <span className="text-ink-400">{String(n).padStart(2, "0")}</span>
      <span>{text}</span>
    </div>
  );
}

function squareLabel(file: number, rank: number) {
  return `${"abcdefgh"[file]}${rank + 1}`;
}

/* ─────────────────────────────────────────────────────────────── */
/* Game-over modal                                                 */
/* ─────────────────────────────────────────────────────────────── */

function GameOverModal({
  open,
  winner,
  loser,
  onClaim,
  onPlayAgain,
  onPreview,
  claiming,
  error,
  onClose,
}: {
  open: boolean;
  winner: string;
  loser: string;
  onClaim: () => void;
  onPlayAgain: () => void;
  onPreview: () => void;
  claiming: boolean;
  error: string | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} dismissible={false}>
      <div className="p-7 flex flex-col items-center text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="relative h-16 w-16 rounded-full bg-amber-100 ring-8 ring-amber-50 flex items-center justify-center mb-4"
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-amber-300/30"
          />
          <Trophy className="relative h-9 w-9 text-amber-600" strokeWidth={2} />
        </motion.div>

        <h2 className="text-xl font-semibold text-ink-900">Game over</h2>
        <p className="mt-1.5 text-sm text-ink-600 max-w-xs leading-relaxed">
          <span className="font-semibold text-amber-700">{winner}</span> defeats{" "}
          <span className="font-semibold text-ink-900">{loser}</span> by checkmate.
        </p>

        <div className="mt-5 w-full grid grid-cols-2 gap-2.5">
          <ResultBox label="Winner" name={winner} highlight />
          <ResultBox label="Runner-up" name={loser} />
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-100 w-full">
            {error}
          </div>
        )}

        <div className="mt-6 w-full flex flex-col gap-2">
          <Button size="md" onClick={onClaim} loading={claiming} className="w-full bg-amber-500 hover:bg-amber-600 focus-visible:ring-amber-300">
            <Award className="h-4 w-4" />
            Claim your certificate
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button size="md" variant="outline" onClick={onPreview} className="w-full">
              <Eye className="h-4 w-4" />
              Preview
            </Button>
            <Button size="md" variant="outline" onClick={onPlayAgain} className="w-full">
              Play again
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

function ResultBox({ label, name, highlight }: { label: string; name: string; highlight?: boolean }) {
  return (
    <div
      className={`rounded-lg border px-3 py-2.5 ${
        highlight
          ? "border-amber-200 bg-amber-50/60"
          : "border-ink-200 bg-white"
      }`}
    >
      <div className={`text-[10px] uppercase tracking-wider font-semibold ${highlight ? "text-amber-700" : "text-ink-500"}`}>
        {label}
      </div>
      <div className="text-sm font-semibold text-ink-900 truncate mt-0.5">{name}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Credential preview modal — fetches templateContent & renders it */
/* ─────────────────────────────────────────────────────────────── */

function PreviewCredentialDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [template, setTemplate] = React.useState<Awaited<ReturnType<typeof getPredefinedTemplate>> | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open || template) return;
    let alive = true;
    setLoading(true);
    setError(null);
    getPredefinedTemplate(CHESS_TEMPLATE_ID)
      .then((data) => {
        if (alive) setTemplate(data);
      })
      .catch((err) => {
        if (alive) setError(err?.message ?? "Failed to load template");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, template]);

  return (
    <Dialog open={open} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Eye className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-ink-900">Credential preview</h2>
            <p className="text-xs text-ink-500 mt-0.5">
              The visual badge you&apos;ll receive when you claim — rendered
              live from the on-server template.
            </p>
          </div>
        </div>

        {/* Render container — templateContent is self-contained HTML with an iframe */}
        <div className="mt-5 rounded-xl border border-ink-200 bg-ink-50/60 overflow-hidden min-h-[480px] flex items-center justify-center">
          {loading && (
            <div className="flex flex-col items-center gap-2 text-xs text-ink-500">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              Loading template…
            </div>
          )}
          {error && !loading && (
            <div className="text-center px-4">
              <div className="text-sm font-medium text-red-700">{error}</div>
              <div className="text-xs text-ink-500 mt-1">
                Couldn&apos;t fetch the template. Check your network and try again.
              </div>
            </div>
          )}
          {template?.templateContent && !loading && !error && (
            <div
              className="w-full"
              // The backend returns a styled wrapper with an iframe srcdoc
              // already inside, so just inject it directly.
              dangerouslySetInnerHTML={{ __html: template.templateContent }}
            />
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose}>
            Close preview
          </Button>
        </div>
      </div>
    </Dialog>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/* Issuance / QR modal                                             */
/* ─────────────────────────────────────────────────────────────── */

function ChessIssuanceModal({
  open,
  invitationUrl,
  winner,
  issued,
  onClose,
  onDone,
}: {
  open: boolean;
  invitationUrl: string;
  winner: string;
  issued: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  return (
    <Dialog open={open} onClose={onClose} dismissible={false}>
      <div className="p-7 flex flex-col items-center text-center">
        <AnimatePresence mode="wait" initial={false}>
          {!issued ? (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="w-full flex flex-col items-center"
            >
              <div className="h-12 w-12 rounded-full bg-amber-100 ring-8 ring-amber-50 flex items-center justify-center mb-3">
                <Crown className="h-6 w-6 text-amber-600" />
              </div>
              <h2 className="text-lg font-semibold text-ink-900">
                Claim your Chess Competition badge
              </h2>
              <p className="mt-1.5 text-xs text-ink-500 max-w-xs">
                Open the e-idStack app on your phone and scan this QR to save
                your verifiable winner&apos;s credential.
              </p>

              <div className="mt-5 rounded-xl border-2 border-dashed border-amber-200 p-3.5 bg-amber-50/30">
                <QrPanel value={invitationUrl} />
                <div className="mt-2.5 rounded-md border border-ink-200 bg-white px-3 py-1.5 font-mono text-xs text-ink-700">
                  Winner: {winner}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
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

              <h2 className="text-xl font-semibold text-ink-900">Badge claimed!</h2>
              <p className="mt-2 text-sm text-ink-600 max-w-xs leading-relaxed">
                Your Chess Competition credential has been issued to {winner} and
                stored in your e-idStack wallet.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-emerald-800">
                  Verified · valid for 10 years
                </span>
              </div>

              <Button size="md" onClick={onDone} className="mt-6 w-full">
                Back to dashboard
                <ArrowRight className="h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Dialog>
  );
}
