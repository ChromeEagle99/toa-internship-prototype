import { CheckCircle2, ClipboardCheck, FileClock, Folder } from "lucide-react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";

import { Shell, type ShellUser } from "~/components/shell";
import type { Actor } from "~/data";

import { StatCard } from "../stat-card";
import type {
  ApprovalReview,
  ProjectApproval,
  RequestStatus,
  SubmissionRequest,
} from "~/features/projects/submissions-data";

/**
 * The PD P&C dashboard: a submission-review summary rather than the applications
 * pipeline. Headline figures for the review queue and request fulfilment, with
 * the projects awaiting review surfaced for one-click follow-through. A
 * self-contained page — owns its Shell, like every dashboard view.
 */

export interface PdPncDashboardViewProps {
  actor: Actor;
  user: ShellUser;
  roleLabel: string;
  counts: {
    pendingReviews: number;
    requestsPending: number;
    requestsSubmitted: number;
    projects: number;
  };
  approvals: ProjectApproval[];
  requests: SubmissionRequest[];
}

const REVIEW: Record<ApprovalReview, { variant: BadgeProps["variant"]; label: string }> = {
  pending: { variant: "subtle", label: "Pending Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
};

const REQUEST: Record<RequestStatus, { variant: BadgeProps["variant"]; label: string }> = {
  submitted: { variant: "success", label: "Submitted" },
  incomplete: { variant: "warning", label: "Incomplete" },
  pending: { variant: "subtle", label: "Pending" },
};

export function PdPncDashboardView({
  actor,
  user,
  roleLabel,
  counts,
  approvals,
  requests,
}: PdPncDashboardViewProps) {
  return (
    <Shell actor={actor} user={user} title="Dashboard" workstream="Internship">
      <div className="space-y-8">
        {/* Greeting */}
        <div className="flex flex-wrap items-center gap-2">
          <Heading as="h2" size="lg">
            Welcome back, {user.name}
          </Heading>
          <Badge variant="info">{roleLabel}</Badge>
        </div>

        {/* Headline figures — the review queue and request fulfilment. */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={ClipboardCheck}
            label="Pending reviews"
            value={counts.pendingReviews}
            to="/projects"
          />
          <StatCard
            icon={FileClock}
            label="Requests pending"
            value={counts.requestsPending}
          />
          <StatCard
            icon={CheckCircle2}
            label="Requests submitted"
            value={counts.requestsSubmitted}
          />
          <StatCard
            icon={Folder}
            label="Projects"
            value={counts.projects}
            to="/projects"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Awaiting review */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Awaiting your review</CardTitle>
              <CardDescription>
                Submitted projects pending approval. Review them on the Projects page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvals.length > 0 ? (
                <ul className="divide-y divide-border">
                  {approvals.map((approval) => (
                    <li
                      key={approval.id}
                      className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <Link
                          to="/projects"
                          className="truncate font-medium text-fg outline-none hover:text-accent focus-visible:text-accent"
                        >
                          {approval.project}
                        </Link>
                        <Text size="xs" variant="muted">
                          {approval.educationLevel} · {approval.mentor}
                        </Text>
                      </div>
                      <Badge variant={REVIEW[approval.review].variant}>
                        {REVIEW[approval.review].label}
                      </Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <Text size="sm" variant="muted">
                  Nothing awaiting review.
                </Text>
              )}
            </CardContent>
          </Card>

          {/* Request fulfilment */}
          <Card>
            <CardHeader>
              <CardTitle>Requests overview</CardTitle>
              <CardDescription>Fulfilment across the current intake.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <Text size="sm" weight="medium" className="truncate">
                      {request.educationLevel}
                    </Text>
                    <Text size="xs" variant="muted">
                      {request.previouslySubmitted} / {request.placementsNeeded} submitted
                    </Text>
                  </div>
                  <Badge variant={REQUEST[request.status].variant}>
                    {REQUEST[request.status].label}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  );
}
