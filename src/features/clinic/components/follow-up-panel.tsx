import { CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Id } from "../../../../convex/_generated/dataModel";
import { SectionHeading } from "./section-heading";

type FollowUpCase = {
  _id: Id<"cases">;
  patientName: string;
  status: "waiting" | "review" | "handout" | "followup";
  followUp?: {
    timing: string;
    message: string;
  };
};

export function FollowUpPanel({
  cases,
  onSelectCase,
}: {
  cases: FollowUpCase[] | undefined;
  onSelectCase: (caseId: Id<"cases">) => void;
}) {
  const followUps = (cases ?? []).filter(
    (caseItem) => caseItem.status === "followup",
  );

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<CalendarClock size={18} aria-hidden="true" />}
          title="Due Follow-ups"
          subtitle="Close the loop after discharge"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {followUps.map((caseItem) => (
            <button
              className="w-full rounded-md border border-border bg-background p-3 text-left transition hover:border-primary"
              key={caseItem._id}
              type="button"
              onClick={() => onSelectCase(caseItem._id)}
            >
              <p className="font-semibold text-sm">{caseItem.patientName}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {caseItem.followUp?.timing ?? "Follow-up timing not set"}
              </p>
            </button>
          ))}
          {followUps.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No follow-up cases are queued.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
