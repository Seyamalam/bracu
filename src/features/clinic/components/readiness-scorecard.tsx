import {
  Accessibility,
  CheckCircle2,
  ClipboardCheck,
  Languages,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { readinessPillars, readinessSignals } from "../data";
import type { CaseStatus, CopilotOutput, Language, Severity } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

type ReadinessCase = {
  status: CaseStatus;
  severity: Severity;
  language: Language;
};

export function ReadinessScorecard({
  auditCount,
  cases,
  output,
}: {
  auditCount: number;
  cases: ReadinessCase[] | undefined;
  output: CopilotOutput | null;
}) {
  const t = useClinicText();
  const rows = cases ?? [];
  const highPriority = rows.filter((item) => item.severity === "high").length;
  const banglaReady = rows.filter((item) => item.language !== "en").length;
  const closedLoop = rows.filter(
    (item) => item.status === "handout" || item.status === "followup",
  ).length;
  const generatedSafetyItems =
    (output?.redFlags.length ?? 0) + (output?.missingQuestions.length ?? 0);

  const score = Math.min(
    100,
    42 +
      Math.min(rows.length, 6) * 5 +
      Math.min(generatedSafetyItems, 8) * 3 +
      Math.min(auditCount, 6) * 2,
  );

  const scoreLabel =
    score >= 85 ? "Clinic ready" : score >= 70 ? "Nearly ready" : "Build up";
  const badgeVariant = score >= 85 ? "success" : "warning";

  const metrics = [
    { label: "Seed cases", value: rows.length },
    { label: "Bangla/mixed", value: banglaReady },
    { label: "High priority", value: highPriority },
    { label: "Closed loop", value: closedLoop },
  ];

  const pillarIcons = {
    accessibility: Accessibility,
    demo: Rocket,
    safety: ShieldCheck,
    workflow: ClipboardCheck,
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <SectionHeading
          icon={<Rocket size={18} aria-hidden="true" />}
          title={t("Readiness")}
          subtitle={t("Safety, access, workflow, and operating proof")}
        />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-border bg-background p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-black text-3xl text-primary">{score}%</p>
              <p className="text-muted-foreground text-xs">
                {t("Clinic workflow readiness")}
              </p>
            </div>
            <Badge variant={badgeVariant}>{t(scoreLabel)}</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {metrics.map((metric) => (
              <div className="rounded-md bg-[#f7f4ee] p-2" key={metric.label}>
                <p className="font-semibold text-sm">{metric.value}</p>
                <p className="text-muted-foreground text-xs">
                  {t(metric.label)}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 grid gap-2">
          {readinessPillars.map((pillar) => {
            const Icon = pillarIcons[pillar.key];
            return (
              <div
                className="rounded-md border border-border bg-background p-3"
                key={pillar.key}
              >
                <div className="flex items-start gap-2">
                  <Icon
                    className="mt-0.5 shrink-0 text-primary"
                    size={16}
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold text-xs">{t(pillar.label)}</p>
                    <p className="mt-1 text-muted-foreground text-xs leading-5">
                      {t(pillar.description)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-3 rounded-md bg-[#f7f4ee] p-3">
          <div className="flex items-center gap-2">
            <Languages size={15} aria-hidden="true" />
            <p className="font-semibold text-xs">{t("Proof points")}</p>
          </div>
          <ul className="mt-2 space-y-1 text-muted-foreground text-xs leading-5">
            {readinessSignals.map((signal) => (
              <li className="flex gap-2" key={signal}>
                <CheckCircle2
                  className="mt-0.5 shrink-0 text-emerald-700"
                  size={13}
                  aria-hidden="true"
                />
                <span>{t(signal)}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
