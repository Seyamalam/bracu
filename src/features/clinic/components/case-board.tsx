import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CaseStatus } from "../types";
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
  status: CaseStatus;
  approvedAt?: number;
};

export function CaseBoard({
  cases,
  selectedCaseId,
  onSelectCase,
  onStatusChange,
  onApproveCase,
}: {
  cases: CaseBoardItem[] | undefined;
  selectedCaseId?: Id<"cases">;
  onSelectCase: (caseId: Id<"cases">) => void;
  onStatusChange: (caseId: Id<"cases">, status: "handout" | "followup") => void;
  onApproveCase: (caseId: Id<"cases">) => void;
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
              className={
                selectedCaseId === caseItem._id
                  ? "w-full rounded-lg border border-primary bg-background p-3 text-left shadow-sm"
                  : "w-full rounded-lg border border-border bg-background p-3 text-left transition hover:border-primary"
              }
              key={caseItem._id}
            >
              <button
                className="w-full text-left"
                type="button"
                onClick={() => onSelectCase(caseItem._id)}
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
                <Badge className="mt-2 capitalize" variant="outline">
                  {caseItem.approvedAt ? "approved" : caseItem.status}
                </Badge>
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                  {caseItem.chiefComplaint}
                </p>
              </button>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={caseItem.approvedAt ? "secondary" : "outline"}
                  onClick={() => onApproveCase(caseItem._id)}
                >
                  Approve
                </Button>
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
