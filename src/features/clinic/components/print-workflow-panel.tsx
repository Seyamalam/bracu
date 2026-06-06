import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

type PrintItem = {
  id: string;
  label: string;
  body: string;
};

export function PrintWorkflowPanel({
  output,
  patientName,
}: {
  output: CopilotOutput | null;
  patientName: string;
}) {
  const packet = buildPrintPacket(output, patientName);

  async function copyItem(item: PrintItem) {
    await navigator.clipboard.writeText(`${item.label}\n\n${item.body}`);
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Printer size={18} aria-hidden="true" />}
          title="Print Packet"
          subtitle="Handout, referral, medicine slip, call sheet, doctor summary"
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {packet.map((item) => (
            <div
              className="rounded-md border border-border bg-background p-3"
              key={item.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">{item.label}</p>
                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-5">
                    {item.body}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    aria-label={`Copy ${item.label}`}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => void copyItem(item)}
                  >
                    <FileText size={15} aria-hidden="true" />
                  </Button>
                  <Button
                    aria-label={`Print ${item.label}`}
                    size="icon"
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                  >
                    <Printer size={15} aria-hidden="true" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function buildPrintPacket(
  output: CopilotOutput | null,
  patientName: string,
): PrintItem[] {
  const fallback = "Generate or select a case to fill this printable packet.";
  return [
    {
      id: "handout",
      label: "Patient handout",
      body: output
        ? `${output.patientHandout.title}\n${output.patientHandout.plainSummary}\nReturn warnings: ${output.patientHandout.urgentReturnWarnings.join("; ")}`
        : fallback,
    },
    {
      id: "referral",
      label: "Referral cover note",
      body: output
        ? `${patientName || "Patient"}: ${output.chiefComplaint}\nReason: ${output.summary}\nRed flags: ${output.redFlags.join("; ") || "None documented"}`
        : fallback,
    },
    {
      id: "medicine",
      label: "Medicine slip",
      body: output
        ? output.patientHandout.medicineInstructions.join("\n")
        : fallback,
    },
    {
      id: "follow-up",
      label: "Follow-up call sheet",
      body: output
        ? `${output.followUp.timing}\n${output.followUp.message}`
        : fallback,
    },
    {
      id: "doctor",
      label: "Doctor summary",
      body: output
        ? `S: ${output.soap.subjective}\nO: ${output.soap.objective}\nA: ${output.soap.assessmentSupport}\nP: ${output.soap.planSupport}`
        : fallback,
    },
  ];
}
