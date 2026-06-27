import { z } from "zod";

import { createRepository, newId } from "../repository";
import { EDUCATION_LEVELS } from "./programmes";
import type { Intake } from "./intakes";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT — a placement opportunity submitted by an AD (P&C).
 * ─────────────────────────────────────────────────────────────────────────────
 *  Projects are submitted against a [[project-requests|Project Request]] (soft
 *  matched on pc_code + education level — there is NO foreign key between them),
 *  reviewed by an IO Admin, and once Approved may be attached to an
 *  [[intakes|Intake]] (`intakeId`, nullable: a project starts in the pool with
 *  `intakeId = null`). The attach rule lives in `attachableToIntake` below.
 */

export const PROJECT_REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export type ProjectReviewStatus = (typeof PROJECT_REVIEW_STATUSES)[number];

export const ProjectSchema = z.object({
  id: z.string().min(1),
  /** Nullable FK → Intake.id. Null = approved-but-unattached (the pool). */
  intakeId: z.string().nullable(),
  /** Programme Centre code (e.g. "PC11"). Soft-matches the request. */
  pcCode: z.string().min(1),
  educationLevel: z.enum(EDUCATION_LEVELS),
  title: z.string().min(1),
  scope: z.string().default(""),
  /** Headcount this project can host. */
  placements: z.number().int().nonnegative(),
  /** Internship period (ISO dates). Used by the attach rule. */
  internshipStart: z.string(),
  internshipEnd: z.string(),
  /** Length the intern stays — entered manually, not derived from the period. */
  durationMonths: z.number().int().positive(),
  mentorName: z.string().min(1),
  mentorEmail: z.string().default(""),
  /** Matching tags (disciplines / skills / domains) for later applicant matching. */
  matchingTags: z.array(z.string()).default([]),
  /** Set by the IO Admin during review. AD (P&C) submissions start "pending". */
  reviewStatus: z.enum(PROJECT_REVIEW_STATUSES).default("pending"),
  /** Actor id of the AD (P&C) who submitted it. */
  createdBy: z.string().min(1),
  createdAt: z.string(),
});

export type Project = z.infer<typeof ProjectSchema>;

export const projectsRepository = createRepository<Project>({
  resource: "projects",
  schema: ProjectSchema,
  identify: (project) => project.id,
});

/**
 * The attach rule, as a pure predicate (NOT enforced by the repository — the IO
 * Admin's attach UI calls it). A Project may be attached to an Intake only when:
 *   ① education level matches, ② review status is Approved, and ③ the project's
 *   internship period falls within the intake's period.
 */
export function attachableToIntake(project: Project, intake: Intake): boolean {
  return (
    project.reviewStatus === "approved" &&
    project.internshipStart >= intake.internshipStart &&
    project.internshipEnd <= intake.internshipEnd
    // education-level match is checked by the caller against the intake's
    // programme, since the level lives on the Programme, not the Intake.
  );
}

/** Build a new pending Project. Callers still go through the repository's `create`. */
export function makeProject(input: {
  pcCode: string;
  educationLevel: (typeof EDUCATION_LEVELS)[number];
  title: string;
  scope?: string;
  placements: number;
  internshipStart: string;
  internshipEnd: string;
  durationMonths: number;
  mentorName: string;
  mentorEmail?: string;
  matchingTags?: string[];
  createdBy: string;
  createdAt: string;
}): Project {
  return {
    id: newId(),
    intakeId: null,
    pcCode: input.pcCode,
    educationLevel: input.educationLevel,
    title: input.title,
    scope: input.scope ?? "",
    placements: input.placements,
    internshipStart: input.internshipStart,
    internshipEnd: input.internshipEnd,
    durationMonths: input.durationMonths,
    mentorName: input.mentorName,
    mentorEmail: input.mentorEmail ?? "",
    matchingTags: input.matchingTags ?? [],
    reviewStatus: "pending",
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
