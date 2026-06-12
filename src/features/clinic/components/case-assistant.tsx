"use client";

import { MessageSquareText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CopilotOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

const suggestions = [
  "What should reception ask next?",
  "Explain this to the patient in simple Bangla",
  "What are the safety-net warnings?",
  "Make a follow-up call script",
];

export function CaseAssistant({
  askSignal,
  commandQuestion,
  model,
  output,
}: {
  askSignal: number;
  commandQuestion?: string;
  model: string;
  output: CopilotOutput | null;
}) {
  const [question, setQuestion] = useState(suggestions[0]);
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");
  const t = useClinicText();

  const ask = useCallback(
    async (questionOverride?: string) => {
      const nextQuestion = (questionOverride ?? question).trim();
      if (nextQuestion.length < 3) {
        setError(t("Ask a question about the selected case."));
        return;
      }

      setQuestion(nextQuestion);
      setIsAsking(true);
      setError("");
      try {
        const response = await fetch("/api/case-assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: nextQuestion,
            model,
            caseSummary: output?.summary,
            patientHandout: output?.patientHandout.plainSummary,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(t(data.error ?? "Assistant failed."));
        }
        setAnswer(data.answer as string);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : t("Assistant failed."),
        );
      } finally {
        setIsAsking(false);
      }
    },
    [model, output, question, t],
  );

  useEffect(() => {
    if (askSignal > 0) {
      void ask(commandQuestion);
    }
  }, [ask, askSignal, commandQuestion]);

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<MessageSquareText size={18} aria-hidden="true" />}
          title={t("Ask This Case")}
          subtitle={t("Free-text AI help for the selected patient")}
        />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            aria-label={t("Ask about selected case")}
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void ask();
              }
            }}
          />
          <Button type="button" disabled={isAsking} onClick={() => void ask()}>
            {t("Ask")}
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <Button
              className="h-auto px-2 py-1 text-xs"
              key={item}
              type="button"
              variant="outline"
              onClick={() => setQuestion(item)}
            >
              {t(item)}
            </Button>
          ))}
        </div>
        {answer ? (
          <div className="mt-4 whitespace-pre-wrap rounded-lg bg-[#f7f4ee] p-3 text-sm leading-6">
            {answer}
          </div>
        ) : null}
        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
