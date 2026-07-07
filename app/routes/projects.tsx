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

import type { Route } from "./+types/projects";

/**
 * Projects — the live, approved project list for IO, IO Admin and Director. A
 * thin orchestrator: it guards access, loads the projects the actor may see, and
 * hands off to the self-contained {@link ProjectsListView} that owns its Shell.
 *
 * Access is guarded at the door and the data layer:
 *   1. `requireCan(... "list", "projects")` gates the route — a role without the
 *      grant gets a 403 before any data is read.
 *   2. Reads go through `projectsRepository.as(actor)`, so only rows the actor may
 *      see are returned.
 *
 * AD (P&C) don't land here — their submission-centric surfaces are `/my-projects`
 * and `/project-requests` instead.
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
    rows: toProjectRows(
      projectsRes.ok ? projectsRes.data : [],
      programmesRes.ok ? programmesRes.data : [],
    ),
    canCreate: can(actor, "create", "projects"),
  };
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { actor, user, rows, canCreate } = loaderData;

  return (
    <ProjectsListView actor={actor} user={user} rows={rows} canCreate={canCreate} />
  );
}

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Your current role isn't permitted to view Projects. Switch to a role that can (e.g. Internship Officer, IO Admin, or Director)." />
  );
}
