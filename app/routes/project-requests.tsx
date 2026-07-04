import { Fragment, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronRight,
  Columns3,
  Download,
  Search,
  Send,
} from "lucide-react";
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
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { AccessDeniedBoundary } from "~/components/access-denied";
import { Shell } from "~/components/shell";
import {
  EmailPreviewSheet,
  type RequestItem,
} from "~/components/project-request";
import { requireActor } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  projectRequestsRepository,
  projectsRepository,
  resolveUser,
  type Actor,
  type Project,
  type ProjectRequest,
} from "~/data";
import { fulfilmentFor } from "~/features/project-requests/reconcile";
import { projectRequestsVariantFor } from "~/features/project-requests/view-for";
import {
  ReceivedRequestsView,
  type ReceivedRequest,
  type RejectedProject,
} from "~/features/project-requests/views/received-requests-view";

import type { Route } from "./+types/project-requests";

/**
 * Project Requests — the first stage of the project lifecycle, where an Internship
 * Officer asks Programme Centres to submit projects for an intake:
 *
 *     ProjectRequest  →  ProjectSubmissionBatch { SubmittedProject[] }  →  ProjectEntry
 *     (this page)        (PC uploads, IO/DCE reviews)                      (live projects)
 *
 * A queue of requests, one row per PC Head, each expandable to its per-education-
 * level placement breakdown. The toolbar (search, sortable headers) is client-side
 * over the rows the loader resolved; "Columns" and "Export" are affordances, not
 * yet wired. "View Email" opens the same email preview the create flow reviews.
 *
 * Project requests aren't a data resource yet, so the page is ROLE-GATED to match
 * the side-nav: Internship Officers and IO Admins manage the requests they send;
 * AD (P&C) see the requests their centre has received (a separate variant — see
 * `features/project-requests/view-for`). The data below is placeholder sample
 * content until a `projectRequestsRepository` exists.
 */

export function meta() {
  return [{ title: "Project Requests — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);

  // Project requests aren't a policy resource, so the variant mapper doubles as
  // the role gate: no variant → 403 (the same allowlist the side-nav uses).
  const variant = projectRequestsVariantFor(actor.role);
  if (!variant) {
    throw new Response("Project requests are restricted to your role.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const dbUser = await resolveUser(actor.id);
  const user = {
    name: dbUser?.name ?? ROLE_LABELS[actor.role],
    email: dbUser?.email,
  };

  // AD (P&C): the requests addressed to them. Read every project request the
  // actor may see, then narrow to the ones whose `adPncEmail` is this AD's
  // address — the tag the create flow sets is the relation. (The row filter lives
  // here because the actor carries no email for a policy-level `where` to match.)
  if (variant === "received") {
    const res = await projectRequestsRepository.as(actor).list();
    const addressed =
      res.ok && user.email
        ? res.data.filter(
            (request) =>
              request.adPncEmail?.toLowerCase() === user.email!.toLowerCase(),
          )
        : [];
    // The projects this centre has already submitted, so each card can show real
    // fulfilment progress (soft-matched by the addressed AD + education level).
    const projectsRes = await projectsRepository.as(actor).list();
    const projects = projectsRes.ok ? projectsRes.data : [];
    const requests = addressed.map((request) =>
      toReceivedRequest(request, projects),
    );
    // Projects this AD submitted that the IO rejected — surfaced back for revision.
    const rejected = toRejectedProjects(projects, actor, user.email, addressed);
    return {
      variant,
      actor,
      user,
      requests: await Promise.all(requests),
      rejected,
    };
  }

  // IO / IO Admin: the requests they've sent to Programme Centres. Read live from
  // the project-requests repository (seed/clear these rows from the Dev database),
  // then adapt each entity into the row shape this table renders. Reconcile each
  // against submitted projects so the status reflects how far the AD (P&C) has
  // actually responded — "Incomplete" while some but not all placements are in.
  const res = await projectRequestsRepository.as(actor).list();
  const projectsRes = await projectsRepository.as(actor).list();
  const projects = projectsRes.ok ? projectsRes.data : [];
  const requests = res.ok ? res.data.map((r) => toRow(r, projects)) : [];
  return { variant, actor, user, requests, canCreate: true };
}

/** One education-level line within a request. */
interface PlacementLine {
  level: string;
  slots: number;
}

/**
 * The status shown in the manage table's "Overall Status" column. Unlike the
 * stored `draft | sent` enum, this folds in how far the AD (P&C) has responded: a
 * sent request reads "Incomplete" once some — but not all — of its placements have
 * projects against them, and "Complete" once fully fulfilled.
 */
type RequestDisplayStatus = "draft" | "sent" | "incomplete" | "complete";

/**
 * Derive a request's display status from its stored status and how many placements
 * have been submitted against it (soft-matched by the addressed AD + education
 * level — see `fulfilmentFor`). Drafts stay drafts; only sent requests carry
 * fulfilment.
 */
function displayStatusFor(
  request: ProjectRequest,
  projects: Project[],
): RequestDisplayStatus {
  if (request.status === "draft") return "draft";
  const { placementsSubmitted, fulfilled } = fulfilmentFor(request, projects);
  if (fulfilled) return "complete";
  if (placementsSubmitted > 0) return "incomplete";
  return "sent";
}

/**
 * The row shape this table renders — a view-model over the `ProjectRequest`
 * entity (see `~/data`). The entity is the source of truth; `toRow` below adapts
 * one into this flattened shape, reconciling it against submitted projects for
 * its status.
 */
interface ProjectRequestRow {
  id: string;
  /** PC Head the request is addressed to. */
  recipientName: string;
  /** AD (P&C) copied on the request — the email Cc. */
  adPnc: string;
  placements: PlacementLine[];
  /** When the request was raised. YYYY-MM-DD, or "" if unknown. */
  requestDate: string;
  /** When the recipient's response is due. YYYY-MM-DD. */
  deadline: string;
  status: RequestDisplayStatus;
}

/** Adapt a stored `ProjectRequest` into the row this table renders. */
function toRow(request: ProjectRequest, projects: Project[]): ProjectRequestRow {
  return {
    id: request.requestId,
    recipientName: request.pcHead,
    adPnc: request.adPnc,
    placements: request.lines.map((line) => ({
      level: line.educationLevel,
      slots: line.placements,
    })),
    requestDate: request.createdAt ? request.createdAt.slice(0, 10) : "",
    deadline: request.deadline,
    status: displayStatusFor(request, projects),
  };
}

/**
 * The projects this AD (P&C) submitted that the IO rejected, adapted for the
 * "Needs revision" banner. Matched to the AD by submitter id or captured email
 * (mirroring how the received requests are addressed). Each links back to the
 * respond flow of a request asking for its education level, or to batch upload as
 * a fallback when no such request is in view.
 */
function toRejectedProjects(
  projects: Project[],
  actor: Actor,
  email: string | undefined,
  requests: ProjectRequest[],
): RejectedProject[] {
  const mine = projects.filter((project) => {
    if (project.reviewStatus?.toLowerCase() !== "rejected") return false;
    if (project.submittedBy === actor.id) return true;
    return Boolean(
      email &&
        project.submittedByEmail?.toLowerCase() === email.toLowerCase(),
    );
  });

  return mine.map((project) => {
    const match = requests.find((request) =>
      request.lines.some((line) => line.educationLevel === project.educationLevel),
    );
    return {
      id: project.projectId,
      title: project.projectTitle,
      remarks: project.reviewRemarks,
      resubmitTo: match
        ? `/project-requests/${match.requestId}/respond`
        : "/projects/upload",
    };
  });
}

/**
 * Adapt a stored `ProjectRequest` into the card the AD (P&C) recipient sees.
 * Resolves the requester's name/email from `requestedBy` (falling back to the
 * email captured on the request), and totals the requested placements.
 */
async function toReceivedRequest(
  request: ProjectRequest,
  projects: Project[],
): Promise<ReceivedRequest> {
  const requester = request.requestedBy
    ? await resolveUser(request.requestedBy)
    : null;
  // Reconcile the request against submitted projects for real progress/status.
  const fulfilment = fulfilmentFor(request, projects);
  return {
    id: request.requestId,
    requestedBy: requester?.name ?? "Internship Office",
    requestedByEmail: request.requestedByEmail ?? requester?.email,
    lines: request.lines.map((line) => ({
      level: line.educationLevel,
      slots: line.placements,
    })),
    placementsNeeded: fulfilment.placementsNeeded,
    previouslySubmitted: fulfilment.placementsSubmitted,
    sentDate: request.createdAt ? request.createdAt.slice(0, 10) : "",
    deadline: request.deadline,
    submitted: fulfilment.fulfilled,
  };
}

/**
 * Display status → badge. Extends the stored draft/sent with fulfilment-derived
 * states, so an IO can see at a glance which requests the AD (P&C) has only
 * partially answered.
 */
const STATUS_BADGE: Record<
  RequestDisplayStatus,
  { variant: BadgeProps["variant"]; label: string }
> = {
  draft: { variant: "subtle", label: "Draft" },
  sent: { variant: "info", label: "Sent" },
  incomplete: { variant: "warning", label: "Incomplete" },
  complete: { variant: "success", label: "Complete" },
};

// ── Derived values ─────────────────────────────────────────────────────────────

const totalPlacements = (row: ProjectRequestRow) =>
  row.placements.reduce((sum, line) => sum + line.slots, 0);

/** A readable date, e.g. "28 Jul 2026", or "—" when absent/unparseable. */
function formatDate(iso: string): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Adapt a list row into the shape the shared email preview expects. */
function toRequestItem(row: ProjectRequestRow): RequestItem {
  return {
    id: row.id,
    pcHead: row.recipientName,
    pcHeadEmail: null,
    adPnc: row.adPnc,
    adPncEmail: null,
    deadline: new Date(row.deadline),
    rows: row.placements.map((line, index) => ({
      id: `${row.id}-p${index}`,
      level: line.level,
      placements: line.slots,
    })),
    collapsed: false,
    selected: false,
  };
}

// ── Sorting ─────────────────────────────────────────────────────────────────────

type SortKey =
  | "recipient"
  | "levels"
  | "placements"
  | "requestDate"
  | "deadline"
  | "status";
type SortDir = "asc" | "desc";

const SORT_VALUE: Record<SortKey, (row: ProjectRequestRow) => string | number> = {
  recipient: (r) => r.recipientName.toLowerCase(),
  levels: (r) => r.placements.length,
  placements: (r) => totalPlacements(r),
  requestDate: (r) => r.requestDate,
  deadline: (r) => r.deadline,
  status: (r) => r.status,
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProjectRequests({ loaderData }: Route.ComponentProps) {
  // AD (P&C) get a distinct "requests received" surface; IO / IO Admin manage the
  // requests they've sent (the queue below).
  if (loaderData.variant === "received") {
    return (
      <ReceivedRequestsView
        actor={loaderData.actor}
        user={loaderData.user}
        requests={loaderData.requests}
        rejected={loaderData.rejected}
      />
    );
  }
  return <ManageRequestsPage data={loaderData} />;
}

function ManageRequestsPage({
  data,
}: {
  data: Extract<Route.ComponentProps["loaderData"], { variant: "manage" }>;
}) {
  const { actor, user, requests, canCreate } = data;

  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir } | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<string>>(new Set());
  const [previewId, setPreviewId] = useState<string | null>(null);

  const sender = { name: user.name, role: `${ROLE_LABELS[actor.role]}, DSTA` };

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? requests.filter((row) =>
          [
            row.recipientName,
            row.adPnc,
            ...row.placements.map((p) => p.level),
          ].some((field) => field.toLowerCase().includes(needle)),
        )
      : requests;

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
  }, [requests, query, sort]);

  const previewRow = requests.find((r) => r.id === previewId) ?? null;

  function toggleSort(key: SortKey) {
    setSort((current) => {
      if (current?.key !== key) return { key, dir: "asc" };
      if (current.dir === "asc") return { key, dir: "desc" };
      return null; // third click clears the sort
    });
  }

  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <Shell
      actor={actor}
      user={user}
      title="Project Requests"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link to="/project-requests/new" className={buttonVariants({ size: "md" })}>
            <Send className="size-4" />
            Create Project Request
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
                aria-label="Search project requests"
                placeholder="Search by name or programme…"
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

        {/* Requests table. */}
        <div className="mt-4 overflow-hidden rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow className="bg-bg-muted/50 hover:bg-bg-muted/50">
                <SortableHead
                  label="Recipient"
                  sortKey="recipient"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Education Levels"
                  sortKey="levels"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Placements Requested"
                  sortKey="placements"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Request Date"
                  sortKey="requestDate"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Deadline"
                  sortKey="deadline"
                  sort={sort}
                  onSort={toggleSort}
                />
                <SortableHead
                  label="Overall Status"
                  sortKey="status"
                  sort={sort}
                  onSort={toggleSort}
                />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Text size="sm" variant="muted">
                      {query.trim()
                        ? "No requests match your search."
                        : "No project requests yet. Create one to ask a Programme Centre for projects."}
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                visibleRows.map((row) => {
                  const badge = STATUS_BADGE[row.status];
                  const isExpanded = expanded.has(row.id);
                  return (
                    <Fragment key={row.id}>
                      <TableRow>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(row.id)}
                              aria-expanded={isExpanded}
                              aria-label={
                                isExpanded ? "Collapse request" : "Expand request"
                              }
                              className="text-fg-muted transition-colors hover:text-fg"
                            >
                              <ChevronRight
                                className={cn(
                                  "size-4 transition-transform",
                                  isExpanded && "rotate-90",
                                )}
                              />
                            </button>
                            <div className="flex flex-col">
                              <Text size="sm" weight="medium" className="text-fg">
                                {row.recipientName}
                              </Text>
                              <Text size="xs" variant="muted">
                                AD (P&C): {row.adPnc}
                              </Text>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Text size="sm" variant="muted">
                            {row.placements.length} education level
                            {row.placements.length === 1 ? "" : "s"}
                          </Text>
                        </TableCell>
                        <TableCell className="tabular-nums text-fg">
                          {totalPlacements(row)}
                        </TableCell>
                        <TableCell className="text-fg">
                          {formatDate(row.requestDate)}
                        </TableCell>
                        <TableCell className="text-fg">
                          {formatDate(row.deadline)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <button
                            type="button"
                            onClick={() => setPreviewId(row.id)}
                            className="text-sm font-medium text-accent transition-colors hover:underline"
                          >
                            View Email
                          </button>
                        </TableCell>
                      </TableRow>

                      {isExpanded
                        ? row.placements.map((line, index) => (
                            <TableRow
                              key={`${row.id}-p${index}`}
                              className="bg-bg-subtle/40 hover:bg-bg-subtle/40"
                            >
                              <TableCell className="pl-12">
                                <Text size="sm" weight="medium">
                                  {line.level}
                                </Text>
                              </TableCell>
                              <TableCell />
                              <TableCell>
                                <Text size="sm" variant="muted">
                                  {line.slots} slot{line.slots === 1 ? "" : "s"}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Text size="sm" variant="muted">
                                  {formatDate(row.requestDate)}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Text size="sm" variant="muted">
                                  {formatDate(row.deadline)}
                                </Text>
                              </TableCell>
                              <TableCell>
                                <Badge variant={badge.variant}>{badge.label}</Badge>
                              </TableCell>
                              <TableCell />
                            </TableRow>
                          ))
                        : null}
                    </Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer count. */}
        <div className="mt-3 flex justify-end">
          <Text size="sm" variant="muted">
            <span className="font-semibold text-fg">{visibleRows.length}</span> of{" "}
            {requests.length} PC Head{requests.length === 1 ? "" : "s"}
          </Text>
        </div>
      </Card>

      <EmailPreviewSheet
        request={previewRow ? toRequestItem(previewRow) : null}
        sender={sender}
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
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

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Your current role isn't permitted to view Project Requests. Switch to a role that can (Internship Officer, IO Admin, or AD (P&C))." />
  );
}
