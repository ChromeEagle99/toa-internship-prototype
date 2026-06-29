import { Plus } from "lucide-react";
import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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

import { Shell } from "~/components/shell";
import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, resolveUser, type Role } from "~/data";

import type { Route } from "./+types/project-requests";

/**
 * Project Requests — the first stage of the project lifecycle, where an Internship
 * Officer asks a Programme Centre to submit projects for an intake:
 *
 *     ProjectRequest  →  ProjectSubmissionBatch { SubmittedProject[] }  →  ProjectEntry
 *     (this page)        (PC uploads, IO/DCE reviews)                      (live projects)
 *
 * Project requests aren't a data resource yet, so the page is ROLE-GATED to match
 * the side-nav: only Internship Officers and IO Admins may see it. The data below
 * is placeholder sample content until a `projectRequestsRepository` exists.
 */

/** Roles permitted to manage project requests — mirrors the side-nav gate. */
const ALLOWED_ROLES: readonly Role[] = [ROLES.internshipOfficer, ROLES.ioAdmin];

export function meta() {
  return [{ title: "Project Requests — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);

  // Role gate. Project requests aren't a policy resource, so guard by role here —
  // the same allowlist the nav uses — and throw the 403 the ErrorBoundary renders.
  if (!ALLOWED_ROLES.includes(actor.role)) {
    throw new Response("Project requests are restricted to Internship Officers.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const user = await resolveUser(actor.id);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    requests: SAMPLE_REQUESTS,
    canCreate: true,
  };
}

/** The lifecycle stage a request is at. */
type RequestStatus = "draft" | "sent" | "acknowledged" | "submitted" | "declined";

interface ProjectRequest {
  id: string;
  /** What the IO is asking the Programme Centre for. */
  title: string;
  /** The Programme Centre being asked. */
  pc: string;
  /** Slots the IO is requesting projects for. */
  slotsRequested: number;
  status: RequestStatus;
  /** When the request was raised. YYYY-MM-DD. */
  requestedOn: string;
  /** When the Programme Centre's submission is due. YYYY-MM-DD. */
  dueBy: string;
}

/** Placeholder rows until a project-requests repository exists. */
const SAMPLE_REQUESTS: ProjectRequest[] = [
  {
    id: "pr-001",
    title: "AY26 Q3 intake — ML & signal processing",
    pc: "DSO National Laboratories",
    slotsRequested: 6,
    status: "sent",
    requestedOn: "2026-06-12",
    dueBy: "2026-07-10",
  },
  {
    id: "pr-002",
    title: "AY26 Q3 intake — cyber defence",
    pc: "Cyber Security Agency",
    slotsRequested: 4,
    status: "acknowledged",
    requestedOn: "2026-06-09",
    dueBy: "2026-07-07",
  },
  {
    id: "pr-003",
    title: "AY26 Q3 intake — systems engineering",
    pc: "ST Engineering",
    slotsRequested: 3,
    status: "sent",
    requestedOn: "2026-06-18",
    dueBy: "2026-07-15",
  },
  {
    id: "pr-004",
    title: "AY26 Q2 intake — data analytics",
    pc: "GovTech",
    slotsRequested: 5,
    status: "submitted",
    requestedOn: "2026-04-21",
    dueBy: "2026-05-19",
  },
  {
    id: "pr-005",
    title: "AY26 Q2 intake — robotics & autonomy",
    pc: "DSO National Laboratories",
    slotsRequested: 2,
    status: "declined",
    requestedOn: "2026-04-15",
    dueBy: "2026-05-13",
  },
];

/** Request status → badge variant. */
const STATUS_VARIANT: Record<RequestStatus, BadgeProps["variant"]> = {
  draft: "subtle",
  sent: "info",
  acknowledged: "warning",
  submitted: "success",
  declined: "danger",
};

/** Human-readable status label. British English. */
const STATUS_LABEL: Record<RequestStatus, string> = {
  draft: "Draft",
  sent: "Sent",
  acknowledged: "Acknowledged",
  submitted: "Submitted",
  declined: "Declined",
};

/** A readable date, e.g. "10 Jul 2026". */
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectRequests({ loaderData }: Route.ComponentProps) {
  const { actor, user, requests, canCreate } = loaderData;

  return (
    <Shell
      actor={actor}
      user={user}
      title="Project Requests"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link
            to="/project-requests/new"
            className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
          >
            <Plus className="size-4" />
            New request
          </Link>
        ) : null
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All requests</CardTitle>
          <CardDescription>
            Requests asking a Programme Centre to submit projects for an intake.
            Track each through to submission before the projects go live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Programme Centre</TableHead>
                <TableHead>Due by</TableHead>
                <TableHead className="text-right">Slots requested</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text size="sm" variant="muted">
                      No project requests yet. Raise one to ask a Programme Centre
                      for projects.
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">{req.title}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[req.status]}>
                        {STATUS_LABEL[req.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {req.pc}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {formatDate(req.dueBy)}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {req.slotsRequested}
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

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403
            ? "Your current role isn't permitted to view Project Requests. Switch to a role that can (Internship Officer or IO Admin)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
