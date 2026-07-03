// Client-side model, option sets, and formatting helpers for the Request Project
// flow. No JSX here — pure data and pure functions.
//
// The flow builds a batch of *requests*: each request names a PC Head and an
// AD (P&C) to address, a response deadline, and one or more placement
// requirements (an education level and the number of placements wanted).

export interface EducationRow {
  id: string;
  level: string;
  /** Number of placements wanted at this education level. */
  placements: number;
}

export interface RequestItem {
  id: string;
  /** Programme Centre Head the request is addressed to. */
  pcHead: string | null;
  /** Assistant Director (People & Culture) copied on the request. */
  adPnc: string | null;
  /** When the recipients' response is due. */
  deadline?: Date;
  rows: EducationRow[];
  /** Whether the request's detail panel is collapsed in the list. */
  collapsed: boolean;
  /** Whether the request is ticked for a bulk action. */
  selected: boolean;
}

// ── Option sets ──────────────────────────────────────────────────────────────
// Provisional pick-lists for the prototype. Swap for the real directories once a
// contacts repository exists.

/** Programme Centre Heads a request can be addressed to. */
export const PC_HEADS = [
  "Tan Wei Ming",
  "Priya Nair",
  "Daniel Koh",
  "Siti Rahman",
  "Marcus Tan",
] as const;

/** Assistant Directors (People & Culture) a request can copy. */
export const AD_PNC = [
  "Ng Shu Qi",
  "Benjamin Lee",
  "Farah Ismail",
  "Kelvin Ong",
  "Grace Wong",
] as const;

// Education levels are a product-wide constant — see `~/data`.
export { EDUCATION_LEVELS, type EducationLevel } from "~/data";

// ── Factories ────────────────────────────────────────────────────────────────

/** Monotonic id source — keeps React keys stable without `Date`/`Math.random`. */
let nextId = 1;
const makeId = (prefix: string) => `${prefix}-${nextId++}`;

export function emptyRow(): EducationRow {
  return { id: makeId("row"), level: "", placements: 1 };
}

export function emptyRequest(): RequestItem {
  return {
    id: makeId("req"),
    pcHead: null,
    adPnc: null,
    deadline: undefined,
    rows: [emptyRow()],
    collapsed: false,
    selected: false,
  };
}

// ── Email preview ────────────────────────────────────────────────────────────
// The Review step previews the email each recipient will receive. Kept here as
// pure helpers so the copy and the derived fields live beside the model.

/** Identity used in the email sign-off — the signed-in officer. */
export interface Sender {
  name: string;
  /** Role line, e.g. "Internship Officer, DSTA". */
  role: string;
}

/** Subject line for a request's email, keyed to its education levels. */
export function emailSubject(request: RequestItem): string {
  const levels = request.rows.map((r) => r.level).filter(Boolean);
  const focus = levels.length > 0 ? levels.join(", ") : "Internship Placements";
  return `[DSTA] Project Request – ${focus}`;
}

/** The dedicated upload link a recipient uses to submit projects (placeholder). */
export function uploadLink(request: RequestItem): string {
  return `https://toaproject.vercel.app/upload/${request.id}`;
}

// ── Derived values & formatting ──────────────────────────────────────────────

/** Total placements across one request's education rows. */
export function requestSlots(request: RequestItem): number {
  return request.rows.reduce((sum, row) => sum + (row.placements || 0), 0);
}

/** A request is ready to send once its recipients, deadline, and every row are set. */
export function isRequestReady(request: RequestItem): boolean {
  return Boolean(
    request.pcHead &&
      request.adPnc &&
      request.deadline &&
      request.rows.length > 0 &&
      request.rows.every((row) => row.level && row.placements >= 1),
  );
}

/**
 * The label shown on a collapsed request row. Falls back to a muted prompt while
 * the request is still empty.
 */
export function requestSummary(request: RequestItem): string | null {
  if (!request.pcHead && !request.adPnc && !request.deadline) return null;
  const slots = requestSlots(request);
  const parts = [request.pcHead ?? "No PC Head"];
  parts.push(`${slots} placement${slots === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

/** A readable date, e.g. "10 Jul 2026". */
export function formatDate(date?: Date): string | undefined {
  return date?.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Midnight today — the boundary for "no deadline in the past". */
export function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
