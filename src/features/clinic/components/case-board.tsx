"use client";

import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CaseStatus, Severity } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SeverityBadge } from "./doctor-console";
import { SectionHeading } from "./section-heading";

type CaseBoardItem = {
  _id: Id<"cases">;
  _creationTime: number;
  patientName: string;
  age: number;
  language: "bn" | "en" | "mixed";
  redFlagCount: number;
  chiefComplaint: string;
  severity: "low" | "medium" | "high";
  status: CaseStatus;
  approvedAt?: number;
  followUp?: {
    timing: string;
    message: string;
  };
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
  const t = useClinicText();

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Radio size={18} aria-hidden="true" />}
          title={t("Live Case Board")}
          subtitle={t("Convex realtime queue")}
        />
      </CardHeader>
      <CardContent>
        <div className="mb-4 space-y-3">
          <div>
            <Label htmlFor="case-search">{t("Search cases")}</Label>
            <Input
              id="case-search"
              className="mt-1"
              placeholder={t("Patient, complaint, language...")}
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              aria-label={t("Filter by status")}
              value={statusFilter}
              onChange={(event) =>
                onStatusFilterChange(event.target.value as CaseStatus | "all")
              }
            >
              {["all", "waiting", "review", "handout", "followup"].map(
                (item) => (
                  <option key={item} value={item}>
                    {t(item)}
                  </option>
                ),
              )}
            </select>
            <select
              className="h-10 rounded-md border border-input bg-background px-2 text-sm"
              aria-label={t("Filter by severity")}
              value={severityFilter}
              onChange={(event) =>
                onSeverityFilterChange(event.target.value as Severity | "all")
              }
            >
              {["all", "high", "medium", "low"].map((item) => (
                <option key={item} value={item}>
                  {t(item)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-3">
          <RedFlagLane cases={cases ?? []} onSelectCase={onSelectCase} t={t} />
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
                aria-label={`${t("Select case")}: ${caseItem.patientName}, ${t(caseItem.severity)} ${t("priority")}, ${t(caseItem.status)} ${t("status")}`}
                className="w-full text-left"
                type="button"
                onClick={() => onSelectCase(caseItem._id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{caseItem.patientName}</p>
                    <p className="text-muted-foreground text-xs">
                      {caseItem.age} {t("yrs")} · {t(caseItem.language)} ·{" "}
                      {caseItem.redFlagCount} {t("flags")}
                    </p>
                  </div>
                  <SeverityBadge severity={caseItem.severity} />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge className="capitalize" variant="outline">
                    {t(caseItem.approvedAt ? "approved" : caseItem.status)}
                  </Badge>
                  <Badge
                    variant={
                      caseItem.redFlagCount ? "destructive" : "secondary"
                    }
                  >
                    {t(
                      caseItem.redFlagCount ? "red flag lane" : "routine lane",
                    )}
                  </Badge>
                  <Badge variant="outline">
                    {waitingTime(caseItem._creationTime, t)}
                  </Badge>
                  <Badge variant="outline">{t(ownerForCase(caseItem))}</Badge>
                </div>
                {caseItem.status === "followup" || caseItem.followUp ? (
                  <p className="mt-2 rounded-md bg-[#f7f4ee] px-2 py-1 text-muted-foreground text-xs">
                    {t("Follow-up clock")}:{" "}
                    {caseItem.followUp?.timing ?? t("timing not set")}
                  </p>
                ) : null}
                <p className="mt-2 line-clamp-2 text-muted-foreground text-sm">
                  {caseItem.chiefComplaint}
                </p>
              </button>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <Button
                  aria-label={`${t("Approve")} ${caseItem.patientName}`}
                  type="button"
                  variant={caseItem.approvedAt ? "secondary" : "outline"}
                  onClick={() => onApproveCase(caseItem._id)}
                >
                  {t("Approve")}
                </Button>
                <Button
                  aria-label={`${t("Move to handout")}: ${caseItem.patientName}`}
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange(caseItem._id, "handout")}
                >
                  {t("Handout")}
                </Button>
                <Button
                  aria-label={`${t("Move to follow-up")}: ${caseItem.patientName}`}
                  type="button"
                  variant="outline"
                  onClick={() => onStatusChange(caseItem._id, "followup")}
                >
                  {t("Follow-up")}
                </Button>
              </div>
            </div>
          ))}
          {cases?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("Generated cases will appear here.")}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function RedFlagLane({
  cases,
  onSelectCase,
  t,
}: {
  cases: CaseBoardItem[];
  onSelectCase: (caseId: Id<"cases">) => void;
  t: (text: string) => string;
}) {
  const urgentCases = cases.filter(
    (caseItem) => caseItem.redFlagCount > 0 || caseItem.severity === "high",
  );

  if (!urgentCases.length) {
    return null;
  }

  return (
    <div className="min-w-0 overflow-hidden rounded-lg border border-red-200 bg-red-50 p-3">
      <p className="font-semibold text-red-950 text-sm">{t("Red Flag Lane")}</p>
      <div className="mt-2 flex max-w-full gap-2 overflow-x-auto pb-1">
        {urgentCases.map((caseItem) => (
          <button
            aria-label={`${t("Open urgent case")}: ${caseItem.patientName}`}
            className="shrink-0 rounded-md border border-red-200 bg-white px-3 py-2 text-left"
            key={caseItem._id}
            type="button"
            onClick={() => onSelectCase(caseItem._id)}
          >
            <p className="font-semibold text-xs">{caseItem.patientName}</p>
            <p className="text-red-800 text-xs">
              {caseItem.redFlagCount} {t("flags")} ·{" "}
              {waitingTime(caseItem._creationTime, t)}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function waitingTime(createdAt: number, t: (text: string) => string) {
  const minutes = Math.max(0, Math.round((Date.now() - createdAt) / 60_000));
  if (minutes < 1) {
    return t("just arrived");
  }
  if (minutes < 60) {
    return `${minutes}${t("m")} ${t("waiting")}`;
  }
  return `${Math.floor(minutes / 60)}${t("h")} ${minutes % 60}${t("m")} ${t("waiting")}`;
}

function ownerForCase(caseItem: CaseBoardItem) {
  if (caseItem.status === "waiting") {
    return "owner: reception";
  }
  if (caseItem.status === "review") {
    return caseItem.severity === "high" ? "owner: doctor" : "owner: nurse";
  }
  if (caseItem.status === "handout") {
    return "owner: doctor";
  }
  return "owner: follow-up desk";
}
