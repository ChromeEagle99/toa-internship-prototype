import { isRouteErrorResponse, Link, useRouteError } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";

/**
 * The shared route-level error screen. Renders `message` when the thrown
 * response is a 403 (from `requireCan` or a role gate) and a generic fallback
 * otherwise. Each route's `ErrorBoundary` delegates here with its own denial
 * copy, e.g.:
 *
 *     export function ErrorBoundary() {
 *       return <AccessDeniedBoundary message="Your role can't create programmes…" />;
 *     }
 */
export function AccessDeniedBoundary({ message }: { message: string }) {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403 ? message : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
