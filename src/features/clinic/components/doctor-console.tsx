import { Activity, AlertTriangle, ClipboardCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { emptyWorkflowSteps } from "../data";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function DoctorConsole({ output }: { output: CopilotOutput | null }) {
  return (
    <Card className="min-h-64">
      <CardHeader>
        <SectionHeading
          icon={<ClipboardCheck size={18} aria-hidden="true" />}
          title="Doctor Console"
          subtitle="Draft support only, clinician reviewed"
        />
      </CardHeader>
      <CardContent>
        {output ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <div>
                <p className="font-semibold text-2xl">
                  {output.chiefComplaint}
                </p>
                <p className="mt-2 text-muted-foreground text-sm leading-6">
                  {output.summary}
                </p>
              </div>
              <SeverityBadge severity={output.severity} />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <InfoBlock
                title="Missing Questions"
                items={output.missingQuestions}
              />
              <InfoBlock
                tone="danger"
                title="Safety Red Flags"
                items={output.redFlags}
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <SoapCard label="S" value={output.soap.subjective} />
              <SoapCard label="O" value={output.soap.objective} />
              <SoapCard label="A" value={output.soap.assessmentSupport} />
              <SoapCard label="P" value={output.soap.planSupport} />
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
  const variant =
    severity === "high"
      ? "destructive"
      : severity === "medium"
        ? "warning"
        : "success";

  return (
    <Badge className="h-fit capitalize" variant={variant}>
      {severity} priority
    </Badge>
  );
}

function EmptyState() {
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
          <p className="mt-3 font-semibold">{title}</p>
          <p className="mt-1 text-muted-foreground text-sm leading-6">{text}</p>
        </div>
      ))}
    </div>
  );
}

function InfoBlock({
  title,
  items,
  tone = "normal",
}: {
  title: string;
  items: string[];
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
      <ul className="mt-3 space-y-2 text-slate-700 text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function SoapCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <p className="font-black text-[#e2553d] text-xl">{label}</p>
      <p className="mt-2 text-muted-foreground text-sm leading-6">{value}</p>
    </div>
  );
}
