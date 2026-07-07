import type { Project, ProjectRequest } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Request ↔ Project reconciliation.
 * ─────────────────────────────────────────────────────────────────────────────
 *  A project carries NO foreign key to a project request (the BA's data model —
 *  see `data/repositories/projects.ts`). Fulfilment is therefore a SOFT match:
 *  a project counts toward a request when
 *
 *    1. it was submitted by the AD (P&C) the request is addressed to
 *       (`project.submittedByEmail` === `request.adPncEmail`), and
 *    2. its education level is one the request asked for.
 *
 *  This is what lets the received-requests list and the respond page show real
 *  "N of M placements submitted" progress instead of a hardcoded zero. It's the
 *  same email/level relation the rest of the flow reconciles on; tighten it to a
 *  real submission FK if the model ever grows one.
 *
 *  Caveat (acceptable for the prototype): two requests addressed to the same AD
 *  that share an education level will both count a matching project. Distinct
 *  levels per request — the common case — reconcile cleanly.
 */

/** One project counted against a request, flattened for display. */
export interface SubmittedProject {
  projectId: string;
  title: string;
  educationLevel: string;
  /** Placements this project offers. */
  placements: number;
}

export interface RequestFulfilment {
  /** The projects matched to the request, most-recent-first where known. */
  projects: SubmittedProject[];
  /** Placements offered across those projects. */
  placementsSubmitted: number;
  /** Placements the request asked for, across every line. */
  placementsNeeded: number;
  /** Whether the request's placement need is fully met. */
  fulfilled: boolean;
}

/** Reconcile one request against the full project list the caller can see. */
export function fulfilmentFor(
  request: ProjectRequest,
  projects: Project[],
): RequestFulfilment {
  const levels = new Set<string>(request.lines.map((line) => line.educationLevel));
  const addressedTo = request.adPncEmail?.toLowerCase();

  const matched = projects.filter((project) => {
    if (!levels.has(project.educationLevel)) return false;
    // Tie the project to the AD the request is addressed to. Fall back to "any
    // submitter" only when the request predates email capture.
    if (!addressedTo) return true;
    return project.submittedByEmail?.toLowerCase() === addressedTo;
  });

  const placementsNeeded = request.lines.reduce(
    (sum, line) => sum + line.placements,
    0,
  );
  const placementsSubmitted = matched.reduce(
    (sum, project) => sum + project.placement,
    0,
  );

  return {
    projects: matched.map((project) => ({
      projectId: project.projectId,
      title: project.projectTitle,
      educationLevel: project.educationLevel,
      placements: project.placement,
    })),
    placementsSubmitted,
    placementsNeeded,
    fulfilled: placementsNeeded > 0 && placementsSubmitted >= placementsNeeded,
  };
}
