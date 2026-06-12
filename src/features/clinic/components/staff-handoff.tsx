"use client";

import { ClipboardList, Copy, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, StaffHandoffOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function StaffHandoff({
  commandInstruction,
  handoffSignal,
  model,
  output,
  patientName,
}: {
  commandInstruction?: string;
  handoffSignal: number;
  model: string;
  output: CopilotOutput | null;
  patientName: string;
}) {
  const [handoff, setHandoff] = useState<StaffHandoffOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const t = useClinicText();

  const followUpText = useMemo(() => {
    if (!output) {
      return "";
    }
    return `${output.followUp.timing}: ${output.followUp.message}`;
  }, [output]);

  const generateHandoff = useCallback(async () => {
    if (!output) {
      setError(t("Generate or select a case before creating a handoff."));
      return;
    }

    setIsGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/staff-handoff", {
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
        throw new Error(t(data.error ?? "Staff handoff failed."));
      }
      setHandoff(data.output as StaffHandoffOutput);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("Staff handoff failed."),
      );
    } finally {
      setIsGenerating(false);
    }
  }, [commandInstruction, followUpText, model, output, patientName, t]);

  useEffect(() => {
    if (handoffSignal > 0) {
      void generateHandoff();
    }
  }, [generateHandoff, handoffSignal]);

  async function copyHandoff() {
    if (!handoff) {
      return;
    }

    await navigator.clipboard.writeText(
      [
        handoff.headline,
        `${t("Urgency")}: ${t(handoff.urgency)}`,
        "",
        t("Receptionist"),
        ...handoff.receptionistTasks.map((item) => `- ${item}`),
        "",
        t("Nurse"),
        ...handoff.nurseTasks.map((item) => `- ${item}`),
        "",
        t("Doctor"),
        ...handoff.doctorTasks.map((item) => `- ${item}`),
        "",
        t("Follow-up desk"),
        ...handoff.followUpDeskTasks.map((item) => `- ${item}`),
        "",
        t("Safety notes"),
        ...handoff.safetyNotes.map((item) => `- ${item}`),
        "",
        t("Handoff script"),
        handoff.handoffScript,
      ].join("\n"),
    );
  }

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <SectionHeading
          icon={<UsersRound size={18} aria-hidden="true" />}
          title={t("Staff Handoff")}
          subtitle={t(
            "AI task split for receptionist, nurse, doctor, and follow-up desk",
          )}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isGenerating || !output}
          type="button"
          variant="outline"
          onClick={() => void generateHandoff()}
        >
          <ClipboardList size={17} aria-hidden="true" />
          {isGenerating ? t("Creating handoff...") : t("Create Staff Handoff")}
        </Button>

        {handoff ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{handoff.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {t(handoff.urgency)}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {handoff.handoffScript}
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <TaskList
                items={handoff.receptionistTasks}
                title={t("Receptionist")}
              />
              <TaskList items={handoff.nurseTasks} title={t("Nurse")} />
              <TaskList items={handoff.doctorTasks} title={t("Doctor")} />
              <TaskList
                items={handoff.followUpDeskTasks}
                title={t("Follow-up desk")}
              />
            </div>
            <TaskList items={handoff.safetyNotes} title={t("Safety notes")} />
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={copyHandoff}
            >
              <Copy size={16} aria-hidden="true" />
              {t("Copy handoff")}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            {t(
              "Ask for a nurse handoff or team task list from the command box.",
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

function TaskList({ items, title }: { items: string[]; title: string }) {
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
