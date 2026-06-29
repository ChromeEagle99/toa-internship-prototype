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
  /** Who raised the request. */
  requestedBy: string;
  /** Placements the request needs filled. */
  placementsNeeded: number;
  /** Projects already submitted against it. */
  previouslySubmitted: number;
  /** Submission deadline. YYYY-MM-DD. */
  deadline: string;
  status: RequestStatus;
}

/** Sample approval queue — one project pending review, mirroring the prototype. */
export const SAMPLE_APPROVALS: ProjectApproval[] = [
  {
    id: "ap-001",
    project: "Acoustic signal classification with ML",
    educationLevel: "Junior College",
    mentor: "Dr Lim Wei Sheng",
    slots: 1,
    review: "pending",
  },
];

/** Sample requests overview — two pending, one submitted. */
export const SAMPLE_REQUESTS: SubmissionRequest[] = [
  {
    id: "rq-001",
    educationLevel: "University",
    requestedBy: "IO Admin",
    placementsNeeded: 10,
    previouslySubmitted: 10,
    deadline: "2026-04-30",
    status: "submitted",
  },
  {
    id: "rq-002",
    educationLevel: "Polytechnic",
    requestedBy: "IO Admin",
    placementsNeeded: 8,
    previouslySubmitted: 5,
    deadline: "2026-04-30",
    status: "incomplete",
  },
  {
    id: "rq-003",
    educationLevel: "Junior College",
    requestedBy: "IO Admin",
    placementsNeeded: 6,
    previouslySubmitted: 0,
    deadline: "2026-05-30",
    status: "pending",
  },
];
