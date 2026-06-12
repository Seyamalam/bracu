import { CheckCircle2, Circle, Route, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { visitJourneyCopy } from "../data";
import type { CaseStatus, CopilotOutput, IntakeFormState } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

type JourneyState = "active" | "done" | "waiting";

export function VisitJourney({
  form,
  output,
  status,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
  status?: CaseStatus;
}) {
  const t = useClinicText();
  const intakeReady =
    form.patientName.trim().length > 0 &&
    Number(form.age) > 0 &&
    form.intake.trim().length > 40;
  const hasDraft = Boolean(output);
  const handoutReady = Boolean(
    output && (status === "handout" || status === "followup"),
  );
  const followUpQueued = status === "followup";

  const states: Record<
    (typeof visitJourneyCopy.steps)[number]["key"],
    JourneyState
  > = {
    draft: hasDraft ? "done" : intakeReady ? "active" : "waiting",
    followup: followUpQueued ? "done" : hasDraft ? "active" : "waiting",
    handout: handoutReady ? "done" : hasDraft ? "active" : "waiting",
    intake: intakeReady ? "done" : "active",
    safety: hasDraft ? "done" : intakeReady ? "active" : "waiting",
    teachBack: handoutReady ? "active" : hasDraft ? "waiting" : "waiting",
  };

  const completed = Object.values(states).filter(
    (state) => state === "done",
  ).length;
  const activeStep =
    visitJourneyCopy.steps.find((step) => states[step.key] === "active") ??
    visitJourneyCopy.steps.at(-1);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <SectionHeading
          icon={<Route size={18} aria-hidden="true" />}
          title={t(visitJourneyCopy.title)}
          subtitle={t(visitJourneyCopy.subtitle)}
        />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-background p-3">
          <div>
            <p className="font-black text-2xl text-primary">
              {completed}/{visitJourneyCopy.steps.length}
            </p>
            <p className="text-muted-foreground text-xs">
              {t("steps completed")}
            </p>
          </div>
          <Badge variant={completed >= 4 ? "success" : "warning"}>
            {t(visitJourneyCopy.nextMoveLabel)}: {t(activeStep?.label ?? "")}
          </Badge>
        </div>

        <ol className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {visitJourneyCopy.steps.map((step, index) => {
            const state = states[step.key];
            const Icon =
              state === "done"
                ? CheckCircle2
                : state === "active"
                  ? Timer
                  : Circle;
            const detail = step[state];

            return (
              <li
                className={cn(
                  "rounded-md border p-3",
                  state === "done" && "border-emerald-200 bg-emerald-50",
                  state === "active" && "border-amber-200 bg-amber-50",
                  state === "waiting" && "border-border bg-[#f7f4ee]",
                )}
                key={step.key}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className={cn(
                      "mt-0.5 shrink-0",
                      state === "done" && "text-emerald-700",
                      state === "active" && "text-amber-700",
                      state === "waiting" && "text-muted-foreground",
                    )}
                    size={16}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-xs">
                      {index + 1}. {t(step.label)}
                    </p>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {t(detail)}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
