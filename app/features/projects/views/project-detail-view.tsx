import { useEffect, useMemo, useState } from "react";
import { useFetcher, useNavigate } from "react-router";
import { Check, Pencil, Sparkles, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { Shell, type ShellUser } from "~/components/shell";
import type { Actor } from "~/data";

import { BUCKET_BADGE, type ProjectBucket } from "./projects-list-view";

/**
 * Project detail / review — where an IO (Admin) opens a single project from the
 * Projects list to read it in full and, while it's pending, approve or reject it.
 * A self-contained page that owns its Shell chrome, like every feature view.
 *
 * The AI affordances (title/description suggestions and the "AI Writing Tips"
 * panel) are deterministic stand-ins for a future model call — enough to
 * demonstrate the review interaction. They operate on local copies of the title
 * and scope; nothing about them persists. Approve/Reject go through the route's
 * server `action`, which patches `reviewStatus`.
 */

// ── The shape the loader resolves and hands this view ─────────────────────────

export interface ProjectDetail {
  projectId: string;
  title: string;
  /** project_scope — the description shown and assessed. */
  scope: string;
  educationLevel: string;
  /** Resolved name of the submitting AD (P&C). */
  submittedByName: string;
  submittedByEmail?: string;
  mentorName: string;
  mentorDesignation: string;
  mentorWriteup?: string;
  slots: number;
  /** discipline_of_study joined for display. */
  discipline: string;
  techDomain?: string;
  emergingArea?: string;
  /** e.g. "3 Months". */
  duration: string;
  skills: string[];
  /** Derived lifecycle bucket — drives the status badge and the review gate. */
  bucket: ProjectBucket;
}

export interface ProjectDetailViewProps {
  actor: Actor;
  user: ShellUser;
  project: ProjectDetail;
  /** Whether this actor may approve/reject (i.e. `update` on projects). */
  canReview: boolean;
}

// ── Deterministic AI stand-ins ────────────────────────────────────────────────

/** Words in a string, ignoring surrounding whitespace. */
function wordCount(value: string): number {
  const trimmed = value.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** True when the first letter of a trimmed string is lower-case. */
function startsLower(value: string): boolean {
  const first = value.trim()[0];
  return Boolean(first) && first === first.toLowerCase() && first !== first.toUpperCase();
}

/** Title-cases a raw phrase, e.g. "smart drone" → "Smart Drone". */
function titleCase(value: string): string {
  return value.replace(/\b\w/g, (character) => character.toUpperCase());
}

/** A cleaned-up title suggestion, mirroring the create wizard's tone. */
function suggestTitle(title: string): string {
  const base = title.trim();
  return `Introduction to ${titleCase(base || "the Proposed Project")}`;
}

/** A fuller, structured description suggestion built from the title. */
function suggestScope(title: string): string {
  const topic = title.trim() || "the project domain";
  return [
    "Overview",
    `In this internship, you will be introduced to the fundamentals of ${topic}. Under close guidance from your mentor, you will explore real-world applications of the domain in a structured and supportive environment.`,
    "",
    "Key Activities",
    "You will participate in guided hands-on exercises, attend knowledge-sharing sessions, and contribute to a small-scale project. Daily activities include reading relevant documentation, running supervised experiments, and reviewing your progress with the team.",
    "",
    "Learning Outcomes",
    "By the end of the internship, you will have gained practical experience with the tools and workflows the team uses, and produced a small deliverable that demonstrates what you have learnt.",
  ].join("\n");
}

type Tone = "danger" | "warning" | "success";

interface TipCategory {
  title: string;
  tone: Tone;
  messages: string[];
}

/** Lint the title and scope into the three "AI Writing Tips" categories. */
function assess(title: string, scope: string): TipCategory[] {
  // Grammar & Tone
  const grammar: string[] = [];
  if (startsLower(title)) {
    grammar.push("Project title should begin with a capital letter.");
  }
  if (wordCount(title) < 3) {
    grammar.push("Project title is too brief. Use a descriptive title of at least 3 words.");
  }
  const sentences = scope
    .split(/[.\n]+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  if (sentences.some(startsLower)) {
    grammar.push(
      "Some sentences in the description do not begin with a capital letter. Review for consistent capitalisation.",
    );
  }

  // Readability
  const words = wordCount(scope);
  const readability: string[] = [];
  if (words < 40) {
    readability.push(
      `Description is too brief (${words} word${words === 1 ? "" : "s"}). Aim for at least 40–60 words covering intern tasks, tools used, and learning outcomes.`,
    );
  }

  // Scope Alignment
  const scopeTips: string[] = [];
  if (words < 30) {
    scopeTips.push(
      "Project scope is too brief. Expand to at least 30–50 words covering intern tasks, learning outcomes, and expected deliverables.",
    );
  }

  return [
    {
      title: "Grammar & Tone",
      tone: grammar.length ? "danger" : "success",
      messages: grammar.length ? grammar : ["Title and description read cleanly."],
    },
    {
      title: "Readability",
      tone: readability.length ? "warning" : "success",
      messages: readability.length ? readability : ["Description length looks good."],
    },
    {
      title: "Scope Alignment",
      tone: scopeTips.length ? "danger" : "success",
      messages: scopeTips.length ? scopeTips : ["Scope covers the essentials."],
    },
  ];
}

// ── Small presentational helpers ─────────────────────────────────────────────

/** A tiny uppercase field label, e.g. "CURRENT TITLE". */
function MicroLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-semibold uppercase tracking-wide text-fg-subtle">
      {children}
    </span>
  );
}

/** The "✨ AI Suggestion" header used above each suggestion field. */
function SuggestionHeader({ note }: { note?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Sparkles className="size-3.5 text-accent" />
      <span className="text-[11px] font-semibold uppercase tracking-wide text-accent">
        AI Suggestion
      </span>
      {note ? (
        <Text size="xs" variant="muted">
          · {note}
        </Text>
      ) : null}
    </div>
  );
}

/** A label/value pair in the Project Details grid. */
function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <MicroLabel>{label}</MicroLabel>
      <Text size="sm" className="text-fg">
        {value.trim() || "—"}
      </Text>
    </div>
  );
}

const DOT_TONE: Record<Tone, string> = {
  danger: "bg-danger",
  warning: "bg-warning",
  success: "bg-success",
};

// ── The view ──────────────────────────────────────────────────────────────────

export function ProjectDetailView({
  actor,
  user,
  project,
  canReview,
}: ProjectDetailViewProps) {
  const navigate = useNavigate();

  // Local, non-persisted working copies. "Apply" writes a suggestion into these;
  // the AI tips re-assess against them. Nothing here is saved.
  const [title, setTitle] = useState(project.title);
  const [scope, setScope] = useState(project.scope);
  const [titleSuggestion, setTitleSuggestion] = useState(() => suggestTitle(project.title));
  const [scopeSuggestion, setScopeSuggestion] = useState(() => suggestScope(project.title));

  const tips = useMemo(() => assess(title, scope), [title, scope]);

  // Approve/Reject go through the route action (a fetcher, so the sticky bar can
  // report progress in place). On success we toast and return to the list.
  const fetcher = useFetcher<{ ok?: boolean; error?: string; status?: string }>();
  const submitting = fetcher.state !== "idle";

  // Rejecting swaps the review bar for a remarks prompt — the reason is sent back
  // to the submitter, so it's required before the rejection can be confirmed.
  const [rejecting, setRejecting] = useState(false);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (!fetcher.data) return;
    if (fetcher.data.ok) {
      toast.add({
        title: fetcher.data.status === "approved" ? "Project approved" : "Project rejected",
        description:
          fetcher.data.status === "approved"
            ? "It's been added to the approved pool (unassigned)."
            : "The submitting Programme Centre can revise and resubmit.",
        type: fetcher.data.status === "approved" ? "success" : "info",
      });
      navigate("/projects");
    } else if (fetcher.data.error) {
      toast.add({
        title: "Couldn't update project",
        description: fetcher.data.error,
        type: "error",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  function review(intent: "approve" | "reject") {
    const payload: Record<string, string> = { intent };
    if (intent === "reject") payload.remarks = remarks.trim();
    fetcher.submit(payload, { method: "post" });
  }

  function reassess() {
    setTitleSuggestion(suggestTitle(title));
    setScopeSuggestion(suggestScope(title));
    toast.add({
      title: "Re-assessed with AI",
      description: "Fresh title and description suggestions generated.",
      type: "info",
    });
  }

  const badge = BUCKET_BADGE[project.bucket];
  const isPending = project.bucket === "pending";

  return (
    <Shell actor={actor} user={user} workstream="Internship">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Text size="sm" variant="muted">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="font-medium text-accent transition-colors hover:text-accent/80"
          >
            Projects
          </button>{" "}
          / <span className="font-semibold text-fg">{title.trim() || "Untitled project"}</span>
        </Text>
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Heading as="h1" size="3xl">
            {title.trim() || "Untitled project"}
          </Heading>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            toast.add({
              title: "Edit not wired yet",
              description: "Editing project details is a placeholder in this prototype.",
              type: "info",
            })
          }
        >
          <Pencil className="size-4" />
          Edit Details
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Title, with AI suggestion */}
          <Card>
            <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
              <div className="space-y-1.5">
                <MicroLabel>Current Title</MicroLabel>
                <Text size="lg" weight="medium" className="text-fg">
                  {title.trim() || "—"}
                </Text>
              </div>
              <div className="space-y-2 lg:border-l lg:border-border lg:pl-6">
                <SuggestionHeader />
                <div className="flex items-center gap-2">
                  <Input
                    value={titleSuggestion}
                    onChange={(event) => setTitleSuggestion(event.target.value)}
                    className="bg-accent-subtle/40"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setTitle(titleSuggestion)}
                  >
                    <Check className="size-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description / scope, with AI suggestion */}
          <Card>
            <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-2">
              <div className="space-y-1.5">
                <MicroLabel>Project Description</MicroLabel>
                <Text size="sm" className="whitespace-pre-wrap text-fg">
                  {scope.trim() || "—"}
                </Text>
              </div>
              <div className="space-y-2 lg:border-l lg:border-border lg:pl-6">
                <SuggestionHeader note="edit as needed" />
                <Textarea
                  rows={8}
                  value={scopeSuggestion}
                  onChange={(event) => setScopeSuggestion(event.target.value)}
                  className="bg-accent-subtle/40"
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setScope(scopeSuggestion)}
                  >
                    <Check className="size-4" />
                    Apply
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project details */}
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <Text size="sm" weight="semibold" className="text-fg">
                Project Details
              </Text>
              <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Education Level" value={project.educationLevel} />
                <DetailItem
                  label="Submitted By"
                  value={
                    project.submittedByEmail
                      ? `${project.submittedByName} · ${project.submittedByEmail}`
                      : project.submittedByName
                  }
                />
                <DetailItem
                  label="Mentor"
                  value={`${project.mentorName} · ${project.mentorDesignation}`}
                />
                <DetailItem
                  label="Slots"
                  value={`${project.slots} placement${project.slots === 1 ? "" : "s"}`}
                />
                <DetailItem label="Discipline" value={project.discipline} />
                <DetailItem label="Tech Domain" value={project.techDomain ?? "—"} />
                <DetailItem label="Emerging Area" value={project.emergingArea ?? "—"} />
                <DetailItem label="Intern Category" value={project.educationLevel} />
                <DetailItem label="Duration" value={project.duration} />
              </div>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card>
            <CardContent className="space-y-3 p-5 sm:p-6">
              <Text size="sm" weight="semibold" className="text-fg">
                Skills Required
              </Text>
              {project.skills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {project.skills.map((skill) => (
                    <Badge key={skill} variant="subtle">
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <Text size="sm" variant="muted">
                  None listed.
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Mentor write-up */}
          <Card>
            <CardContent className="space-y-2 p-5 sm:p-6">
              <Text size="sm" weight="semibold" className="text-fg">
                About the Mentor
              </Text>
              <Text size="sm" className="whitespace-pre-wrap text-fg-muted">
                {project.mentorWriteup?.trim() || "No write-up provided."}
              </Text>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar — AI Writing Tips */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center gap-1.5">
                <Sparkles className="size-4 text-accent" />
                <Text size="sm" weight="semibold" className="text-fg">
                  AI Writing Tips
                </Text>
              </div>

              <div className="space-y-5">
                {tips.map((tip) => (
                  <div key={tip.title} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn("size-2 shrink-0 rounded-full", DOT_TONE[tip.tone])}
                        aria-hidden
                      />
                      <Text size="sm" weight="medium" className="text-fg">
                        {tip.title}
                      </Text>
                    </div>
                    <div className="space-y-1 pl-4">
                      {tip.messages.map((message, index) => (
                        <Text key={index} size="sm" variant="muted">
                          {message}
                        </Text>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={reassess}
                >
                  <Sparkles className="size-4 text-accent" />
                  Re-assess with AI
                </Button>
                <Text size="xs" variant="muted" className="text-center">
                  Generates fresh title and description suggestions.
                </Text>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Rejection remarks live in the scrolling content, so the footer below
          stays a compact sticky action bar. Shown only while rejecting. */}
      {canReview && rejecting ? (
        <Card className="mt-6 border-danger/40">
          <CardContent className="space-y-1.5 p-5 sm:p-6">
            <Label htmlFor="rejection-remarks" className="text-danger">
              Rejection Remarks <span aria-hidden>*</span>
            </Label>
            <Text size="xs" variant="muted">
              This will be sent back to the submitter.
            </Text>
            <Textarea
              id="rejection-remarks"
              rows={4}
              value={remarks}
              onChange={(event) => setRemarks(event.target.value)}
              placeholder="Explain what needs to be changed or improved…"
              autoFocus
            />
          </CardContent>
        </Card>
      ) : null}

      {/* Sticky review bar. Rejecting swaps the actions for confirm/cancel. */}
      {canReview ? (
        <Shell.Footer>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Text size="sm" variant="muted" className="min-w-0 flex-1">
              {rejecting
                ? "Add a note above explaining what needs to change, then confirm."
                : isPending
                  ? "Approving adds this project to the approved pool (unassigned). Attach it to a programme later when creating or editing one."
                  : "This project is no longer pending review. You can still change its decision below."}
            </Text>
            <div className="flex shrink-0 items-center gap-2">
              {rejecting ? (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setRejecting(false);
                      setRemarks("");
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => review("reject")}
                    disabled={submitting || remarks.trim() === ""}
                  >
                    <X className="size-4" />
                    Confirm Rejection
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={() => setRejecting(true)}
                    disabled={submitting}
                  >
                    <X className="size-4" />
                    Reject Project
                  </Button>
                  <Button type="button" onClick={() => review("approve")} disabled={submitting}>
                    <Check className="size-4" />
                    Approve Project
                  </Button>
                </>
              )}
            </div>
          </div>
        </Shell.Footer>
      ) : null}
    </Shell>
  );
}
