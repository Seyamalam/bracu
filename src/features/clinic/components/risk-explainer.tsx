"use client";

import { BrainCircuit, Copy, ShieldAlert } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, RiskExplanationOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function RiskExplainer({
  commandInstruction,
  explainSignal,
  model,
  output,
}: {
  commandInstruction?: string;
  explainSignal: number;
  model: string;
  output: CopilotOutput | null;
}) {
  const [explanation, setExplanation] = useState<RiskExplanationOutput | null>(
    null,
  );
  const [isExplaining, setIsExplaining] = useState(false);
  const [error, setError] = useState("");
  const t = useClinicText();

  const explainRisk = useCallback(async () => {
    if (!output) {
      setError(t("Generate or select a case before explaining risk."));
      return;
    }

    setIsExplaining(true);
    setError("");
    try {
      const response = await fetch("/api/risk-explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseSummary: output.summary,
          severity: output.severity,
          redFlags: output.redFlags,
          missingQuestions: output.missingQuestions,
          instruction: commandInstruction,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(t(data.error ?? "Risk explanation failed."));
      }
      setExplanation(data.output as RiskExplanationOutput);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t("Risk explanation failed."),
      );
    } finally {
      setIsExplaining(false);
    }
  }, [commandInstruction, model, output, t]);

  useEffect(() => {
    if (explainSignal > 0) {
      void explainRisk();
    }
  }, [explainRisk, explainSignal]);

  async function copyExplanation() {
    if (!explanation) {
      return;
    }
    await navigator.clipboard.writeText(
      [
        explanation.plainReason,
        "",
        t("Evidence for risk"),
        ...explanation.evidenceForRisk.map((item) => `- ${item}`),
        "",
        t("Evidence against risk"),
        ...explanation.evidenceAgainstRisk.map((item) => `- ${item}`),
        "",
        t("Uncertainty"),
        ...explanation.uncertainty.map((item) => `- ${item}`),
        "",
        t("Clinician actions"),
        ...explanation.clinicianActions.map((item) => `- ${item}`),
        "",
        t("Patient safety net"),
        ...explanation.patientSafetyNet.map((item) => `- ${item}`),
      ].join("\n"),
    );
  }

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <SectionHeading
          icon={<BrainCircuit size={18} aria-hidden="true" />}
          title={t("Risk Rationale")}
          subtitle={t("Explainable safety reasoning for review")}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isExplaining || !output}
          type="button"
          variant="outline"
          onClick={() => void explainRisk()}
        >
          <ShieldAlert size={17} aria-hidden="true" />
          {isExplaining ? t("Explaining...") : t("Explain Risk")}
        </Button>

        {explanation ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">
                  {explanation.plainReason}
                </p>
                <Badge className="capitalize" variant="outline">
                  {t(explanation.riskLevel)}
                </Badge>
              </div>
            </div>
            <RiskList
              title={t("Evidence for risk")}
              items={explanation.evidenceForRisk}
            />
            <RiskList
              title={t("Evidence against risk")}
              items={explanation.evidenceAgainstRisk}
            />
            <RiskList
              title={t("Uncertainty")}
              items={explanation.uncertainty}
            />
            <RiskList
              title={t("Clinician actions")}
              items={explanation.clinicianActions}
            />
            <RiskList
              title={t("Patient safety net")}
              items={explanation.patientSafetyNet}
            />
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={copyExplanation}
            >
              <Copy size={16} aria-hidden="true" />
              {t("Copy rationale")}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            {t("Ask why a case is risky, or run the explanation here.")}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function RiskList({ items, title }: { items: string[]; title: string }) {
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
