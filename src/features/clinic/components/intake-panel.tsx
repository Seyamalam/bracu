import { Languages, Loader2, Mic, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { demoScenarios, sampleIntakes } from "../data";
import type { IntakeFormState, Sex } from "../types";
import { SectionHeading } from "./section-heading";

const sexOptions = ["female", "male", "other", "unknown"] as const;

type SpeechRecognitionResult = {
  readonly transcript: string;
};

type SpeechRecognitionEventLike = {
  readonly results: {
    readonly length: number;
    readonly [index: number]: {
      readonly [index: number]: SpeechRecognitionResult;
    };
  };
};

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
};

type SpeechWindow = Window &
  typeof globalThis & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };

export function IntakePanel({
  copy,
  form,
  onChange,
  onGenerate,
  onCleanIntake,
  isGenerating,
  isCleaningIntake,
  error,
}: {
  copy: {
    intakeTitle: string;
    intakeSubtitle: string;
    patient: string;
    age: string;
    sex: string;
    rawIntake: string;
    scripts: string;
    voice: string;
    listening: string;
    attach: string;
    generate: string;
  };
  form: IntakeFormState;
  onChange: (nextForm: IntakeFormState) => void;
  onGenerate: () => void;
  onCleanIntake: () => void;
  isGenerating: boolean;
  isCleaningIntake: boolean;
  error: string;
}) {
  const [isListening, setIsListening] = useState(false);
  const updateForm = (patch: Partial<IntakeFormState>) => {
    onChange({ ...form, ...patch });
  };

  function startVoiceIntake() {
    const speechWindow = window as SpeechWindow;
    const SpeechRecognition =
      speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      updateForm({
        intake: `${form.intake}\n\nVoice intake is not supported in this browser.`,
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "bn-BD";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const latestResult = event.results[event.results.length - 1]?.[0];
      if (latestResult?.transcript) {
        updateForm({ intake: `${form.intake}\n${latestResult.transcript}` });
      }
    };
    recognition.onend = () => setIsListening(false);
    setIsListening(true);
    recognition.start();
  }

  async function attachFile(file: File | undefined) {
    if (!file) {
      return;
    }

    if (file.type.startsWith("text/") || file.name.endsWith(".txt")) {
      const text = await file.text();
      updateForm({
        intake: `${form.intake}\n\nAttached ${file.name}:\n${text.slice(0, 2500)}`,
      });
      return;
    }

    updateForm({
      intake: `${form.intake}\n\nAttached file for clinician review: ${file.name} (${file.type || "unknown type"}).`,
    });
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Languages size={18} aria-hidden="true" />}
          title={copy.intakeTitle}
          subtitle={copy.intakeSubtitle}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="patient-name" label={copy.patient}>
            <Input
              id="patient-name"
              value={form.patientName}
              onChange={(event) =>
                updateForm({ patientName: event.target.value })
              }
            />
          </FormField>
          <FormField id="patient-age" label={copy.age}>
            <Input
              id="patient-age"
              inputMode="numeric"
              value={form.age}
              onChange={(event) => updateForm({ age: event.target.value })}
            />
          </FormField>
        </div>

        <div className="mt-4 rounded-lg bg-[#f7f4ee] p-3">
          <p className="font-semibold text-sm">{copy.scripts}</p>
          <div className="mt-2 grid gap-2">
            {demoScenarios.map((scenario) => (
              <Button
                aria-label={`Load ${scenario.label} demo scenario: ${scenario.focus}`}
                className="h-auto justify-start px-3 py-2 text-left"
                key={scenario.label}
                type="button"
                variant="outline"
                onClick={() =>
                  onChange({
                    patientName: scenario.patientName,
                    age: scenario.age,
                    sex: scenario.sex,
                    intake: scenario.intake,
                  })
                }
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
        </div>

        <fieldset className="mt-3">
          <legend className="font-medium text-muted-foreground text-sm">
            {copy.sex}
          </legend>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {sexOptions.map((option) => (
              <Button
                aria-label={`Set patient sex to ${option}`}
                className={cn(
                  "px-1 text-[0.72rem] capitalize",
                  form.sex === option && "bg-primary text-primary-foreground",
                )}
                key={option}
                type="button"
                variant={form.sex === option ? "default" : "outline"}
                onClick={() => updateForm({ sex: option as Sex })}
              >
                {option}
              </Button>
            ))}
          </div>
        </fieldset>

        <FormField id="raw-intake" label={copy.rawIntake}>
          <Textarea
            id="raw-intake"
            className="min-h-48 resize-none"
            value={form.intake}
            onChange={(event) => updateForm({ intake: event.target.value })}
          />
        </FormField>

        <Button
          aria-label={
            isListening
              ? "Voice intake is listening"
              : "Start Bangla voice intake"
          }
          className="mb-3 w-full"
          type="button"
          variant="outline"
          onClick={startVoiceIntake}
        >
          <Mic size={17} aria-hidden="true" />
          {isListening ? copy.listening : copy.voice}
        </Button>

        <Button
          aria-label="Clean intake note with AI"
          className="mb-3 w-full"
          type="button"
          variant="outline"
          disabled={isCleaningIntake}
          onClick={onCleanIntake}
        >
          {isCleaningIntake ? (
            <Loader2 className="animate-spin" size={17} aria-hidden="true" />
          ) : (
            <Sparkles size={17} aria-hidden="true" />
          )}
          Clean intake with AI
        </Button>

        <Label htmlFor="intake-file">{copy.attach}</Label>
        <Input
          id="intake-file"
          className="mb-3 mt-1"
          type="file"
          accept=".txt,.md,text/*,image/*,.pdf"
          onChange={(event) => {
            void attachFile(event.target.files?.[0]);
            event.currentTarget.value = "";
          }}
        />

        <div className="grid grid-cols-3 gap-2">
          {sampleIntakes.map((sample) => (
            <Button
              aria-label={`Load sample intake: ${sample.label}`}
              className="h-11 px-2 text-xs"
              key={sample.label}
              type="button"
              variant="outline"
              onClick={() => updateForm({ intake: sample.text })}
            >
              {sample.label}
            </Button>
          ))}
        </div>

        <Button
          className="mt-4 w-full bg-[#e2553d] hover:bg-[#c9432f]"
          size="lg"
          type="button"
          disabled={isGenerating}
          onClick={onGenerate}
        >
          {isGenerating ? (
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <Sparkles size={18} aria-hidden="true" />
          )}
          {copy.generate}
        </Button>
        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function FormField({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-3">
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
