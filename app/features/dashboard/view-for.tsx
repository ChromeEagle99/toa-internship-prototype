import { ROLES, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Dashboard module — role → view variant.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Same shape as the Projects module: one `/dashboard` route, several faces. The
 *  loader uses this to choose what data to fetch; the route switches on the
 *  variant to render the matching self-contained view.
 */

/** The distinct dashboard experiences. */
export type DashboardVariant =
  /** Applications-pipeline summary — IO, IO Admin, Director, applicant. */
  | "default"
  /** Submission-review summary — AD (P&C). */
  | "submissions";

/** Which dashboard this role lands on. Defaults to the pipeline summary. */
export function dashboardVariantFor(role: Role): DashboardVariant {
  return role === ROLES.adPnc ? "submissions" : "default";
}
