import { Plus } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Text } from "@/components/ui/text";

import { ROLE_LABELS } from "~/data";
import { Shell } from "~/components/shell";

import { requireActor } from "~/auth/current-user.server";

import type { Route } from "./+types/playground.shell";

/**
 * DEMO of the application Shell. The actor is resolved from the session, so the
 * side-nav reflects the signed-in role's real permissions — switch identity via
 * the user menu (or /act-as) to watch items appear and disappear.
 */

export function meta() {
  return [{ title: "App Shell — PRIZM 4.0" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);
  // In a real app, name/email come from the user record; the picker seeds them.
  return { actor, roleLabel: ROLE_LABELS[actor.role] };
}

export default function ShellDemo({ loaderData }: Route.ComponentProps) {
  const { actor, roleLabel } = loaderData;

  return (
    <Shell
      actor={actor}
      user={{ name: "Davina Tan", email: "davina.tan@dsta.gov.sg" }}
      title="Dashboard"
      workstream="Internship"
      actions={
        <Button size="sm" className="hidden sm:inline-flex">
          <Plus className="size-4" />
          Quick actions
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Text variant="muted">Signed in as</Text>
          <Badge variant="info">{roleLabel}</Badge>
          <Link
            to="/act-as"
            className="text-sm text-accent underline-offset-4 hover:underline"
          >
            Switch identity
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role-aware navigation</CardTitle>
            <CardDescription>
              The side-nav is filtered by the same policy the data layer enforces.
              Items gated on a resource you cannot read — or a role you do not hold —
              simply do not render. Sign in as different users to compare.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Text size="sm" variant="muted">
              This panel is the main content slot. Drop any page in here; the sticky
              sidebar and header stay put around it.
            </Text>
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
