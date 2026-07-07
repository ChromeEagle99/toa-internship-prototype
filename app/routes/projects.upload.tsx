import { ToastProvider } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, resolveUser } from "~/data";
import { UploadProjectsView } from "~/features/projects/views/upload-projects-view";

import type { Route } from "./+types/projects.upload";

/**
 * Upload Projects — thin orchestrator. Guards access to AD (P&C), resolves the
 * actor's display identity, and hands off to the self-contained
 * {@link UploadProjectsView} that owns its Shell.
 *
 * Reachable only from the submission-review page's "Upload Projects" action.
 */

export function meta() {
  return [{ title: "Upload Projects — Talent Outreach & Acquisition" }];
}

/**
 * Gate this page to AD (P&C) only. Uploading a project batch is their
 * remit; everyone else — IO, IO Admin, Director, applicants — gets a 403, even
 * roles that can otherwise create projects. This is a deliberate role allowlist,
 * not a resource grant, so it stays exact as the policy table evolves.
 */
export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);
  if (actor.role !== ROLES.adPnc) {
    throw new Response("Only AD (P&C) may upload projects.", {
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
  };
}

export default function UploadProjectsRoute({ loaderData }: Route.ComponentProps) {
  const { actor, user } = loaderData;

  return (
    <ToastProvider>
      <UploadProjectsView actor={actor} user={user} />
    </ToastProvider>
  );
}

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Only AD (P&C) may upload projects. Switch to the AD (P&C) role to continue." />
  );
}
