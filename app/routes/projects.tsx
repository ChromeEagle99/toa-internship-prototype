import { AccessDeniedBoundary } from "~/components/access-denied";

import { requireCan } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  can,
  programmesRepository,
  projectsRepository,
  resolveUser,
} from "~/data";

import {
  ProjectsListView,
  toProjectRows,
} from "~/features/projects/views/projects-list-view";
import { SubmissionsReviewView } from "~/features/projects/views/submissions-review-view";
import { projectsVariantFor } from "~/features/projects/view-for";
import { SAMPLE_APPROVALS, SAMPLE_REQUESTS } from "~/features/projects/submissions-data";

import type { Route } from "./+types/projects";

/**
 * Projects — one URL, several faces. This route is a thin orchestrator: it guards
 * access, resolves the actor's {@link projectsVariantFor view variant}, loads only
 * that variant's data, and hands off to a self-contained view that owns its Shell.
 *
 * Access is guarded at the door and the data layer:
 *   1. `requireCan(... "list", "projects")` gates the route — a role without the
 *      grant gets a 403 before any data is read.
 *   2. The list variant reads through `projectsRepository.as(actor)`, so it only
 *      returns rows the actor may see.
 *
 * Adding a role's bespoke Projects page: add a variant in `view-for.tsx`, a branch
 * here, and a view file under `features/projects/views/`. No existing view changes.
 */

export function meta() {
  return [{ title: "Projects — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "list", "projects");
  const dbUser = await resolveUser(actor.id);
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };

  if (projectsVariantFor(actor.role) === "submissions") {
    // PD P&C: submission-review surface. Placeholder rows until a submissions
    // repository exists (see `features/projects/submissions-data.ts`).
    return {
      actor,
      user,
      data: {
        variant: "submissions" as const,
        approvals: SAMPLE_APPROVALS,
        requests: SAMPLE_REQUESTS,
      },
    };
  }

  // Resolve each project's programme (via intakeId) so the list can show it.
  // Both reads go through `.as(actor)`, so each only returns rows the actor may
  // see; a denied programmes read just leaves the Programme column blank.
  const [projectsRes, programmesRes] = await Promise.all([
    projectsRepository.as(actor).list(),
    programmesRepository.as(actor).list(),
  ]);
  return {
    actor,
    user,
    data: {
      variant: "list" as const,
      rows: toProjectRows(
        projectsRes.ok ? projectsRes.data : [],
        programmesRes.ok ? programmesRes.data : [],
      ),
      canCreate: can(actor, "create", "projects"),
    },
  };
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { actor, user, data } = loaderData;

  if (data.variant === "submissions") {
    return (
      <SubmissionsReviewView
        actor={actor}
        user={user}
        approvals={data.approvals}
        requests={data.requests}
      />
    );
  }

  return (
    <ProjectsListView
      actor={actor}
      user={user}
      rows={data.rows}
      canCreate={data.canCreate}
    />
  );
}

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Your current role isn't permitted to view Projects. Switch to a role that can (e.g. Internship Officer, IO Admin, Director, or PD P&C)." />
  );
}
