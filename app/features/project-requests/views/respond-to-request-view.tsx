import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Upload,
} from "lucide-react";
import { Link } from "react-router";

import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Shell, type ShellUser } from "~/components/shell";
import { startOfToday } from "~/components/project-request";
import type { Actor } from "~/data";

import { CreateProjectWizardView } from "./create-project-wizard-view";

/**
 * Respond to a Project Request — the AD (P&C) chooses HOW to submit projects
 * against a single request their centre has received. A short landing between the
 * received-requests list and the two submission surfaces:
 *
 *     Project Requests (received)  →  [this page]  →  Upload Projects  (batch)
 *                                                  →  Create Project   (one at a time)
 *
 * A self-contained page that owns its Shell chrome, like every feature view. The
 * request summary up top mirrors the card the recipient responded from.
 */

/** One requested education level within the request being responded to. */
export interface RespondRequestLine {
  level: string;
  slots: number;
}

/** One project already submitted against the request, for the summary list. */
export interface RespondSubmittedProject {
  title: string;
  level: string;
  slots: number;
}

/** The single request the AD (P&C) is responding to, resolved by the loader. */
export interface RespondRequest {
  id: string;
  /** Name of the officer who raised it, resolved from `requestedBy`. */
  requestedBy: string;
  /** One row per requested education level. */
  lines: RespondRequestLine[];
  /** Total placements requested across every line. */
  placementsNeeded: number;
  /** Placements already submitted against it (summed across matched projects). */
  previouslySubmitted: number;
  /** The projects already submitted against this request. */
  submittedProjects: RespondSubmittedProject[];
  /** Response deadline. YYYY-MM-DD. */
  deadline: string;
}

export interface RespondToRequestViewProps {
  actor: Actor;
  user: ShellUser;
  request: RespondRequest;
}

/** A readable date, e.g. "31 Jul 2026". */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Whole days from today until a deadline — negative once it's passed. */
function daysUntil(iso: string): number {
  const target = new Date(iso);
  const start = startOfToday();
  return Math.round((target.getTime() - start.getTime()) / 86_400_000);
}

/** "in 27 days" phrasing for the deadline, or the overdue/due-today edges. */
function deadlineRemaining(iso: string): string {
  const days = daysUntil(iso);
  if (days < 0) return "overdue";
  if (days === 0) return "due today";
  return `${days}d left`;
}

/**
 * A single way to submit, rendered as a large clickable card. The whole card is
 * the control; the trailing "call to action" is an affordance, not nested. Pass
 * `to` to navigate (batch upload) or `onClick` to stay in place (create in a
 * wizard on this page).
 */
function SubmitOption({
  to,
  onClick,
  icon,
  title,
  description,
  cta,
}: {
  to?: string;
  onClick?: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
}) {
  const className = cn(
    "group flex flex-col gap-3 rounded-lg border border-border bg-surface p-5 text-left sm:p-6",
    "transition-colors hover:border-accent hover:bg-accent-subtle/30",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  );
  const inner = (
    <>
      <span className="flex size-11 items-center justify-center rounded-lg bg-accent-subtle text-accent">
        {icon}
      </span>
      <div className="space-y-1">
        <Text size="lg" weight="semibold" className="text-fg">
          {title}
        </Text>
        <Text size="sm" variant="muted">
          {description}
        </Text>
      </div>
      <span className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-accent">
        {cta}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </>
  );

  return to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}

export function RespondToRequestView({
  actor,
  user,
  request,
}: RespondToRequestViewProps) {
  // "Create individually" reveals a multi-step wizard in place of this landing,
  // keeping the AD (P&C) on the request throughout. "Upload by batch" still
  // navigates away to the shared upload surface.
  const [creating, setCreating] = useState(false);

  if (creating) {
    return (
      <CreateProjectWizardView
        actor={actor}
        user={user}
        requestedLevels={[...new Set(request.lines.map((line) => line.level))]}
        onCancel={() => setCreating(false)}
      />
    );
  }

  const levels = request.lines.map((line) => line.level).join(", ");
  const placementSummary = `${request.placementsNeeded} placement${
    request.placementsNeeded === 1 ? "" : "s"
  }${levels ? ` (${levels})` : ""}`;

  return (
    <Shell actor={actor} user={user} workstream="Internship">
      <div className="mb-5">
        <Link
          to="/project-requests"
          className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-fg"
        >
          <ArrowLeft className="size-4" />
          Back to Project Requests
        </Link>
      </div>

      {/* Request summary */}
      <div>
        <Heading as="h1" size="3xl">
          Respond to request from {request.requestedBy}
        </Heading>
        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
          <Clock className="size-4 text-fg-subtle" />
          <Text as="span" size="sm" variant="muted">
            Deadline {formatDate(request.deadline)} · {deadlineRemaining(request.deadline)}
          </Text>
          <Text as="span" size="sm" variant="muted">
            · {placementSummary}
          </Text>
          <Text as="span" size="sm" variant="muted">
            ·{" "}
            <span className="font-semibold text-fg">
              {request.previouslySubmitted} of {request.placementsNeeded}
            </span>{" "}
            submitted
          </Text>
        </div>
      </div>

      {/* Submission method */}
      <div className="mt-6">
        <Text size="sm" weight="semibold" className="text-fg">
          How would you like to submit?
        </Text>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <SubmitOption
            to="/projects/upload"
            icon={<Upload className="size-5" />}
            title="Upload by batch"
            description="Download the Excel template, fill it in, and upload many projects at once. Best for a long list."
            cta="Start upload"
          />
          <SubmitOption
            onClick={() => setCreating(true)}
            icon={<Plus className="size-5" />}
            title="Create individually"
            description="Fill in a guided form, one project at a time. Best for adding just a few projects."
            cta="Create a project"
          />
        </div>
      </div>

      {/* Projects already submitted against this request. */}
      {request.submittedProjects.length > 0 ? (
        <div className="mt-8">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4 text-success" />
            <Text size="sm" weight="semibold" className="text-fg">
              Already submitted ({request.submittedProjects.length})
            </Text>
          </div>
          <div className="mt-3 space-y-2">
            {request.submittedProjects.map((project, index) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 rounded-lg border border-border bg-surface px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <FileText className="size-4 shrink-0 text-fg-muted" />
                  <Text size="sm" weight="medium" className="truncate text-fg">
                    {project.title}
                  </Text>
                </div>
                <Text size="sm" variant="muted" className="shrink-0">
                  {project.level} · {project.slots} slot
                  {project.slots === 1 ? "" : "s"}
                </Text>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Shell>
  );
}
