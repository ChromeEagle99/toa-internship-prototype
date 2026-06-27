import { z } from "zod";

import { createRepository, newId } from "../repository";
import { EDUCATION_LEVELS } from "./programmes";
import type { Project } from "./projects";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PROJECT REQUEST — an IO Admin's ask to a Programme Centre for placements.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Raised per Programme Centre (pc_code) with one line per education level
 *  ("3 University, 2 Polytechnic"). AD (P&C) then submits [[projects|Projects]]
 *  back. Fulfilment is RECONCILED, not stored: there is no foreign key between a
 *  request and its projects — they soft-match on pc_code + education level.
 *  `fulfilmentFor` computes it on demand. A Project Request has no real
 *  relationship to a Programme (incidental — they merely share a level + year).
 */

export const ProjectRequestLineSchema = z.object({
  educationLevel: z.enum(EDUCATION_LEVELS),
  placementsRequested: z.number().int().positive(),
});
export type ProjectRequestLine = z.infer<typeof ProjectRequestLineSchema>;

export const ProjectRequestSchema = z.object({
  id: z.string().min(1),
  pcCode: z.string().min(1),
  /** Recipients (PC Head) and CC (AD P&C) — stored as emails/identifiers. */
  toRecipients: z.array(z.string()).default([]),
  ccRecipients: z.array(z.string()).default([]),
  /** One line per education level requested. */
  lines: z.array(ProjectRequestLineSchema).min(1),
  /** Auto-filled by the caller (e.g. the current year). */
  year: z.number().int(),
  createdBy: z.string().min(1),
  createdAt: z.string(),
});

export type ProjectRequest = z.infer<typeof ProjectRequestSchema>;

export const projectRequestsRepository = createRepository<ProjectRequest>({
  resource: "project-requests",
  schema: ProjectRequestSchema,
  identify: (request) => request.id,
});

export type LineFulfilment = {
  educationLevel: ProjectRequestLine["educationLevel"];
  requested: number;
  submitted: number;
  gap: number;
  status: "pending" | "shortfall" | "fulfilled" | "over-allocated";
};

/**
 * Reconcile a request against the project pool — the soft match. For each line,
 * sum the placements of projects sharing the request's pc_code and that line's
 * education level, then classify. No FK is involved; this is derived data.
 */
export function fulfilmentFor(request: ProjectRequest, projects: Project[]): LineFulfilment[] {
  return request.lines.map((line) => {
    const submitted = projects
      .filter((p) => p.pcCode === request.pcCode && p.educationLevel === line.educationLevel)
      .reduce((sum, p) => sum + p.placements, 0);
    const requested = line.placementsRequested;
    const gap = requested - submitted;
    let status: LineFulfilment["status"];
    if (submitted === 0) status = "pending";
    else if (submitted < requested) status = "shortfall";
    else if (submitted === requested) status = "fulfilled";
    else status = "over-allocated";
    return { educationLevel: line.educationLevel, requested, submitted, gap, status };
  });
}

/** Build a new Project Request. Callers still go through the repository's `create`. */
export function makeProjectRequest(input: {
  pcCode: string;
  toRecipients?: string[];
  ccRecipients?: string[];
  lines: ProjectRequestLine[];
  year: number;
  createdBy: string;
  createdAt: string;
}): ProjectRequest {
  return {
    id: newId(),
    pcCode: input.pcCode,
    toRecipients: input.toRecipients ?? [],
    ccRecipients: input.ccRecipients ?? [],
    lines: input.lines,
    year: input.year,
    createdBy: input.createdBy,
    createdAt: input.createdAt,
  };
}
