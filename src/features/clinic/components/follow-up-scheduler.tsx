"use client";

import { CalendarClock, PhoneCall } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, FollowUpPlanOutput } from "../types";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function FollowUpScheduler({
  model,
  onRunCommand,
  output,
  patientName,
  scheduleSignal,
}: {
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
  patientName: string;
  scheduleSignal: number;
}) {
  const [plan, setPlan] = useState<FollowUpPlanOutput | null>(null);
  const [isScheduling, setIsScheduling] = useState(false);
  const [error, setError] = useState("");

  const scheduleFollowUp = useCallback(async () => {
    if (!output) {
      setError("Generate or select a case before scheduling follow-up.");
      return;
    }

    setIsScheduling(true);
    setError("");
    try {
      const response = await fetch("/api/follow-up-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          caseSummary: output.summary,
          severity: output.severity,
          followUpTiming: output.followUp.timing,
          followUpMessage: output.followUp.message,
          redFlags: output.redFlags,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Follow-up scheduling failed.");
      }
      setPlan(data.output as FollowUpPlanOutput);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Follow-up scheduling failed.",
      );
    } finally {
      setIsScheduling(false);
    }
  }, [model, output, patientName]);

  useEffect(() => {
    if (scheduleSignal > 0) {
      void scheduleFollowUp();
    }
  }, [scheduleFollowUp, scheduleSignal]);

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <SectionHeading
          icon={<CalendarClock size={18} aria-hidden="true" />}
          title="Follow-up Scheduler"
          subtitle="AI callback timing, reminders, and closure rules"
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isScheduling || !output}
          type="button"
          variant="outline"
          onClick={() => void scheduleFollowUp()}
        >
          <PhoneCall size={17} aria-hidden="true" />
          {isScheduling ? "Scheduling..." : "Schedule Follow-up"}
        </Button>

        {plan ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">{plan.timing}</p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    Owner: {plan.staffOwner}
                  </p>
                </div>
                <Badge className="capitalize" variant="outline">
                  {plan.priority} / {plan.channel}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {plan.callbackScript}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <ScheduleList items={plan.reminders} title="Reminders" />
              <ScheduleList items={plan.escalationRules} title="Escalate if" />
            </div>
            <ScheduleList items={plan.closureCriteria} title="Close when" />

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">Suggested commands</p>
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
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            Schedule callback timing and escalation rules after a draft is
            ready.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ScheduleList({ items, title }: { items: string[]; title: string }) {
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
