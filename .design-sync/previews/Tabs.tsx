import { Tabs, TabsList, TabsTrigger, TabsContent, Text } from "toa-project";

export function AccountSettings() {
  return (
    <Tabs defaultValue="profile" style={{ width: 420 }}>
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
      </TabsList>
      <TabsContent value="profile">
        <Text size="sm" variant="muted">
          Update your display name, organisation and contact details. These appear
          across the workspace.
        </Text>
      </TabsContent>
      <TabsContent value="billing">
        <Text size="sm" variant="muted">
          You are on the Team plan, billed annually. Your next invoice is due on 14
          July 2026.
        </Text>
      </TabsContent>
      <TabsContent value="security">
        <Text size="sm" variant="muted">
          Two-factor authentication is enabled. Review active sessions and recovery
          codes here.
        </Text>
      </TabsContent>
    </Tabs>
  );
}

export function ReportView() {
  return (
    <Tabs defaultValue="overview" style={{ width: 420 }}>
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <Text size="sm" variant="muted">
          A summary of key metrics for the quarter, including revenue, retention and
          headline customer growth.
        </Text>
      </TabsContent>
      <TabsContent value="activity">
        <Text size="sm" variant="muted">
          A chronological feed of recent changes made by members of your organisation.
        </Text>
      </TabsContent>
    </Tabs>
  );
}
