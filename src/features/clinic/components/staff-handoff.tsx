"use client";

import { ClipboardList, Copy, UsersRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, StaffHandoffOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function StaffHandoff({
  handoffSignal,
  model,
  output,
  patientName,
}: {
  handoffSignal: number;
  model: string;
  output: CopilotOutput | null;
  patientName: string;
}) {
  const [handoff, setHandoff] = useState<StaffHandoffOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const followUpText = useMemo(() => {
    if (!output) {
      return "";
    }
    return `${output.followUp.timing}: ${output.followUp.message}`;
  }, [output]);

  const generateHandoff = useCallback(async () => {
    if (!output) {
      setError("Generate or select a case before creating a handoff.");
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
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Staff handoff failed.");
      }
      setHandoff(data.output as StaffHandoffOutput);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Staff handoff failed.",
      );
    } finally {
      setIsGenerating(false);
    }
  }, [followUpText, model, output, patientName]);

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
        `Urgency: ${handoff.urgency}`,
        "",
        "Receptionist",
        ...handoff.receptionistTasks.map((item) => `- ${item}`),
        "",
        "Nurse",
        ...handoff.nurseTasks.map((item) => `- ${item}`),
        "",
        "Doctor",
        ...handoff.doctorTasks.map((item) => `- ${item}`),
        "",
        "Follow-up desk",
        ...handoff.followUpDeskTasks.map((item) => `- ${item}`),
        "",
        "Safety notes",
        ...handoff.safetyNotes.map((item) => `- ${item}`),
        "",
        "Handoff script",
        handoff.handoffScript,
      ].join("\n"),
    );
  }

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <SectionHeading
          icon={<UsersRound size={18} aria-hidden="true" />}
          title="Staff Handoff"
          subtitle="AI task split for receptionist, nurse, doctor, and follow-up desk"
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
          {isGenerating ? "Creating handoff..." : "Create Staff Handoff"}
        </Button>

        {handoff ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{handoff.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {handoff.urgency}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {handoff.handoffScript}
              </p>
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <TaskList
                items={handoff.receptionistTasks}
                title="Receptionist"
              />
              <TaskList items={handoff.nurseTasks} title="Nurse" />
              <TaskList items={handoff.doctorTasks} title="Doctor" />
              <TaskList
                items={handoff.followUpDeskTasks}
                title="Follow-up desk"
              />
            </div>
            <TaskList items={handoff.safetyNotes} title="Safety notes" />
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={copyHandoff}
            >
              <Copy size={16} aria-hidden="true" />
              Copy handoff
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            Ask for a nurse handoff or team task list from the command box.
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
