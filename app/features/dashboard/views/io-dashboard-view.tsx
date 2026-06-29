import {
  BookOpen,
  ChevronDown,
  ClipboardList,
  Folder,
  GitPullRequestArrow,
  GraduationCap,
  Plus,
  type LucideIcon,
} from "lucide-react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { Text } from "@/components/ui/text";

import { Shell, type ShellUser } from "~/components/shell";
import { APPLICATION_STATUSES, type Actor, type Application } from "~/data";

import { StatCard } from "../stat-card";

/**
 * The default dashboard: an applications-pipeline summary for IO, IO Admin,
 * Director (and applicants, scoped to their own record). Every figure is sourced
 * through the same policy the data layer enforces, so it never surfaces a count
 * for a resource the actor may not read. A self-contained page — owns its Shell.
 */

export interface IoDashboardViewProps {
  actor: Actor;
  user: ShellUser;
  roleLabel: string;
  canListApplications: boolean;
  canListProgrammes: boolean;
  canListProjects: boolean;
  canCreateProjects: boolean;
  canCreateProgrammes: boolean;
  canCreateProjectRequest: boolean;
  counts: { applications: number; programmes: number; projects: number };
  byStatus: Record<Application["status"], number>;
  recentApplications: Application[];
}

/** Status → badge variant, so the colour reads the same everywhere. */
const STATUS_VARIANT: Record<Application["status"], BadgeProps["variant"]> = {
  draft: "subtle",
  submitted: "info",
  under_review: "warning",
  accepted: "success",
  rejected: "danger",
};

const STATUS_LABEL: Record<Application["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  under_review: "Under review",
  accepted: "Accepted",
  rejected: "Rejected",
};

interface QuickAction {
  to: string;
  label: string;
  icon: LucideIcon;
}

/**
 * Header "Quick actions" dropdown. The caller passes only the actions the actor
 * is allowed; the menu renders nothing when that list is empty.
 */
function QuickActions({ actions }: { actions: QuickAction[] }) {
  if (actions.length === 0) return null;
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button size="sm" className="hidden sm:inline-flex">
            <Plus className="size-4" />
            Quick actions
            <ChevronDown className="size-4" />
          </Button>
        }
      />
      <MenuContent className="w-56">
        {actions.map((action) => (
          <MenuItem key={action.to} render={<Link to={action.to} />}>
            <action.icon className="size-4" />
            {action.label}
          </MenuItem>
        ))}
      </MenuContent>
    </Menu>
  );
}

export function IoDashboardView({
  actor,
  user,
  roleLabel,
  canListApplications,
  canListProgrammes,
  canListProjects,
  canCreateProjects,
  canCreateProgrammes,
  canCreateProjectRequest,
  counts,
  byStatus,
  recentApplications,
}: IoDashboardViewProps) {
  const quickActions: QuickAction[] = [
    canCreateProjects && {
      to: "/projects/new",
      label: "Create Project",
      icon: Folder,
    },
    canCreateProgrammes && {
      to: "/programmes/new",
      label: "Create Programme",
      icon: BookOpen,
    },
    canCreateProjectRequest && {
      to: "/project-requests/new",
      label: "Create Project Request",
      icon: GitPullRequestArrow,
    },
  ].filter(Boolean) as QuickAction[];

  return (
    <Shell
      actor={actor}
      user={user}
      title="Dashboard"
      workstream="Internship"
      actions={<QuickActions actions={quickActions} />}
    >
      <div className="space-y-8">
        {/* Greeting */}
        <div className="flex flex-wrap items-center gap-2">
          <Heading as="h2" size="lg">
            Welcome back, {user.name}
          </Heading>
          <Badge variant="info">{roleLabel}</Badge>
        </div>

        {/* Headline figures — only the resources this actor may read appear. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {canListApplications ? (
            <StatCard
              icon={ClipboardList}
              label="Applications"
              value={counts.applications}
              to="/applications"
            />
          ) : null}
          {canListProgrammes ? (
            <StatCard
              icon={GraduationCap}
              label="Programmes"
              value={counts.programmes}
              to="/programmes"
            />
          ) : null}
          {canListProjects ? (
            <StatCard
              icon={Folder}
              label="Projects"
              value={counts.projects}
              to="/projects"
            />
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent applications */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent applications</CardTitle>
              <CardDescription>
                The latest applications you can access, newest first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentApplications.length > 0 ? (
                <ul className="divide-y divide-border">
                  {recentApplications.map((application) => (
                    <li
                      key={application.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Text className="truncate font-medium">
                          {application.fullName}
                        </Text>
                        <Text size="xs" variant="muted">
                          {new Date(application.createdAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Text>
                      </div>
                      <Badge variant={STATUS_VARIANT[application.status]}>
                        {STATUS_LABEL[application.status]}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text size="sm" variant="muted">
                  No applications to show yet.
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Status breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>By status</CardTitle>
              <CardDescription>Applications across the pipeline.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {APPLICATION_STATUSES.map((status) => (
                <div key={status} className="flex items-center justify-between gap-3">
                  <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>
                  <Text size="sm" weight="medium">
                    {byStatus[status]}
                  </Text>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
