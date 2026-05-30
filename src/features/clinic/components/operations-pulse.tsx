import {
  Activity,
  AlertTriangle,
  Languages,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { operationsPulseCopy } from "../data";
import type { CaseStatus, Language, Severity } from "../types";
import { SectionHeading } from "./section-heading";

type OperationsCase = {
  language: Language;
  redFlagCount?: number;
  severity: Severity;
  status: CaseStatus;
};

export function OperationsPulse({
  cases,
}: {
  cases: OperationsCase[] | undefined;
}) {
  const rows = cases ?? [];
  const highPriority = rows.filter((item) => item.severity === "high").length;
  const review = rows.filter(
    (item) => item.status === "waiting" || item.status === "review",
  ).length;
  const followup = rows.filter((item) => item.status === "followup").length;
  const bangla = rows.filter((item) => item.language !== "en").length;
  const redFlags = rows.reduce(
    (total, item) => total + (item.redFlagCount ?? 0),
    0,
  );
  const pressureScore =
    highPriority * 3 + review * 2 + followup * 2 + Math.ceil(redFlags / 2);
  const pressure =
    pressureScore >= 14 ? "high" : pressureScore >= 7 ? "medium" : "low";
  const pressureLabel = operationsPulseCopy.pressure[pressure];
  const badgeVariant =
    pressure === "high"
      ? "destructive"
      : pressure === "medium"
        ? "warning"
        : "success";

  const metrics = [
    {
      icon: UserCheck,
      label: operationsPulseCopy.metrics.review,
      value: review,
    },
    {
      icon: PhoneCall,
      label: operationsPulseCopy.metrics.followup,
      value: followup,
    },
    {
      icon: Languages,
      label: operationsPulseCopy.metrics.bangla,
      value: bangla,
    },
    {
      icon: AlertTriangle,
      label: operationsPulseCopy.metrics.redFlags,
      value: redFlags,
    },
  ];

  const focus =
    pressure === "high"
      ? "Put clinician review first, assign one staff member to follow-up closure, and keep patient handouts waiting for signoff."
      : pressure === "medium"
        ? "Clear waiting/review cases before adding routine paperwork, then close follow-up loops."
        : "Queue is manageable. Keep intake, handout, and follow-up ownership explicit.";

  return (
    <Card className="border-amber-200">
      <CardHeader>
        <SectionHeading
          icon={<Activity size={18} aria-hidden="true" />}
          title={operationsPulseCopy.title}
          subtitle={operationsPulseCopy.subtitle}
        />
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-black text-2xl text-primary">
                    {pressureLabel}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    pressure score {pressureScore}
                  </p>
                </div>
                <Badge className="capitalize" variant={badgeVariant}>
                  {pressure}
                </Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {metrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div
                      className="rounded-md bg-[#f7f4ee] p-2"
                      key={metric.label}
                    >
                      <div className="flex items-center gap-2">
                        <Icon
                          className="text-primary"
                          size={14}
                          aria-hidden="true"
                        />
                        <p className="font-semibold text-sm">{metric.value}</p>
                      </div>
                      <p className="mt-1 text-muted-foreground text-xs">
                        {metric.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-md bg-[#fff7df] p-3">
              <p className="font-semibold text-xs">
                {operationsPulseCopy.focusTitle}
              </p>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {focus}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            {operationsPulseCopy.empty}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
