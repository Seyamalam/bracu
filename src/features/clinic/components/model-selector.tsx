import { Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
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
  const providerOptions = [
    {
      description: "Run through local LM Studio",
      label: "LM Studio",
      value: "lmstudio",
    },
    {
      description: "Use Google Gemini through AI SDK",
      label: "Gemini",
      value: "gemini-2.5-flash",
    },
  ];

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
        <p className="font-medium text-sm">{t("Provider")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {providerOptions.map((option) => {
            const isActive =
              option.value === "lmstudio"
                ? value === "lmstudio"
                : value !== "lmstudio";
            return (
              <Button
                key={option.value}
                aria-pressed={isActive}
                className={cn(
                  "h-auto min-h-16 flex-col items-start gap-1 px-3 py-2 text-left",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                )}
                type="button"
                variant={isActive ? "default" : "outline"}
                onClick={() => onChange(option.value)}
              >
                <span className="font-bold">{t(option.label)}</span>
                <span className="whitespace-normal text-xs opacity-80">
                  {t(option.description)}
                </span>
              </Button>
            );
          })}
        </div>
        <Label className="mt-4 block" htmlFor="model-select">
          {t("Generation model")}
        </Label>
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
