import { Card, CardContent } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

import {
  formatDate,
  type EmailTemplate,
  type Recipient,
  type SendMode,
} from "./model";

export function PreviewStep({
  sendMode,
  template,
  deadline,
  recipients,
}: {
  sendMode: SendMode;
  template: EmailTemplate | undefined;
  deadline?: Date;
  recipients: Recipient[];
}) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div>
          <Heading as="h2" size="2xl">
            Preview and Send
          </Heading>
          <Text size="sm" variant="muted" className="mt-1">
            Review the request below. Use Back to make changes, or Send Request to
            issue it.
          </Text>
        </div>

        <dl className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-3">
          <div>
            <Text size="xs" variant="muted">
              Send mode
            </Text>
            <Text size="sm" weight="medium">
              {sendMode === "individual" ? "Individual" : "Combined"}
            </Text>
          </div>
          <div>
            <Text size="xs" variant="muted">
              Email template
            </Text>
            <Text size="sm" weight="medium">
              {template?.name ?? "—"}
            </Text>
          </div>
          <div>
            <Text size="xs" variant="muted">
              Response deadline
            </Text>
            <Text size="sm" weight="medium">
              {formatDate(deadline) ?? "—"}
            </Text>
          </div>
        </dl>

        <div className="space-y-4">
          {recipients.map((recipient, index) => (
            <div key={recipient.id} className="rounded-lg border border-border p-4">
              <Text size="sm" weight="semibold">
                Recipient{index > 0 ? ` ${index + 1}` : ""}
              </Text>
              <Text size="sm" className="mt-0.5">
                {recipient.primary ?? "—"}
              </Text>
              {recipient.ccs.length > 0 ? (
                <Text size="xs" variant="muted" className="mt-1">
                  Cc: {recipient.ccs.join(", ")}
                </Text>
              ) : null}
              <Separator className="my-3" />
              <ul className="space-y-1">
                {recipient.rows.map((row) => (
                  <li
                    key={row.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Text size="sm" variant="muted">
                      {row.level || "—"}
                    </Text>
                    <Text size="sm" weight="medium" className="tabular-nums">
                      {row.slots} slot{Number(row.slots) === 1 ? "" : "s"}
                    </Text>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
