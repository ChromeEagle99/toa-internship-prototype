import { Upload, User } from "lucide-react";
import { Link } from "react-router";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  RequestStatus,
  SubmissionRequest,
} from "~/features/projects/submissions-data";

/**
 * The PD P&C Project Requests page: the requests their Programme Centre has
 * received from Internship Officers, tracked against what's been submitted so
 * far. The IO-facing side of the same route manages requests they've *sent* — the
 * button is shared, the surface differs (see `../view-for`).
 *
 * A self-contained page that owns its Shell chrome, like every feature view. The
 * "Upload Projects" action is the path to fulfilling a request.
 */

export interface ReceivedRequestsViewProps {
  actor: Actor;
  user: ShellUser;
  requests: SubmissionRequest[];
}

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

export function ReceivedRequestsView({
  actor,
  user,
  requests,
}: ReceivedRequestsViewProps) {
  const submittedCount = requests.filter((r) => r.status === "submitted").length;
  const pendingCount = requests.length - submittedCount;

  return (
    <Shell
      actor={actor}
      user={user}
      title="Project Requests"
      workstream="Internship"
      actions={
        <Link
          to="/projects/upload"
          className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
        >
          <Upload className="size-4" />
          Upload Projects
        </Link>
      }
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3 space-y-0">
          <CardTitle>Requests received</CardTitle>
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
                      No requests received yet. When an Internship Officer asks your
                      centre for projects, they'll appear here.
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
    </Shell>
  );
}
