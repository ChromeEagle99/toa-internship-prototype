import { Plus } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import { Shell } from "~/components/shell";
import { requireCan } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  can,
  projectsRepository,
  resolveUser,
  type ProjectEntry,
  type ProjectStatus,
} from "~/data";

import type { Route } from "./+types/projects";

/**
 * Projects index. Guarded by the same policy at the door and the data layer:
 *   1. `requireCan(... "list", "projects")` gates the route — a role without the
 *      grant gets a 403 before any data is read.
 *   2. `projectsRepository.as(actor).list()` returns only the rows the actor may
 *      see. The "New project" action mirrors the `create` grant.
 */

export function meta() {
  return [{ title: "Projects — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "list", "projects");
  const [res, user] = await Promise.all([
    projectsRepository.as(actor).list(),
    resolveUser(actor.id),
  ]);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    projects: res.ok ? res.data : [],
    canCreate: can(actor, "create", "projects"),
  };
}

/** Project status → badge variant. */
const STATUS_VARIANT: Record<ProjectStatus, BadgeProps["variant"]> = {
  open: "info",
  "in-progress": "warning",
  confirmed: "success",
};

/** Human-readable status label. */
const STATUS_LABEL: Record<ProjectStatus, string> = {
  open: "Open",
  "in-progress": "In progress",
  confirmed: "Confirmed",
};

/** A readable minimum-duration string. */
function minDuration(project: ProjectEntry): string {
  return project.minDurationWeeks ? `${project.minDurationWeeks} weeks` : "—";
}

export default function Projects({ loaderData }: Route.ComponentProps) {
  const { actor, user, projects, canCreate } = loaderData;

  return (
    <Shell
      actor={actor}
      user={user}
      title="Projects"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link
            to="/projects/new"
            className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
          >
            <Plus className="size-4" />
            New project
          </Link>
        ) : null
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All projects</CardTitle>
          <CardDescription>
            Live, approved projects applicants are matched against. You see the
            projects your role is permitted to read.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Programme Centre</TableHead>
                <TableHead>Minimum duration</TableHead>
                <TableHead className="text-right">Slots filled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text size="sm" variant="muted">
                      No projects yet. Seed some in the dev database.
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                projects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[project.status]}>
                        {STATUS_LABEL[project.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {project.pc ?? "—"}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {minDuration(project)}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {project.matched} / {project.slots}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Shell>
  );
}

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403
            ? "Your current role isn't permitted to view Projects. Switch to a role that can (e.g. Internship Officer, IO Admin, or Director)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
