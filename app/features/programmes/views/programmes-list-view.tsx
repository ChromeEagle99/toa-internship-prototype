import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Columns3,
  Download,
  Plus,
  Search,
} from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import type { Actor, Programme, ProgStatus } from "~/data";

/**
 * The Programmes index for IO and IO Admin: the programmes an actor may read,
 * filtered by status tab (All → Active → Draft → Completed). A self-contained
 * page — it owns its Shell chrome — so the route only has to load and render it.
 *
 * The toolbar (status tabs, search, sortable headers, row expansion) is
 * client-side: it filters and sorts the rows the loader already resolved.
 * "Columns" and "Export" are present as affordances but not yet wired, matching
 * the Projects list. Expanding a row reveals the programme's intake window(s).
 */

// ── Status tabs ───────────────────────────────────────────────────────────────

/** The status filter tabs. `all` is a synthetic bucket spanning every row. */
const STATUS_TABS = [
  { key: "all", label: "All" },
  { key: "Active", label: "Active" },
  { key: "Draft", label: "Draft" },
  { key: "Completed", label: "Completed" },
] as const;

type TabKey = (typeof STATUS_TABS)[number]["key"];

/** Programme status → the coloured dot shown in the Programme Status column. */
const STATUS_DOT: Record<ProgStatus, string> = {
  Draft: "bg-fg-subtle",
  Active: "bg-success",
  Completed: "bg-fg-muted",
};

/** Long taxonomy value → the short label shown in the Education Level pill. */
const EDUCATION_LABEL: Record<string, string> = {
  "University (Undergraduate)": "University",
  "Junior College": "Junior College",
  "Post-JC / Post-Poly": "Post JC/Post Poly",
};

// ── Date helpers ──────────────────────────────────────────────────────────────

/** British short months; "Sept" not "Sep", matching the design. */
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sept", "Oct", "Nov", "Dec",
] as const;

/** "2026-06-30" → "30 Jun 2026". Parsed by parts so there's no timezone drift. */
function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// ── Row model ─────────────────────────────────────────────────────────────────

/** One intake window flattened for the expanded sub-row. */
export interface ProgrammeIntakeRow {
  title: string;
  window: string;
  durationMonths: number | null;
}

/**
 * A programme flattened for the table: its own fields plus the derived
 * application window, application status (Open/Closed vs `nowIso`) and intake
 * summary. Built by {@link toProgrammeRows} in the loader, so the view stays
 * presentational.
 */
export interface ProgrammeListRow {
  programmeId: string;
  programmeTitle: string;
  status: ProgStatus;
  educationLevel: string;
  educationLabel: string;
  applicationWindow: string;
  /** Open when today falls within the first intake's window; else Closed. */
  applicationStatus: "Open" | "Closed" | null;
  applicationsCount: number;
  intakeCount: number;
  intakes: ProgrammeIntakeRow[];
  /** First intake's open date, for sorting the Application Window column. */
  windowSortKey: string;
}

/**
 * Flatten each programme into a {@link ProgrammeListRow}, deriving the
 * application window and Open/Closed status from its first intake relative to
 * `nowIso` (a `YYYY-MM-DD` string — passed in so the result is deterministic).
 */
export function toProgrammeRows(
  programmes: Programme[],
  nowIso: string,
): ProgrammeListRow[] {
  return programmes.map((programme) => {
    const intakes = programme.intakeWindows.map((intake) => ({
      title: intake.intakeTitle ?? "Intake",
      open: intake.applicationOpen,
      close: intake.applicationClose,
      window: `${formatDate(intake.applicationOpen)} – ${formatDate(intake.applicationClose)}`,
      durationMonths: intake.durationMonths ?? null,
    }));
    const first = intakes[0] ?? null;
    // ISO dates sort lexically, so a string compare is a date compare.
    const applicationStatus = first
      ? first.open <= nowIso && nowIso <= first.close
        ? "Open"
        : "Closed"
      : null;

    return {
      programmeId: programme.programmeId,
      programmeTitle: programme.programmeTitle,
      status: programme.status,
      educationLevel: programme.educationLevel,
      educationLabel: EDUCATION_LABEL[programme.educationLevel] ?? programme.educationLevel,
      applicationWindow: first ? first.window : "—",
      applicationStatus,
      applicationsCount: programme.applicationsCount ?? 0,
      intakeCount: intakes.length,
      intakes: intakes.map(({ title, window, durationMonths }) => ({
        title,
        window,
        durationMonths,
      })),
      windowSortKey: first?.open ?? "",
    };
  });
}

// ── Sorting ───────────────────────────────────────────────────────────────────

type SortKey =
  | "id"
  | "title"
  | "status"
  | "education"
  | "appStatus"
  | "window"
  | "applications";
type SortDir = "asc" | "desc";

const SORT_VALUE: Record<SortKey, (row: ProgrammeListRow) => string | number> = {
  id: (r) => r.programmeId.toLowerCase(),
  title: (r) => r.programmeTitle.toLowerCase(),
  status: (r) => r.status,
  education: (r) => r.educationLabel.toLowerCase(),
  appStatus: (r) => r.applicationStatus ?? "",
  window: (r) => r.windowSortKey,
  applications: (r) => r.applicationsCount,
};

// ── View ──────────────────────────────────────────────────────────────────────

export interface ProgrammesListViewProps {
  actor: Actor;
  user: ShellUser;
  rows: ProgrammeListRow[];
  canCreate: boolean;
}

export function ProgrammesListView({ actor, user, rows, canCreate }: ProgrammesListViewProps) {
  const [tab, setTab] = useState<TabKey>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());

  /** Count per tab, across all rows (search-independent, like the design). */
  const counts = useMemo(() => {
    const tally: Record<TabKey, number> = { all: rows.length, Active: 0, Draft: 0, Completed: 0 };
    for (const row of rows) tally[row.status]++;
    return tally;
  }, [rows]);

  /** Rows in the active tab, after search and sort. */
  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const inTab = tab === "all" ? rows : rows.filter((row) => row.status === tab);
    const filtered = needle
      ? inTab.filter((row) =>
          [row.programmeId, row.programmeTitle].some((field) =>
            field.toLowerCase().includes(needle),
          ),
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

  const activeTab = STATUS_TABS.find((t) => t.key === tab)!;
  const nounPrefix = tab === "all" ? "" : `${activeTab.label.toLowerCase()} `;

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null; // third click clears the sort
    });
  }

  function toggleExpanded(programmeId: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(programmeId)) next.delete(programmeId);
      else next.add(programmeId);
      return next;
    });
  }

  return (
    <Shell
      actor={actor}
      user={user}
      title="Programmes"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link to="/programmes/new" className={buttonVariants({ size: "md" })}>
            <Plus className="size-4" />
            Create Programme
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
                aria-label="Search programmes"
                placeholder="Search by ID or Title…"
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

        {/* Status tabs with live counts. */}
        <Tabs value={tab} onValueChange={(value) => setTab(value as TabKey)} className="mt-4">
          <TabsList className="flex-wrap">
            {STATUS_TABS.map((definition) => (
              <TabsTrigger key={definition.key} value={definition.key}>
                {definition.label}
                <span className="ml-1.5 text-xs tabular-nums opacity-70">
                  {counts[definition.key]}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Programme table for the active tab. */}
        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-muted/50 hover:bg-bg-muted/50">
                <TableHead className="w-10" />
                <SortableHead label="Programme ID" sortKey="id" sort={sort} onSort={toggleSort} />
                <SortableHead label="Programme Title" sortKey="title" sort={sort} onSort={toggleSort} />
                <SortableHead label="Programme Status" sortKey="status" sort={sort} onSort={toggleSort} />
                <SortableHead label="Education Level" sortKey="education" sort={sort} onSort={toggleSort} />
                <SortableHead label="Application Status" sortKey="appStatus" sort={sort} onSort={toggleSort} />
                <SortableHead label="Application Window" sortKey="window" sort={sort} onSort={toggleSort} />
                <SortableHead label="Applications" sortKey="applications" sort={sort} onSort={toggleSort} />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Text size="sm" variant="muted">
                      {query.trim()
                        ? "No programmes match your search."
                        : `No ${nounPrefix}programmes.`}
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => {
                  const isExpanded = expanded.has(row.programmeId);
                  return (
                    <Fragment key={row.programmeId}>
                      <TableRow data-state={isExpanded ? "selected" : undefined}>
                        <TableCell className="w-10">
                          <button
                            type="button"
                            aria-label={isExpanded ? "Collapse intakes" : "Expand intakes"}
                            aria-expanded={isExpanded}
                            onClick={() => toggleExpanded(row.programmeId)}
                            className="inline-flex rounded p-1 text-fg-subtle transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                          >
                            <ChevronRight
                              className={cn("size-4 transition-transform", isExpanded && "rotate-90")}
                            />
                          </button>
                        </TableCell>
                        <TableCell>
                          <Text size="sm" className="font-medium">
                            {row.programmeId}
                          </Text>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-fg">{row.programmeTitle}</span>
                            <button
                              type="button"
                              onClick={() => toggleExpanded(row.programmeId)}
                              className="self-start rounded text-xs text-accent transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                            >
                              {row.intakeCount} intake{row.intakeCount === 1 ? "" : "s"}
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-2 whitespace-nowrap">
                            <span className={cn("size-1.5 rounded-full", STATUS_DOT[row.status])} />
                            <Text size="sm">{row.status}</Text>
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{row.educationLabel}</Badge>
                        </TableCell>
                        <TableCell>
                          {row.applicationStatus ? (
                            <Badge variant={row.applicationStatus === "Open" ? "success" : "subtle"}>
                              {row.applicationStatus}
                            </Badge>
                          ) : (
                            <Text size="xs" variant="muted">
                              —
                            </Text>
                          )}
                        </TableCell>
                        <TableCell>
                          <Text size="sm" variant="muted" className="whitespace-nowrap">
                            {row.applicationWindow}
                          </Text>
                        </TableCell>
                        <TableCell className="tabular-nums">{row.applicationsCount}</TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell colSpan={8} className="bg-bg-muted/30">
                            <div className="px-2 py-1">
                              <Text size="xs" variant="muted" weight="semibold">
                                Intake windows
                              </Text>
                              <ul className="mt-1 space-y-1">
                                {row.intakes.map((intake, index) => (
                                  <li key={index}>
                                    <Text size="sm">
                                      {intake.title} · {intake.window}
                                      {intake.durationMonths ? ` · ${intake.durationMonths} mo` : ""}
                                    </Text>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer count, mirroring the active tab. */}
        <div className="mt-3 flex justify-end">
          <Text size="sm" weight="semibold">
            Showing {visibleRows.length} of {counts[tab]} {nounPrefix}programme
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
          "-mx-1 inline-flex items-center gap-1 whitespace-nowrap rounded px-1 py-0.5 transition-colors hover:text-fg",
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
