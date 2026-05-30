"use client";

import { Copy, MessageCircle, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CopilotOutput, FollowUpMessageOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function FollowUpComposer({
  commandInstruction,
  composeSignal,
  model,
  output,
  patientName,
  preferredChannel,
}: {
  commandInstruction?: string;
  composeSignal: number;
  model: string;
  output: CopilotOutput | null;
  patientName: string;
  preferredChannel: "sms" | "whatsapp";
}) {
  const [channel, setChannel] = useState<"sms" | "whatsapp">(preferredChannel);
  const [message, setMessage] = useState<FollowUpMessageOutput | null>(null);
  const [language, setLanguage] = useState<"bn" | "en">("bn");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setChannel(preferredChannel);
  }, [preferredChannel]);

  const composeFollowUp = useCallback(
    async (nextChannel = channel) => {
      if (!output) {
        setError("Generate or select a case before composing follow-up.");
        return;
      }

      setChannel(nextChannel);
      setIsGenerating(true);
      setError("");
      setSent(false);
      try {
        const response = await fetch("/api/follow-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName,
            channel: nextChannel,
            caseSummary: output.summary,
            followUpTiming: output.followUp.timing,
            followUpMessage: output.followUp.message,
            instruction: commandInstruction,
            model,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Follow-up composition failed.");
        }
        setMessage(data.output as FollowUpMessageOutput);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Follow-up composition failed.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [channel, commandInstruction, model, output, patientName],
  );

  useEffect(() => {
    if (composeSignal > 0) {
      void composeFollowUp(preferredChannel);
    }
  }, [composeFollowUp, composeSignal, preferredChannel]);

  const activeText =
    language === "bn" ? message?.messageBn : message?.messageEn;

  async function copyMessage() {
    if (!activeText) {
      return;
    }
    await navigator.clipboard.writeText(activeText);
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<MessageCircle size={18} aria-hidden="true" />}
          title="Follow-up Messenger"
          subtitle="AI-drafted SMS or WhatsApp callback"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {(["whatsapp", "sms"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={channel === option ? "default" : "outline"}
              onClick={() => setChannel(option)}
            >
              {option === "sms" ? "SMS" : "WhatsApp"}
            </Button>
          ))}
        </div>

        <Button
          className="mt-3 w-full"
          disabled={isGenerating || !output}
          type="button"
          onClick={() => void composeFollowUp()}
        >
          <MessageCircle size={17} aria-hidden="true" />
          {isGenerating ? "Composing..." : "Compose Follow-up"}
        </Button>

        {message ? (
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-[#f7f4ee] p-1">
              {(["bn", "en"] as const).map((option) => (
                <Button
                  key={option}
                  size="sm"
                  type="button"
                  variant={language === option ? "default" : "ghost"}
                  onClick={() => setLanguage(option)}
                >
                  {option.toUpperCase()}
                </Button>
              ))}
            </div>
            <Textarea
              aria-label="Follow-up message"
              className="min-h-36"
              value={activeText ?? ""}
              onChange={(event) =>
                setMessage({
                  ...message,
                  [language === "bn" ? "messageBn" : "messageEn"]:
                    event.target.value,
                })
              }
            />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={copyMessage}>
                <Copy size={16} aria-hidden="true" />
                Copy
              </Button>
              <Button type="button" onClick={() => setSent(true)}>
                <Send size={16} aria-hidden="true" />
                Queue demo
              </Button>
            </div>
            <div className="rounded-md border border-border bg-background p-3">
              <p className="font-semibold text-sm">
                Urgency: <span className="capitalize">{message.urgency}</span>
              </p>
              <ul className="mt-2 space-y-1 text-muted-foreground text-xs">
                {message.checklist.map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
            {sent ? (
              <p className="rounded-md bg-emerald-50 p-2 text-emerald-900 text-sm">
                Demo queued for {patientName} via {channel}.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            Compose a reviewed callback after a draft is generated.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
