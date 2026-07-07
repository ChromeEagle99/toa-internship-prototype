import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, projectsRepository, resolveUser } from "~/data";
import {
  MyProjectsView,
  toApprovalRows,
} from "~/features/projects/views/my-projects-view";

import type { Route } from "./+types/my-projects";

/**
 * My Projects — the AD (P&C) surface for the projects their Programme Centre has
 * submitted, with the IO's review status for each. A thin orchestrator: it gates
 * access to AD (P&C), resolves the actor's identity, loads the projects THIS AD
 * submitted, and hands off to the self-contained {@link MyProjectsView}.
 *
 * The page is role-gated to AD (P&C). Projects are a data resource, so rows come
 * from `projectsRepository`; the policy lets an AD list projects resource-wide, so
 * the ownership narrowing — only the ones they submitted — lives in the loader,
 * matched on `submittedByEmail` (the tag the respond wizard stamps at create
 * time). It's the same email relation the request-fulfilment reconcile uses.
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
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };

  // Only the projects this AD (P&C) submitted. The list read is resource-wide, so
  // narrow it here by the submitter's email — the durable owner tag the respond
  // wizard sets. Without an email to match on, show nothing rather than everyone's.
  const res = await projectsRepository.as(actor).list();
  const mine =
    res.ok && user.email
      ? res.data.filter(
          (project) =>
            project.submittedByEmail?.toLowerCase() === user.email!.toLowerCase(),
        )
      : [];

  return { actor, user, approvals: toApprovalRows(mine) };
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
