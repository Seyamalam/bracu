import { Activity, ClipboardList, PlayCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { WorkspacePage } from "./app-shell-sidebar";
import { SectionHeading } from "./section-heading";

const quickActions = [
  {
    body: "Capture or clean the reception note before AI drafting.",
    icon: ClipboardList,
    label: "Open Case",
    page: "case",
  },
  {
    body: "Check the draft, handoff, risk explanation, and approval status.",
    icon: ShieldCheck,
    label: "Open AI",
    page: "ai",
  },
  {
    body: "Review queue pressure, follow-ups, trends, model, and audit trail.",
    icon: Activity,
    label: "Open Ops",
    page: "operations",
  },
] as const;

export function OverviewQuickActions({
  onOpenPage,
  onStartGuidedWorkflow,
}: {
  onOpenPage: (page: WorkspacePage) => void;
  onStartGuidedWorkflow: () => void;
}) {
  return (
    <Card className="border-primary/25 bg-white">
      <CardHeader>
        <SectionHeading
          icon={<PlayCircle size={18} aria-hidden="true" />}
          title="Start here"
          subtitle="Run the guided workflow or jump straight into the work area you need."
        />
      </CardHeader>
      <CardContent>
        <Button
          className="h-auto w-full justify-start px-4 py-3 text-left"
          size="lg"
          type="button"
          onClick={onStartGuidedWorkflow}
        >
          <PlayCircle size={19} aria-hidden="true" />
          <span>
            <span className="block">Start guided workflow</span>
            <span className="block font-normal text-primary-foreground/80 text-xs">
              Load a realistic case, generate the draft, and open presentation
              mode.
            </span>
          </span>
        </Button>

        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                className="rounded-md border border-border bg-background p-3 text-left transition hover:border-primary hover:bg-[#eaf6f1]"
                key={action.label}
                type="button"
                onClick={() => onOpenPage(action.page)}
              >
                <Icon className="text-primary" size={20} aria-hidden="true" />
                <span className="mt-3 block font-semibold text-sm">
                  {action.label}
                </span>
                <span className="mt-1 block text-muted-foreground text-xs leading-5">
                  {action.body}
                </span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
