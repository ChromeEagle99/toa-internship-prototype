import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

import { requireCan } from "~/auth/current-user.server";
import { ROLE_LABELS, can, programmesRepository, resolveUser } from "~/data";

import {
  ProgrammesListView,
  toProgrammeRows,
} from "~/features/programmes/views/programmes-list-view";

import type { Route } from "./+types/programmes";

/**
 * Programmes index. A thin orchestrator: it guards access, loads the programmes
 * the actor may read, flattens them into list rows, and hands off to a
 * self-contained view that owns its Shell.
 *
 * Access is guarded at the door and the data layer:
 *   1. `requireCan(... "list", "programmes")` gates the route — a role without the
 *      grant (e.g. an Applicant) gets a 403 before any data is read.
 *   2. `programmesRepository.as(actor).list()` returns only the rows the actor may
 *      see. The "Create Programme" action mirrors the `create` grant.
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

  // A single `now` (server date, YYYY-MM-DD) drives the derived Open/Closed
  // application status, so every row is computed against the same instant.
  const nowIso = new Date().toISOString().slice(0, 10);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
    rows: toProgrammeRows(res.ok ? res.data : [], nowIso),
    canCreate: can(actor, "create", "programmes"),
  };
}

export default function Programmes({ loaderData }: Route.ComponentProps) {
  const { actor, user, rows, canCreate } = loaderData;

  return (
    <ProgrammesListView actor={actor} user={user} rows={rows} canCreate={canCreate} />
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
