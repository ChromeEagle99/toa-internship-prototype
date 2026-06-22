import { Alert, AlertTitle, AlertDescription } from "toa-project";
import { Info, CheckCircle2, TriangleAlert, OctagonAlert } from "lucide-react";

export function Variants() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 520 }}>
      <Alert variant="default">
        <Info />
        <AlertTitle>Scheduled maintenance</AlertTitle>
        <AlertDescription>
          The reporting workspace will be offline on Sunday from 02:00 to 04:00 BST while we
          upgrade the database.
        </AlertDescription>
      </Alert>
      <Alert variant="info">
        <Info />
        <AlertTitle>New organisation policy</AlertTitle>
        <AlertDescription>
          Two-factor authentication is now required for all administrators.
        </AlertDescription>
      </Alert>
    </div>
  );
}

export function Success() {
  return (
    <Alert variant="success" style={{ maxWidth: 520 }}>
      <CheckCircle2 />
      <AlertTitle>Payment received</AlertTitle>
      <AlertDescription>
        Your invoice for June 2026 has been settled. A receipt has been emailed to your
        billing contact.
      </AlertDescription>
    </Alert>
  );
}

export function Warning() {
  return (
    <Alert variant="warning" style={{ maxWidth: 520 }}>
      <TriangleAlert />
      <AlertTitle>Storage nearly full</AlertTitle>
      <AlertDescription>
        You have used 92% of your plan&rsquo;s storage. Archive old projects or upgrade to
        avoid interruptions.
      </AlertDescription>
    </Alert>
  );
}

export function Danger() {
  return (
    <Alert variant="danger" style={{ maxWidth: 520 }}>
      <OctagonAlert />
      <AlertTitle>Unable to sync changes</AlertTitle>
      <AlertDescription>
        We could not reach the server. Check your connection and try again, or contact
        support if the problem persists.
      </AlertDescription>
    </Alert>
  );
}
