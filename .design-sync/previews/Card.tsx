import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "toa-project";

export function Default() {
  return (
    <Card style={{ maxWidth: 380 }}>
      <CardHeader>
        <CardTitle>Monthly report</CardTitle>
        <CardDescription>Usage across all workspaces for June 2026.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-fg-muted">
          Active users rose 12% week on week, with the steepest growth in the
          analytics workspace. Storage remains well within the current plan.
        </p>
      </CardContent>
      <CardFooter style={{ display: "flex", gap: 8 }}>
        <Button variant="solid" size="sm">
          View report
        </Button>
        <Button variant="outline" size="sm">
          Export
        </Button>
      </CardFooter>
    </Card>
  );
}

export function Minimal() {
  return (
    <Card style={{ maxWidth: 380 }}>
      <CardHeader>
        <CardTitle>API keys</CardTitle>
        <CardDescription>Manage keys used to authenticate requests.</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 14,
          }}
        >
          <span className="font-mono text-fg">sk_live_••••4f2a</span>
          <Button variant="ghost" size="sm">
            Revoke
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
