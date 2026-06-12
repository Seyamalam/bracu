"use client";

import { ClipboardCopy, HelpCircle, Languages } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { demoPatientQuestion } from "../data";
import type { CopilotOutput, PatientQuestionOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function PatientQuestionAnswer({
  answerSignal,
  commandQuestion,
  model,
  onRunCommand,
  output,
  patientName,
}: {
  answerSignal: number;
  commandQuestion?: string;
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
  patientName: string;
}) {
  const t = useClinicText();
  const [question, setQuestion] = useState(demoPatientQuestion);
  const [answer, setAnswer] = useState<PatientQuestionOutput | null>(null);
  const [isAnswering, setIsAnswering] = useState(false);
  const [error, setError] = useState("");

  const answerQuestion = useCallback(
    async (questionOverride?: string) => {
      const nextQuestion = (questionOverride ?? question).trim();
      if (nextQuestion.length < 3) {
        setError(t("Paste the patient or family question first."));
        return;
      }

      setQuestion(nextQuestion);
      setIsAnswering(true);
      setError("");
      try {
        const response = await fetch("/api/patient-question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName,
            question: nextQuestion,
            caseSummary: output?.summary,
            handoutSummary: output?.patientHandout.plainSummary,
            redFlags: output?.redFlags,
            model,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(t(data.error ?? "Patient question answer failed."));
        }
        setAnswer(data.output as PatientQuestionOutput);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : t("Patient question answer failed."),
        );
      } finally {
        setIsAnswering(false);
      }
    },
    [model, output, patientName, question, t],
  );

  useEffect(() => {
    if (answerSignal > 0) {
      void answerQuestion(commandQuestion);
    }
  }, [answerQuestion, answerSignal, commandQuestion]);

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <Card className="border-cyan-200">
      <CardHeader>
        <SectionHeading
          icon={<HelpCircle size={18} aria-hidden="true" />}
          title={t("Patient Question")}
          subtitle={t(
            "AI drafts safe Bangla-English answers for clinician review",
          )}
        />
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label={t("Patient or family question")}
          className="min-h-24"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <Button
          className="mt-3 w-full"
          disabled={isAnswering}
          type="button"
          variant="outline"
          onClick={() => void answerQuestion()}
        >
          <Languages size={17} aria-hidden="true" />
          {isAnswering ? t("Answering...") : t("Answer Patient Question")}
        </Button>

        {answer ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">
                  {t("Teach-back")}: {answer.teachBackQuestion}
                </p>
                <Badge className="capitalize" variant="outline">
                  {t(answer.urgency)}
                </Badge>
              </div>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <AnswerDraft
                label={t("Bangla answer")}
                text={answer.plainAnswerBn}
                onCopy={copyText}
              />
              <AnswerDraft
                label={t("English answer")}
                text={answer.plainAnswerEn}
                onCopy={copyText}
              />
            </div>

            <AnswerList items={answer.redFlagReminder} title={t("Red flags")} />
            <AnswerList
              items={answer.clinicianReviewNeeded}
              title={t("Clinician review")}
            />

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">{t("Suggested commands")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {answer.suggestedCommands.map((command) => (
                  <SuggestedCommandButton
                    command={command}
                    key={command}
                    onRunCommand={onRunCommand}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            {t(
              "Paste a patient question, or ask the command box to answer it.",
            )}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function AnswerDraft({
  label,
  onCopy,
  text,
}: {
  label: string;
  onCopy: (text: string) => Promise<void>;
  text: string;
}) {
  const t = useClinicText();
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold text-xs">{label}</p>
        <Button
          size="sm"
          type="button"
          variant="ghost"
          onClick={() => void onCopy(text)}
        >
          <ClipboardCopy size={14} aria-hidden="true" />
          {t("Copy")}
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">{text}</p>
    </div>
  );
}

function AnswerList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-md bg-[#f7f4ee] p-3">
      <p className="font-semibold text-xs">{title}</p>
      <ul className="mt-2 space-y-1 text-muted-foreground text-xs leading-5">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
