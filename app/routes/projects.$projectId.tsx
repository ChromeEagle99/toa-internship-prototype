import { ToastProvider } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireActor, requireCan } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  can,
  programmesRepository,
  projectsRepository,
  resolveUser,
} from "~/data";

import {
  ProjectDetailView,
  type ProjectDetail,
} from "~/features/projects/views/project-detail-view";
import { bucketFor } from "~/features/projects/views/projects-list-view";

import type { Route } from "./+types/projects.$projectId";

/**
 * Project detail / review — thin orchestrator for `/projects/:projectId`. Guards
 * access, loads the one project (resolving the submitter's name), and hands off to
 * the self-contained {@link ProjectDetailView} that owns its Shell.
 *
 * Reachable by clicking a project row in the Projects list. Reads go through
 * `.as(actor)`, so a project the actor may not see is a 404, not a leak. The
 * approve/reject `action` is gated on `update` — IO and IO Admin have it; a
 * read-only role (Director) sees the page without the review bar.
 */

export function meta() {
  return [{ title: "Project — Talent Outreach & Acquisition" }];
}

/** e.g. 3 → "3 Months", 1 → "1 Month", 0/absent → "—". */
function formatDuration(months: number | undefined): string {
  if (!months || months <= 0) return "—";
  return `${months} Month${months === 1 ? "" : "s"}`;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const actor = await requireCan(request, "read", "projects");
  const dbUser = await resolveUser(actor.id);
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };

  const res = await projectsRepository.as(actor).get(params.projectId);
  if (!res.ok) {
    throw new Response("Project not found.", { status: 404, statusText: "Not Found" });
  }
  const record = res.data;

  // Resolve the submitting AD (P&C)'s name; fall back to their captured email.
  const submitter = record.submittedBy ? await resolveUser(record.submittedBy) : null;

  const project: ProjectDetail = {
    projectId: record.projectId,
    title: record.projectTitle,
    scope: record.projectScope,
    educationLevel: record.educationLevel,
    submittedByName:
      submitter?.name ?? record.submittedByEmail ?? record.pcCode ?? "Unknown",
    submittedByEmail: record.submittedByEmail,
    mentorName: record.mentorName,
    mentorDesignation: record.mentorDesignation,
    mentorWriteup: record.mentorWriteup,
    slots: record.placement,
    discipline: (record.disciplineOfStudy ?? []).join(", "),
    techDomain: record.techDomain,
    emergingArea: record.emergingAreas,
    duration: formatDuration(record.durationMonths),
    skills: record.skills ?? [],
    bucket: bucketFor(record),
  };

  return {
    actor,
    user,
    project,
    canReview: can(actor, "update", "projects"),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const actor = await requireActor(request);

  // Approving/rejecting is an update on the project — same grant the repository
  // enforces. A role without it (e.g. Director) gets a 403.
  if (!can(actor, "update", "projects")) {
    throw new Response("Your role isn't permitted to review projects.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");
  if (intent !== "approve" && intent !== "reject") {
    return { error: "Unknown review action." };
  }

  // Rejection carries remarks back to the submitter; approval clears any prior
  // remarks. Require the note server-side, not just in the UI.
  const remarks = String(form.get("remarks") ?? "").trim();
  if (intent === "reject" && !remarks) {
    return { error: "Add a note explaining what needs to change before rejecting." };
  }

  const patch =
    intent === "approve"
      ? { reviewStatus: "approved", reviewedBy: actor.id, reviewRemarks: undefined }
      : { reviewStatus: "rejected", reviewedBy: actor.id, reviewRemarks: remarks };

  const res = await projectsRepository.as(actor).update(params.projectId, patch);
  if (!res.ok) return { error: res.error.message };

  return { ok: true, status: intent === "approve" ? "approved" : "rejected" };
}

export default function ProjectDetailRoute({ loaderData }: Route.ComponentProps) {
  const { actor, user, project, canReview } = loaderData;
  return (
    <ToastProvider>
      <ProjectDetailView
        actor={actor}
        user={user}
        project={project}
        canReview={canReview}
      />
    </ToastProvider>
  );
}

/** Renders the 403 from `requireCan` (or a 404) as a clear access screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="This project isn't available to your current role, or it doesn't exist. Switch to a role that can view Projects (e.g. Internship Officer, IO Admin, or Director)." />
  );
}
