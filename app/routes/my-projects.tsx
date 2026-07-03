import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, resolveUser } from "~/data";
import { MyProjectsView } from "~/features/projects/views/my-projects-view";
import { SAMPLE_APPROVALS } from "~/features/projects/submissions-data";

import type { Route } from "./+types/my-projects";

/**
 * My Projects — the AD (P&C) surface for the projects their Programme Centre has
 * submitted, with the IO's review status for each. A thin orchestrator: it gates
 * access to AD (P&C), resolves the actor's identity, and hands off to the
 * self-contained {@link MyProjectsView}.
 *
 * Submissions aren't a data resource yet, so the page is role-gated (not policy-
 * gated) and reads placeholder rows from `features/projects/submissions-data.ts`.
 */

export function meta() {
  return [{ title: "My Projects — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);
  if (actor.role !== ROLES.adPnc) {
    throw new Response("My Projects is restricted to AD (P&C).", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const dbUser = await resolveUser(actor.id);
  return {
    actor,
    user: {
      name: dbUser?.name ?? ROLE_LABELS[actor.role],
      email: dbUser?.email,
    },
    approvals: SAMPLE_APPROVALS,
  };
}

export default function MyProjects({ loaderData }: Route.ComponentProps) {
  const { actor, user, approvals } = loaderData;
  return <MyProjectsView actor={actor} user={user} approvals={approvals} />;
}

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="My Projects is for AD (P&C). Switch to the AD (P&C) role to view the projects your centre has submitted." />
  );
}
