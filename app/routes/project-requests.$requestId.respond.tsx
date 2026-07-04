import { ToastProvider } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  ROLES,
  newId,
  projectRequestsRepository,
  projectsRepository,
  resolveUser,
  type Project,
} from "~/data";
import { fulfilmentFor } from "~/features/project-requests/reconcile";
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

  // Reconcile against the projects already submitted for this request (soft
  // match by the addressed AD + education level — projects carry no request FK).
  const projectsRes = await projectsRepository.as(actor).list();
  const fulfilment = fulfilmentFor(found, projectsRes.ok ? projectsRes.data : []);

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
      placementsNeeded: fulfilment.placementsNeeded,
      previouslySubmitted: fulfilment.placementsSubmitted,
      submittedProjects: fulfilment.projects.map((project) => ({
        title: project.title,
        level: project.educationLevel,
        slots: project.placements,
      })),
      deadline: found.deadline,
    },
  };
}

// ── Submission ────────────────────────────────────────────────────────────────

/**
 * The serialisable project the wizard posts. System fields (id, review status,
 * submitter, timestamp) are set server-side here, not trusted from the client —
 * the same discipline as the Request Project action. Field names match the
 * `Project` schema so the mapping below is a straight copy.
 */
interface ProjectPayload {
  projectTitle: string;
  projectScope: string;
  pcCode: string;
  educationLevel: string;
  placement: number;
  disciplineOfStudy: string[];
  skills: string[];
  techDomain: string;
  emergingAreas: string;
  /** YYYY-MM. */
  internshipStart: string;
  /** YYYY-MM. */
  internshipEnd: string;
  durationMonths: number;
  mentorName: string;
  mentorEmail: string;
  mentorDesignation: string;
  mentorWriteup: string;
}

export async function action({ request }: Route.ActionArgs) {
  const actor = await requireActor(request);

  // Same gate as the loader: creating a project against a request is the AD
  // (P&C)'s remit (and the POLICY only grants them `create` on projects).
  if (actor.role !== ROLES.adPnc) {
    throw new Response("Only AD (P&C) may submit projects for a request.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  let payload: ProjectPayload;
  try {
    payload = JSON.parse(String((await request.formData()).get("payload") ?? ""));
  } catch {
    return { error: "Could not read the submitted project." };
  }

  // The submitting AD's contact, captured alongside their id so a reviewer has a
  // durable reply-to on the project (the `submittedByEmail` tag).
  const submitter = await resolveUser(actor.id);

  const record: Project = {
    projectTitle: payload.projectTitle,
    projectScope: payload.projectScope,
    pcCode: payload.pcCode,
    educationLevel: payload.educationLevel,
    placement: payload.placement,
    disciplineOfStudy: payload.disciplineOfStudy,
    skills: payload.skills,
    techDomain: payload.techDomain || undefined,
    emergingAreas: payload.emergingAreas || undefined,
    internshipStart: payload.internshipStart,
    internshipEnd: payload.internshipEnd,
    durationMonths: payload.durationMonths,
    mentorName: payload.mentorName,
    mentorEmail: payload.mentorEmail,
    mentorDesignation: payload.mentorDesignation,
    mentorWriteup: payload.mentorWriteup || undefined,
    // System fields — set here, never trusted from the client.
    projectId: newId(),
    intakeId: null,
    reviewStatus: "pending",
    submittedBy: actor.id,
    submittedByEmail: submitter?.email,
    submittedAt: new Date().toISOString(),
  };

  const res = await projectsRepository.as(actor).create(record);
  if (!res.ok) return { error: res.error.message };

  return { ok: true };
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
