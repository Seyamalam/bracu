"use client";

import { ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { ApprovalReadinessOutput, CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function ApprovalReadiness({
  checkSignal,
  commandInstruction,
  model,
  onRunCommand,
  output,
}: {
  checkSignal: number;
  commandInstruction?: string;
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
}) {
  const [readiness, setReadiness] = useState<ApprovalReadinessOutput | null>(
    null,
  );
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  const checkReadiness = useCallback(async () => {
    if (!output) {
      setError("Generate or select a draft before checking approval.");
      return;
    }

    setIsChecking(true);
    setError("");
    try {
      const response = await fetch("/api/approval-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draft: output,
          instruction: commandInstruction,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Approval readiness check failed.");
      }
      setReadiness(data.output as ApprovalReadinessOutput);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Approval readiness check failed.",
      );
    } finally {
      setIsChecking(false);
    }
  }, [commandInstruction, model, output]);

  useEffect(() => {
    if (checkSignal > 0) {
      void checkReadiness();
    }
  }, [checkReadiness, checkSignal]);

  return (
    <Card className="border-lime-200">
      <CardHeader>
        <SectionHeading
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          title="Approval Guard"
          subtitle="AI checks blockers before clinician signoff"
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isChecking || !output}
          type="button"
          variant="outline"
          onClick={() => void checkReadiness()}
        >
          <ShieldCheck size={17} aria-hidden="true" />
          {isChecking ? "Checking..." : "Check Approval Readiness"}
        </Button>

        {readiness ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{readiness.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {readiness.readiness.replace("_", " ")}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs capitalize">
                Risk level: {readiness.riskLevel}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <ReadinessList items={readiness.blockers} title="Blockers" />
              <ReadinessList
                items={readiness.missingChecks}
                title="Missing checks"
              />
              <ReadinessList
                items={readiness.readySignals}
                title="Ready signals"
              />
              <ReadinessList
                items={readiness.clinicianSignoffChecklist}
                title="Signoff checklist"
              />
            </div>

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">Suggested commands</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {readiness.suggestedCommands.map((command) => (
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
            Check whether the selected draft is ready for clinician approval.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReadinessList({ items, title }: { items: string[]; title: string }) {
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
