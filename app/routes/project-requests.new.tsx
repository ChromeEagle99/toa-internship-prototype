import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ChevronsDownUp,
  ChevronsUpDown,
  Eye,
  Plus,
  Send,
  Trash2,
} from "lucide-react";
import { Link, useNavigate } from "react-router";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Text } from "@/components/ui/text";
import { ToastProvider, toast } from "@/components/ui/toast";

import { AccessDeniedBoundary } from "~/components/access-denied";
import { Shell } from "~/components/shell";
import {
  RequestCard,
  ReviewStep,
  StepHeader,
  emptyRequest,
  emptyRow,
  isRequestReady,
  requestSlots,
  type EducationRow,
  type RequestItem,
} from "~/components/project-request";
import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, resolveUser, type Role } from "~/data";

import type { Route } from "./+types/project-requests.new";

/**
 * Request Project — `/project-requests/new`, the IO/IO-Admin flow for asking
 * Programme Centres to submit projects for an intake. It opens the lifecycle
 * the list page tracks:
 *
 *     ProjectRequest  →  ProjectSubmissionBatch  →  ProjectEntry
 *     (this page)        (PC uploads)               (live projects)
 *
 * A two-step wizard (Build Requests → Review) that batches one or more
 * requests, each addressed to a PC Head and an AD (P&C) with its own response
 * deadline and placement requirements. Like `projects.new`, this is a
 * prototype: the form is fully wired client-side but "Submit" does not persist
 * yet — it toasts and returns to the list. Project requests aren't a policy
 * resource, so the route is ROLE-GATED to mirror the side-nav and list page.
 *
 * The wizard's building blocks (request card, review step, the client-side
 * model and option sets) live in `~/components/project-request`.
 */

/** Roles permitted to manage project requests — mirrors the list page. */
const ALLOWED_ROLES: readonly Role[] = [ROLES.internshipOfficer, ROLES.ioAdmin];

export function meta() {
  return [{ title: "Request Project — Talent Outreach & Acquisition" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const actor = await requireActor(request);

  if (!ALLOWED_ROLES.includes(actor.role)) {
    throw new Response("Project requests are restricted to Internship Officers.", {
      status: 403,
      statusText: "Forbidden",
    });
  }

  const user = await resolveUser(actor.id);

  return {
    actor,
    user: {
      name: user?.name ?? ROLE_LABELS[actor.role],
      email: user?.email,
    },
  };
}

// ── The form ─────────────────────────────────────────────────────────────────

function RequestProjectForm({
  actor,
  user,
}: {
  actor: Route.ComponentProps["loaderData"]["actor"];
  user: Route.ComponentProps["loaderData"]["user"];
}) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [requests, setRequests] = useState<RequestItem[]>([emptyRequest()]);
  const [showErrors, setShowErrors] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────

  const totalSlots = useMemo(
    () => requests.reduce((sum, r) => sum + requestSlots(r), 0),
    [requests],
  );
  const readyCount = useMemo(
    () => requests.filter(isRequestReady).length,
    [requests],
  );
  const selectedCount = requests.filter((r) => r.selected).length;
  const allSelected = requests.length > 0 && selectedCount === requests.length;
  const allCollapsed = requests.length > 0 && requests.every((r) => r.collapsed);

  // ── Request mutators ─────────────────────────────────────────────────────────

  function updateRequest(id: string, patch: Partial<RequestItem>) {
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRequest() {
    setRequests((rs) => [...rs, emptyRequest()]);
  }

  /** Remove one request; never leave the list empty. */
  function removeRequest(id: string) {
    setRequests((rs) => {
      const next = rs.filter((r) => r.id !== id);
      return next.length > 0 ? next : [emptyRequest()];
    });
  }

  /** Bulk-remove every ticked request; re-seed one if that empties the list. */
  function deleteSelected() {
    setRequests((rs) => {
      const next = rs.filter((r) => !r.selected);
      return next.length > 0 ? next : [emptyRequest()];
    });
  }

  function toggleSelectAll(selected: boolean) {
    setRequests((rs) => rs.map((r) => ({ ...r, selected })));
  }

  function toggleCollapseAll() {
    const collapsed = !allCollapsed;
    setRequests((rs) => rs.map((r) => ({ ...r, collapsed })));
  }

  function updateRow(reqId: string, rowId: string, patch: Partial<EducationRow>) {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === reqId
          ? {
              ...r,
              rows: r.rows.map((row) =>
                row.id === rowId ? { ...row, ...patch } : row,
              ),
            }
          : r,
      ),
    );
  }

  function addRow(reqId: string) {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === reqId ? { ...r, rows: [...r.rows, emptyRow()] } : r,
      ),
    );
  }

  function removeRow(reqId: string, rowId: string) {
    setRequests((rs) =>
      rs.map((r) =>
        r.id === reqId && r.rows.length > 1
          ? { ...r, rows: r.rows.filter((row) => row.id !== rowId) }
          : r,
      ),
    );
  }

  // ── Validation & submit ──────────────────────────────────────────────────────

  function handleReview() {
    if (!requests.every(isRequestReady)) {
      setShowErrors(true);
      toast.add({
        title: "Incomplete requests",
        description: "Complete every required field before reviewing.",
        type: "error",
      });
      return;
    }
    setStep(2);
  }

  function handleSubmit() {
    const payload = requests.map((r) => ({
      pcHead: r.pcHead,
      adPnc: r.adPnc,
      deadline: r.deadline?.toISOString().slice(0, 10),
      placements: r.rows.map((row) => ({
        level: row.level,
        placements: row.placements,
      })),
    }));

    // Placeholder: persistence isn't wired up yet — log and return to the list.
    // eslint-disable-next-line no-console
    console.log("Submit project requests (placeholder):", payload);
    toast.add({
      title: "Requests submitted",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "success",
    });
    setTimeout(() => navigate("/project-requests"), 600);
  }

  const requestCount = requests.length;
  const footerSummary = `${requestCount} request${requestCount === 1 ? "" : "s"} · ${totalSlots} slot${totalSlots === 1 ? "" : "s"}`;

  // Sign-off shown in the email preview — the signed-in officer.
  const sender = { name: user.name, role: `${ROLE_LABELS[actor.role]}, DSTA` };

  return (
    <Shell actor={actor} user={user} workstream="Internship" title="Request Project">
      <div className="mb-5">
        <Text size="sm" variant="muted">
          <Link to="/project-requests" className="transition-colors hover:text-fg">
            Project Requests
          </Link>{" "}
          / <span className="text-fg">Request Project</span>
        </Text>
      </div>

      <StepHeader current={step} />

      {step === 1 ? (
        <Card>
          <CardContent className="p-0">
            {/* ── Requests toolbar ─────────────────────────────────────── */}
            <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
              <Checkbox
                checked={allSelected}
                indeterminate={selectedCount > 0 && !allSelected}
                onCheckedChange={(checked) => toggleSelectAll(Boolean(checked))}
                aria-label="Select all requests"
              />
              <Text size="sm" weight="semibold">
                Requests
              </Text>
              <span className="flex size-5 items-center justify-center rounded-full bg-bg-muted text-xs font-medium text-fg-muted">
                {requestCount}
              </span>
              <Text size="xs" variant="muted" className="tabular-nums">
                {readyCount}/{requestCount} ready
              </Text>

              <div className="ml-auto flex items-center gap-1">
                {selectedCount > 0 ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deleteSelected}
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                    Delete ({selectedCount})
                  </Button>
                ) : null}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleCollapseAll}
                  aria-label={allCollapsed ? "Expand all requests" : "Collapse all requests"}
                >
                  {allCollapsed ? (
                    <ChevronsUpDown className="size-4" />
                  ) : (
                    <ChevronsDownUp className="size-4" />
                  )}
                </Button>
                <Button size="sm" onClick={addRequest}>
                  <Plus className="size-4" />
                  Add request
                </Button>
              </div>
            </div>

            {/* ── Request list ─────────────────────────────────────────── */}
            <div className="divide-y divide-border">
              {requests.map((request, index) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  index={index}
                  showErrors={showErrors}
                  onToggleCollapse={() =>
                    updateRequest(request.id, { collapsed: !request.collapsed })
                  }
                  onToggleSelect={(selected) =>
                    updateRequest(request.id, { selected })
                  }
                  onRemove={() => removeRequest(request.id)}
                  onPcHeadChange={(v) => updateRequest(request.id, { pcHead: v })}
                  onAdPncChange={(v) => updateRequest(request.id, { adPnc: v })}
                  onDeadlineChange={(deadline) =>
                    updateRequest(request.id, { deadline })
                  }
                  onRowChange={(rowId, patch) =>
                    updateRow(request.id, rowId, patch)
                  }
                  onAddRow={() => addRow(request.id)}
                  onRemoveRow={(rowId) => removeRow(request.id, rowId)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <ReviewStep requests={requests} sender={sender} />
      )}

      <Shell.Footer>
        <div className="flex items-center justify-between gap-4">
          <Text size="sm" variant="muted" className="tabular-nums">
            {footerSummary}
          </Text>
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="size-4" />
                Back
              </Button>
            ) : (
              <Link
                to="/project-requests"
                className={buttonVariants({ variant: "outline" })}
              >
                Cancel
              </Link>
            )}
            {step === 1 ? (
              <Button onClick={handleReview}>
                Review
                <Eye className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>
                <Send className="size-4" />
                Confirm Send
              </Button>
            )}
          </div>
        </div>
      </Shell.Footer>
    </Shell>
  );
}

export default function NewProjectRequest({ loaderData }: Route.ComponentProps) {
  const { actor, user } = loaderData;

  return (
    <ToastProvider>
      <RequestProjectForm actor={actor} user={user} />
    </ToastProvider>
  );
}

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  return (
    <AccessDeniedBoundary message="Your current role isn't permitted to create project requests. Switch to a role that can (Internship Officer or IO Admin)." />
  );
}
