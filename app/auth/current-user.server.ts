import { redirect } from "react-router";

import {
  ANONYMOUS,
  authorize,
  isAuthenticated,
  resolveUser,
  type Action,
  type Actor,
  type MaybeActor,
} from "~/data";
import { usePersistentBackend } from "~/data/adapters/file.server";

import { readActorId } from "./session.server";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  The bridge from "a request" to "an authorised Actor".
 * ─────────────────────────────────────────────────────────────────────────────
 *  `getCurrentActor` is the single function the whole app depends on. It reads
 *  the session (see `session.server.ts`), looks the user up in the `users` repo,
 *  and returns the `Actor` the data layer authorises against — or ANONYMOUS.
 *
 *  The two `require*` helpers are the PAGE-LEVEL guard: call them at the top of a
 *  loader/action to gate a whole route, reusing the exact same POLICY that
 *  guards the data. Unauthenticated → sent to pick a user; authenticated but not
 *  permitted → 403.
 */

/** Resolve the current actor from the request, or ANONYMOUS if not signed in. */
export async function getCurrentActor(request: Request): Promise<MaybeActor> {
  usePersistentBackend(); // ensure the persistent store is active for this process
  const actorId = await readActorId(request);
  if (!actorId) return ANONYMOUS;
  const user = await resolveUser(actorId);
  return user ? { id: user.id, role: user.role } : ANONYMOUS;
}

/** Require *any* signed-in actor. Redirects to the user picker if there is none. */
export async function requireActor(request: Request): Promise<Actor> {
  const actor = await getCurrentActor(request);
  if (!isAuthenticated(actor)) {
    const back = new URL(request.url).pathname;
    throw redirect(`/act-as?next=${encodeURIComponent(back)}`);
  }
  return actor;
}

/**
 * Require that the current actor may perform `action` on `resource` (optionally a
 * specific `record` for row-level rules). The page-level mirror of what a
 * repository enforces for data — same POLICY, one source of truth.
 */
export async function requireCan(
  request: Request,
  action: Action,
  resource: string,
  record?: unknown,
): Promise<Actor> {
  const actor = await requireActor(request);
  const decision = authorize(actor, action, resource, record);
  if (!decision.ok) {
    throw new Response(decision.error.message, { status: 403, statusText: "Forbidden" });
  }
  return actor;
}
