import { MonitorPlay, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { demoScenarios, guidedWorkflowScript } from "../data";
import type { IntakeFormState, UiLanguage } from "../types";
import { SectionHeading } from "./section-heading";

const steps = ["demoStep1", "demoStep2", "demoStep3", "demoStep4"] as const;

type GuidedWorkflowCopy = Record<
  (typeof steps)[number] | "guidedMode" | "guidedSubtitle",
  string
>;

export function GuidedWorkflowPanel({
  copy,
  language,
  onLanguageChange,
  onLoadScenario,
  onRunGuidedWorkflow,
}: {
  copy: GuidedWorkflowCopy;
  language: UiLanguage;
  onLanguageChange: (language: UiLanguage) => void;
  onLoadScenario: (scenario: IntakeFormState) => void;
  onRunGuidedWorkflow: () => void;
}) {
  return (
    <Card className="border-primary/30 bg-[#fff7df]">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <SectionHeading
            icon={<MonitorPlay size={18} aria-hidden="true" />}
            title={copy.guidedMode}
            subtitle={copy.guidedSubtitle}
          />
          <div className="grid grid-cols-2 gap-1 rounded-md bg-white p-1">
            {(["en", "bn"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                type="button"
                variant={language === option ? "default" : "ghost"}
                onClick={() => onLanguageChange(option)}
              >
                {option.toUpperCase()}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 lg:grid-cols-[1fr_1.2fr]">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {steps.map((step, index) => (
              <div
                className="rounded-md border border-primary/15 bg-white px-3 py-2"
                key={step}
              >
                <p className="font-black text-primary text-xl">{index + 1}</p>
                <p className="font-semibold text-sm">{copy[step]}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            {demoScenarios.slice(0, 3).map((scenario) => (
              <Button
                className="h-auto justify-start px-3 py-2 text-left"
                key={scenario.label}
                type="button"
                variant="outline"
                onClick={() => onLoadScenario(scenario)}
              >
                <span>
                  <span className="block font-semibold">{scenario.label}</span>
                  <span className="block text-muted-foreground text-xs">
                    {scenario.focus}
                  </span>
                </span>
              </Button>
            ))}
          </div>
          <Button
            className="h-auto justify-start gap-3 px-4 py-3 text-left"
            type="button"
            onClick={onRunGuidedWorkflow}
          >
            <Play size={17} aria-hidden="true" />
            <span>
              <span className="block font-semibold">
                {guidedWorkflowScript.command}
              </span>
              <span className="block font-normal text-primary-foreground/80 text-xs">
                Load, generate, check medicine, open presentation view
              </span>
            </span>
          </Button>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-4">
          {guidedWorkflowScript.pitchBeats.map((beat, index) => (
            <div
              className="rounded-md border border-primary/15 bg-white px-3 py-2 text-sm"
              key={beat}
            >
              <span className="font-black text-primary">{index + 1}</span>
              <p className="mt-1 text-muted-foreground text-xs">{beat}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
