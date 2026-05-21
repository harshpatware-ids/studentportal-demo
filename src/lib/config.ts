/**
 * Backend configuration for StudentPortal credential APIs.
 * Override via .env.local: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_CRED_DEF_ID, NEXT_PUBLIC_SCHEMA_ID, NEXT_PUBLIC_TENANT_ID
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://e-idstack-multitenant.polyversity.io";

export const CRED_DEF_ID = process.env.NEXT_PUBLIC_CRED_DEF_ID ?? "";
export const SCHEMA_ID = process.env.NEXT_PUBLIC_SCHEMA_ID ?? "";
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID ?? "";
export const ISSUER_ID = process.env.NEXT_PUBLIC_ISSUER_ID ?? "";

export const API_PATHS = {
  oobOffer: "/api/v1/issuance/oob-offer",
  offerStatus: "/api/v1/issuance/offerStatus",
  createProofRequest: "/api/v1/verification/createproofRequest",
  proofStatus: "/api/v1/verification/proofStatus",
} as const;

/** Polling cadence for status endpoints (ms). */
export const POLL_INTERVAL_MS = 1500;
/** QR session refresh (seconds) — 3 minutes before the QR auto-rotates. */
export const QR_REFRESH_SECONDS = 180;
/** Hard timeout for waiting on a scan (ms). */
export const QR_WAIT_TIMEOUT_MS = 5 * 60 * 1000;
