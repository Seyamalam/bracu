"use client";

import { ClipboardCopy, MessageSquareWarning, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { demoPatientReply } from "../data";
import type { CopilotOutput, PatientReplyTriageOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";
import { SuggestedCommandButton } from "./suggested-command-button";

export function ReplyTriage({
  commandReplyText,
  model,
  onRunCommand,
  output,
  patientName,
  triageSignal,
}: {
  commandReplyText?: string;
  model: string;
  onRunCommand: (command: string) => void | Promise<void>;
  output: CopilotOutput | null;
  patientName: string;
  triageSignal: number;
}) {
  const t = useClinicText();
  const [replyText, setReplyText] = useState(demoPatientReply);
  const [triage, setTriage] = useState<PatientReplyTriageOutput | null>(null);
  const [isTriaging, setIsTriaging] = useState(false);
  const [error, setError] = useState("");

  const triageReply = useCallback(
    async (replyOverride?: string) => {
      const nextReplyText = (replyOverride ?? replyText).trim();
      if (nextReplyText.length < 3) {
        setError(t("Paste the patient's reply before triage."));
        return;
      }

      setReplyText(nextReplyText);
      setIsTriaging(true);
      setError("");
      try {
        const response = await fetch("/api/reply-triage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName,
            replyText: nextReplyText,
            caseSummary: output?.summary,
            followUpMessage: output?.followUp.message,
            model,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(t(data.error ?? "Reply triage failed."));
        }
        setTriage(data.output as PatientReplyTriageOutput);
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : t("Reply triage failed."),
        );
      } finally {
        setIsTriaging(false);
      }
    },
    [model, output, patientName, replyText, t],
  );

  useEffect(() => {
    if (triageSignal > 0) {
      void triageReply(commandReplyText);
    }
  }, [commandReplyText, triageReply, triageSignal]);

  async function copyText(text: string) {
    await navigator.clipboard.writeText(text);
  }

  return (
    <Card className="border-rose-200">
      <CardHeader>
        <SectionHeading
          icon={<MessageSquareWarning size={18} aria-hidden="true" />}
          title={t("Reply Triage")}
          subtitle={t("AI reviews incoming patient replies after follow-up")}
        />
      </CardHeader>
      <CardContent>
        <Textarea
          aria-label={t("Patient follow-up reply")}
          className="min-h-24"
          value={replyText}
          onChange={(event) => setReplyText(event.target.value)}
        />
        <Button
          className="mt-3 w-full"
          disabled={isTriaging}
          type="button"
          variant="outline"
          onClick={() => void triageReply()}
        >
          <ShieldCheck size={17} aria-hidden="true" />
          {isTriaging ? t("Triaging...") : t("Triage Patient Reply")}
        </Button>

        {triage ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm">{triage.replySummary}</p>
                <Badge className="capitalize" variant="outline">
                  {t(triage.urgency)}
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {triage.clinicianEscalation}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <ReplyList
                items={triage.concerningSignals}
                title={t("Concerning")}
              />
              <ReplyList
                items={triage.reassuringSignals}
                title={t("Reassuring")}
              />
            </div>
            <ReplyList items={triage.staffActions} title={t("Staff actions")} />

            <div className="grid gap-2 md:grid-cols-2">
              <ResponseDraft
                label={t("Bangla response")}
                text={triage.responseBn}
                onCopy={copyText}
              />
              <ResponseDraft
                label={t("English response")}
                text={triage.responseEn}
                onCopy={copyText}
              />
            </div>

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">{t("Suggested commands")}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {triage.suggestedCommands.map((command) => (
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
            {t("Paste a patient reply, or ask the command box to triage it.")}
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ReplyList({ items, title }: { items: string[]; title: string }) {
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

function ResponseDraft({
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
