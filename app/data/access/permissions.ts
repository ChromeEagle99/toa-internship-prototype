import type { Actor } from "./actor";
import { ROLES, type Role } from "./roles";

/**
 * The access policy: who may do what, to which resource, under which conditions.
 *
 * Model: Role-Based Access Control with optional row-level conditions.
 *  - A **resource** is an entity name (matches a repository's `resource`, e.g.
 *    "applications"). `"*"` matches any resource.
 *  - An **action** is a CRUD-ish verb. `"*"` matches any action.
 *  - A **rule** grants a role some actions on a resource, optionally narrowed by
 *    a `where` predicate evaluated against the specific record (row-level).
 *
 * **Deny by default.** Nothing is permitted unless a rule grants it. An actor
 * with no matching rule — including the anonymous/no-role caller — is denied.
 *
 * Keep this table the single source of truth for authorisation. Repositories
 * enforce it; they never re-implement checks inline.
 */
export type Action = "create" | "read" | "list" | "update" | "delete";

export interface Rule {
  /** Entity name this rule applies to, or "*" for all. */
  resource: string | "*";
  /** Actions granted, or "*" for all. */
  actions: Action[] | "*";
  /**
   * Optional row-level constraint. Receives the actor and the specific record;
   * return true to allow. Used for ownership ("an applicant sees only their own
   * record"). Omit for resource-wide access.
   *
   * Note: `create` and `list` have no single record to test, so `where` is
   * ignored for `create`, and for `list` it is applied per-row as a filter.
   */
  where?: (actor: Actor, record: unknown) => boolean;
}

/** The policy table: role → the rules granted to it. */
export type Policy = Partial<Record<Role, Rule[]>>;

/**
 * Common ownership predicate: the record's `ownerId` (or `applicantId`) equals
 * the actor's id. Adjust the owner field to your schema, or write per-resource
 * predicates inline.
 */
export function owns(actor: Actor, record: unknown): boolean {
  if (!record || typeof record !== "object") return false;
  const r = record as Record<string, unknown>;
  return r.ownerId === actor.id || r.applicantId === actor.id;
}

/**
 * Authorship predicate: the record's `createdBy` equals the actor's id. Used to
 * scope an AD (P&C) to the projects they themselves submitted (row-level read).
 */
export function createdByOwns(actor: Actor, record: unknown): boolean {
  if (!record || typeof record !== "object") return false;
  return (record as Record<string, unknown>).createdBy === actor.id;
}

/**
 * The active policy.
 *
 * ⚠️ EXAMPLE RULES — these encode a *plausible* reading of the roles, not a
 * confirmed spec. They exist so the pattern is concrete and the example
 * repository works. Replace with the real authorisation matrix once it's
 * defined, keeping the same shape.
 *
 * The "applications" resource below is illustrative (see
 * `repositories/applications.ts`). Add a block per resource as you add repos.
 */
export const POLICY: Policy = {
  [ROLES.applicant]: [
    // An applicant may create applications and list them — but the row-level
    // `owns` rule below means `list`/`read` only ever surface their own records.
    { resource: "applications", actions: ["create", "list"] },
    { resource: "applications", actions: ["read", "update"], where: owns },
  ],
  [ROLES.internshipOfficer]: [
    // IOs handle applications: full read/list/update across the resource.
    { resource: "applications", actions: ["read", "list", "update"] },
  ],
  [ROLES.ioAdmin]: [
    // IO Admin: everything IOs can do, plus create and delete.
    { resource: "applications", actions: "*" },
    // Owns the programme/intake/project lifecycle and raises project requests.
    { resource: "programmes", actions: "*" },
    { resource: "intakes", actions: "*" },
    { resource: "projects", actions: "*" },
    { resource: "project-requests", actions: "*" },
  ],
  [ROLES.adPnc]: [
    // AD (P&C): submits projects against a request and reviews their own
    // submissions; may read the requests they are responding to. The row-level
    // `createdByOwns` scopes read/list to their own projects.
    { resource: "projects", actions: ["create", "list", "read"], where: createdByOwns },
    { resource: "project-requests", actions: ["list", "read"] },
  ],
  [ROLES.pdPnc]: [
    // People & Culture: read and list, no edits.
    { resource: "applications", actions: ["read", "list"] },
  ],
  [ROLES.director]: [
    // Director: read-wide oversight across every resource.
    { resource: "*", actions: ["read", "list"] },
  ],
};
