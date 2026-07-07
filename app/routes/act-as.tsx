import { CircleUser, Database, LayoutDashboard, LogOut, PanelsTopLeft } from "lucide-react";
import { Form, Link, redirect } from "react-router";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { ALL_ROLES, ROLE_LABELS, ensureUsersSeeded, isAuthenticated, listUsers } from "~/data";

import { getCurrentActor } from "~/auth/current-user.server";
import { clearActorId, commitActorId } from "~/auth/session.server";

import type { Route } from "./+types/act-as";

/**
 * DEV "ACT AS" SWITCHER — pick which user (and therefore role) you are, on a
 * single shared machine. This is the dev face of `session.server.ts`: choosing a
 * user just sets the cookie that `getCurrentActor` reads. Replace this with a
 * real login screen when users move to separate machines; the rest stays put.
 */

export function meta() {
  return [{ title: "Act as — PRIZM 4.0" }];
}

/** Only allow same-site redirect targets, never an absolute URL. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loader({ request }: Route.LoaderArgs) {
  await ensureUsersSeeded(); // populate the picker on first visit
  const users = await listUsers();
  const actor = await getCurrentActor(request);
  const next = safeNext(new URL(request.url).searchParams.get("next"));
  return {
    users,
    currentId: isAuthenticated(actor) ? actor.id : null,
    next,
  };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const intent = String(form.get("intent") ?? "");

  if (intent === "signout") {
    return redirect("/act-as", { headers: { "Set-Cookie": await clearActorId() } });
  }

  const userId = String(form.get("userId") ?? "");
  const next = safeNext(String(form.get("next") ?? "")) ?? "/act-as";
  return redirect(next, { headers: { "Set-Cookie": await commitActorId(userId) } });
}

export default function ActAs({ loaderData }: Route.ComponentProps) {
  const { users, currentId, next } = loaderData;

  // Group the picker by role (registry order) so it stays scannable as the
  // userbase grows; drop roles that have no users seeded.
  const groups = ALL_ROLES.map((role) => ({
    role,
    members: users.filter((user) => user.role === role),
  })).filter((group) => group.members.length > 0);

  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading as="h1" size="2xl">
              Act as
            </Heading>
            <Text size="sm" variant="muted" className="mt-0.5">
              Pick an identity to browse as. Dev only — no password, one machine, every role.
            </Text>
          </div>
          <Badge variant="subtle">
            <CircleUser className="size-3.5" />
            dev session
          </Badge>
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-6 px-6 py-10">
        {next ? (
          <Text size="sm" variant="muted">
            You were sent here because <code>{next}</code> needs you to sign in. Choose a user to continue.
          </Text>
        ) : null}

        <div className="space-y-8">
          {groups.map(({ role, members }) => (
            <section key={role} className="space-y-3">
              <div className="flex items-center gap-2">
                <Text
                  as="div"
                  size="xs"
                  weight="semibold"
                  variant="subtle"
                  className="uppercase tracking-wide"
                >
                  {ROLE_LABELS[role]}
                </Text>
                <Badge variant="subtle">{members.length}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {members.map((user) => {
                  const isCurrent = user.id === currentId;
                  return (
                    <Form method="post" key={user.id}>
                      <input type="hidden" name="userId" value={user.id} />
                      {next ? <input type="hidden" name="next" value={next} /> : null}
                      <button
                        type="submit"
                        className={cn(
                          "flex w-full flex-col items-start gap-1 rounded-md border p-4 text-left transition-colors",
                          isCurrent
                            ? "border-accent bg-accent/5"
                            : "border-border bg-surface hover:bg-bg-muted",
                        )}
                      >
                        <span className="flex w-full items-center justify-between gap-2">
                          <span className="font-medium">{user.name}</span>
                          {isCurrent ? <Badge variant="success">current</Badge> : null}
                        </span>
                        <Text size="xs" variant="muted">
                          {user.title ?? ROLE_LABELS[user.role]} · {user.email}
                        </Text>
                      </button>
                    </Form>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <Separator />

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/dashboard" className={buttonVariants({ variant: "solid", size: "sm" })}>
            <LayoutDashboard />
            Go to Dashboard
          </Link>
          <Link to="/playground/programmes" className={buttonVariants({ variant: "outline", size: "sm" })}>
            Go to Programmes (guarded)
          </Link>
          <Link
            to="/playground/shell"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <PanelsTopLeft />
            App Shell
          </Link>
          <Link to="/dev/db" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Database />
            Dev database
          </Link>
          {currentId ? (
            <Form method="post">
              <input type="hidden" name="intent" value="signout" />
              <Button type="submit" variant="ghost" size="sm">
                <LogOut />
                Sign out
              </Button>
            </Form>
          ) : null}
        </div>
      </main>
    </div>
  );
}
