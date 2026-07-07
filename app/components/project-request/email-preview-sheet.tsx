import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

import { PlacementsTable } from "./placements-table";
import {
  emailSubject,
  formatDate,
  uploadLink,
  type RequestItem,
  type Sender,
} from "./model";

/** A row in the email preview's To/Cc/Subject meta block. */
function MetaRow({
  label,
  last,
  children,
}: {
  label: string;
  last?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[3.5rem_1fr] items-start gap-3 px-4 py-2.5",
        !last && "border-b border-border",
      )}
    >
      <Text size="sm" variant="muted">
        {label}
      </Text>
      <div className="min-w-0 text-sm text-fg">{children}</div>
    </div>
  );
}

/** The rendered email body a recipient would receive. */
function EmailBody({
  request,
  sender,
}: {
  request: RequestItem;
  sender: Sender;
}) {
  return (
    <div className="space-y-5">
      {/* Envelope */}
      <div className="rounded-lg border border-border bg-bg-subtle">
        <MetaRow label="To">{request.pcHead ?? "—"}</MetaRow>
        <MetaRow label="Cc">
          {request.adPnc ? <Badge variant="subtle">{request.adPnc}</Badge> : "—"}
        </MetaRow>
        <MetaRow label="Subject" last>
          <span className="font-medium">{emailSubject(request)}</span>
        </MetaRow>
      </div>

      {/* Message */}
      <div className="space-y-4 text-sm leading-relaxed text-fg">
        <p>Dear {request.pcHead ?? "recipient"},</p>
        <p>
          I am writing on behalf of DSTA&rsquo;s Talent Outreach &amp; Acquisition
          team to request project submissions for our upcoming internship
          programme(s).
        </p>
        <p>Please find the placement requirements below:</p>
        <PlacementsTable rows={request.rows} />
        <p>
          To submit your project proposals, please use the dedicated upload link
          below:
          <br />
          <span className="break-all text-accent">{uploadLink(request)}</span>
        </p>
        <p>Please submit your proposals by {formatDate(request.deadline) ?? "—"}.</p>
        <p>Thank you for your continued support.</p>
        <p>
          Warm regards,
          <br />
          {sender.name}
          <br />
          {sender.role}
        </p>
      </div>
    </div>
  );
}

/** Right-hand drawer previewing the email for one request. */
export function EmailPreviewSheet({
  request,
  sender,
  open,
  onOpenChange,
}: {
  request: RequestItem | null;
  sender: Sender;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Email preview</SheetTitle>
          {request?.pcHead ? (
            <Text size="sm" variant="muted">
              {request.pcHead}
            </Text>
          ) : null}
        </SheetHeader>
        <SheetBody>
          {request ? <EmailBody request={request} sender={sender} /> : null}
        </SheetBody>
        <SheetFooter>
          <SheetClose render={<Button variant="outline">Done</Button>} />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
