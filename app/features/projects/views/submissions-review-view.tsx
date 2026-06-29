import { Upload, User } from "lucide-react";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
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
import type { Actor } from "~/data";

import type {
  ApprovalReview,
  ProjectApproval,
  RequestStatus,
  SubmissionRequest,
} from "../submissions-data";

/**
 * The PD P&C Projects page: a project-submission review surface. Two tables —
 * the projects awaiting review, and the fulfilment of each intake request. A
 * self-contained page that owns its Shell chrome, like every Projects view.
 */

export interface SubmissionsReviewViewProps {
  actor: Actor;
  user: ShellUser;
  approvals: ProjectApproval[];
  requests: SubmissionRequest[];
}

/** Approval review state → badge variant + label. */
const REVIEW: Record<ApprovalReview, { variant: BadgeProps["variant"]; label: string }> = {
  pending: { variant: "subtle", label: "Pending Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
};

/** Request fulfilment status → badge variant + label. */
const REQUEST: Record<RequestStatus, { variant: BadgeProps["variant"]; label: string }> = {
  submitted: { variant: "success", label: "Submitted" },
  incomplete: { variant: "warning", label: "Incomplete" },
  pending: { variant: "subtle", label: "Pending" },
};

/** A readable date, e.g. "30 Apr 2026". */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** "N pending review", correctly singular/plural. */
function pendingReviewLabel(count: number): string {
  return `${count} pending review`;
}

export function SubmissionsReviewView({
  actor,
  user,
  approvals,
  requests,
}: SubmissionsReviewViewProps) {
  const pendingReviews = approvals.filter((a) => a.review === "pending").length;
  const submittedCount = requests.filter((r) => r.status === "submitted").length;
  const pendingCount = requests.length - submittedCount;

  return (
    <Shell
      actor={actor}
      user={user}
      title="Project Submission Requests"
      workstream="Internship"
      actions={
        <Button size="sm" className="hidden sm:inline-flex">
          <Upload className="size-4" />
          Upload Projects
        </Button>
      }
    >
      <div className="space-y-8">
        {/* Project Approval Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>Project Approval Status</CardTitle>
            <Badge variant="subtle">{pendingReviewLabel(pendingReviews)}</Badge>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Education Level</TableHead>
                  <TableHead>Mentor</TableHead>
                  <TableHead>Slots</TableHead>
                  <TableHead>IO Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Text size="sm" variant="muted">
                        No projects awaiting review.
                      </Text>
                    </TableCell>
                  </TableRow>
                ) : (
                  approvals.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell className="font-medium">{approval.project}</TableCell>
                      <TableCell>
                        <Text size="sm" className="text-accent">
                          {approval.educationLevel}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Text size="sm" variant="muted">
                          {approval.mentor}
                        </Text>
                      </TableCell>
                      <TableCell className="tabular-nums">{approval.slots}</TableCell>
                      <TableCell>
                        <Badge variant={REVIEW[approval.review].variant}>
                          {REVIEW[approval.review].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Requests Overview */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
            <CardTitle>Requests Overview</CardTitle>
            <Text size="sm" variant="muted">
              {pendingCount} pending · {submittedCount} submitted
            </Text>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Education Level</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Placements Needed</TableHead>
                  <TableHead>Previously Submitted</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Text size="sm" variant="muted">
                        No requests to review yet.
                      </Text>
                    </TableCell>
                  </TableRow>
                ) : (
                  requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.educationLevel}
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1.5 text-fg-muted">
                          <User className="size-3.5" />
                          <Text size="sm" variant="muted">
                            {request.requestedBy}
                          </Text>
                        </span>
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {request.placementsNeeded}
                      </TableCell>
                      <TableCell className="tabular-nums">
                        {request.previouslySubmitted}
                      </TableCell>
                      <TableCell>
                        <Text size="sm" variant="muted">
                          {formatDate(request.deadline)}
                        </Text>
                      </TableCell>
                      <TableCell>
                        <Badge variant={REQUEST[request.status].variant}>
                          {REQUEST[request.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
