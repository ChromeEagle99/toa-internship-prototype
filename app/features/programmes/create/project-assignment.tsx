import { useState } from "react";
import { FolderOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import type { Project } from "~/data";
import type { MonthValue } from "~/components/month-picker";

import { matchProject, projectPeriodLabel } from "./matching";
import type { IntakeDraft } from "./types";

/**
 * The Intakes step's right pane: the project pool for the selected intake.
 *
 * Projects are filtered by match state (education level + internship period
 * within the intake) via the All / Matched / Unmatched tabs. Unassigned projects
 * can be attached to the selected intake; anything already attached shows below
 * with an unassign control.
 */
export interface ProjectAssignmentProps {
  intake: IntakeDraft | null;
  intakeIndex: number;
  projects: Project[];
  educationLevel: string;
  /** projectId → intakeId. */
  assignments: Record<string, string>;
  onAssign: (projectId: string) => void;
  onUnassign: (projectId: string) => void;
}

type Filter = "all" | "matched" | "unmatched";

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
] as const;

function shortMonth(value: MonthValue): string {
  return `${MONTHS_SHORT[value.month]}${String(value.year).slice(2)}`;
}

function intakePeriodLabel(intake: IntakeDraft): string {
  if (intake.internshipStart && intake.internshipEnd) {
    return `${shortMonth(intake.internshipStart)} – ${shortMonth(intake.internshipEnd)}`;
  }
  return "Set internship period";
}

/** One project row with its match state and an assign / unassign action. */
function ProjectCard({
  project,
  matched,
  assignedElsewhere,
  isAssigned,
  onAssign,
  onUnassign,
}: {
  project: Project;
  matched: boolean;
  assignedElsewhere: boolean;
  isAssigned: boolean;
  onAssign: () => void;
  onUnassign: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-4">
      <div className="min-w-0 space-y-1">
        <Text as="p" size="sm" weight="semibold" className="truncate">
          {project.projectTitle}
        </Text>
        <Text as="p" size="xs" variant="muted">
          {projectPeriodLabel(project)} · {project.placement} of {project.placement} placements free
        </Text>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span
            className={cn(
              "size-1.5 rounded-full",
              matched ? "bg-success" : "bg-fg-muted",
            )}
          />
          <Text as="span" size="xs" variant="muted">
            {matched ? "Matched" : "Unmatched"}
          </Text>
        </div>
      </div>

      {isAssigned ? (
        <Button variant="outline" size="sm" onClick={onUnassign}>
          Unassign
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={onAssign}
          disabled={assignedElsewhere}
          title={assignedElsewhere ? "Already assigned to another intake" : undefined}
        >
          Assign
        </Button>
      )}
    </div>
  );
}

export function ProjectAssignment({
  intake,
  intakeIndex,
  projects,
  educationLevel,
  assignments,
  onAssign,
  onUnassign,
}: ProjectAssignmentProps) {
  const [filter, setFilter] = useState<Filter>("all");

  if (!intake) {
    return (
      <div className="rounded-lg border border-border">
        <EmptyState
          icon={<FolderOpen className="size-6" />}
          title="Select an intake"
          description="Pick an intake on the left to see the projects that can be attached to it."
        />
      </div>
    );
  }

  const matchOf = (project: Project) =>
    matchProject(project, educationLevel, intake.internshipStart, intake.internshipEnd).matched;

  const assigned = projects.filter((p) => assignments[p.projectId] === intake.id);

  const unassigned = projects.filter((p) => !assignments[p.projectId]);
  const filtered = unassigned.filter((p) => {
    if (filter === "matched") return matchOf(p);
    if (filter === "unmatched") return !matchOf(p);
    return true;
  });

  return (
    <div className="rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border p-4">
        <div>
          <Text as="p" size="sm" weight="semibold">
            Unassigned
          </Text>
          <Text as="p" size="xs" variant="muted">
            Intake {intakeIndex + 1} · {intakePeriodLabel(intake)}
          </Text>
        </div>
        <Badge variant="subtle">{filtered.length}</Badge>
      </div>

      {/* Filter tabs */}
      <div className="border-b border-border p-4 pb-0">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="matched">Matched</TabsTrigger>
            <TabsTrigger value="unmatched">Unmatched</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Body */}
      <div className="space-y-3 p-4">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="size-6" />}
            title="No unassigned projects"
            description="All projects in this pool are already assigned, or none match the current filter."
          />
        ) : (
          filtered.map((project) => (
            <ProjectCard
              key={project.projectId}
              project={project}
              matched={matchOf(project)}
              assignedElsewhere={false}
              isAssigned={false}
              onAssign={() => onAssign(project.projectId)}
              onUnassign={() => onUnassign(project.projectId)}
            />
          ))
        )}

        {assigned.length > 0 ? (
          <div className="space-y-3 pt-2">
            <Text as="p" size="xs" variant="subtle" weight="semibold" className="uppercase tracking-wide">
              Assigned to this intake
            </Text>
            {assigned.map((project) => (
              <ProjectCard
                key={project.projectId}
                project={project}
                matched={matchOf(project)}
                assignedElsewhere={false}
                isAssigned
                onAssign={() => onAssign(project.projectId)}
                onUnassign={() => onUnassign(project.projectId)}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
