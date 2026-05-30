import { Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Id } from "../../../../convex/_generated/dataModel";
import { SeverityBadge } from "./doctor-console";
import { SectionHeading } from "./section-heading";

type CaseBoardItem = {
  _id: Id<"cases">;
  patientName: string;
  age: number;
  language: "bn" | "en" | "mixed";
  redFlagCount: number;
  chiefComplaint: string;
  severity: "low" | "medium" | "high";
};

export function CaseBoard({
  cases,
  onStatusChange,
}: {
  cases: CaseBoardItem[] | undefined;
  onStatusChange: (caseId: Id<"cases">, status: "handout" | "followup") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Radio size={18} aria-hidden="true" />}
          title="Live Case Board"
          subtitle="Convex realtime queue"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {(cases ?? []).map((caseItem) => (
            <div
              className="rounded-lg border border-border bg-background p-3"
              key={caseItem._id}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{caseItem.patientName}</p>
                  <p className="text-muted-foreground text-xs">
                    {caseItem.age} yrs · {caseItem.language} ·{" "}
                    {caseItem.redFlagCount} flags
                  </p>
                </div>
                <SeverityBadge severity={caseItem.severity} />
              </div>
              <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                {caseItem.chiefComplaint}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange(caseItem._id, "handout")}
                >
                  Handout
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange(caseItem._id, "followup")}
                >
                  Follow-up
                </Button>
              </div>
            </div>
          ))}
          {cases?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Generated cases will appear here.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
