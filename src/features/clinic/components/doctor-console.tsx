import { Activity, AlertTriangle, ClipboardCheck, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { emptyWorkflowSteps } from "../data";
import type { CopilotOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function DoctorConsole({
  output,
  onSave,
}: {
  output: CopilotOutput | null;
  onSave: (output: CopilotOutput) => void;
}) {
  const t = useClinicText();
  const [draft, setDraft] = useState<CopilotOutput | null>(output);

  useEffect(() => {
    setDraft(output);
  }, [output]);

  const activeOutput = draft;

  return (
    <Card className="min-h-64">
      <CardHeader>
        <SectionHeading
          icon={<ClipboardCheck size={18} aria-hidden="true" />}
          title={t("Doctor Console")}
          subtitle={t("Draft support only, clinician reviewed")}
        />
      </CardHeader>
      <CardContent>
        {activeOutput ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <Textarea
                  aria-label={t("Chief complaint")}
                  className="min-h-14 resize-none font-semibold text-xl"
                  value={activeOutput.chiefComplaint}
                  onChange={(event) =>
                    setDraft({
                      ...activeOutput,
                      chiefComplaint: event.target.value,
                    })
                  }
                />
                <Textarea
                  aria-label={t("Case summary")}
                  className="mt-2 min-h-24 resize-none text-sm"
                  value={activeOutput.summary}
                  onChange={(event) =>
                    setDraft({ ...activeOutput, summary: event.target.value })
                  }
                />
              </div>
              <div className="flex flex-col gap-2">
                <SeverityBadge severity={activeOutput.severity} />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onSave(activeOutput)}
                >
                  <Save size={16} aria-hidden="true" />
                  {t("Save edits")}
                </Button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock
                title={t("Missing Questions")}
                items={activeOutput.missingQuestions}
                onItemsChange={(items) =>
                  setDraft({ ...activeOutput, missingQuestions: items })
                }
              />
              <InfoBlock
                tone="danger"
                title={t("Safety Red Flags")}
                items={activeOutput.redFlags}
                onItemsChange={(items) =>
                  setDraft({ ...activeOutput, redFlags: items })
                }
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <SoapCard
                label="S"
                value={activeOutput.soap.subjective}
                onChange={(value) =>
                  setDraft({
                    ...activeOutput,
                    soap: { ...activeOutput.soap, subjective: value },
                  })
                }
              />
              <SoapCard
                label="O"
                value={activeOutput.soap.objective}
                onChange={(value) =>
                  setDraft({
                    ...activeOutput,
                    soap: { ...activeOutput.soap, objective: value },
                  })
                }
              />
              <SoapCard
                label="A"
                value={activeOutput.soap.assessmentSupport}
                onChange={(value) =>
                  setDraft({
                    ...activeOutput,
                    soap: { ...activeOutput.soap, assessmentSupport: value },
                  })
                }
              />
              <SoapCard
                label="P"
                value={activeOutput.soap.planSupport}
                onChange={(value) =>
                  setDraft({
                    ...activeOutput,
                    soap: { ...activeOutput.soap, planSupport: value },
                  })
                }
              />
            </div>
          </div>
        ) : (
          <EmptyState />
        )}
      </CardContent>
    </Card>
  );
}

export function SeverityBadge({
  severity,
}: {
  severity: CopilotOutput["severity"];
}) {
  const t = useClinicText();
  const variant =
    severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "warning"
        : "success";

  return (
    <Badge className="h-fit capitalize" variant={variant}>
      {t(`${severity} priority`)}
    </Badge>
  );
}

function EmptyState() {
  const t = useClinicText();
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {emptyWorkflowSteps.map(([step, title, text]) => (
        <div
          className="rounded-lg border border-dashed border-border p-4"
          key={step}
        >
          <p className="flex size-8 items-center justify-center rounded-full bg-[#f2c14e] font-bold text-slate-950">
            {step}
          </p>
          <p className="mt-3 font-semibold">{t(title)}</p>
          <p className="mt-1 text-muted-foreground text-sm leading-6">
            {t(text)}
          </p>
        </div>
      ))}
    </div>
  );
}

function InfoBlock({
  title,
  items,
  onItemsChange,
  tone = "normal",
}: {
  title: string;
  items: string[];
  onItemsChange: (items: string[]) => void;
  tone?: "normal" | "danger";
}) {
  return (
    <div
      className={
        tone === "danger"
          ? "rounded-lg border border-red-200 bg-red-50 p-4"
          : "rounded-lg border border-border bg-slate-50 p-4"
      }
    >
      <p className="flex items-center gap-2 font-semibold">
        {tone === "danger" ? (
          <AlertTriangle size={17} aria-hidden="true" />
        ) : (
          <Activity size={17} aria-hidden="true" />
        )}
        {title}
      </p>
      <Textarea
        className="mt-3 min-h-28 text-sm"
        value={items.join("\n")}
        onChange={(event) =>
          onItemsChange(
            event.target.value
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean),
          )
        }
      />
    </div>
  );
}

function SoapCard({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useClinicText();
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="font-black text-[#e2553d] text-xl">{label}</p>
      <Textarea
        aria-label={`${label} ${t("SOAP note")}`}
        className="mt-2 min-h-28 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
