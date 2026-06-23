import { z } from "zod";

import { createRepository } from "../repository";
import type { Actor } from "../access/actor";
import { ALL_ROLES, ROLES, type Role } from "../access/roles";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  USERS — the people who use the system, and the role each one holds.
 * ─────────────────────────────────────────────────────────────────────────────
 *  This is the one piece of RBAC that is DATA, not code:
 *
 *    - the role registry (what roles exist)      → `access/roles.ts`   (code)
 *    - the policy (what each role may do)         → `access/permissions.ts` (code)
 *    - the users (who exists, and their role)     → THIS repository      (data)
 *
 *  Users are created and change at runtime (people join, leave, get promoted),
 *  so they live in the store. Authentication resolves a user from here and turns
 *  it into the `Actor` that the rest of the data layer authorises against.
 */

export const UserSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  /** The single role this user acts as — validated against the role registry. */
  role: z.enum(ALL_ROLES as unknown as [Role, ...Role[]]),
});
export type User = z.infer<typeof UserSchema>;

export const usersRepository = createRepository<User>({
  resource: "users",
  schema: UserSchema,
  identify: (user) => user.id,
});

/**
 * A privileged identity used ONLY for the auth bootstrap — resolving "who is the
 * caller?" and powering the dev "act as" picker. This read happens *before* we
 * have a real actor (chicken-and-egg), so it cannot itself be actor-gated.
 * It is not exported to UI/route code; treat it as the system performing auth.
 */
const SYSTEM: Actor = { id: "system", role: ROLES.ioAdmin };

/** Resolve a single user by id (auth bootstrap). Returns null if absent/invalid. */
export async function resolveUser(id: string): Promise<User | null> {
  const res = await usersRepository.as(SYSTEM).get(id);
  return res.ok ? res.data : null;
}

/** Every user — for the dev "act as" picker. */
export async function listUsers(): Promise<User[]> {
  const res = await usersRepository.as(SYSTEM).list();
  return res.ok ? res.data : [];
}

/** One demo user per role. Stable ids so the "act as" cookie survives reseeds. */
export function exampleUsers(): User[] {
  return [
    { id: "u-applicant", name: "Alice Tan", email: "alice@example.sg", role: ROLES.applicant },
    { id: "u-io", name: "Jamie Neo", email: "jamie.neo@example.sg", role: ROLES.internshipOfficer },
    { id: "u-ioadmin", name: "Tara Tan", email: "tara.tan@example.sg", role: ROLES.ioAdmin },
    { id: "u-pdpnc", name: "Lena Lim", email: "lena.lim@example.sg", role: ROLES.pdPnc },
    { id: "u-director", name: "Wei Wong", email: "wei.wong@example.sg", role: ROLES.director },
  ];
}

/** Seed the demo users once, if the store is empty. Keeps the picker populated. */
export async function ensureUsersSeeded(): Promise<void> {
  const existing = await usersRepository.as(SYSTEM).list();
  if (existing.ok && existing.data.length > 0) return;
  for (const user of exampleUsers()) await usersRepository.as(SYSTEM).create(user);
}
