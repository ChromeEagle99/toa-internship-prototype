import { useMemo, useState } from "react";
import { Eye, Mail, Plus, Send, Users } from "lucide-react";
import {
  isRouteErrorResponse,
  Link,
  useNavigate,
  useRouteError,
} from "react-router";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Text } from "@/components/ui/text";
import { ToastProvider, toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

import { Shell } from "~/components/shell";
import {
  DeadlinePicker,
  EMAIL_TEMPLATES,
  PreviewStep,
  RecipientCard,
  Required,
  RequestSummary,
  StepHeader,
  emptyRecipient,
  emptyRow,
  recipientSlots,
  type EducationRow,
  type Recipient,
  type SendMode,
} from "~/components/project-request";
import { requireActor } from "~/auth/current-user.server";
import { ROLE_LABELS, ROLES, resolveUser, type Role } from "~/data";

import type { Route } from "./+types/project-requests.new";

/**
 * Create Project Request — `/project-requests/new`, the IO/IO-Admin flow for
 * asking a Programme Centre to submit projects for an intake. It opens the
 * lifecycle the list page tracks:
 *
 *     ProjectRequest  →  ProjectSubmissionBatch  →  ProjectEntry
 *     (this page)        (PC uploads)               (live projects)
 *
 * A two-step wizard (Create → Preview and Send) with a live request summary in
 * a sticky sidebar. Like `projects.new`, this is a prototype: the form is fully
 * wired client-side but "Send" does not persist yet — it toasts and returns to
 * the list. Project requests aren't a policy resource, so the route is
 * ROLE-GATED to mirror the side-nav and the list page.
 *
 * The wizard's building blocks (recipient card, preview, sidebar summary, the
 * client-side model and option sets) live in `~/components/project-request`.
 */

/** Roles permitted to manage project requests — mirrors the list page. */
const ALLOWED_ROLES: readonly Role[] = [ROLES.internshipOfficer, ROLES.ioAdmin];

export function meta() {
  return [{ title: "Create Project Request — Talent Outreach & Acquisition" }];
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

function CreateRequestForm({
  actor,
  user,
}: {
  actor: Route.ComponentProps["loaderData"]["actor"];
  user: Route.ComponentProps["loaderData"]["user"];
}) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  // Request details
  const [sendMode, setSendMode] = useState<SendMode>("individual");
  const [templateId, setTemplateId] = useState<string>("ET-001");
  const [deadline, setDeadline] = useState<Date | undefined>();

  // Recipients
  const [recipients, setRecipients] = useState<Recipient[]>([emptyRecipient()]);

  const [showErrors, setShowErrors] = useState(false);

  const template = EMAIL_TEMPLATES.find((t) => t.id === templateId);
  const totalSlots = useMemo(
    () => recipients.reduce((sum, r) => sum + recipientSlots(r), 0),
    [recipients],
  );

  // ── Recipient mutators ─────────────────────────────────────────────────────

  function updateRecipient(id: string, patch: Partial<Recipient>) {
    setRecipients((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addRecipient() {
    setRecipients((rs) => [...rs, emptyRecipient()]);
  }

  function removeRecipient(id: string) {
    setRecipients((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== id) : rs));
  }

  function addCc(id: string) {
    setRecipients((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const next = r.ccDraft.trim();
        if (!next || r.ccs.includes(next)) return { ...r, ccDraft: "" };
        return { ...r, ccs: [...r.ccs, next], ccDraft: "" };
      }),
    );
  }

  function removeCc(id: string, cc: string) {
    setRecipients((rs) =>
      rs.map((r) =>
        r.id === id ? { ...r, ccs: r.ccs.filter((c) => c !== cc) } : r,
      ),
    );
  }

  function updateRow(rcptId: string, rowId: string, patch: Partial<EducationRow>) {
    setRecipients((rs) =>
      rs.map((r) =>
        r.id === rcptId
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

  function addRow(rcptId: string) {
    setRecipients((rs) =>
      rs.map((r) =>
        r.id === rcptId ? { ...r, rows: [...r.rows, emptyRow()] } : r,
      ),
    );
  }

  function removeRow(rcptId: string, rowId: string) {
    setRecipients((rs) =>
      rs.map((r) =>
        r.id === rcptId && r.rows.length > 1
          ? { ...r, rows: r.rows.filter((row) => row.id !== rowId) }
          : r,
      ),
    );
  }

  // ── Validation & submit ────────────────────────────────────────────────────

  function isValid() {
    return (
      templateId &&
      deadline &&
      recipients.every(
        (r) =>
          r.primary &&
          r.rows.length > 0 &&
          r.rows.every((row) => row.level && Number(row.slots) >= 1),
      )
    );
  }

  function handlePreview() {
    if (!isValid()) {
      setShowErrors(true);
      toast.add({
        title: "Missing details",
        description: "Please complete the required fields before previewing.",
        type: "error",
      });
      return;
    }
    setStep(2);
  }

  function handleSend() {
    const payload = {
      sendMode,
      templateId,
      deadline: deadline?.toISOString().slice(0, 10),
      recipients: recipients.map((r) => ({
        primary: r.primary,
        ccs: r.ccs,
        educationLevels: r.rows.map((row) => ({
          level: row.level,
          slots: Number(row.slots),
        })),
      })),
    };

    // Placeholder: persistence isn't wired up yet — log and return to the list.
    // eslint-disable-next-line no-console
    console.log("Send project request (placeholder):", payload);
    toast.add({
      title: "Request sent",
      description: "This is a placeholder — nothing was persisted yet.",
      type: "success",
    });
    setTimeout(() => navigate("/project-requests"), 600);
  }

  const recipientCount = recipients.length;
  const footerSummary = `${recipientCount} recipient${recipientCount === 1 ? "" : "s"} · ${totalSlots} slot${totalSlots === 1 ? "" : "s"}`;

  return (
    <Shell
      actor={actor}
      user={user}
      workstream="Internship"
      title="Create Project Request"
    >
      <div className="mb-5">
        <Text size="sm" variant="muted">
          <Link to="/project-requests" className="transition-colors hover:text-fg">
            Project Requests
          </Link>{" "}
          / <span className="text-fg">Create Project Request</span>
        </Text>
      </div>

      <StepHeader current={step} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* ── Main column ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          {step === 1 ? (
            <>
              {/* Request Details */}
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div>
                    <Heading as="h2" size="2xl">
                      Request Details
                    </Heading>
                    {/* <Text size="sm" variant="muted" className="mt-1">
                      Configure how this request will be sent and when recipients
                      should respond.
                    </Text> */}
                  </div>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <div className="space-y-1.5">
                      <Label>
                        Send Mode <Required />
                      </Label>
                      <div className="flex rounded-md border border-border p-1">
                        {(
                          [
                            ["individual", "Individual", Mail],
                            ["combined", "Combined", Users],
                          ] as const
                        ).map(([mode, label, Icon]) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setSendMode(mode)}
                            className={cn(
                              "flex flex-1 items-center justify-center gap-1.5 rounded px-3 py-1.5 text-sm font-medium transition-colors",
                              sendMode === mode
                                ? "bg-accent text-accent-fg"
                                : "text-fg-muted hover:text-fg",
                            )}
                          >
                            <Icon className="size-4" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Email Template <Required />
                      </Label>
                      <Select
                        value={templateId}
                        onValueChange={(v) => setTemplateId((v as string) ?? "")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select template…" />
                        </SelectTrigger>
                        <SelectContent>
                          {EMAIL_TEMPLATES.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label>
                        Response Deadline <Required />
                      </Label>
                      <DeadlinePicker value={deadline} onChange={setDeadline} />
                      {showErrors && !deadline ? (
                        <Text size="xs" className="text-danger">
                          Please choose a response deadline.
                        </Text>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recipients */}
              <Card>
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Heading as="h2" size="2xl">
                        Recipients
                      </Heading>
                      <Text size="sm" variant="muted" className="mt-1">
                        {sendMode === "individual"
                          ? "Each recipient receives a personalised email."
                          : "All recipients receive one combined email."}
                      </Text>
                    </div>
                    <Button variant="outline" size="sm" onClick={addRecipient}>
                      <Plus className="size-4" />
                      Add Recipient
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {recipients.map((recipient, index) => (
                      <RecipientCard
                        key={recipient.id}
                        recipient={recipient}
                        index={index}
                        canRemove={recipients.length > 1}
                        showErrors={showErrors}
                        onToggle={() =>
                          updateRecipient(recipient.id, {
                            collapsed: !recipient.collapsed,
                          })
                        }
                        onRemove={() => removeRecipient(recipient.id)}
                        onPrimaryChange={(v) =>
                          updateRecipient(recipient.id, { primary: v })
                        }
                        onCcDraftChange={(v) =>
                          updateRecipient(recipient.id, { ccDraft: v })
                        }
                        onAddCc={() => addCc(recipient.id)}
                        onRemoveCc={(cc) => removeCc(recipient.id, cc)}
                        onRowChange={(rowId, patch) =>
                          updateRow(recipient.id, rowId, patch)
                        }
                        onAddRow={() => addRow(recipient.id)}
                        onRemoveRow={(rowId) => removeRow(recipient.id, rowId)}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <PreviewStep
              sendMode={sendMode}
              template={template}
              deadline={deadline}
              recipients={recipients}
            />
          )}
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────── */}
        <div className="space-y-6 lg:sticky lg:top-[calc(var(--shell-header-h)+1.5rem)] lg:self-start">
          <RequestSummary
            sendMode={sendMode}
            template={template}
            deadline={deadline}
            recipientCount={recipientCount}
            totalSlots={totalSlots}
          />
        </div>
      </div>

      {/* ── Sticky footer bar — breaks out of the main padding to span full width. */}
      <div className="sticky bottom-0 z-10 mt-6 -mx-4 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Text size="sm" variant="muted" className="tabular-nums">
            {footerSummary}
          </Text>
          <div className="flex items-center gap-2">
            {step === 2 ? (
              <Button variant="outline" onClick={() => setStep(1)}>
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
              <Button onClick={handlePreview}>
                Preview and Send
                <Eye className="size-4" />
              </Button>
            ) : (
              <Button onClick={handleSend}>
                <Send className="size-4" />
                Send Request
              </Button>
            )}
          </div>
        </div>
      </div>
    </Shell>
  );
}

export default function NewProjectRequest({ loaderData }: Route.ComponentProps) {
  const { actor, user } = loaderData;

  return (
    <ToastProvider>
      <CreateRequestForm actor={actor} user={user} />
    </ToastProvider>
  );
}

/** Renders the 403 from the role gate as a clear "access denied" screen. */
export function ErrorBoundary() {
  const error = useRouteError();
  const is403 = isRouteErrorResponse(error) && error.status === 403;

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6">
      <Alert variant="danger">
        <AlertTitle>{is403 ? "Access denied" : "Something went wrong"}</AlertTitle>
        <AlertDescription>
          {is403
            ? "Your current role isn't permitted to create project requests. Switch to a role that can (Internship Officer or IO Admin)."
            : "An unexpected error occurred loading this page."}
        </AlertDescription>
      </Alert>
      <Link to="/act-as" className={buttonVariants({ variant: "solid", size: "sm" })}>
        Switch identity
      </Link>
    </div>
  );
}
