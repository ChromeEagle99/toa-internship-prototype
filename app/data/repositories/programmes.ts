import { z } from "zod";

import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROGRAMME — the top of the internship data model.
 * ─────────────────────────────────────────────────────────────────────────────
 *  A Programme is a cohort shell for one education level in one year
 *  (e.g. "University 2026"). It owns many Intakes ([[intakes]]); each Intake in
 *  turn holds Projects ([[projects]]). The model and rules come from the v6 ER
 *  prototype the developer pointed us to.
 *
 *  Phase note: only the IO Admin journey (create / list programmes) is wired in
 *  the UI for now. The schema already carries everything the later slices need.
 */

/**
 * Education levels an internship can target. Shared across Programme, Project,
 * and Project Request lines so the soft match on education level is type-safe.
 *
 * ⚠️ Provisional — taken from the v6 prototype's worked examples. Confirm the
 * full set (ITE? Master's?) against the product spec before relying on it.
 */
export const EDUCATION_LEVELS = ["University", "Polytechnic", "Junior College"] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const ProgrammeSchema = z.object({
  id: z.string().min(1),
  /** The education level this cohort serves. Intakes inherit it. */
  educationLevel: z.enum(EDUCATION_LEVELS),
  /** Auto-filled by the caller (e.g. the current year) — not user-entered. */
  year: z.number().int(),
  title: z.string().min(1),
  description: z.string().default(""),
  /** Actor id that created the programme. */
  createdBy: z.string().min(1),
  /** ISO timestamp; stored as a string so it survives JSON round-trips. */
  createdAt: z.string(),
});

export type Programme = z.infer<typeof ProgrammeSchema>;

export const programmesRepository = createRepository<Programme>({
  resource: "programmes",
  schema: ProgrammeSchema,
  identify: (programme) => programme.id,
});

/** Build a new Programme. Callers still go through the repository's `create`. */
export function makeProgramme(input: {
  educationLevel: EducationLevel;
  year: number;
  title: string;
  description?: string;
  createdBy: string;
  createdAt: string;
}): Programme {
  return {
    id: newId(),
    educationLevel: input.educationLevel,
    year: input.year,
    title: input.title,
    description: input.description ?? "",
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
