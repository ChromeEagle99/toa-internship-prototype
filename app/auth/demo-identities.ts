import { ROLES, type Role } from "~/data";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE SWAP POINT — which demo identities the applicant login offers.
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is a PROTOTYPE login. There is no real Singpass: choosing (or "logging
 *  in with Singpass" as) a demo identity simply sets the same `toa_actor` cookie
 *  that `session.server.ts` already drives. Everything downstream — the data
 *  layer's `repository.as(actor)`, the route guards — keeps working unchanged.
 *
 *  To swap the demo userbase, you change TWO clearly-labelled places:
 *    1. `exampleUsers()` in `data/repositories/users.ts` — WHO exists (the
 *       people: id, name, email, role). That is the seed the cookie resolves
 *       against, so every id below MUST exist there with role `applicant`.
 *    2. THIS list — WHICH of those applicants the login screen shows, in what
 *       order, and the track copy shown beneath each name.
 *
 *  Names/emails live with the user record (single source); only the id and the
 *  display-only `tagline` live here, so the two can't drift on the facts.
 *
 *  When this becomes real auth, delete this picker and seed a single
 *  authenticated user id into the cookie from your Singpass callback instead.
 */

export interface DemoIdentity {
  /** Must match a seeded user id in `exampleUsers()` with role `applicant`. */
  id: string;
  /** The track shown under the name on the card. British English copy. */
  tagline: string;
}

export const DEMO_APPLICANT_IDENTITIES: readonly DemoIdentity[] = [
  { id: "u-applicant-internship", tagline: "Internship Applicant" },
  { id: "u-applicant-scholarship", tagline: "Scholarship Applicant" },
];

/**
 * Roles the applicant login is allowed to sign in as. The action checks the
 * chosen id resolves to one of these before setting the cookie, so a tampered
 * form can't elevate into a back-office role through this screen.
 */
export const APPLICANT_LOGIN_ROLES: readonly Role[] = [ROLES.applicant];
