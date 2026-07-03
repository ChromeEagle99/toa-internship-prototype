/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PD P&C submission-review data — PLACEHOLDER.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The People & Culture surface reviews the middle of the project lifecycle:
 *
 *      ProjectRequest  →  ProjectSubmissionBatch { SubmittedProject[] }  →  ProjectEntry
 *      (IO asks a PC)     (PC uploads, PD P&C reviews) ← here              (live project)
 *
 *  Neither submissions nor requests are a data resource yet, so these are typed
 *  sample rows — the same stopgap `routes/project-requests.tsx` uses. Replace with
 *  a `projectSubmissionsRepository` when one exists; keep the row shapes so the
 *  views don't change.
 */

/** Where a submitted project sits in PD P&C's review queue. */
export type ApprovalReview = "pending" | "approved" | "rejected";

/** A single project a Programme Centre has submitted, awaiting PD P&C review. */
export interface ProjectApproval {
  id: string;
  /** Project title as submitted. */
  project: string;
  /** Education level the project is pitched at, e.g. "Junior College". */
  educationLevel: string;
  /** Named mentor for the placement. */
  mentor: string;
  /** Intern slots the project offers. */
  slots: number;
  review: ApprovalReview;
}

/** Where a Programme Centre's overall submission stands against what was asked. */
export type RequestStatus = "submitted" | "incomplete" | "pending";

/** A request's fulfilment, tracked across an intake. */
export interface SubmissionRequest {
  id: string;
  educationLevel: string;
  /** Internship Officer who raised the request. */
  requestedBy: string;
  /** Placements the request needs filled. */
  placementsNeeded: number;
  /** Projects already submitted against it. */
  previouslySubmitted: number;
  /** When the request was sent. YYYY-MM-DD. */
  sentDate: string;
  /** Submission deadline. YYYY-MM-DD. */
  deadline: string;
  status: RequestStatus;
}

/** No placeholder approvals — the queue starts empty until a repository exists. */
export const SAMPLE_APPROVALS: ProjectApproval[] = [];

/** No placeholder requests — the page starts empty until a repository exists. */
export const SAMPLE_REQUESTS: SubmissionRequest[] = [];
