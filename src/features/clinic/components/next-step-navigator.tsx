"use client";

import { Compass, Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, NextStepOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function NextStepNavigator({
  commandInstruction,
  model,
  output,
  patientName,
  planSignal,
  onRunCommand,
}: {
  commandInstruction?: string;
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
  patientName: string;
  planSignal: number;
}) {
  const [plan, setPlan] = useState<NextStepOutput | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState("");
  const t = useClinicText();

  const followUpText = useMemo(() => {
    if (!output) {
      return "";
    }
    return `${output.followUp.timing}: ${output.followUp.message}`;
  }, [output]);

  const planNextSteps = useCallback(async () => {
    if (!output) {
      setError(t("Generate or select a case before planning next steps."));
      return;
    }

    setIsPlanning(true);
    setError("");
    try {
      const response = await fetch("/api/next-steps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          caseSummary: output.summary,
          severity: output.severity,
          redFlags: output.redFlags,
          missingQuestions: output.missingQuestions,
          followUp: followUpText,
          instruction: commandInstruction,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(t(data.error ?? "Next-step planning failed."));
      }
      setPlan(data.output as NextStepOutput);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("Next-step planning failed."),
      );
    } finally {
      setIsPlanning(false);
    }
  }, [commandInstruction, followUpText, model, output, patientName, t]);

  useEffect(() => {
    if (planSignal > 0) {
      void planNextSteps();
    }
  }, [planNextSteps, planSignal]);

  return (
    <Card className="border-sky-200">
      <CardHeader>
        <SectionHeading
          icon={<Compass size={18} aria-hidden="true" />}
          title={t("Next-Step Navigator")}
          subtitle={t("AI turns the selected case into actions and commands")}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isPlanning || !output}
          type="button"
          variant="outline"
          onClick={() => void planNextSteps()}
        >
          <Sparkles size={17} aria-hidden="true" />
          {isPlanning ? t("Planning...") : t("Plan Next Steps")}
        </Button>

        {plan ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{plan.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {t(plan.priority)}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {plan.demoNarration}
              </p>
            </div>

            <NextStepList items={plan.immediateActions} title={t("Do next")} />

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">{t("Suggested commands")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {plan.suggestedCommands.map((command) => (
                  <SuggestedCommandButton
                    command={command}
                    key={command}
                    onRunCommand={onRunCommand}
                  />
                ))}
              </div>
            </div>

            <NextStepList
              items={plan.accessibilityNotes}
              title={t("Accessibility notes")}
            />
            <div className="rounded-md border border-border bg-background p-3">
              <p className="font-semibold text-xs">
                {t("Patient communication")}
              </p>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {plan.patientCommunication}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            {t(
              "Ask what to do next and the app will suggest safe workflow commands.",
            )}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function NextStepList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md bg-[#f7f4ee] p-3">
      <p className="font-semibold text-xs">{title}</p>
      <ul className="mt-2 space-y-1 text-muted-foreground text-xs leading-5">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
