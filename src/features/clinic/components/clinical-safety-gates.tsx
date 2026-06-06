import { AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CaseStatus, CopilotOutput, IntakeFormState } from "../types";
import { SectionHeading } from "./section-heading";

export type SafetyGate = {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
  priority: "critical" | "required" | "recommended";
};

export function getClinicalSafetyGates({
  form,
  output,
  status,
}: {
  form: IntakeFormState;
  output: CopilotOutput | null;
  status?: CaseStatus;
}): SafetyGate[] {
  const intake = form.intake.toLowerCase();
  const summary = [output?.summary, output?.chiefComplaint, form.intake]
    .join(" ")
    .toLowerCase();
  const age = Number(form.age);
  const hasVitals =
    /(bp|blood pressure|temp|temperature|pulse|spo2|oxygen|rr|resp|জ্বর|তাপমাত্রা|প্রেশার)/i.test(
      form.intake,
    );
  const hasMedicineClarity = output
    ? output.patientHandout.medicineInstructions.some((item) =>
        /(dose|ডোজ|mg|ml|বার|daily|twice|খাবেন|prescribed)/i.test(item),
      )
    : /(mg|ml|dose|ডোজ|tablet|tab|খাবেন|daily|twice)/i.test(intake);
  const hasAllergyCheck = /(allerg|অ্যালার্জি|reaction|প্রতিক্রিয়া)/i.test(
    form.intake,
  );
  const isPregnancy = /(pregnan|গর্ভ|pregnancy|weeks pregnant)/i.test(summary);
  const isChild = age > 0 && age < 12;
  const isChestPain =
    /(chest pain|chest tight|বুকে ব্যথা|বুক ব্যথা|shortness of breath|শ্বাসকষ্ট)/i.test(
      summary,
    );
  const hasUrgentReturn = Boolean(
    output?.patientHandout.urgentReturnWarnings.length,
  );
  const isApprovedOrLater = status === "handout" || status === "followup";

  return [
    {
      id: "vitals",
      label: "Vitals required",
      detail:
        "Record BP, temperature, pulse, SpO2, or equivalent triage vitals before signoff.",
      passed: hasVitals,
      priority: "required",
    },
    {
      id: "escalation",
      label: "Pregnancy, child, chest-pain escalation",
      detail:
        "Pregnancy, child cases, chest pain, or breathing symptoms must stay in clinician review.",
      passed:
        !(isPregnancy || isChild || isChestPain) ||
        Boolean(output?.redFlags.length),
      priority:
        isPregnancy || isChild || isChestPain ? "critical" : "recommended",
    },
    {
      id: "medicine",
      label: "Medicine and allergy clarity",
      detail:
        "Medicine instructions need dose clarity and allergy status before patient instructions.",
      passed: hasMedicineClarity && hasAllergyCheck,
      priority: "required",
    },
    {
      id: "return",
      label: "Return warnings confirmed",
      detail:
        "Patient-facing output must include urgent-return warnings before printing or closeout.",
      passed: hasUrgentReturn,
      priority: "required",
    },
    {
      id: "review",
      label: "Clinician approval before handout",
      detail:
        "Draft support should be reviewed before handout, follow-up, or discharge packet.",
      passed: output ? isApprovedOrLater || output.severity !== "high" : false,
      priority: output?.severity === "high" ? "critical" : "recommended",
    },
  ];
}

export function ClinicalSafetyGates({ gates }: { gates: SafetyGate[] }) {
  const blocked = gates.filter((gate) => !gate.passed);

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          title="Clinical Safety Gates"
          subtitle="Required checks before print, approval, and closeout"
        />
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant={blocked.length ? "destructive" : "secondary"}>
            {blocked.length ? `${blocked.length} open` : "All gates clear"}
          </Badge>
          <span className="text-muted-foreground text-xs">
            AI drafts remain clinician-review material.
          </span>
        </div>
        <div className="grid gap-2">
          {gates.map((gate) => (
            <div
              className={cn(
                "rounded-md border p-3",
                gate.passed
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-amber-200 bg-amber-50",
                !gate.passed &&
                  gate.priority === "critical" &&
                  "border-red-200 bg-red-50",
              )}
              key={gate.id}
            >
              <div className="flex items-start gap-2">
                <AlertTriangle
                  className={
                    gate.passed ? "text-emerald-700" : "text-amber-700"
                  }
                  size={16}
                  aria-hidden="true"
                />
                <div>
                  <p className="font-semibold text-sm">{gate.label}</p>
                  <p className="mt-1 text-muted-foreground text-xs leading-5">
                    {gate.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
