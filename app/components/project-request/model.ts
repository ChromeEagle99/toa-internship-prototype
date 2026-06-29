// Client-side model, option sets, and formatting helpers for the Create
// Project Request flow. No JSX here — pure data and pure functions.

export type SendMode = "individual" | "combined";

export interface EducationRow {
  id: string;
  level: string;
  slots: string;
}

export interface Recipient {
  id: string;
  primary: string | null;
  ccs: string[];
  ccDraft: string;
  rows: EducationRow[];
  collapsed: boolean;
}

// ── Option sets ──────────────────────────────────────────────────────────────
// Provisional pick-lists for the prototype. Swap for the real taxonomies (and a
// contacts/template repository) once they're defined.

/** Email templates: trigger shows the id, the summary shows the friendly name. */
export const EMAIL_TEMPLATES = [
  { id: "ET-001", name: "Project Request 2026" },
  { id: "ET-002", name: "Project Request — Reminder" },
  { id: "ET-003", name: "Combined Request 2026" },
] as const;

export type EmailTemplate = (typeof EMAIL_TEMPLATES)[number];

/** Programme Centre contacts a request can be addressed to. */
export const CONTACTS = [
  "DSO National Laboratories — projects@dso.org.sg",
  "Cyber Security Agency — internships@csa.gov.sg",
  "ST Engineering — talent@stengg.com",
  "GovTech — interns@tech.gov.sg",
  "Defence Science Organisation — pc@dsta.gov.sg",
] as const;

export const EDUCATION_LEVELS = [
  "Junior College",
  "Polytechnic",
  "University (Undergraduate)",
  "University (Postgraduate)",
] as const;

// ── Factories ────────────────────────────────────────────────────────────────

/** Monotonic id source — keeps React keys stable without `Date`/`Math.random`. */
let nextId = 1;
const makeId = (prefix: string) => `${prefix}-${nextId++}`;

export function emptyRow(): EducationRow {
  return { id: makeId("row"), level: "", slots: "1" };
}

export function emptyRecipient(): Recipient {
  return {
    id: makeId("rcpt"),
    primary: null,
    ccs: [],
    ccDraft: "",
    rows: [emptyRow()],
    collapsed: false,
  };
}

// ── Derived values & formatting ──────────────────────────────────────────────

/** Total slots across one recipient's education rows. */
export function recipientSlots(recipient: Recipient): number {
  return recipient.rows.reduce((sum, row) => sum + (Number(row.slots) || 0), 0);
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
