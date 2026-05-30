import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { safetyPrinciples } from "../data";
import { SectionHeading } from "./section-heading";

export function SafetyFrame() {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          title="Safety Frame"
          subtitle="Built for responsible demo judging"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-muted-foreground text-sm leading-6">
          {safetyPrinciples.map((principle) => (
            <p key={principle}>{principle}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
