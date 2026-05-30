"use client";

import { Pill, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CopilotOutput, MedicineSafetyOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function MedicineSafety({ output }: { output: CopilotOutput | null }) {
  const [medicines, setMedicines] = useState(
    "Paracetamol 500mg\nAntihistamine at night\nORS as needed",
  );
  const [result, setResult] = useState<MedicineSafetyOutput | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState("");

  async function checkSafety() {
    setIsChecking(true);
    setError("");
    try {
      const response = await fetch("/api/medicine-safety", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicines,
          caseSummary: output?.summary ?? "",
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Medicine check failed.");
      }
      setResult(data.output as MedicineSafetyOutput);
    } catch (caught) {
      setError(
        caught instanceof Error ? caught.message : "Medicine check failed.",
      );
    } finally {
      setIsChecking(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Pill size={18} aria-hidden="true" />}
          title="Medicine Safety"
          subtitle="Checks clarity, allergies, and warning language"
        />
      </CardHeader>
      <CardContent>
        <Label htmlFor="medicine-text">Draft medicine instructions</Label>
        <Textarea
          id="medicine-text"
          className="mt-1 min-h-28"
          value={medicines}
          onChange={(event) => setMedicines(event.target.value)}
        />
        <Button
          className="mt-3 w-full"
          type="button"
          variant="outline"
          disabled={isChecking}
          onClick={checkSafety}
        >
          <ShieldAlert size={17} aria-hidden="true" />
          Check medicine safety
        </Button>
        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}

        {result ? (
          <div className="mt-4 rounded-lg border border-border bg-background p-3">
            <Badge
              variant={
                result.riskLevel === "high"
                  ? "destructive"
                  : result.riskLevel === "medium"
                    ? "warning"
                    : "success"
              }
            >
              {result.riskLevel} risk
            </Badge>
            <SafetyList title="Issues" items={result.issues} />
            <SafetyList
              title="Clarifying questions"
              items={result.clarifyingQuestions}
            />
            <SafetyList
              title="Patient instructions"
              items={result.patientInstructions}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function SafetyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-3">
      <p className="font-semibold text-sm">{title}</p>
      <ul className="mt-1 space-y-1 text-muted-foreground text-sm leading-6">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
