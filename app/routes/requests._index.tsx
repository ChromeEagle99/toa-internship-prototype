import { Plus, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Text } from "@/components/ui/text";
import { useActor } from "~/context/actor-context";
import {
  fulfilmentFor,
  projectRequestsRepository,
  projectsRepository,
  type LineFulfilment,
  type Project,
  type ProjectRequest,
} from "~/data";

/** Fulfilment status → Badge variant + label. */
const STATUS_META: Record<LineFulfilment["status"], { variant: "subtle" | "warning" | "success" | "info"; label: string }> = {
  pending: { variant: "subtle", label: "Pending" },
  shortfall: { variant: "warning", label: "Shortfall" },
  fulfilled: { variant: "success", label: "Fulfilled" },
  "over-allocated": { variant: "info", label: "Over-allocated" },
};

/**
 * Project requests list (IO Admin). Each request is reconciled against the
 * project pool on the fly — `fulfilmentFor` soft-matches submitted projects on
 * pc_code + education level; there is no foreign key between them.
 */
export default function RequestsIndex() {
  const { actor, ready } = useActor();
  const [requests, setRequests] = useState<ProjectRequest[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [reqRes, projRes] = await Promise.all([
      projectRequestsRepository.as(actor).list(),
      projectsRepository.as(actor).list(),
    ]);
    if (!reqRes.ok) {
      setRequests([]);
      setProjects([]);
      setError(`[${reqRes.error.code}] ${reqRes.error.message}`);
      return;
    }
    setError(null);
    setRequests(
      [...reqRes.data].sort((a, b) => b.year - a.year || a.pcCode.localeCompare(b.pcCode)),
    );
    setProjects(projRes.ok ? projRes.data : []);
  }, [actor]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Link to="/requests/new" className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" />
          New request
        </Link>
      </div>

      {error ? (
        <Text size="sm" className="text-danger">
          {error}
        </Text>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Send className="h-6 w-6" />}
          title="No project requests yet"
          action={
            <Link to="/requests/new" className={cn(buttonVariants())}>
              <Plus className="h-4 w-4" />
              New request
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {requests.map((request) => {
            const fulfilment = fulfilmentFor(request, projects);
            return (
              <Card key={request.id}>
                <CardHeader className="flex flex-row items-center justify-between gap-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{request.pcCode}</CardTitle>
                    <Text size="xs" variant="muted">
                      {request.year}
                      {request.toRecipients.length > 0 ? ` · To ${request.toRecipients.join(", ")}` : ""}
                    </Text>
                  </div>
                  <Badge variant="subtle">{request.year}</Badge>
                </CardHeader>
                <CardContent>
                  <dl className="divide-y divide-border rounded-md border border-border">
                    {fulfilment.map((line) => {
                      const meta = STATUS_META[line.status];
                      return (
                        <div
                          key={line.educationLevel}
                          className="flex items-center justify-between gap-4 px-4 py-2.5"
                        >
                          <dt className="text-sm text-fg">{line.educationLevel}</dt>
                          <dd className="flex items-center gap-3">
                            <span className="text-sm tabular-nums text-fg-muted">
                              {line.submitted}/{line.requested}
                            </span>
                            <Badge variant={meta.variant}>{meta.label}</Badge>
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
