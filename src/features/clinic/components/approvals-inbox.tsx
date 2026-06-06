import { Inbox, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput, IntakeFormState } from "../types";
import { SectionHeading } from "./section-heading";

type ApprovalItem = {
  action: string;
  detail: string;
  id: string;
  owner: string;
  priority: "high" | "medium" | "low";
};

export function ApprovalsInbox({
  form,
  onCommand,
  onPrintPreview,
  output,
}: {
  form: IntakeFormState;
  onCommand: (command: string) => void;
  onPrintPreview: () => void;
  output: CopilotOutput | null;
}) {
  const items = buildApprovalItems({ form, output });

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Inbox size={18} aria-hidden="true" />}
          title="Approvals Inbox"
          subtitle="One place for signoff, escalation acknowledgment, return warnings, and print approval"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item) => (
            <article
              className="rounded-md border border-border bg-background p-4"
              key={item.id}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldAlert
                      className={
                        item.priority === "high"
                          ? "text-destructive"
                          : "text-primary"
                      }
                      size={17}
                      aria-hidden="true"
                    />
                    <h3 className="font-bold text-sm">{item.action}</h3>
                  </div>
                  <p className="mt-2 text-muted-foreground text-sm leading-6">
                    {item.detail}
                  </p>
                  <p className="mt-1 font-semibold text-muted-foreground text-xs">
                    Owner: {item.owner}
                  </p>
                </div>
                <Badge
                  variant={item.priority === "high" ? "destructive" : "outline"}
                >
                  {item.priority}
                </Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  type="button"
                  onClick={() => onCommand(item.action)}
                >
                  Review
                </Button>
                {item.id.includes("print") ? (
                  <Button
                    size="sm"
                    type="button"
                    variant="outline"
                    onClick={onPrintPreview}
                  >
                    Preview print
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function buildApprovalItems({
  form,
  output,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
}): ApprovalItem[] {
  const items: ApprovalItem[] = [];

  if (!/(bp|temp|pulse|spo2|প্রেশার|তাপমাত্রা)/i.test(form.intake)) {
    items.push({
      action: "Confirm vitals or mark unavailable",
      detail:
        "Vitals are required before a clinical draft or patient packet should be treated as ready.",
      id: "vitals",
      owner: "Nurse",
      priority: "high",
    });
  }

  if (!/(allerg|অ্যালার্জি|reaction)/i.test(form.intake)) {
    items.push({
      action: "Confirm medicine allergy status",
      detail:
        "Medicine-facing output must stay blocked until allergy status is checked.",
      id: "allergy",
      owner: "Nurse",
      priority: "medium",
    });
  }

  if (output?.redFlags.length) {
    items.push({
      action: "Acknowledge red-flag escalation",
      detail: `${output.redFlags.length} red flags require human escalation acknowledgment.`,
      id: "red-flags",
      owner: "Doctor",
      priority: "high",
    });
  }

  if (output) {
    items.push({
      action: "Approve patient packet for print",
      detail:
        "Handout, medicine slip, referral, and follow-up sheet are drafts until reviewed.",
      id: "print-packet",
      owner: "Doctor",
      priority: "medium",
    });
  }

  return items.length
    ? items
    : [
        {
          action: "No approvals waiting",
          detail:
            "The current case has no detected approval blockers, but clinician review remains required.",
          id: "clear",
          owner: "Clinic team",
          priority: "low",
        },
      ];
}
