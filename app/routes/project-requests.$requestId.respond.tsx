import { ToastProvider } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  ROLES,
  projectRequestsRepository,
  resolveUser,
} from "~/data";
import { RespondToRequestView } from "~/features/project-requests/views/respond-to-request-view";

import type { Route } from "./+types/project-requests.$requestId.respond";

/**
 * Respond to a Project Request — thin orchestrator for
 * `/project-requests/:requestId/respond`. Gates access to AD (P&C), loads the one
 * request being responded to (verifying it's addressed to this AD), and hands off
 * to the self-contained {@link RespondToRequestView} that owns its Shell.
 *
 * Reachable from the AD (P&C) received-requests list — the "Respond" action on a
 * request card lands here to pick a submission method.
 */

export function meta() {
  return [{ title: "Respond to Request — Talent Outreach & Acquisition" }];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const actor = await requireActor(request);

  // Responding to a request is the AD (P&C)'s remit; everyone else gets a 403,
  // mirroring the received-requests surface the "Respond" action comes from.
  if (actor.role !== ROLES.adPnc) {
    throw new Response("Only AD (P&C) may respond to project requests.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const dbUser = await resolveUser(actor.id);
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };

  const res = await projectRequestsRepository.as(actor).get(params.requestId);
  const found = res.ok ? res.data : null;

  // Only the AD (P&C) the request is addressed to may respond to it — the
  // `adPncEmail` tag the create flow sets is the relation (same match the list
  // filters on). A wrong id, or one addressed to a different AD, is a 404.
  const addressed =
    found &&
    user.email &&
    found.adPncEmail?.toLowerCase() === user.email.toLowerCase();
  if (!addressed) {
    throw new Response("Project request not found.", {
      status: 404,
      statusText: "Not Found",
    });
  }

  const requester = found.requestedBy ? await resolveUser(found.requestedBy) : null;

  return {
    actor,
    user,
    request: {
      id: found.requestId,
      requestedBy: requester?.name ?? "Internship Office",
      lines: found.lines.map((line) => ({
        level: line.educationLevel,
        slots: line.placements,
      })),
      placementsNeeded: found.lines.reduce((sum, line) => sum + line.placements, 0),
      // No submissions repository yet, so nothing is fulfilled.
      previouslySubmitted: 0,
      deadline: found.deadline,
    },
  };
}

export default function RespondToRequestRoute({ loaderData }: Route.ComponentProps) {
  const { actor, user, request } = loaderData;
  return (
    <ToastProvider>
      <RespondToRequestView actor={actor} user={user} request={request} />
    </ToastProvider>
  );
}

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Only AD (P&C) may respond to project requests. Switch to the AD (P&C) role to continue." />
  );
}
