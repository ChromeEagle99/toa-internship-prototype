import { z } from "zod";

import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECTS — a simple example schema. Subject to change.
 * ─────────────────────────────────────────────────────────────────────────────
 *  This models the END of the project lifecycle: the live, approved ProjectEntry
 *  that applicants are matched against. The earlier stages —
 *
 *      ProjectRequest  →  ProjectSubmissionBatch { SubmittedProject[] }  →  ProjectEntry
 *      (IO asks a PC)     (PC uploads, IO/DCE reviews)                     (this entity)
 *
 *  — plus the Programme Centre models (PCEntry / PCProgramme) are intentionally
 *  left out of this first cut; add them as their own repositories when needed.
 */

export const PROJECT_STATUSES = ["confirmed", "in-progress", "open"] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

/** A period a project cannot host an intern (e.g. lab shutdown). Dates YYYY-MM-DD. */
export const BlackoutPeriodSchema = z.object({
  start: z.string(),
  end: z.string(),
});
export type BlackoutPeriod = z.infer<typeof BlackoutPeriodSchema>;

export const ProjectEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  /** The Programme this project belongs to. */
  programmeId: z.string().optional(),
  /** The Programme Centre hosting it. */
  pc: z.string().optional(),

  slots: z.number().int().nonnegative(),
  matched: z.number().int().nonnegative(),
  status: z.enum(PROJECT_STATUSES),
  archived: z.boolean().optional(),

  // Availability-matching fields.
  minDurationWeeks: z.number().int().positive().optional(),
  blackoutPeriods: z.array(BlackoutPeriodSchema).optional(),
});
export type ProjectEntry = z.infer<typeof ProjectEntrySchema>;

export const projectsRepository = createRepository<ProjectEntry>({
  resource: "projects",
  schema: ProjectEntrySchema,
  identify: (project) => project.id,
});

/** A minimal valid live project, for seeding the dev store. */
export function exampleProject(overrides: Partial<ProjectEntry> = {}): ProjectEntry {
  return {
    id: newId(),
    title: "Acoustic signal classification with ML",
    pc: "DSO National Laboratories",
    slots: 3,
    matched: 1,
    status: "open",
    minDurationWeeks: 8,
    blackoutPeriods: [{ start: "2026-07-01", end: "2026-07-07" }],
    ...overrides,
  };
}
