"use client";

import { ClipboardList, Copy, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Doc } from "../../../../convex/_generated/dataModel";
import type { ClinicBriefingOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

type BriefingCase = Pick<
  Doc<"cases">,
  | "_id"
  | "age"
  | "approvedAt"
  | "chiefComplaint"
  | "language"
  | "patientName"
  | "redFlagCount"
  | "severity"
  | "status"
>;

export function ClinicBriefing({
  briefingSignal,
  cases,
  clinicName,
  model,
}: {
  briefingSignal: number;
  cases: BriefingCase[] | undefined;
  clinicName: string;
  model: string;
}) {
  const [briefing, setBriefing] = useState<ClinicBriefingOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const t = useClinicText();

  const generateBriefing = useCallback(async () => {
    setIsGenerating(true);
    setError("");
    try {
      const response = await fetch("/api/clinic-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clinicName,
          cases: (cases ?? []).map((caseItem) => ({
            patientName: caseItem.patientName,
            age: caseItem.age,
            language: caseItem.language,
            chiefComplaint: caseItem.chiefComplaint,
            severity: caseItem.severity,
            status: caseItem.status,
            redFlagCount: caseItem.redFlagCount,
            approvedAt: caseItem.approvedAt,
          })),
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(t(data.error ?? "Clinic briefing failed."));
      }
      setBriefing(data.output as ClinicBriefingOutput);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : t("Clinic briefing failed."),
      );
    } finally {
      setIsGenerating(false);
    }
  }, [cases, clinicName, model, t]);

  useEffect(() => {
    if (briefingSignal > 0) {
      void generateBriefing();
    }
  }, [briefingSignal, generateBriefing]);

  async function copyBriefing() {
    if (!briefing) {
      return;
    }
    await navigator.clipboard.writeText(
      [
        briefing.headline,
        briefing.queueSummary,
        "",
        t("Priority patients"),
        ...briefing.priorityPatients.map((item) => `- ${item}`),
        "",
        t("Follow-up actions"),
        ...briefing.followUpActions.map((item) => `- ${item}`),
        "",
        t("Paperwork gaps"),
        ...briefing.paperworkGaps.map((item) => `- ${item}`),
        "",
        t("Next best actions"),
        ...briefing.nextBestActions.map((item) => `- ${item}`),
        "",
        briefing.operatorSummary,
      ].join("\n"),
    );
  }

  return (
    <Card className="border-primary/25">
      <CardHeader>
        <SectionHeading
          icon={<ClipboardList size={18} aria-hidden="true" />}
          title={t("Clinic Briefing")}
          subtitle={t("AI queue summary for the next safe move")}
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isGenerating}
          type="button"
          onClick={() => void generateBriefing()}
        >
          <Sparkles size={17} aria-hidden="true" />
          {isGenerating ? t("Briefing...") : t("Brief Clinic Queue")}
        </Button>

        {briefing ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{briefing.headline}</p>
                <Badge className="capitalize" variant="outline">
                  {t(briefing.riskLevel)}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {briefing.queueSummary}
              </p>
            </div>

            <BriefingList
              items={briefing.priorityPatients}
              title={t("Priority patients")}
            />
            <BriefingList
              items={briefing.followUpActions}
              title={t("Follow-up actions")}
            />
            <BriefingList
              items={briefing.paperworkGaps}
              title={t("Paperwork")}
            />
            <BriefingList
              items={briefing.nextBestActions}
              title={t("Next best actions")}
            />
            <div className="rounded-md bg-[#fff7df] p-3 text-sm">
              {briefing.operatorSummary}
            </div>
            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={copyBriefing}
            >
              <Copy size={16} aria-hidden="true" />
              {t("Copy briefing")}
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            {t("Ask Command Copilot to brief the clinic, or run it here.")}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function BriefingList({ items, title }: { items: string[]; title: string }) {
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
