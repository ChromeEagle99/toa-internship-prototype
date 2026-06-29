import { CalendarDays, Eye, Mail, Users } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { formatDate, type EmailTemplate, type SendMode } from "./model";

/** A row in the request summary sidebar: icon + label on the left, value right. */
function SummaryItem({
  icon: Icon,
  label,
  value,
  muted,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="flex items-center gap-2 text-fg-muted">
        <Icon className="size-4 shrink-0" />
        <Text size="sm" variant="muted">
          {label}
        </Text>
      </span>
      <Text
        size="sm"
        weight="medium"
        className={cn("text-right", muted && "text-fg-muted font-normal")}
      >
        {value}
      </Text>
    </div>
  );
}

/** Sticky sidebar: a live summary of the request plus a "what happens next" note. */
export function RequestSummary({
  sendMode,
  template,
  deadline,
  recipientCount,
  totalSlots,
}: {
  sendMode: SendMode;
  template: EmailTemplate | undefined;
  deadline?: Date;
  recipientCount: number;
  totalSlots: number;
}) {
  return (
    <>
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-2">
            <Mail className="size-4 text-fg-muted" />
            <Text size="xs" weight="semibold" className="uppercase tracking-wide">
              Request Summary
            </Text>
          </div>
          <Separator />
          <div className="space-y-3.5">
            <SummaryItem
              icon={Users}
              label="Send mode"
              value={sendMode === "individual" ? "Individual" : "Combined"}
            />
            <SummaryItem
              icon={Mail}
              label="Email template"
              value={template?.name ?? "Not set"}
              muted={!template}
            />
            <SummaryItem
              icon={CalendarDays}
              label="Response deadline"
              value={formatDate(deadline) ?? "Not set"}
              muted={!deadline}
            />
            <SummaryItem
              icon={Users}
              label="Recipients"
              value={String(recipientCount)}
            />
            <SummaryItem
              icon={Users}
              label="Total slots requested"
              value={String(totalSlots)}
            />
          </div>
        </CardContent>
      </Card>

      <Alert variant="info">
        <Eye />
        <AlertTitle>What happens next?</AlertTitle>
        <AlertDescription>
          Recipients will upload project submissions using the generated link.
          Approved projects can then be assigned to the right programme and
          intake.
        </AlertDescription>
      </Alert>
    </>
  );
}
