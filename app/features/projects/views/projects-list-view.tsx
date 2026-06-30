import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  Plus,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Shell, type ShellUser } from "~/components/shell";
import type { Actor, Programme, Project } from "~/data";

/**
 * The default Projects page: the live project queue an actor may read, organised
 * into lifecycle tabs (Drafts → Pending Review → Project Pool → Allocated →
 * Archived). Used by IO, IO Admin and Director. A self-contained page — it owns
 * its Shell chrome — so the route only has to choose and render it.
 *
 * The toolbar (tabs, search, sortable headers, row selection) is client-side: it
 * filters and sorts the rows the loader already resolved. "Columns" and "Export"
 * are present as affordances but not yet wired.
 */

// ── Lifecycle tabs ────────────────────────────────────────────────────────────

/**
 * The lifecycle buckets a project moves through, in order. `noun` is the singular
 * word used in the footer count ("Showing 3 of 3 pending projects").
 */
export const PROJECT_TABS = [
  { key: "drafts", label: "Drafts", noun: "draft" },
  { key: "pending", label: "Pending Review", noun: "pending" },
  { key: "pool", label: "Project Pool", noun: "pool" },
  { key: "allocated", label: "Allocated Projects", noun: "allocated" },
  { key: "archived", label: "Archived", noun: "archived" },
] as const;

export type ProjectBucket = (typeof PROJECT_TABS)[number]["key"];

/**
 * TODO(status-buckets): the `reviewStatus` value set is still TBD (see
 * `ProjectSchema`). This mapping is PROVISIONAL — confirm the canonical status
 * values with the BA and revisit. Note a project can be attached to a programme
 * (have an `intakeId`) at any lifecycle stage, so the bucket is driven solely by
 * `reviewStatus`; anything unrecognised falls into "pending" so nothing is
 * silently dropped from the queue.
 */
function bucketFor(project: Pick<Project, "reviewStatus">): ProjectBucket {
  switch ((project.reviewStatus ?? "").toLowerCase()) {
    case "draft":
      return "drafts";
    case "approved":
    case "pool":
      return "pool";
    case "allocated":
      return "allocated";
    case "archived":
    case "rejected":
      return "archived";
    default:
      return "pending"; // pending / in-progress / unknown
  }
}

/** Lifecycle bucket → status badge. Drives the Status column, so it stays in
 * step with the tabs. */
const BUCKET_BADGE: Record<ProjectBucket, { variant: BadgeProps["variant"]; label: string }> = {
  drafts: { variant: "subtle", label: "Draft" },
  pending: { variant: "warning", label: "Pending Review" },
  pool: { variant: "info", label: "Project Pool" },
  allocated: { variant: "success", label: "Allocated" },
  archived: { variant: "subtle", label: "Archived" },
};

// ── Row model ─────────────────────────────────────────────────────────────────

/**
 * A project flattened for the table: its own fields plus the programme it's
 * attached to (resolved via `intakeId`) and its derived lifecycle bucket. Built
 * by {@link toProjectRows} in the loader, so the view stays presentational.
 */
export interface ProjectListRow {
  projectId: string;
  projectTitle: string;
  /** Friendly programme code, e.g. "PROG-0009". Null if unattached. */
  programmeCode: string | null;
  /** Programme title, e.g. "University Internship 2026". Null if unattached. */
  programmeName: string | null;
  /** Programme Centre code the project was submitted under, e.g. "SECC". */
  submittedBy: string;
  mentorName: string;
  mentorDesignation: string;
  slots: number;
  bucket: ProjectBucket;
}

/**
 * Resolve each project's programme (via `intakeId` → an intake window) and flatten
 * it into a {@link ProjectListRow}. Programme stays null when the project isn't
 * attached to any intake yet.
 */
export function toProjectRows(
  projects: Project[],
  programmes: Programme[],
): ProjectListRow[] {
  // intake_id → owning programme, so the lookup is O(1) per project.
  const programmeByIntake = new Map<string, Programme>();
  for (const programme of programmes) {
    for (const intake of programme.intakeWindows) {
      if (intake.intakeId) programmeByIntake.set(intake.intakeId, programme);
    }
  }

  return projects.map((project) => {
    const programme = project.intakeId
      ? programmeByIntake.get(project.intakeId) ?? null
      : null;
    return {
      projectId: project.projectId,
      projectTitle: project.projectTitle,
      programmeCode: programme?.programmeId ?? null,
      programmeName: programme?.programmeTitle ?? null,
      submittedBy: project.pcCode,
      mentorName: project.mentorName,
      mentorDesignation: project.mentorDesignation,
      slots: project.placement,
      bucket: bucketFor(project),
    };
  });
}

// ── Sorting ───────────────────────────────────────────────────────────────────

type SortKey = "project" | "programme" | "submittedBy" | "mentor" | "slots" | "status";
type SortDir = "asc" | "desc";

const SORT_VALUE: Record<SortKey, (row: ProjectListRow) => string | number> = {
  project: (r) => r.projectTitle.toLowerCase(),
  programme: (r) => (r.programmeName ?? "").toLowerCase(),
  submittedBy: (r) => r.submittedBy.toLowerCase(),
  mentor: (r) => r.mentorName.toLowerCase(),
  slots: (r) => r.slots,
  status: (r) => r.bucket,
};

// ── View ──────────────────────────────────────────────────────────────────────

export interface ProjectsListViewProps {
  actor: Actor;
  user: ShellUser;
  rows: ProjectListRow[];
  canCreate: boolean;
}

export function ProjectsListView({ actor, user, rows, canCreate }: ProjectsListViewProps) {
  const [tab, setTab] = useState<ProjectBucket>("pending");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  /** Count per tab, across all rows (search-independent, like the image). */
  const counts = useMemo(() => {
    const tally: Record<ProjectBucket, number> = {
      drafts: 0,
      pending: 0,
      pool: 0,
      allocated: 0,
      archived: 0,
    };
    for (const row of rows) tally[row.bucket]++;
    return tally;
  }, [rows]);

  /** Rows in the active tab, after search and sort. */
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const inTab = rows.filter((row) => row.bucket === tab);
    const filtered = needle
      ? inTab.filter((row) =>
          [row.projectTitle, row.mentorName, row.programmeName, row.programmeCode, row.submittedBy]
            .some((field) => field?.toLowerCase().includes(needle)),
        )
      : inTab;

    if (!sort) return filtered;
    const read = SORT_VALUE[sort.key];
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = read(a);
      const bv = read(b);
      if (av < bv) return -1 * factor;
      if (av > bv) return 1 * factor;
      return 0;
    });
  }, [rows, tab, query, sort]);

  const activeTab = PROJECT_TABS.find((t) => t.key === tab)!;
  const allVisibleSelected =
    visibleRows.length > 0 && visibleRows.every((row) => selected.has(row.projectId));
  const someVisibleSelected = visibleRows.some((row) => selected.has(row.projectId));

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null; // third click clears the sort
    });
  }

  function toggleRow(projectId: string, checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(projectId);
      else next.delete(projectId);
      return next;
    });
  }

  function toggleAllVisible(checked: boolean) {
    setSelected((current) => {
      const next = new Set(current);
      for (const row of visibleRows) {
        if (checked) next.add(row.projectId);
        else next.delete(row.projectId);
      }
      return next;
    });
  }

  return (
    <Shell
      actor={actor}
      user={user}
      title="Projects"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link to="/projects/new" className={buttonVariants({ size: "md" })}>
            <Plus className="size-4" />
            Create Project
          </Link>
        ) : null
      }
    >
      <Card className="p-4 sm:p-6">
        {/* Toolbar: search + columns on the left, export on the right. */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input
                type="search"
                aria-label="Search projects"
                placeholder="Search by title, mentor, programme…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="md">
              <Columns3 className="size-4" />
              Columns
            </Button>
          </div>
          <Button variant="outline" size="md">
            <Download className="size-4" />
            Export
          </Button>
        </div>

        {/* Lifecycle tabs with live counts. */}
        <Tabs
          value={tab}
          onValueChange={(value) => setTab(value as ProjectBucket)}
          className="mt-4"
        >
          <TabsList className="flex-wrap">
            {PROJECT_TABS.map((definition) => (
              <TabsTrigger key={definition.key} value={definition.key}>
                {definition.label}
                <span className="ml-1.5 text-xs tabular-nums opacity-70">
                  {counts[definition.key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Project table for the active tab. */}
        <div className="mt-4 overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-muted/50 hover:bg-bg-muted/50">
                <TableHead className="w-10">
                  <Checkbox
                    aria-label="Select all projects"
                    checked={allVisibleSelected}
                    indeterminate={!allVisibleSelected && someVisibleSelected}
                    onCheckedChange={(checked) => toggleAllVisible(checked === true)}
                  />
                </TableHead>
                <SortableHead label="Project" sortKey="project" sort={sort} onSort={toggleSort} />
                <SortableHead
                  label="Programme"
                  sortKey="programme"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Submitted By"
                  sortKey="submittedBy"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead label="Mentor" sortKey="mentor" sort={sort} onSort={toggleSort} />
                <SortableHead label="Slots" sortKey="slots" sort={sort} onSort={toggleSort} />
                <SortableHead label="Status" sortKey="status" sort={sort} onSort={toggleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Text size="sm" variant="muted">
                      {query.trim()
                        ? "No projects match your search."
                        : `No ${activeTab.noun} projects.`}
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => {
                  const badge = BUCKET_BADGE[row.bucket];
                  const isSelected = selected.has(row.projectId);
                  return (
                    <TableRow key={row.projectId} data-state={isSelected ? "selected" : undefined}>
                      <TableCell>
                        <Checkbox
                          aria-label={`Select ${row.projectTitle}`}
                          checked={isSelected}
                          onCheckedChange={(checked) => toggleRow(row.projectId, checked === true)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-fg">{row.projectTitle}</TableCell>
                      <TableCell>
                        {row.programmeCode ? (
                          <div className="flex flex-col">
                            <Text size="sm" className="text-accent">
                              {row.programmeCode}
                            </Text>
                            <Text size="xs" variant="muted">
                              {row.programmeName}
                            </Text>
                          </div>
                        ) : (
                          <Text size="xs" variant="muted">
                            —
                          </Text>
                        )}
                      </TableCell>
                      <TableCell>
                        <Text size="sm" variant="muted">
                          {row.submittedBy}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <Text size="sm" className="text-fg">
                            {row.mentorName}
                          </Text>
                          <Text size="xs" variant="muted">
                            {row.mentorDesignation}
                          </Text>
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums">{row.slots}</TableCell>
                      <TableCell>
                        <Badge variant={badge.variant}>{badge.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer count, mirroring the active tab. */}
        <div className="mt-3 flex justify-end">
          <Text size="sm" weight="semibold">
            Showing {visibleRows.length} of {counts[tab]} {activeTab.noun} project
            {counts[tab] === 1 ? "" : "s"}
          </Text>
        </div>
      </Card>
    </Shell>
  );
}

/** A sortable column header: label + a sort-direction affordance. */
function SortableHead({
  label,
  sortKey,
  sort,
  onSort,
  className,
}: {
  label: string;
  sortKey: SortKey;
  sort: { key: SortKey; dir: SortDir } | null;
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  const Icon = !active ? ArrowUpDown : sort.dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          "-mx-1 inline-flex items-center gap-1 rounded px-1 py-0.5 transition-colors hover:text-fg",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          active && "text-fg",
        )}
      >
        {label}
        <Icon className={cn("size-3.5", active ? "text-accent" : "text-fg-subtle")} />
      </button>
    </TableHead>
  );
}
