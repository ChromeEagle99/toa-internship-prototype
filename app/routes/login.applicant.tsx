import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Form, Link, redirect } from "react-router";

import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { ensureUsersSeeded, listUsers, resolveUser } from "~/data";
import {
  APPLICANT_LOGIN_ROLES,
  DEMO_APPLICANT_IDENTITIES,
} from "~/auth/demo-identities";
import { commitActorId } from "~/auth/session.server";

import type { Route } from "./+types/login.applicant";

/**
 * APPLICANT LOGIN — the public "Sign in to apply" screen.
 *
 * This is a PROTOTYPE: there is no real Singpass. Picking a demo identity and
 * pressing "Log in with Singpass" sets the same `toa_actor` cookie the rest of
 * the app already reads (see `session.server.ts`). Swap the demo userbase from
 * `app/auth/demo-identities.ts` + `exampleUsers()` — nothing here hardcodes a
 * person.
 */

export function meta() {
  return [{ title: "Sign in to apply — DSTA Talent Outreach & Acquisition" }];
}

/** Only allow same-site redirect targets, never an absolute URL. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loader({ request }: Route.LoaderArgs) {
  await ensureUsersSeeded(); // make sure the demo applicants exist to log in as
  const users = await listUsers();
  const byId = new Map(users.map((user) => [user.id, user]));

  // Join "which identities to show" (presentation) with the seeded users (facts).
  const identities = DEMO_APPLICANT_IDENTITIES.flatMap((identity) => {
    const user = byId.get(identity.id);
    return user ? [{ id: user.id, name: user.name, tagline: identity.tagline }] : [];
  });

  const next = safeNext(new URL(request.url).searchParams.get("next"));
  return { identities, next };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  const next = safeNext(String(form.get("next") ?? "")) ?? "/";

  // Defence in depth: only sign in as a seeded applicant offered on this screen,
  // so a tampered form can't elevate into a back-office role here.
  const offered = DEMO_APPLICANT_IDENTITIES.some((identity) => identity.id === userId);
  const user = offered ? await resolveUser(userId) : null;
  if (!user || !APPLICANT_LOGIN_ROLES.includes(user.role)) {
    return redirect("/login/applicant");
  }

  return redirect(next, { headers: { "Set-Cookie": await commitActorId(user.id) } });
}

/** The big red Singpass call-to-action. Maps to the `danger` token to keep the
 *  Singpass-brand red while staying within PRIZM's semantic tokens. */
function SingpassButton({ disabled }: { disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="flex h-12 w-full items-center justify-center gap-1.5 rounded-md bg-danger text-sm font-semibold text-danger-fg transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50"
    >
      Log in with <span className="font-bold">singpass</span>
    </button>
  );
}

export default function ApplicantLogin({ loaderData }: Route.ComponentProps) {
  const { identities, next } = loaderData;
  const [selectedId, setSelectedId] = useState(identities[0]?.id ?? "");

  return (
    <main className="grid min-h-svh bg-bg text-fg lg:grid-cols-[1fr_2fr]">
      {/* Brand panel — hidden on small screens, full-height on large. */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-accent p-12 text-accent-fg lg:flex">
        {/* Decorative brand atmosphere — navy→teal wash + orbital trajectories,
            behind content. Carries the gradient so the panel isn't flat. */}
        <img
          src="/images/brand-atmosphere.svg"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full object-cover"
        />

        <div className="relative z-10 space-y-5">
          <img src="/images/dsta-logo-white.png" alt="DSTA" className="h-12 w-auto" />
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-fg/80">
            Talent Outreach &amp; Acquisition
          </p>
        </div>

        <p className="relative z-10 max-w-sm text-4xl font-semibold leading-tight">
          Find your place in Singapore&rsquo;s defence technology community.
        </p>

        <p className="relative z-10 text-xs text-accent-fg/70">© 2026 Government of Singapore</p>
      </aside>

      {/* Form panel. */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10">
        <Form method="post" className="w-full max-w-md space-y-7">
          <input type="hidden" name="userId" value={selectedId} />
          {next ? <input type="hidden" name="next" value={next} /> : null}

          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-accent">
              Internship track
            </p>
            <Heading as="h1" size="3xl">
              Sign in to apply
            </Heading>
            <Text variant="muted">
              Apply, track where you are, and manage your internship — all in one place.
            </Text>
          </div>

          <SingpassButton disabled={!selectedId} />

          {/* Demo identity picker — selecting a card chooses who Singpass signs
              you in as (there is no real Singpass in this prototype). */}
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wider text-fg-muted">
              Demo identity
            </legend>
            <div className="space-y-2.5">
              {identities.map((identity) => {
                const isSelected = identity.id === selectedId;
                return (
                  <button
                    key={identity.id}
                    type="button"
                    onClick={() => setSelectedId(identity.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                      isSelected
                        ? "border-accent bg-accent/5 ring-1 ring-accent"
                        : "border-border bg-surface hover:bg-bg-muted",
                    )}
                  >
                    <span className="flex flex-col">
                      <span className="text-sm font-semibold text-fg">{identity.name}</span>
                      <span className="text-xs text-fg-muted">{identity.tagline}</span>
                    </span>
                    <ChevronRight
                      className={cn(
                        "size-4 shrink-0",
                        isSelected ? "text-accent" : "text-fg-muted",
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Under-16 disclosure — native <details> so it works without JS. */}
          <details className="group rounded-lg">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 text-sm font-medium text-fg [&::-webkit-details-marker]:hidden">
              Under 16 and don&rsquo;t have Singpass?
              <ChevronDown className="size-4 text-fg-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-4 rounded-lg border border-border bg-surface p-4">
              <Text size="sm" variant="muted">
                Applicants under 16 don&rsquo;t have a Singpass account yet. A parent or
                guardian can sign in with their <strong className="font-semibold text-fg">own Singpass</strong> to
                set up and submit the application on the applicant&rsquo;s behalf.
              </Text>
              <Text size="sm" weight="medium">
                Log in with your parent or guardian&rsquo;s Singpass
              </Text>
              <SingpassButton disabled={!selectedId} />
              <Text size="xs" variant="subtle">
                You&rsquo;ll be signing in as the parent or guardian — not the applicant.
              </Text>
            </div>
          </details>

          <Text size="xs" variant="muted">
            By continuing you agree to the{" "}
            <Link to="/terms" className="text-accent underline-offset-4 hover:underline">
              Terms of Use
            </Link>{" "}
            and{" "}
            <Link to="/privacy" className="text-accent underline-offset-4 hover:underline">
              Privacy Statement
            </Link>
            .
          </Text>

          <Separator />

          <Text size="sm" variant="muted">
            DSTA staff?{" "}
            <Link to="/act-as" className="font-medium text-accent underline-offset-4 hover:underline">
              Sign in to the internal console
            </Link>
          </Text>
        </Form>
      </section>
    </main>
  );
}
