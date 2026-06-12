import { ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { safetyPrinciples } from "../data";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function SafetyFrame() {
  const t = useClinicText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<ShieldCheck size={18} aria-hidden="true" />}
          title={t("Safety Frame")}
          subtitle={t("Built for responsible demo judging")}
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-muted-foreground text-sm leading-6">
          {safetyPrinciples.map((principle) => (
            <p key={principle}>{t(principle)}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
