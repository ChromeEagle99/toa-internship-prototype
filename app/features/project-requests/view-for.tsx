import { ROLES, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  Project Requests module — role → view variant.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Same shape as the Projects and Dashboard modules: one `/project-requests`
 *  route, several faces. The loader uses this to decide which data to load and
 *  which self-contained view to render.
 *
 *  Project requests aren't a policy resource yet, so this mapper is also the
 *  access gate: a role with no variant (`null`) is refused with a 403. Keep it in
 *  step with the side-nav's `roles` allowlist.
 */

/** The distinct Project Requests experiences. */
export type ProjectRequestsVariant =
  /** Requests an IO has sent to Programme Centres — IO, IO Admin. */
  | "manage"
  /** Requests a Programme Centre has received to fulfil — PD P&C. */
  | "received";

/**
 * Which Project Requests view this role sees, or `null` if none — the route
 * turns `null` into a 403.
 */
export function projectRequestsVariantFor(role: Role): ProjectRequestsVariant | null {
  if (role === ROLES.pdPnc) return "received";
  if (role === ROLES.internshipOfficer || role === ROLES.ioAdmin) return "manage";
  return null;
}
