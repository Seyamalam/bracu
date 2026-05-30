import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CaseStatus, Severity } from "../types";
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
  searchQuery,
  selectedCaseId,
  severityFilter,
  statusFilter,
  onSearchChange,
  onSelectCase,
  onSeverityFilterChange,
  onStatusFilterChange,
  onStatusChange,
  onApproveCase,
}: {
  cases: CaseBoardItem[] | undefined;
  searchQuery: string;
  selectedCaseId?: Id<"cases">;
  severityFilter: Severity | "all";
  statusFilter: CaseStatus | "all";
  onSearchChange: (query: string) => void;
  onSelectCase: (caseId: Id<"cases">) => void;
  onSeverityFilterChange: (severity: Severity | "all") => void;
  onStatusFilterChange: (status: CaseStatus | "all") => void;
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
        <div className="mb-4 space-y-3">
          <div>
            <Label htmlFor="case-search">Search cases</Label>
            <Input
              id="case-search"
              className="mt-1"
              placeholder="Patient, complaint, language..."
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(event.target.value as CaseStatus | "all")
              }
            >
              {["all", "waiting", "review", "handout", "followup"].map(
                (item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ),
              )}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              aria-label="Filter by severity"
              value={severityFilter}
              onChange={(event) =>
                onSeverityFilterChange(event.target.value as Severity | "all")
              }
            >
              {["all", "high", "medium", "low"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
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
