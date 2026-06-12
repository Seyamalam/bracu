import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { modelOptions } from "../data";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const t = useClinicText();
  const activeOption = modelOptions.find((option) => option.value === value);
  const providerLabel = value === "lmstudio" ? "Local" : "Gemini";

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Cpu size={18} aria-hidden="true" />}
          title={t("AI Model")}
          subtitle={t("Switch provider model for demos")}
        />
      </CardHeader>
      <CardContent>
        <div className="mb-3 flex flex-wrap gap-2">
          <Badge variant={value === "lmstudio" ? "default" : "outline"}>
            LM Studio
          </Badge>
          <Badge
            variant={
              value === "gemini-2.5-flash" || value === "gemini-2.5-flash-lite"
                ? "default"
                : "outline"
            }
          >
            Gemini
          </Badge>
          <Badge variant="secondary">{t(providerLabel)}</Badge>
        </div>
        <Label htmlFor="model-select">{t("Generation model")}</Label>
        <select
          id="model-select"
          className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-2 text-muted-foreground text-xs">
          {t(activeOption?.description ?? "")}
        </p>
      </CardContent>
    </Card>
  );
}
