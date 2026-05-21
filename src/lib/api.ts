/**
 * Thin client over the StudentPortal credential backend.
 *
 * Real endpoint contract (sample curl from Polyversity):
 *
 *   POST /api/v1/issuance/oob-offer
 *   Headers: x-tenant-id, Content-Type: application/json
 *   Body: {
 *     credentialDefinitionId, issuerId, attributes: { name, degree, year, university },
 *     autoAcceptCredential, comment, documentKey
 *   }
 *
 *   POST /api/v1/verification/createproofRequest  — same headers, similar shape
 *   GET  /api/v1/verification/proofStatus?requestId=…
 *
 * Response shapes are normalized defensively (invitationUrl / invitation_url / etc).
 */
import {
  API_BASE_URL,
  API_PATHS,
  CRED_DEF_ID,
  ISSUER_ID,
  TENANT_ID,
} from "./config";

/**
 * Attributes that go INTO the verifiable credential.
 * Must match the on-ledger `studentportal/1.0` schema exactly (5 attributes).
 *   - full_name, email, student_id, department, date_of_birth
 */
export type StudentAttributes = {
  full_name: string;
  email: string;
  student_id: string;
  department: string;
  date_of_birth: string;
};

export type QrSession = {
  invitationUrl: string;
  requestId: string;
  raw: unknown;
};

export type ProofState =
  | "request-sent"
  | "offer-sent"
  | "credential-issued"
  | "presentation-received"
  | "verified"
  | "done"
  | "abandoned"
  | "expired"
  | "pending"
  | "unknown";

export type ProofStatus = {
  state: ProofState;
  attributes?: Partial<StudentAttributes> & Record<string, string | undefined>;
  raw: unknown;
};

function headers(): HeadersInit {
  const h: Record<string, string> = {
    "Content-Type": "application/json",
    accept: "*/*",
  };
  if (TENANT_ID) h["x-tenant-id"] = TENANT_ID;
  return h;
}

function pickInvitationUrl(payload: any): string {
  // Polyversity wraps everything in `data`. Prefer shortUrl (much smaller QR)
  // and fall back to the full invitationUrl if shortUrl isn't returned.
  return (
    payload?.data?.shortUrl ??
    payload?.data?.invitationUrl ??
    payload?.shortUrl ??
    payload?.invitationUrl ??
    payload?.invitation_url ??
    payload?.oobUrl ??
    payload?.url ??
    payload?.invitation?.url ??
    ""
  );
}

function pickRequestId(payload: any): string {
  // Issuance puts the ID at `data.credentialExchange.id` (nested record),
  // while verify returns `data.proofRecordId` directly. Check both shapes.
  return (
    payload?.data?.credentialExchange?.id ??
    payload?.data?.credentialExchangeId ??
    payload?.data?.proofRecordId ??
    payload?.data?.outOfBandId ??
    payload?.data?.requestId ??
    payload?.data?.id ??
    payload?.credentialExchange?.id ??
    payload?.credentialExchangeId ??
    payload?.proofRecordId ??
    payload?.outOfBandId ??
    payload?.requestId ??
    payload?.threadId ??
    payload?.id ??
    ""
  );
}

async function parseError(res: Response, fallback: string): Promise<string> {
  try {
    const data = await res.json();
    const msg = data?.message;
    if (Array.isArray(msg)) return msg.join(", ");
    if (typeof msg === "string") return msg;
    return `${fallback} (${res.status})`;
  } catch {
    return `${fallback} (${res.status})`;
  }
}

/**
 * Polyversity returns credential attributes as either an object map or an
 * array of `{name, value}` pairs (the latter is the Aries on-the-wire shape).
 * Normalize to a flat `{key: value}` object so downstream consumers can do
 * `attrs.full_name` regardless of which form arrived.
 */
function normalizeAttributes(raw: any): Record<string, string> | undefined {
  if (!raw) return undefined;
  if (Array.isArray(raw)) {
    const out: Record<string, string> = {};
    for (const item of raw) {
      if (item && typeof item === "object" && "name" in item) {
        out[String(item.name)] = String(item.value ?? "");
      }
    }
    return out;
  }
  if (typeof raw === "object") return raw as Record<string, string>;
  return undefined;
}

function normalizeState(raw: any): ProofState {
  const s = String(raw ?? "").toLowerCase();
  if (!s) return "unknown";
  if (s.includes("done") || s.includes("complete")) return "done";
  if (s.includes("verified")) return "verified";
  if (s.includes("presentation-received") || s.includes("presentation_received"))
    return "presentation-received";
  if (s.includes("credential-issued") || s.includes("issued"))
    return "credential-issued";
  if (s.includes("offer")) return "offer-sent";
  if (s.includes("request")) return "request-sent";
  if (s.includes("abandon")) return "abandoned";
  if (s.includes("expire")) return "expired";
  return "pending";
}

export async function createIssuanceOffer(
  attrs: StudentAttributes,
  opts?: { comment?: string; documentKey?: string }
): Promise<QrSession> {
  const body = {
    credentialDefinitionId: CRED_DEF_ID,
    ...(ISSUER_ID ? { issuerId: ISSUER_ID } : {}),
    attributes: attrs,
    autoAcceptCredential: true,
    comment: opts?.comment ?? "StudentPortal student credential",
    ...(opts?.documentKey ? { documentKey: opts.documentKey } : {}),
  };

  const res = await fetch(`${API_BASE_URL}${API_PATHS.oobOffer}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(await parseError(res, "Issuance failed"));
  }

  const data = await res.json();
  return {
    invitationUrl: pickInvitationUrl(data),
    requestId: pickRequestId(data),
    raw: data,
  };
}

/**
 * Polyversity verify shape (reverse-engineered from live backend):
 *   { credDefId, attributes: [{ name: "..." }, ...] }
 * Returns: { data: { invitationUrl, shortUrl, proofRecordId, state } }
 */
export async function createProofRequest(): Promise<QrSession> {
  const body = {
    credDefId: CRED_DEF_ID,
    attributes: [
      { name: "full_name" },
      { name: "email" },
      { name: "student_id" },
      { name: "department" },
      { name: "date_of_birth" },
    ],
  };

  const res = await fetch(
    `${API_BASE_URL}${API_PATHS.createProofRequest}`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(await parseError(res, "Proof request failed"));
  }

  const data = await res.json();
  return {
    invitationUrl: pickInvitationUrl(data),
    requestId: pickRequestId(data),
    raw: data,
  };
}

/**
 * Fetch a predefined template (e.g. the Chess Competition badge, id 91).
 * Returns the raw `data` object — most importantly `templateContent`,
 * a self-contained HTML snippet with the visual badge preview.
 */
export type PredefinedTemplate = {
  id: number;
  templateName: string;
  templateContent: string;
  documentKey?: string;
  credDefId?: string;
  schemaId?: string;
  issuerDid?: string;
  credentialType?: string;
  params?: { fields?: string[]; required?: string[] };
};

export async function getPredefinedTemplate(
  id: string | number
): Promise<PredefinedTemplate> {
  const res = await fetch(
    `${API_BASE_URL}/api/v1/predefined-templates/${id}`,
    { headers: headers() }
  );
  if (!res.ok) {
    throw new Error(await parseError(res, "Template fetch failed"));
  }
  const data = await res.json();
  return (data?.data ?? data) as PredefinedTemplate;
}

/** Chess credential attributes — match the SkillBadges/1.1 schema bound to template #91. */
export type ChessAttributes = {
  nameOfPerson: string;
  nameOfCourse: string;
  dateOfIssuance: string;
  placeOfIssuance: string;
  issuerName: string;
  expiresAt: string;
};

const CHESS_TEMPLATE_ID = "91";
const CHESS_DOCUMENT_KEY =
  "e-id-templates/3a0152d8-87f7-4430-b4a9-89155ab13499-badge-3.html";
const CHESS_ISSUER_DID = "did:indy:bcovrin:test:X4CgTcYWAxYCUJyfpPT5ck";

/**
 * Issue the Chess Competition (skill-badge) credential via the predefined
 * template endpoint.
 *
 *   POST /api/v1/predefined-templates/91/issue-oob
 *   Header: x-tenant-id
 *
 * Body shape per Polyversity sample — issuerId is the schema/template author
 * DID (not the StudentPortal NEXT_PUBLIC_ISSUER_ID).
 */
export async function createChessOffer(
  attrs: ChessAttributes
): Promise<QrSession> {
  const body = {
    attributes: attrs,
    autoAcceptCredential: true,
    comment: "",
    documentKey: CHESS_DOCUMENT_KEY,
    issuerId: CHESS_ISSUER_DID,
  };

  const res = await fetch(
    `${API_BASE_URL}/api/v1/predefined-templates/${CHESS_TEMPLATE_ID}/issue-oob`,
    {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    throw new Error(await parseError(res, "Chess credential issuance failed"));
  }

  const data = await res.json();
  return {
    invitationUrl: pickInvitationUrl(data),
    requestId: pickRequestId(data),
    raw: data,
  };
}

/**
 * Issuance status — hit after the wallet has scanned the OOB QR to see whether
 * the credential exchange has progressed (offer-sent → request-received →
 * credential-issued → done).
 *
 * Endpoint: GET /api/v1/issuance/offerStatus?credentialExchangeId=…
 * Header:   x-tenant-id
 */
export async function getOfferStatus(
  credentialExchangeId: string
): Promise<ProofStatus> {
  const url = new URL(`${API_BASE_URL}${API_PATHS.offerStatus}`);
  url.searchParams.set("credentialExchangeId", credentialExchangeId);

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) {
    throw new Error(await parseError(res, "Offer status check failed"));
  }

  const data = await res.json();
  const stateRaw =
    data?.data?.state ??
    data?.data?.status ??
    data?.state ??
    data?.status;

  const attrsRaw =
    data?.data?.credentialAttributes ??
    data?.data?.attributes ??
    data?.credentialAttributes ??
    data?.attributes ??
    undefined;

  return {
    state: normalizeState(stateRaw),
    attributes: normalizeAttributes(attrsRaw),
    raw: data,
  };
}

export async function getProofStatus(requestId: string): Promise<ProofStatus> {
  const url = new URL(`${API_BASE_URL}${API_PATHS.proofStatus}`);
  url.searchParams.set("proofRecordId", requestId);

  const res = await fetch(url.toString(), { headers: headers() });
  if (!res.ok) {
    throw new Error(await parseError(res, "Status check failed"));
  }

  const data = await res.json();
  const stateRaw =
    data?.data?.state ??
    data?.data?.status ??
    data?.state ??
    data?.status;

  const attrsRaw =
    data?.data?.revealedAttributes ??
    data?.data?.attributes ??
    data?.revealedAttributes ??
    data?.attributes ??
    undefined;

  return {
    state: normalizeState(stateRaw),
    attributes: normalizeAttributes(attrsRaw),
    raw: data,
  };
}

export function isTerminalSuccess(state: ProofState) {
  return state === "done" || state === "verified" || state === "credential-issued";
}

export function isTerminalFailure(state: ProofState) {
  return state === "abandoned" || state === "expired";
}
