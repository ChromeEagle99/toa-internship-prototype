import { useState } from "react";
import { ArrowRight, CheckCircle2, Inbox, Mail } from "lucide-react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Heading } from "@/components/ui/heading";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { Shell, type ShellUser } from "~/components/shell";
import {
  EmailPreviewSheet,
  startOfToday,
  type RequestItem,
} from "~/components/project-request";
import type { Actor } from "~/data";

import type { SubmissionRequest } from "~/features/projects/submissions-data";

/**
 * The AD (P&C) Project Requests page: the requests their Programme Centre has
 * received from the Internship Office, split into those still awaiting a response
 * and those already fulfilled. Each request is a card the recipient responds to by
 * submitting projects; "View email" reuses the same preview the IO create flow
 * reviews. The IO-facing side of this route manages the requests they've *sent* —
 * the button is shared, the surface differs (see `../view-for`).
 *
 * A self-contained page that owns its Shell chrome, like every feature view.
 */

export interface ReceivedRequestsViewProps {
  actor: Actor;
  user: ShellUser;
  requests: SubmissionRequest[];
}

/** A request is fulfilled once its status is "submitted"; everything else awaits a response. */
const isSubmitted = (request: SubmissionRequest) => request.status === "submitted";

/** A readable date, e.g. "30 Jul 2026". */
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

/** A deadline's urgency badge: countdown while there's time, else due/overdue. */
function DeadlineBadge({ deadline }: { deadline: string }) {
  const days = daysUntil(deadline);
  if (days < 0) return <Badge variant="danger">Overdue</Badge>;
  if (days === 0) return <Badge variant="warning">Due today</Badge>;
  return <Badge variant="subtle">{days}d left</Badge>;
}

/** A small, muted section label used within a request card. */
function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text as="span" size="xs" weight="semibold" variant="subtle">
      {children}
    </Text>
  );
}

/** Adapt a received request into the shape the shared email preview expects. */
function toRequestItem(request: SubmissionRequest, recipient: string): RequestItem {
  return {
    id: request.id,
    pcHead: recipient,
    pcHeadEmail: null,
    adPnc: null,
    adPncEmail: null,
    deadline: new Date(request.deadline),
    rows: [
      {
        id: `${request.id}-p0`,
        level: request.educationLevel,
        placements: request.placementsNeeded,
      },
    ],
    collapsed: false,
    selected: false,
  };
}

/** One received request, with its fulfilment progress and response actions. */
function RequestCard({
  request,
  onViewEmail,
}: {
  request: SubmissionRequest;
  onViewEmail: () => void;
}) {
  const submitted = isSubmitted(request);
  const status: { variant: BadgeProps["variant"]; label: string } = submitted
    ? { variant: "success", label: "Submitted" }
    : { variant: "subtle", label: "Awaiting response" };

  return (
    <Card className="p-5 sm:p-6">
      {/* Header: who the request is from, and a link to the original email. */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Badge variant={status.variant}>{status.label}</Badge>
          <Text size="sm" variant="muted">
            Request from{" "}
            <span className="font-medium text-fg">{request.requestedBy}</span> · sent{" "}
            {formatDate(request.sentDate)}
          </Text>
        </div>
        <button
          type="button"
          onClick={onViewEmail}
          className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-fg-muted transition-colors hover:text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <Mail className="size-4" />
          View email
        </button>
      </div>

      <Separator className="my-4" />

      <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
        {/* What's being asked for. */}
        <div className="lg:w-64 lg:shrink-0">
          <FieldLabel>Placements requested</FieldLabel>
          <div className="mt-2 flex items-center justify-between gap-4">
            <Text size="sm" className="text-fg">
              {request.educationLevel}
            </Text>
            <Text size="sm" variant="muted">
              {request.placementsNeeded} slot{request.placementsNeeded === 1 ? "" : "s"}
            </Text>
          </div>
        </div>

        {/* Deadline and fulfilment progress. */}
        <div className="flex-1">
          <div>
            <FieldLabel>Deadline</FieldLabel>
            <div className="mt-1 flex items-center gap-2">
              <Text size="sm" className="text-fg">
                {formatDate(request.deadline)}
              </Text>
              <DeadlineBadge deadline={request.deadline} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-center justify-between gap-2">
              <FieldLabel>Placements submitted</FieldLabel>
              <Text size="sm" variant="muted">
                <span className="font-medium text-fg">{request.previouslySubmitted}</span>{" "}
                of {request.placementsNeeded}
              </Text>
            </div>
            <Progress
              value={request.previouslySubmitted}
              max={request.placementsNeeded}
              className="mt-1.5"
            />
          </div>
        </div>

        {/* Respond by submitting projects against the request. */}
        <div className="lg:shrink-0">
          <Link
            to="/projects/upload"
            className={buttonVariants({
              size: "md",
              className: "w-full justify-center lg:w-auto",
            })}
          >
            Respond
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </Card>
  );
}

export function ReceivedRequestsView({
  actor,
  user,
  requests,
}: ReceivedRequestsViewProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const awaiting = requests.filter((request) => !isSubmitted(request));
  const submitted = requests.filter(isSubmitted);

  const previewRequest = requests.find((request) => request.id === previewId) ?? null;
  const sender = previewRequest
    ? { name: previewRequest.requestedBy, role: "Internship Office, DSTA" }
    : { name: "", role: "" };

  return (
    <Shell actor={actor} user={user} workstream="Internship">
      <div className="space-y-6">
        <div>
          <Heading as="h1" size="3xl">
            Project Requests
          </Heading>
          <Text variant="muted" className="mt-1">
            Requests from the Internship Office. Respond to each by submitting projects.
          </Text>
        </div>

        <Tabs defaultValue="awaiting">
          <TabsList>
            <TabsTrigger value="awaiting">
              Awaiting response
              <TabCount>{awaiting.length}</TabCount>
            </TabsTrigger>
            <TabsTrigger value="submitted">
              Submitted
              <TabCount>{submitted.length}</TabCount>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="awaiting" className="space-y-4">
            {awaiting.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Inbox className="size-6" />}
                  title="No requests awaiting a response."
                  description="When the Internship Office asks your centre for projects, they'll appear here."
                />
              </Card>
            ) : (
              awaiting.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewEmail={() => setPreviewId(request.id)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4">
            {submitted.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<CheckCircle2 className="size-6 text-success" />}
                  title="No submitted requests yet."
                />
              </Card>
            ) : (
              submitted.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onViewEmail={() => setPreviewId(request.id)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <EmailPreviewSheet
        request={previewRequest ? toRequestItem(previewRequest, user.name) : null}
        sender={sender}
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
    </Shell>
  );
}

/** The count pill trailing a tab label. */
function TabCount({ children }: { children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full",
        "bg-bg px-1.5 py-0.5 text-xs font-medium tabular-nums",
      )}
    >
      {children}
    </span>
  );
}
