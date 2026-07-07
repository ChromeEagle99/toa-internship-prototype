import { createCookie } from "react-router";

/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  THE SWAP POINT — how the server learns *who the caller is*.
 * ─────────────────────────────────────────────────────────────────────────────
 *  Right now this is a DEV stand-in: a cookie that simply holds the id of the
 *  user you are "acting as". It has no password and no real authentication — its
 *  whole job is to let several roles share one machine while you build and demo.
 *
 *  When you move to real auth (separate machines, real logins), change ONLY this
 *  file: verify a credential, then store the authenticated user's id the same
 *  way (ideally via `createCookieSessionStorage` with a signing secret so the
 *  cookie can't be forged). Everything downstream — `getCurrentActor`, the route
 *  guards, every `repository.as(actor)` call — keeps working unchanged, because
 *  they only ever ask "what is the current user id?".
 */

const actorCookie = createCookie("toa_actor", {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 30, // 30 days
  // secrets: [process.env.SESSION_SECRET!]  ← add when this becomes real auth
});

/** The id of the user the caller is acting as, or null if none is set. */
export async function readActorId(request: Request): Promise<string | null> {
  const value = await actorCookie.parse(request.headers.get("Cookie"));
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** A `Set-Cookie` header value that starts acting as `userId`. */
export function commitActorId(userId: string): Promise<string> {
  return actorCookie.serialize(userId);
}

/** A `Set-Cookie` header value that clears the acting identity (sign out). */
export function clearActorId(): Promise<string> {
  return actorCookie.serialize("", { maxAge: 0 });
}
