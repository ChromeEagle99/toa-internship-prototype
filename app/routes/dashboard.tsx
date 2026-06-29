import {
  APPLICATION_STATUSES,
  ROLE_LABELS,
  ROLES,
  applicationsRepository,
  can,
  programmesRepository,
  projectsRepository,
  resolveUser,
  type Application,
} from "~/data";

import { requireActor } from "~/auth/current-user.server";
import { IoDashboardView } from "~/features/dashboard/views/io-dashboard-view";
import { PdPncDashboardView } from "~/features/dashboard/views/pdpnc-dashboard-view";
import { dashboardVariantFor } from "~/features/dashboard/view-for";
import {
  SAMPLE_APPROVALS,
  SAMPLE_REQUESTS,
} from "~/features/projects/submissions-data";

import type { Route } from "./+types/dashboard";

/**
 * The signed-in landing page — one URL, several faces. A thin orchestrator: it
 * resolves the actor's {@link dashboardVariantFor view variant}, loads only that
 * variant's data, and hands off to a self-contained view that owns its Shell.
 *
 * Every figure is sourced through the same policy the data layer enforces, so a
 * dashboard never surfaces a count for a resource the actor may not read.
 */

export function meta() {
  return [{ title: "Dashboard — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);
  const dbUser = await resolveUser(actor.id);
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };
  const roleLabel = ROLE_LABELS[actor.role];

  // Projects are read by both variants (when the actor may list them).
  const projects = can(actor, "list", "projects")
    ? await projectsRepository
        .as(actor)
        .list()
        .then((r) => (r.ok ? r.data : []))
    : [];

  if (dashboardVariantFor(actor.role) === "submissions") {
    // PD P&C: submission-review summary. Counts from placeholder rows until a
    // submissions repository exists (see `features/projects/submissions-data.ts`).
    const requestsSubmitted = SAMPLE_REQUESTS.filter(
      (r) => r.status === "submitted",
    ).length;
    return {
      actor,
      user,
      roleLabel,
      data: {
        variant: "submissions" as const,
        counts: {
          pendingReviews: SAMPLE_APPROVALS.filter((a) => a.review === "pending").length,
          requestsSubmitted,
          requestsPending: SAMPLE_REQUESTS.length - requestsSubmitted,
          projects: projects.length,
        },
        approvals: SAMPLE_APPROVALS,
        requests: SAMPLE_REQUESTS,
      },
    };
  }

  // Default: applications-pipeline summary. Pull each resource only when the
  // actor may list it — the repository scopes rows further.
  const [applications, programmes] = await Promise.all([
    can(actor, "list", "applications")
      ? applicationsRepository
          .as(actor)
          .list()
          .then((r) => (r.ok ? r.data : []))
      : Promise.resolve([]),
    can(actor, "list", "programmes")
      ? programmesRepository
          .as(actor)
          .list()
          .then((r) => (r.ok ? r.data : []))
      : Promise.resolve([]),
  ]);

  // Tally applications by status for the breakdown card.
  const byStatus = Object.fromEntries(
    APPLICATION_STATUSES.map((status) => [
      status,
      applications.filter((a) => a.status === status).length,
    ]),
  ) as Record<Application["status"], number>;

  const recentApplications = [...applications]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return {
    actor,
    user,
    roleLabel,
    data: {
      variant: "default" as const,
      canListApplications: can(actor, "list", "applications"),
      canListProgrammes: can(actor, "list", "programmes"),
      canListProjects: can(actor, "list", "projects"),
      // Quick-action gates. Create grants come from the policy; project requests
      // aren't a data resource, so they're role-gated to match the side-nav.
      canCreateProjects: can(actor, "create", "projects"),
      canCreateProgrammes: can(actor, "create", "programmes"),
      canCreateProjectRequest: (
        [ROLES.internshipOfficer, ROLES.ioAdmin] as string[]
      ).includes(actor.role),
      counts: {
        applications: applications.length,
        programmes: programmes.length,
        projects: projects.length,
      },
      byStatus,
      recentApplications,
    },
  };
}

export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { actor, user, roleLabel, data } = loaderData;

  if (data.variant === "submissions") {
    return (
      <PdPncDashboardView
        actor={actor}
        user={user}
        roleLabel={roleLabel}
        counts={data.counts}
        approvals={data.approvals}
        requests={data.requests}
      />
    );
  }

  return (
    <IoDashboardView
      actor={actor}
      user={user}
      roleLabel={roleLabel}
      canListApplications={data.canListApplications}
      canListProgrammes={data.canListProgrammes}
      canListProjects={data.canListProjects}
      canCreateProjects={data.canCreateProjects}
      canCreateProgrammes={data.canCreateProgrammes}
      canCreateProjectRequest={data.canCreateProjectRequest}
      counts={data.counts}
      byStatus={data.byStatus}
      recentApplications={data.recentApplications}
    />
  );
}
