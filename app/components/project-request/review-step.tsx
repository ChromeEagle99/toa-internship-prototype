import { useState } from "react";
import { ChevronDown, Clock, Eye } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { EmailPreviewSheet } from "./email-preview-sheet";
import { SectionLabel } from "./fields";
import { PlacementsTable } from "./placements-table";
import { formatDate, requestSlots, type RequestItem, type Sender } from "./model";

/** One labelled read-only recipient field. */
function RecipientField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Text size="xs" variant="muted">
        {label}
      </Text>
      <Text size="sm" weight="medium" className="mt-0.5">
        {value}
      </Text>
    </div>
  );
}

/** A collapsible review card for a single request. */
function ReviewRequestRow({
  request,
  index,
  onPreview,
}: {
  request: RequestItem;
  index: number;
  onPreview: () => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const slots = requestSlots(request);
  const summary = [
    request.pcHead ?? "No PC Head",
    formatDate(request.deadline) ?? "No deadline",
    `${slots} placement${slots === 1 ? "" : "s"}`,
  ].join(" · ");

  return (
    <div className="px-6 py-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand request" : "Collapse request"}
          className="text-fg-muted transition-colors hover:text-fg"
        >
          <ChevronDown
            className={cn("size-4 transition-transform", collapsed && "-rotate-90")}
          />
        </button>
        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-bg-muted text-xs font-medium text-fg-muted">
          {index + 1}
        </span>
        <Text size="sm" weight="medium" className="truncate">
          {summary}
        </Text>
      </div>

      {!collapsed ? (
        <div className="mt-4 space-y-5">
          <div className="space-y-4">
            <SectionLabel>Recipients</SectionLabel>
            <div className="grid gap-5 sm:grid-cols-3">
              <RecipientField label="PC Head" value={request.pcHead ?? "—"} />
              <RecipientField label="AD (P&C)" value={request.adPnc ?? "—"} />
              <RecipientField
                label="Response deadline"
                value={formatDate(request.deadline) ?? "—"}
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionLabel>Placement requirements</SectionLabel>
            <PlacementsTable rows={request.rows} />
          </div>

          <Button variant="outline" size="sm" onClick={onPreview}>
            <Eye className="size-4" />
            Preview email
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/** Step 2 — review every request before sending, with a per-request email preview. */
export function ReviewStep({
  requests,
  sender,
}: {
  requests: RequestItem[];
  sender: Sender;
}) {
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewRequest = requests.find((r) => r.id === previewId) ?? null;

  return (
    <div className="space-y-6">
      <Alert variant="info">
        <Clock />
        <AlertDescription>
          Automatic reminders will be sent{" "}
          <span className="font-semibold">14 and 7 days</span> before the
          deadline.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border px-6 py-5">
            <Heading as="h2" size="lg">
              Review {requests.length} request{requests.length === 1 ? "" : "s"}
            </Heading>
            <Text size="sm" variant="muted" className="mt-1">
              Check each request before sending. Use &ldquo;Preview email&rdquo;
              to see the message a recipient will receive.
            </Text>
          </div>

          <div className="divide-y divide-border">
            {requests.map((request, index) => (
              <ReviewRequestRow
                key={request.id}
                request={request}
                index={index}
                onPreview={() => setPreviewId(request.id)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <EmailPreviewSheet
        request={previewRequest}
        sender={sender}
        open={previewId !== null}
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
      />
    </div>
  );
}
