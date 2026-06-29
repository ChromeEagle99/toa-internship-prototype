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
import { requireCan } from "~/auth/current-user.server";
import {
  ROLE_LABELS,
  can,
  programmesRepository,
  resolveUser,
  type Programme,
  type ProgStatus,
} from "~/data";

import type { Route } from "./+types/programmes";

/**
 * Programmes index. Guarded by the same policy at the door and the data layer:
 *   1. `requireCan(... "list", "programmes")` gates the route — a role without the
 *      grant (e.g. an Applicant) gets a 403 before any data is read.
 *   2. `programmesRepository.as(actor).list()` returns only the rows the actor may
 *      see. The "New programme" action mirrors the `create` grant.
 */

export function meta() {
  return [{ title: "Programmes — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "list", "programmes");
  const [res, user] = await Promise.all([
    programmesRepository.as(actor).list(),
    resolveUser(actor.id),
  ]);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    programmes: res.ok ? res.data : [],
    canCreate: can(actor, "create", "programmes"),
  };
}

/** Programme status → badge variant. */
const STATUS_VARIANT: Record<ProgStatus, BadgeProps["variant"]> = {
  Draft: "subtle",
  Active: "success",
  Completed: "info",
};

/** A readable application window from whichever date model the programme uses. */
function applicationWindow(programme: Programme): string {
  if (programme.timeline) return programme.timeline;
  if (programme.appOpen && programme.appDeadline) {
    return `${programme.appOpen} → ${programme.appDeadline}`;
  }
  if (programme.intakeWindows?.length) {
    const next = programme.intakeWindows[0]!;
    return `${next.appOpen} → ${next.appClose}`;
  }
  return "—";
}

export default function Programmes({ loaderData }: Route.ComponentProps) {
  const { actor, user, programmes, canCreate } = loaderData;

  return (
    <Shell
      actor={actor}
      user={user}
      title="Programmes"
      workstream="Internship"
      actions={
        canCreate ? (
          <Link
            to="/programmes/new"
            className={buttonVariants({ size: "sm", className: "hidden sm:inline-flex" })}
          >
            <Plus className="size-4" />
            New programme
          </Link>
        ) : null
      }
    >
      <Card>
        <CardHeader>
          <CardTitle>All programmes</CardTitle>
          <CardDescription>
            Offerings applicants can apply to. You see the programmes your role is
            permitted to read.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Application window</TableHead>
                <TableHead className="text-right">Capacity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programmes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Text size="sm" variant="muted">
                      No programmes yet. Seed some in the dev database.
                    </Text>
                  </TableCell>
                </TableRow>
              ) : (
                programmes.map((programme) => (
                  <TableRow key={programme.id}>
                    <TableCell className="font-medium">{programme.title}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[programme.status]}>
                        {programme.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {programme.category.join(", ")}
                      </Text>
                    </TableCell>
                    <TableCell>
                      <Text size="xs" variant="muted">
                        {applicationWindow(programme)}
                      </Text>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {programme.capacity ?? "—"}
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

/** Renders the 403 from `requireCan` as a clear "access denied" screen. */
export function ErrorBoundary() {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403
            ? "Your current role isn't permitted to view Programmes. Switch to a role that can (e.g. Internship Officer, IO Admin, or Director)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
