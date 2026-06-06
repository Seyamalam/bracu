import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, IntakeFormState } from "../types";
import { SectionHeading } from "./section-heading";

type Receipt = {
  id: string;
  action: string;
  input: string;
  outputType: string;
  role: string;
  safety: string;
  status: "approved" | "draft" | "needs_review";
  timestamp: string;
};

export function AiRunReceipts({
  form,
  output,
  runningAction,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
  runningAction: string | null;
}) {
  const receipts = buildReceipts({ form, output, runningAction });

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<ClipboardCheck size={18} aria-hidden="true" />}
          title="AI Run Receipts"
          subtitle="Every AI action shows inputs, safety checks, review state, and audit context"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {receipts.map((receipt) => (
            <article
              className="rounded-md border border-border bg-background p-4"
              key={receipt.id}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-bold text-sm">{receipt.action}</h3>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {receipt.timestamp} · {receipt.role}
                  </p>
                </div>
                <Badge
                  variant={
                    receipt.status === "approved"
                      ? "default"
                      : receipt.status === "needs_review"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {receipt.status.replace("_", " ")}
                </Badge>
              </div>
              <div className="mt-3 grid gap-2 md:grid-cols-3">
                <ReceiptField label="Input" value={receipt.input} />
                <ReceiptField label="Output" value={receipt.outputType} />
                <ReceiptField label="Safety" value={receipt.safety} />
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ReceiptField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-white p-3">
      <p className="flex items-center gap-2 font-semibold text-muted-foreground text-xs uppercase">
        <ShieldCheck size={13} aria-hidden="true" />
        {label}
      </p>
      <p className="mt-2 text-sm leading-5">{value}</p>
    </div>
  );
}

function buildReceipts({
  form,
  output,
  runningAction,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
  runningAction: string | null;
}): Receipt[] {
  const now = new Date().toLocaleString();
  const baseInput = form.patientName
    ? `${form.patientName}, age ${form.age || "unknown"}`
    : "No active patient";

  const receipts: Receipt[] = [
    {
      id: "receipt-intake",
      action: runningAction
        ? `Running ${runningAction}`
        : "Intake readiness check",
      input: baseInput,
      outputType: "Structured workflow context",
      role: "Ops Agent",
      safety:
        "Draft support only. Missing vitals, allergy status, and escalation triggers remain visible.",
      status: runningAction ? "needs_review" : "draft",
      timestamp: now,
    },
  ];

  if (output) {
    receipts.unshift({
      id: "receipt-draft",
      action: "Clinical draft generation",
      input: `${output.chiefComplaint} · ${output.severity} priority`,
      outputType: "SOAP support, red flags, handout, follow-up",
      role: "Doctor Agent",
      safety: `${output.redFlags.length} red flags and ${output.missingQuestions.length} missing questions require human review.`,
      status: output.redFlags.length ? "needs_review" : "draft",
      timestamp: now,
    });
  }

  return receipts;
}
