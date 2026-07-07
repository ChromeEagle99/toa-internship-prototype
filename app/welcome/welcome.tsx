import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Welcome() {
  return (
    <main className="mx-auto flex min-h-svh max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-fg-muted">
        Internal starting point
      </p>

      <h1 className="text-2xl font-semibold text-fg">
        This page won't be seen by users
      </h1>

      <p className="text-sm text-fg-muted">
        It only exists to help you begin the journey. Pick a starting point below.
      </p>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          to="/login/applicant"
          className={cn(buttonVariants({ variant: "solid" }), "w-full sm:w-auto")}
        >
          Applicant login
        </Link>
        <Link
          to="/login/corporate"
          className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
        >
          Corporate login
        </Link>
      </div>

      <nav className="flex flex-col items-center gap-3">
        <Link
          to="/components"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Browse all PRIZM components →
        </Link>
        <Link
          to="/playground"
          className="text-accent underline-offset-4 transition-colors hover:underline"
        >
          Open the playground →
        </Link>
      </nav>
    </main>
  );
}
