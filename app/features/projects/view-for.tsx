import { ROLES, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Projects module — role → view variant.
 * ─────────────────────────────────────────────────────────────────────────────
 *  The `/projects` route is one URL with several faces. This is the single place
 *  that decides which face a role gets; the loader uses it to choose what data to
 *  fetch, and the route component switches on the returned variant to render the
 *  matching self-contained view.
 *
 *  Adding a role's bespoke Projects page = add a variant here, a `case` in the
 *  route, and a view file under `views/`. No existing view is touched.
 */

/** The distinct Projects experiences. */
export type ProjectsVariant =
  /** Live, approved project list — IO, IO Admin, Director. */
  | "list"
  /** Project-submission review queue + requests overview — PD P&C. */
  | "submissions";

/** Which Projects view this role sees. Defaults to the project list. */
export function projectsVariantFor(role: Role): ProjectsVariant {
  return role === ROLES.pdPnc ? "submissions" : "list";
}
