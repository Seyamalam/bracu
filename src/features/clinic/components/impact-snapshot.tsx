import { TimerReset } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function ImpactSnapshot({
  output,
  title,
}: {
  output: CopilotOutput | null;
  title: string;
}) {
  const missingQuestions = output?.missingQuestions.length ?? 4;
  const redFlags = output?.redFlags.length ?? 1;
  const minutesSaved = Math.min(8, 3 + missingQuestions);

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <SectionHeading
          icon={<TimerReset size={18} aria-hidden="true" />}
          title={title}
          subtitle="Operational proof points the clinic can act on"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          <ImpactNumber label="min saved" value={minutesSaved} />
          <ImpactNumber label="questions found" value={missingQuestions} />
          <ImpactNumber label="red flags" value={redFlags} />
        </div>
      </CardContent>
    </Card>
  );
}

function ImpactNumber({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-[#f7f4ee] p-3 text-center">
      <p className="font-black text-2xl text-primary">{value}</p>
      <p className="text-muted-foreground text-xs">{label}</p>
    </div>
  );
}
