import { Plus } from "lucide-react";
import { Link } from "react-router";

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

import { Shell, type ShellUser } from "~/components/shell";
import type { Actor, ProjectEntry, ProjectStatus } from "~/data";

/**
 * The default Projects page: the live, approved projects an actor may read, as a
 * single table. Used by IO, IO Admin and Director. A self-contained page — it
 * owns its Shell chrome — so the route only has to choose and render it.
 */

export interface ProjectsListViewProps {
  actor: Actor;
  user: ShellUser;
  projects: ProjectEntry[];
  canCreate: boolean;
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

export function ProjectsListView({
  actor,
  user,
  projects,
  canCreate,
}: ProjectsListViewProps) {
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
