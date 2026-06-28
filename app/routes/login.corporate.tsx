import { useState } from "react";
import { ChevronRight, KeyRound } from "lucide-react";
import { Form, Link, redirect } from "react-router";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { ensureUsersSeeded, listUsers, resolveUser } from "~/data";
import {
  DEMO_CORPORATE_IDENTITIES,
  CORPORATE_LOGIN_ROLES,
} from "~/auth/demo-identities";
import { commitActorId } from "~/auth/session.server";

import type { Route } from "./+types/login.corporate";

/**
 * CORPORATE LOGIN — the internal back-office console sign-in, at `/login/corporate`.
 *
 * "Corporate" (the route/nav term — e.g. the "Corporate login" button on the
 * welcome screen) and the on-screen "Staff sign-in" heading are the SAME thing:
 * "corporate" names the Corppass / WOG-AD channel DSTA staff sign in through,
 * "staff" names who they are. There is one screen, not two — don't split them.
 *
 * The back-office mirror of `login.applicant.tsx`. This is a PROTOTYPE: there is
 * no real Corppass or WOG AD SSO. Picking a demo identity and pressing either
 * sign-in button sets the same `toa_actor` cookie the rest of the app already
 * reads (see `session.server.ts`). Swap the demo userbase from
 * `app/auth/demo-identities.ts` + `exampleUsers()` — nothing here hardcodes a
 * person.
 */

export function meta() {
  return [{ title: "Staff sign-in — DSTA Talent Outreach & Acquisition" }];
}

/** Only allow same-site redirect targets, never an absolute URL. */
function safeNext(next: string | null): string | null {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : null;
}

export async function loader({ request }: Route.LoaderArgs) {
  await ensureUsersSeeded(); // make sure the demo back-office users exist to log in as
  const users = await listUsers();
  const byId = new Map(users.map((user) => [user.id, user]));

  // Join "which identities to show" (presentation) with the seeded users (facts).
  const identities = DEMO_CORPORATE_IDENTITIES.flatMap((identity) => {
    const user = byId.get(identity.id);
    return user ? [{ id: user.id, name: user.name, tagline: identity.tagline }] : [];
  });

  const next = safeNext(new URL(request.url).searchParams.get("next"));
  return { identities, next };
}

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const userId = String(form.get("userId") ?? "");
  // After corporate sign-in land on the internal console (the App Shell / Dashboard),
  // unless a guarded route bounced the caller here with its own `next` target.
  const next = safeNext(String(form.get("next") ?? "")) ?? "/playground/shell";

  // Defence in depth: only sign in as a seeded back-office user offered on this
  // screen, so a tampered form can't sign in as an applicant through here.
  const offered = DEMO_CORPORATE_IDENTITIES.some((identity) => identity.id === userId);
  const user = offered ? await resolveUser(userId) : null;
  if (!user || !CORPORATE_LOGIN_ROLES.includes(user.role)) {
    return redirect("/login/corporate");
  }

  return redirect(next, { headers: { "Set-Cookie": await commitActorId(user.id) } });
}

/** The primary Corppass call-to-action. Maps to the `danger` token to keep the
 *  Corppass-brand red while staying within PRIZM's semantic tokens. */
function CorppassButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button
      type="submit"
      variant="danger"
      disabled={disabled}
      className="h-12 w-full gap-1.5 text-sm font-semibold"
    >
      Log in with <span className="font-bold">Corppass</span>
    </Button>
  );
}

/** Secondary internal route — Whole-of-Government Active Directory SSO. Same
 *  prototype behaviour (sets the cookie for the selected identity). */
function SsoButton({ disabled }: { disabled?: boolean }) {
  return (
    <Button
      type="submit"
      variant="outline"
      disabled={disabled}
      className="h-12 w-full bg-surface text-sm font-semibold"
    >
      <KeyRound className="size-4" />
      Staff SSO (WOG AD)
    </Button>
  );
}

export default function CorporateLogin({ loaderData }: Route.ComponentProps) {
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
          Run talent outreach, selection and internships &mdash; in one console.
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
              Internal console
            </p>
            <Heading as="h1" size="3xl">
              Staff sign-in
            </Heading>
            <Text variant="muted">
              Sign in with your government credentials to pick up where you left off.
            </Text>
          </div>

          {/* Demo identity picker — selecting a card chooses who the sign-in
              buttons sign you in as (there is no real Corppass/SSO here). */}
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

          <div className="space-y-2.5">
            <CorppassButton disabled={!selectedId} />
            <SsoButton disabled={!selectedId} />
          </div>

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
            Applying for an internship?{" "}
            <Link
              to="/login/applicant"
              className="font-medium text-accent underline-offset-4 hover:underline"
            >
              Candidate sign-in
            </Link>
          </Text>
        </Form>
      </section>
    </main>
  );
}
