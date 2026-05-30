import { Languages, Loader2, Mic, Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { sampleIntakes } from "../data";
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
  form,
  onChange,
  onGenerate,
  isGenerating,
  error,
}: {
  form: IntakeFormState;
  onChange: (nextForm: IntakeFormState) => void;
  onGenerate: () => void;
  isGenerating: boolean;
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

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Languages size={18} aria-hidden="true" />}
          title="Reception Intake"
          subtitle="Bangla, English, or mixed"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="patient-name" label="Patient">
            <Input
              id="patient-name"
              value={form.patientName}
              onChange={(event) =>
                updateForm({ patientName: event.target.value })
              }
            />
          </FormField>
          <FormField id="patient-age" label="Age">
            <Input
              id="patient-age"
              inputMode="numeric"
              value={form.age}
              onChange={(event) => updateForm({ age: event.target.value })}
            />
          </FormField>
        </div>

        <fieldset className="mt-3">
          <legend className="font-medium text-muted-foreground text-sm">
            Sex
          </legend>
          <div className="mt-1 grid grid-cols-4 gap-2">
            {sexOptions.map((option) => (
              <Button
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

        <FormField id="raw-intake" label="Raw intake">
          <Textarea
            id="raw-intake"
            className="min-h-48 resize-none"
            value={form.intake}
            onChange={(event) => updateForm({ intake: event.target.value })}
          />
        </FormField>

        <Button
          className="mb-3 w-full"
          type="button"
          variant="outline"
          onClick={startVoiceIntake}
        >
          <Mic size={17} aria-hidden="true" />
          {isListening ? "Listening..." : "Voice intake"}
        </Button>

        <div className="grid grid-cols-3 gap-2">
          {sampleIntakes.map((sample) => (
            <Button
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
          Generate Clinical Draft
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
