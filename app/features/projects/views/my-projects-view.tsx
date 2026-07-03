import { Upload } from "lucide-react";
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

import type { ApprovalReview, ProjectApproval } from "../submissions-data";

/**
 * The PD P&C "My Projects" page: the projects their Programme Centre has
 * submitted, with the IO's review status for each. Their equivalent of the live
 * Projects list the other roles see. The "Upload Projects" action adds more to a
 * request. A self-contained page that owns its Shell chrome.
 */

export interface MyProjectsViewProps {
  actor: Actor;
  user: ShellUser;
  approvals: ProjectApproval[];
}

/** Approval review state → badge variant + label. */
const REVIEW: Record<ApprovalReview, { variant: BadgeProps["variant"]; label: string }> = {
  pending: { variant: "subtle", label: "Pending Review" },
  approved: { variant: "success", label: "Approved" },
  rejected: { variant: "danger", label: "Rejected" },
};

export function MyProjectsView({ actor, user, approvals }: MyProjectsViewProps) {
  const pendingReviews = approvals.filter((a) => a.review === "pending").length;

  return (
    <Shell
      actor={actor}
      user={user}
      title="My Projects"
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
          <CardTitle>Submitted projects</CardTitle>
          <Badge variant="subtle">
            {pendingReviews} pending review{pendingReviews === 1 ? "" : "s"}
          </Badge>
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
                      You haven't submitted any projects yet. Use Upload Projects to
                      submit against a request.
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
    </Shell>
  );
}
