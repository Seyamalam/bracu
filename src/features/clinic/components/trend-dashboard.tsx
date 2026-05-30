import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { trendLabels } from "../data";
import type { CaseStatus, Severity } from "../types";
import { SectionHeading } from "./section-heading";

type TrendCase = {
  severity: Severity;
  status: CaseStatus;
  language: "bn" | "en" | "mixed";
};

export function TrendDashboard({ cases }: { cases: TrendCase[] | undefined }) {
  const rows = cases ?? [];
  const high = rows.filter((item) => item.severity === "high").length;
  const medium = rows.filter((item) => item.severity === "medium").length;
  const low = rows.filter((item) => item.severity === "low").length;
  const followup = rows.filter((item) => item.status === "followup").length;
  const banglaFirst = rows.filter((item) => item.language !== "en").length;
  const max = Math.max(high, medium, low, followup, 1);

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<BarChart3 size={18} aria-hidden="true" />}
          title="Clinic Trends"
          subtitle="Anonymized demo signals"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <TrendBar label={trendLabels.high} value={high} max={max} />
          <TrendBar label={trendLabels.medium} value={medium} max={max} />
          <TrendBar label={trendLabels.low} value={low} max={max} />
          <TrendBar label={trendLabels.followup} value={followup} max={max} />
        </div>
        <div className="mt-4 rounded-lg bg-[#f7f4ee] p-3">
          <p className="font-semibold text-2xl">
            {rows.length ? Math.round((banglaFirst / rows.length) * 100) : 0}%
          </p>
          <p className="text-muted-foreground text-xs">
            Bangla or mixed-language intakes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBar({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${Math.max((value / max) * 100, value ? 10 : 0)}%` }}
        />
      </div>
    </div>
  );
}
