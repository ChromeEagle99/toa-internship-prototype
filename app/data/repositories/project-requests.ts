import { z } from "zod";

import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT REQUEST — the BA's agreed field model (see the data diagram).
 * ─────────────────────────────────────────────────────────────────────────────
 *  IO asks a Programme Centre (PC) for placements. A request fans out into child
 *  "line" rows — one per education level (the diagram's `line_id` is "PK (line)")
 *  — each carrying a requested count and its calculated fulfilment. The output is
 *  rendered as an email; it reconciles against projects via pc + education_level
 *  (soft match, no FK).
 *
 *  Naming + optionality conventions are documented in `programmes.ts`.
 *
 *  NOTE (wiring, out of scope here): the resource key "project-requests" has no
 *  entry in `access/permissions.ts`, so it is deny-by-default until a policy
 *  block is added.
 */

/** send_mode — one email per education level, or one combined email. */
export const SEND_MODES = ["individual", "combined"] as const;
export type SendMode = (typeof SEND_MODES)[number];

/** One requested-placements line — a child row, one per education level. */
export const RequestLineSchema = z.object({
  /** line_id — PK (line). */
  lineId: z.string().optional(),
  /** education_level — ENUM, Required; value set TBD. */
  educationLevel: z.string().min(1),
  /** placements_requested — Required. */
  placementsRequested: z.number().int().nonnegative(),
  /** placements_submitted — INT, Calculated. */
  placementsSubmitted: z.number().int().nonnegative().optional(),
  /** placements_gap — INT, Calculated (requested − submitted). */
  placementsGap: z.number().int().optional(),
});
export type RequestLine = z.infer<typeof RequestLineSchema>;

export const ProjectRequestSchema = z.object({
  // REQUEST SETUP
  /** send_mode — ENUM, Required. */
  sendMode: z.enum(SEND_MODES),
  /** email_template_id — UUID, Required (FK to an email template). */
  emailTemplateId: z.string().min(1),
  /** deadline — DATE (YYYY-MM-DD), Required. */
  deadline: z.string().min(1),

  // RECIPIENTS
  /** pc — the Programme Centre addressed. */
  pc: z.string().min(1),
  /** head_name — Derived from the PC. */
  headName: z.string().optional(),
  /** cc_recipients — UUID[], Optional. */
  ccRecipients: z.array(z.string()).optional(),

  // REQUESTED PLACEMENTS — repeating child line rows.
  lines: z.array(RequestLineSchema),

  // SYSTEM FIELDS
  /** request_id — PK. */
  requestId: z.string().min(1),
  /** upload_token — VARCHAR, Auto. */
  uploadToken: z.string().optional(),
  /** sender_name — VARCHAR, Auto. */
  senderName: z.string().optional(),
  /** sent_date — DATE, Auto. */
  sentDate: z.string().optional(),
  /** status — ENUM, System-set; value set TBD. */
  status: z.string().optional(),
  /** created_count — INT, Calculated. */
  createdCount: z.number().int().nonnegative().optional(),
  /** uploaded_count — INT, Calculated. */
  uploadedCount: z.number().int().nonnegative().optional(),
  /** requested_by — FK → User. */
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
    sendMode: "individual",
    emailTemplateId: "ET-001",
    deadline: "2026-03-31",
    pc: "DSO National Laboratories",
    headName: "Dr Tan Kok",
    ccRecipients: [],
    lines: [
      {
        lineId: newId(),
        educationLevel: "University (Undergraduate)",
        placementsRequested: 5,
        placementsSubmitted: 0,
        placementsGap: 5,
      },
      {
        lineId: newId(),
        educationLevel: "Polytechnic",
        placementsRequested: 3,
        placementsSubmitted: 0,
        placementsGap: 3,
      },
    ],
    requestId: newId(),
    status: "draft",
    createdCount: 2,
    uploadedCount: 0,
    createdAt: "2026-01-10T00:00:00.000Z",
    ...overrides,
  };
}
