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

/**
 * ⚠️ PROVISIONAL matching vocabularies. The v6 spec mandates "predefined lists
 * for consistent matching" for discipline_of_study / skills / tech_domain /
 * emerging_areas but does NOT enumerate them. These are placeholder values —
 * replace with the canonical lists once the developer supplies them.
 */
export const DISCIPLINES = [
  "Computer Science",
  "Computer Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Data Science",
  "Mathematics",
  "Business",
] as const;
export type Discipline = (typeof DISCIPLINES)[number];

export const SKILLS = [
  "Python",
  "C++",
  "Java",
  "JavaScript",
  "Machine Learning",
  "Data Engineering",
  "Cloud",
  "Cybersecurity",
  "Robotics",
  "UI/UX",
] as const;
export type Skill = (typeof SKILLS)[number];

export const TECH_DOMAINS = [
  "Software",
  "Data & AI",
  "Cybersecurity",
  "Robotics",
  "Cloud & Infrastructure",
  "Networks",
  "Hardware",
] as const;
export type TechDomain = (typeof TECH_DOMAINS)[number];

export const EMERGING_AREAS = [
  "Artificial Intelligence",
  "Quantum",
  "Autonomy",
  "Cyber",
  "Space",
] as const;
export type EmergingArea = (typeof EMERGING_AREAS)[number];

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
  mentorDesignation: z.string().default(""),
  /** Optional free-text mentor blurb (v6 mentor_writeup). */
  mentorWriteup: z.string().default(""),
  /**
   * Structured matching tags (v6) — replace the old free-form `matchingTags`.
   * All defaulted so pre-existing stored rows still parse; the single-selects are
   * nullable until set (the spec marks them Required at the form layer).
   */
  disciplineOfStudy: z.array(z.enum(DISCIPLINES)).default([]),
  skills: z.array(z.enum(SKILLS)).default([]),
  techDomain: z.enum(TECH_DOMAINS).nullable().default(null),
  emergingAreas: z.enum(EMERGING_AREAS).nullable().default(null),
  /** Set by the IO Admin during review. AD (P&C) submissions start "pending". */
  reviewStatus: z.enum(PROJECT_REVIEW_STATUSES).default("pending"),
  /** Actor id of the IO Admin who reviewed it (v6 reviewed_by). Null until reviewed. */
  reviewedBy: z.string().nullable().default(null),
  /** Actor id of the AD (P&C) who submitted it (v6 submitted_by). */
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
  mentorDesignation?: string;
  mentorWriteup?: string;
  disciplineOfStudy?: Discipline[];
  skills?: Skill[];
  techDomain?: TechDomain | null;
  emergingAreas?: EmergingArea | null;
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
    mentorDesignation: input.mentorDesignation ?? "",
    mentorWriteup: input.mentorWriteup ?? "",
    disciplineOfStudy: input.disciplineOfStudy ?? [],
    skills: input.skills ?? [],
    techDomain: input.techDomain ?? null,
    emergingAreas: input.emergingAreas ?? null,
    reviewStatus: "pending",
    reviewedBy: null,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
