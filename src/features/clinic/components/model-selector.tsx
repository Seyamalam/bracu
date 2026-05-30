import { Cpu } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { modelOptions } from "../data";
import { SectionHeading } from "./section-heading";

export function ModelSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Cpu size={18} aria-hidden="true" />}
          title="AI Model"
          subtitle="Switch provider model for demos"
        />
      </CardHeader>
      <CardContent>
        <Label htmlFor="model-select">Generation model</Label>
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
          {modelOptions.find((option) => option.value === value)?.description}
        </p>
      </CardContent>
    </Card>
  );
}
