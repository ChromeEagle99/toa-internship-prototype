import { useCallback, useEffect, useState } from "react";

import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/text";
import { useActor, ACTOR_NAMES } from "~/context/actor-context";
import {
  ROLES,
  programmesRepository,
  projectRequestsRepository,
  projectsRepository,
} from "~/data";

type Stat = { label: string; value: number; hint: string };

/** Landing dashboard. A light, role-aware summary built from live counts. */
export default function Dashboard() {
  const { actor, role, ready } = useActor();
  const [stats, setStats] = useState<Stat[]>([]);

  const refresh = useCallback(async () => {
    if (role === ROLES.ioAdmin) {
      const [progs, reqs, projs] = await Promise.all([
        programmesRepository.as(actor).list(),
        projectRequestsRepository.as(actor).list(),
        projectsRepository.as(actor).list(),
      ]);
      const pending = projs.ok ? projs.data.filter((p) => p.reviewStatus === "pending").length : 0;
      setStats([
        { label: "Programmes", value: progs.ok ? progs.data.length : 0, hint: "Active cohorts" },
        { label: "Project requests", value: reqs.ok ? reqs.data.length : 0, hint: "Raised to PCs" },
        { label: "Projects to review", value: pending, hint: "Awaiting approval" },
      ]);
    } else {
      const projs = await projectsRepository.as(actor).list();
      const mine = projs.ok ? projs.data : [];
      setStats([
        { label: "My submissions", value: mine.length, hint: "Projects you submitted" },
        {
          label: "Approved",
          value: mine.filter((p) => p.reviewStatus === "approved").length,
          hint: "Accepted by IO",
        },
        {
          label: "Pending review",
          value: mine.filter((p) => p.reviewStatus === "pending").length,
          hint: "With the IO Admin",
        },
      ]);
    }
  }, [actor, role]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  return (
    <div className="space-y-6">
      <Text variant="muted">
        Welcome back, {ACTOR_NAMES[actor.id] ?? actor.id}. Here is where things stand.
      </Text>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="mt-1 text-3xl">{stat.value}</CardTitle>
              <Text size="xs" variant="muted" className="mt-1">
                {stat.hint}
              </Text>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
