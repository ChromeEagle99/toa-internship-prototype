import { z } from "zod";

import { createRepository, newId } from "../repository";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROGRAMMES — a simple example schema. Subject to change.
 * ─────────────────────────────────────────────────────────────────────────────
 *  A Programme is an offering applicants apply to. It carries an eligibility tree
 *  (the `requirements` below) and either legacy single-window dates OR the newer
 *  multi-intake model (`intakeWindows`).
 *
 *  Faithful to the shape sketched out, but deliberately lenient: most display /
 *  derived fields are optional so partial records still validate while the model
 *  settles. Tighten as the real spec firms up.
 */

export const PROG_CATEGORIES = [
  "JC",
  "Post-JC",
  "Poly",
  "Post-Poly",
  "University",
  "YDSP",
] as const;
export type ProgCategory = (typeof PROG_CATEGORIES)[number];

export const PROG_STATUSES = ["Draft", "Active", "Completed"] as const;
export type ProgStatus = (typeof PROG_STATUSES)[number];

/** A single eligibility check. `value` is one value or a list, per the rule type. */
export const CriteriaRuleSchema = z.object({
  type: z.string(),
  operator: z.string(),
  value: z.union([z.string(), z.array(z.string())]),
  gradeValue: z.string().optional(),
  institutions: z.array(z.string()).optional(),
});
export type CriteriaRule = z.infer<typeof CriteriaRuleSchema>;

/** An OR-branch: any pathway whose rules all pass satisfies an ANY group. */
export const CriteriaPathwaySchema = z.object({
  rules: z.array(CriteriaRuleSchema),
});
export type CriteriaPathway = z.infer<typeof CriteriaPathwaySchema>;

/**
 * One node of the eligibility tree. `ALL` uses `rules` (every rule must pass);
 * `ANY` uses `pathways` (at least one pathway must pass). Groups are AND'd.
 */
export const CriteriaGroupSchema = z.object({
  matchType: z.enum(["ALL", "ANY"]),
  rules: z.array(CriteriaRuleSchema).optional(),
  pathways: z.array(CriteriaPathwaySchema).optional(),
});
export type CriteriaGroup = z.infer<typeof CriteriaGroupSchema>;

/** A single application intake; a programme may run several. Dates are YYYY-MM-DD. */
export const IntakeWindowSchema = z.object({
  appOpen: z.string(),
  appClose: z.string(),
  start: z.string(),
  end: z.string(),
  capacity: z.number().int().nonnegative().optional(),
});
export type IntakeWindow = z.infer<typeof IntakeWindowSchema>;

export const ProgrammeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.array(z.enum(PROG_CATEGORIES)),
  status: z.enum(PROG_STATUSES),
  num: z.number(),

  // Legacy single-window dates (YYYY-MM-DD). Optional: newer programmes use
  // `intakeWindows` instead.
  appOpen: z.string().optional(),
  appDeadline: z.string().optional(),
  start: z.string().optional(),
  end: z.string().optional(),

  // Display / derived.
  timeline: z.string().optional(),
  daysLeft: z.number().optional(),

  description: z.string().optional(),
  formTemplate: z.string().optional(),
  capacity: z.number().int().nonnegative().optional(),

  /** The eligibility criteria. Groups are AND'd together. */
  requirements: z.array(CriteriaGroupSchema),
  /** Newer multi-intake model; present instead of the legacy single window. */
  intakeWindows: z.array(IntakeWindowSchema).optional(),
});
export type Programme = z.infer<typeof ProgrammeSchema>;

export const programmesRepository = createRepository<Programme>({
  resource: "programmes",
  schema: ProgrammeSchema,
  identify: (programme) => programme.id,
});

/** A minimal valid programme, for seeding the dev store. */
export function exampleProgramme(overrides: Partial<Programme> = {}): Programme {
  return {
    id: newId(),
    title: "YDSP Research Attachment",
    category: ["University", "YDSP"],
    status: "Active",
    num: 1,
    appOpen: "2026-01-01",
    appDeadline: "2026-03-31",
    start: "2026-06-01",
    end: "2026-08-31",
    description: "An eight-week research attachment under the Young Defence Scientists Programme.",
    capacity: 20,
    requirements: [
      {
        matchType: "ALL",
        rules: [{ type: "education_level", operator: "is", value: "University" }],
      },
      {
        matchType: "ANY",
        pathways: [
          { rules: [{ type: "citizenship", operator: "is", value: "Singapore Citizen" }] },
          { rules: [{ type: "citizenship", operator: "is", value: "PR" }] },
        ],
      },
    ],
    ...overrides,
  };
}
