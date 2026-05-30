"use client";

import { MessageSquareText } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

const suggestions = [
  "What should reception ask next?",
  "Explain this to the patient in simple Bangla",
  "What are the safety-net warnings?",
  "Make a follow-up call script",
];

export function CaseAssistant({
  model,
  output,
}: {
  model: string;
  output: CopilotOutput | null;
}) {
  const [question, setQuestion] = useState(suggestions[0]);
  const [answer, setAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState("");

  async function ask() {
    setIsAsking(true);
    setError("");
    try {
      const response = await fetch("/api/case-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          model,
          caseSummary: output?.summary,
          patientHandout: output?.patientHandout.plainSummary,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Assistant failed.");
      }
      setAnswer(data.answer as string);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Assistant failed.");
    } finally {
      setIsAsking(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<MessageSquareText size={18} aria-hidden="true" />}
          title="Ask This Case"
          subtitle="Free-text AI help for the selected patient"
        />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            aria-label="Ask about selected case"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void ask();
              }
            }}
          />
          <Button type="button" disabled={isAsking} onClick={ask}>
            Ask
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
              {item}
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
