"use client";

import { BadgeCheck, FileCheck2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, VisitCloseoutOutput } from "../types";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function VisitCloseout({
  closeoutSignal,
  model,
  onRunCommand,
  output,
  patientName,
}: {
  closeoutSignal: number;
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
  patientName: string;
}) {
  const [closeout, setCloseout] = useState<VisitCloseoutOutput | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [error, setError] = useState("");

  const closeVisit = useCallback(async () => {
    if (!output) {
      setError("Generate or select a case before closing the visit.");
      return;
    }

    setIsClosing(true);
    setError("");
    try {
      const response = await fetch("/api/visit-closeout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          caseSummary: output.summary,
          severity: output.severity,
          redFlags: output.redFlags,
          missingQuestions: output.missingQuestions,
          followUp: `${output.followUp.timing}: ${output.followUp.message}`,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Visit closeout failed.");
      }
      setCloseout(data.output as VisitCloseoutOutput);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Visit closeout failed.",
      );
    } finally {
      setIsClosing(false);
    }
  }, [model, output, patientName]);

  useEffect(() => {
    if (closeoutSignal > 0) {
      void closeVisit();
    }
  }, [closeVisit, closeoutSignal]);

  return (
    <Card className="border-teal-200">
      <CardHeader>
        <SectionHeading
          icon={<FileCheck2 size={18} aria-hidden="true" />}
          title="Visit Closeout"
          subtitle="AI final packet, follow-up closure, and audit notes"
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isClosing || !output}
          type="button"
          variant="outline"
          onClick={() => void closeVisit()}
        >
          <BadgeCheck size={17} aria-hidden="true" />
          {isClosing ? "Closing..." : "Close Visit Safely"}
        </Button>

        {closeout ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{closeout.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {closeout.readiness.replace("_", " ")} / {closeout.priority}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <CloseoutList
                items={closeout.staffCloseoutSteps}
                title="Staff closeout"
              />
              <CloseoutList
                items={closeout.patientBeforeLeaving}
                title="Before patient leaves"
              />
              <CloseoutList
                items={closeout.followUpClosure}
                title="Follow-up closure"
              />
              <CloseoutList items={closeout.auditNotes} title="Audit notes" />
            </div>

            <CloseoutList items={closeout.printPacket} title="Print packet" />

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">Suggested commands</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {closeout.suggestedCommands.map((command) => (
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
            Prepare final staff steps, patient instructions, print packet, and
            audit notes before the visit leaves the workflow.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function CloseoutList({ items, title }: { items: string[]; title: string }) {
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
