import { z } from "zod";

import { EDUCATION_LEVELS } from "../education-levels";
import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT REQUEST — modelled from the Request Project UI (source of truth).
 * ─────────────────────────────────────────────────────────────────────────────
 *  An IO / IO-Admin asks a Programme Centre for internship placements. The form
 *  ("Request Project", `/project-requests/new`) builds a batch of requests; this
 *  schema is one request. Each request names its RECIPIENTS (a PC Head, an AD
 *  (P&C), a response deadline) and one or more PLACEMENT REQUIREMENTS — child
 *  "line" rows, one per education level, each carrying a requested count.
 *
 *  Field names mirror the client-side form model in
 *  `app/components/project-request/model.ts` so the wizard maps onto this schema
 *  with no renaming: `pcHead`, `adPnc`, `deadline`, and the `lines` rows
 *  (`educationLevel` + `placements`). The remaining fields are system-set at
 *  create time and are not collected from the form.
 *
 *  A request reconciles against uploaded projects softly (by PC + education
 *  level); there is no FK from a line to a project.
 *
 *  NOTE (wiring, out of scope here): the resource key "project-requests" has no
 *  entry in `access/permissions.ts`, so it is deny-by-default until a policy
 *  block is added.
 */

/** status — lifecycle of a request. System-set; the form only ever creates drafts. */
export const REQUEST_STATUSES = ["draft", "sent"] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

/**
 * One placement-requirement line — a child row, one per education level.
 * Mirrors `EducationRow` in the form model (`level` → `educationLevel`).
 */
export const RequestLineSchema = z.object({
  /** line_id — PK (line). Auto-generated per row. */
  lineId: z.string().min(1),
  /** education_level — Required; constrained to the shared canonical list. */
  educationLevel: z.enum(EDUCATION_LEVELS),
  /** placements — number of placements wanted at this level. Required, ≥ 1. */
  placements: z.number().int().min(1),
});
export type RequestLine = z.infer<typeof RequestLineSchema>;

export const ProjectRequestSchema = z.object({
  // ── RECIPIENTS (from the form) ──────────────────────────────────────────────
  /** pc_head — the Programme Centre Head the request is addressed to. Required. */
  pcHead: z.string().min(1),
  /** ad_pnc — the Assistant Director (People & Culture) copied. Required. */
  adPnc: z.string().min(1),
  /** deadline — response deadline, DATE as YYYY-MM-DD. Required. */
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected a YYYY-MM-DD date."),

  // ── PLACEMENT REQUIREMENTS (from the form) ──────────────────────────────────
  /** lines — one or more requirement rows; at least one is required. */
  lines: z.array(RequestLineSchema).min(1),

  // ── SYSTEM FIELDS (set at create time, not collected by the form) ───────────
  /** request_id — PK. */
  requestId: z.string().min(1),
  /** status — ENUM, system-set. New requests start as "draft". */
  status: z.enum(REQUEST_STATUSES).default("draft"),
  /** requested_by — FK → User (the signed-in officer). */
  requestedBy: z.string().optional(),
  /** created_at — TIMESTAMP, Auto (ISO string). */
  createdAt: z.string().optional(),
});
export type ProjectRequest = z.infer<typeof ProjectRequestSchema>;

export const projectRequestsRepository = createRepository<ProjectRequest>({
  resource: "project-requests",
  schema: ProjectRequestSchema,
  identify: (request) => request.requestId,
});

/** A minimal valid project request, for seeding the dev store. */
export function exampleProjectRequest(
  overrides: Partial<ProjectRequest> = {},
): ProjectRequest {
  return {
    pcHead: "Tan Wei Ming",
    adPnc: "Ng Shu Qi",
    deadline: "2026-03-31",
    lines: [
      { lineId: newId(), educationLevel: "University", placements: 5 },
      { lineId: newId(), educationLevel: "Polytechnic", placements: 3 },
    ],
    requestId: newId(),
    status: "draft",
    createdAt: "2026-01-10T00:00:00.000Z",
    ...overrides,
  };
}

/**
 * The demo project requests an IO has sent to Programme Centres. Stable
 * `requestId`s so re-seeding is idempotent (a second seed conflicts rather than
 * duplicating). Seed and clear these from the Dev database (`/dev/db`).
 */
export function exampleProjectRequests(): ProjectRequest[] {
  return [
    {
      requestId: "req-aisha-pjc",
      pcHead: "Aisha Rahman",
      adPnc: "Benjamin Lee",
      deadline: "2026-07-28",
      lines: [
        {
          lineId: "req-aisha-pjc-l1",
          educationLevel: "Post Junior College / Post Polytechnic",
          placements: 1,
        },
      ],
      status: "sent",
      requestedBy: "u-io",
      createdAt: "2026-07-03T00:00:00.000Z",
    },
    {
      requestId: "req-priya-ip",
      pcHead: "Priya Nair",
      adPnc: "Ng Shu Qi",
      deadline: "2026-08-31",
      lines: [
        {
          lineId: "req-priya-ip-l1",
          educationLevel: "Integrated Programme (IP)",
          placements: 1,
        },
      ],
      status: "sent",
      requestedBy: "u-io",
      createdAt: "2026-07-03T00:00:00.000Z",
    },
    {
      requestId: "req-james-uni",
      pcHead: "James Tan",
      adPnc: "Grace Wong",
      deadline: "2026-07-31",
      lines: [
        { lineId: "req-james-uni-l1", educationLevel: "University", placements: 2 },
        { lineId: "req-james-uni-l2", educationLevel: "Polytechnic", placements: 1 },
      ],
      status: "sent",
      requestedBy: "u-io",
      createdAt: "2026-07-03T00:00:00.000Z",
    },
  ];
}
