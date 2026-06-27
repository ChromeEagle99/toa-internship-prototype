import { ArrowLeft, CalendarRange } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useActor } from "~/context/actor-context";
import {
  intakesRepository,
  programmesRepository,
  projectsRepository,
  type Intake,
  type IntakeStatus,
  type Programme,
  type Project,
} from "~/data";

/** Intake status → Badge variant. */
const INTAKE_STATUS_VARIANT: Record<IntakeStatus, "subtle" | "success" | "warning" | "info"> = {
  draft: "subtle",
  open: "success",
  closed: "warning",
  completed: "info",
};

function formatRange(start: string, end: string): string {
  return `${start} → ${end}`;
}

/**
 * Programme detail (IO Admin). Shows the cohort, its intakes, and the projects
 * attached to each intake. Reads through the data layer with the current actor.
 */
export default function ProgrammeDetail() {
  const { id } = useParams();
  const { actor, ready } = useActor();
  const [programme, setProgramme] = useState<Programme | null>(null);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    const progRes = await programmesRepository.as(actor).get(id);
    if (!progRes.ok) {
      setProgramme(null);
      setError(`[${progRes.error.code}] ${progRes.error.message}`);
      return;
    }
    setError(null);
    setProgramme(progRes.data);

    const [intakeRes, projRes] = await Promise.all([
      intakesRepository.as(actor).list(),
      projectsRepository.as(actor).list(),
    ]);
    setIntakes(
      intakeRes.ok
        ? intakeRes.data
            .filter((i) => i.programmeId === id)
            .sort((a, b) => a.internshipStart.localeCompare(b.internshipStart))
        : [],
    );
    setProjects(projRes.ok ? projRes.data : []);
  }, [actor, id]);

  useEffect(() => {
    if (ready) void refresh();
  }, [ready, refresh]);

  return (
    <div className="space-y-6">
      <Link
        to="/programmes"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "-ml-2 w-fit")}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to programmes
      </Link>

      {error ? (
        <Text size="sm" className="text-danger">
          {error}
        </Text>
      ) : !programme ? (
        <Text variant="muted">Loading…</Text>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Heading as="h1" size="2xl">
                {programme.title}
              </Heading>
              <Badge variant="subtle">{programme.educationLevel}</Badge>
            </div>
            <Text variant="muted">
              {programme.year}
              {programme.description ? ` · ${programme.description}` : ""}
            </Text>
          </div>

          <section className="space-y-4">
            <Heading as="h2" size="lg">
              Intakes
            </Heading>

            {intakes.length === 0 ? (
              <EmptyState icon={<CalendarRange className="h-6 w-6" />} title="No intakes yet" />
            ) : (
              <div className="space-y-4">
                {intakes.map((intake) => {
                  const attached = projects.filter((p) => p.intakeId === intake.id);
                  return (
                    <Card key={intake.id}>
                      <CardHeader className="flex flex-row items-start justify-between gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-base">
                            {intake.intakeTitle || formatRange(intake.internshipStart, intake.internshipEnd)}
                          </CardTitle>
                          <CardDescription>
                            {formatRange(intake.internshipStart, intake.internshipEnd)} ·{" "}
                            {intake.durationMonths} {intake.durationMonths === 1 ? "month" : "months"} ·
                            Applications {formatRange(intake.applicationOpen, intake.applicationClose)}
                          </CardDescription>
                        </div>
                        <Badge variant={INTAKE_STATUS_VARIANT[intake.status]}>
                          {intake.status}
                        </Badge>
                      </CardHeader>
                      <CardContent>
                        {attached.length === 0 ? (
                          <Text size="sm" variant="muted">
                            No projects attached yet.
                          </Text>
                        ) : (
                          <dl className="divide-y divide-border rounded-md border border-border">
                            {attached.map((project) => (
                              <div
                                key={project.id}
                                className="flex items-center justify-between gap-4 px-4 py-2.5"
                              >
                                <dt className="space-y-0.5">
                                  <span className="text-sm font-medium text-fg">
                                    {project.title}
                                  </span>
                                  <span className="block text-xs text-fg-muted">
                                    {project.pcCode} · {project.mentorName}
                                  </span>
                                </dt>
                                <dd className="text-sm tabular-nums text-fg-muted">
                                  {project.placements}{" "}
                                  {project.placements === 1 ? "placement" : "placements"}
                                </dd>
                              </div>
                            ))}
                          </dl>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
