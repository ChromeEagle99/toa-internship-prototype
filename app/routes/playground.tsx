import {
  ArrowRight,
  CalendarRange,
  Database,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import { Link } from "react-router";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";

import { ThemeToggle } from "~/components/theme-toggle";

export function meta() {
  return [
    { title: "Playground — PRIZM 4.0" },
    {
      name: "description",
      content: "A sandbox for building and testing custom components.",
    },
  ];
}

/* Experiments live on their own routes so each can be showcased and tested in
   isolation. Add a card here when you scaffold a new one. */
const EXPERIMENTS = [
  {
    to: "/playground/multi-step-form",
    icon: Layers,
    title: "Multi-step form",
    description:
      "A route-free wizard built as a compound component, with several worked examples covering schemas, conditional steps, and the imperative validate escape hatch.",
  },
  {
    to: "/playground/data-access",
    icon: Database,
    title: "Data access layer",
    description:
      "A live demo of the role-aware, backend-agnostic data layer: switch acting identity to see deny-by-default authorisation and row-level ownership over a swappable storage backend.",
  },
  {
    to: "/playground/date-range-picker",
    icon: CalendarRange,
    title: "Date range picker",
    description:
      "A start/end date-range picker composed from PRIZM Calendar, Popover, and Button, shown standalone and then editing ranges inside a table cell.",
  },
  {
    to: "/playground/dashboard",
    icon: LayoutDashboard,
    title: "Customisable dashboard",
    description:
      "A draggable, resizable widget dashboard on react-grid-layout: toggle edit mode to rearrange, resize, add, or remove widgets, with per-widget minimum sizes, a pinned banner, and layout saved per device.",
  },
];

export default function Playground() {
  return (
    <div className="min-h-screen bg-bg text-fg">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <Heading as="h1" size="2xl">
              Playground
            </Heading>
            <Text size="sm" variant="muted" className="mt-0.5">
              A sandbox for building and testing your own components.
            </Text>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <section className="space-y-3">
          <Heading as="h2" size="lg">
            Experiments
          </Heading>
          <Text size="sm" variant="muted">
            Each experiment has its own route so it can be explored on its own.
          </Text>
          <Separator />

          <div className="grid gap-4">
            {EXPERIMENTS.map(({ to, icon: Icon, title, description }) => (
              <Card key={to}>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-accent" />
                    <CardTitle>{title}</CardTitle>
                  </div>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link to={to} className={buttonVariants({ variant: "solid" })}>
                    Open
                    <ArrowRight />
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <Heading as="h2" size="lg">
            Scratch area
          </Heading>
          <Text size="sm" variant="muted">
            Drop new components below to try them out.
          </Text>
          <Separator />
          <div className="rounded-md border border-dashed border-border p-6 text-center">
            <Link to="/components" className={buttonVariants({ variant: "outline" })}>
              Browse the component gallery
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
