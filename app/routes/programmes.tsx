import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Text } from "@/components/ui/text";

import { ROLE_LABELS, can, programmesRepository } from "~/data";

import { requireCan } from "~/auth/current-user.server";

import type { Route } from "./+types/programmes";

/**
 * EXAMPLE GUARDED PAGE. Two layers of the SAME policy in action:
 *   1. page-level — `requireCan(... "list", "programmes")` gates the whole route;
 *      a role without that grant (e.g. an Applicant) gets a 403 before any data.
 *   2. data-level — `programmesRepository.as(actor).list()` returns only the rows
 *      this actor may read. One policy, enforced at both the door and the data.
 */

export function meta() {
  return [{ title: "Programmes — PRIZM 4.0" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireCan(request, "list", "programmes");
  const res = await programmesRepository.as(actor).list();
  return {
    role: actor.role,
    programmes: res.ok ? res.data : [],
    canCreate: can(actor, "create", "programmes"),
    canDelete: can(actor, "delete", "programmes"),
  };
}

export default function Programmes({ loaderData }: Route.ComponentProps) {
  const { role, programmes, canCreate, canDelete } = loaderData;

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <Heading as="h1" size="2xl">
            Programmes
          </Heading>
          <Badge variant="info">acting as {ROLE_LABELS[role]}</Badge>
        </div>
      </header>

      <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
        <Link to="/act-as" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Switch identity
        </Link>

        <Text size="sm" variant="muted">
          You can see this page because the policy grants <strong>{ROLE_LABELS[role]}</strong> the{" "}
          <code>list</code> action on <code>programmes</code>. Your buttons below mirror the same
          policy: create is {canCreate ? "allowed" : "denied"}, delete is{" "}
          {canDelete ? "allowed" : "denied"}.
        </Text>

        <div className="flex items-center gap-3">
          <Button disabled={!canCreate}>New programme</Button>
          {!canCreate ? (
            <Text size="xs" variant="muted">
              Disabled — your role may not create programmes.
            </Text>
          ) : null}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Category</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programmes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3}>
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
                    <Badge variant="subtle">{programme.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <Text size="xs" variant="muted">
                      {programme.category.join(", ")}
                    </Text>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </main>
    </div>
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
