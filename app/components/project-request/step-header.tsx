import { Separator } from "@/components/ui/separator";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

/** The numbered "1 → 2" wizard header, matching the design. */
export function StepHeader({ current }: { current: number }) {
  const steps = [
    { n: 1, label: "Create Project Request" },
    { n: 2, label: "Preview and Send" },
  ];
  return (
    <div className="mb-6 flex items-center gap-3">
      {steps.map((step, i) => {
        const active = current >= step.n;
        return (
          <div key={step.n} className="flex flex-1 items-center gap-3">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                active
                  ? "bg-accent text-accent-fg"
                  : "border border-border bg-surface text-fg-muted",
              )}
            >
              {step.n}
            </span>
            <Text
              size="sm"
              weight="medium"
              className={active ? "text-accent" : "text-fg-muted"}
            >
              {step.label}
            </Text>
            {i < steps.length - 1 ? (
              <Separator className="ml-2 flex-1" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
