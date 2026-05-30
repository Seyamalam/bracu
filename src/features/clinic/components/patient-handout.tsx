import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function PatientHandout({ output }: { output: CopilotOutput | null }) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Printer size={18} aria-hidden="true" />}
          title="Patient Handout"
          subtitle="Plain-language Bangla/English"
        />
      </CardHeader>
      <CardContent>
        {output ? (
          <div className="rounded-lg border border-border bg-background p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 border-border border-b pb-3">
              <div>
                <p className="font-semibold text-xl">
                  {output.patientHandout.title}
                </p>
                <p className="mt-1 text-muted-foreground text-sm">
                  Follow-up: {output.followUp.timing}
                </p>
              </div>
              <Button
                size="icon"
                type="button"
                variant="outline"
                title="Print handout"
              >
                <Printer size={17} aria-hidden="true" />
              </Button>
            </div>
            <p className="mt-3 text-slate-700 leading-7">
              {output.patientHandout.plainSummary}
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <MiniList title="Care" items={output.patientHandout.careSteps} />
              <MiniList
                title="Medicine"
                items={output.patientHandout.medicineInstructions}
              />
              <MiniList
                title="Urgent return"
                items={output.patientHandout.urgentReturnWarnings}
              />
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            Generate a draft to create a shareable handout.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg bg-[#f7f4ee] p-3">
      <p className="font-semibold text-sm">{title}</p>
      <ul className="mt-2 space-y-2 text-muted-foreground text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
