"use client";

import { Copy, FileText, Printer } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { CopilotOutput, ReferralOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function ReferralComposer({
  composeSignal,
  documentType,
  model,
  output,
  patientName,
}: {
  composeSignal: number;
  documentType: "referral" | "visit_summary";
  model: string;
  output: CopilotOutput | null;
  patientName: string;
}) {
  const [activeType, setActiveType] = useState(documentType);
  const [document, setDocument] = useState<ReferralOutput | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setActiveType(documentType);
  }, [documentType]);

  const documentText = useMemo(() => {
    if (!document) {
      return "";
    }

    return [
      document.title,
      `Patient: ${patientName}`,
      `Recipient: ${document.recipient}`,
      `Urgency: ${document.urgency}`,
      "",
      "Reason",
      document.reason,
      "",
      "Clinical summary",
      document.clinicalSummary,
      "",
      "Key findings",
      ...document.keyFindings.map((item) => `- ${item}`),
      "",
      "Red flags",
      ...document.redFlags.map((item) => `- ${item}`),
      "",
      "Requested action",
      document.requestedAction,
      "",
      "Patient instructions",
      document.patientInstructions,
      "",
      "Clinician checklist",
      ...document.clinicianChecklist.map((item) => `- ${item}`),
    ].join("\n");
  }, [document, patientName]);

  const composeDocument = useCallback(
    async (nextType = activeType) => {
      if (!output) {
        setError("Generate or select a case before creating paperwork.");
        return;
      }

      setActiveType(nextType);
      setIsGenerating(true);
      setError("");
      try {
        const response = await fetch("/api/referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            patientName,
            documentType: nextType,
            caseSummary: output.summary,
            redFlags: output.redFlags,
            missingQuestions: output.missingQuestions,
            followUp: output.followUp.message,
            model,
          }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Paperwork generation failed.");
        }
        setDocument(data.output as ReferralOutput);
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Paperwork generation failed.",
        );
      } finally {
        setIsGenerating(false);
      }
    },
    [activeType, model, output, patientName],
  );

  useEffect(() => {
    if (composeSignal > 0) {
      void composeDocument(documentType);
    }
  }, [composeDocument, composeSignal, documentType]);

  async function copyDocument() {
    if (!documentText) {
      return;
    }
    await navigator.clipboard.writeText(documentText);
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<FileText size={18} aria-hidden="true" />}
          title="Referral Writer"
          subtitle="Clinician-reviewable referral or visit summary"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {(["referral", "visit_summary"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={activeType === option ? "default" : "outline"}
              onClick={() => setActiveType(option)}
            >
              {option === "referral" ? "Referral" : "Visit summary"}
            </Button>
          ))}
        </div>

        <Button
          className="mt-3 w-full"
          disabled={isGenerating || !output}
          type="button"
          onClick={() => void composeDocument()}
        >
          <FileText size={17} aria-hidden="true" />
          {isGenerating ? "Writing..." : "Write Paperwork"}
        </Button>

        {document ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <p className="font-semibold">{document.title}</p>
              <p className="mt-1 text-muted-foreground text-xs">
                {document.recipient} · {document.urgency} urgency
              </p>
            </div>
            <Textarea
              aria-label="Referral or visit summary"
              className="min-h-64 font-mono text-xs"
              value={documentText}
              readOnly
            />
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={copyDocument}>
                <Copy size={16} aria-hidden="true" />
                Copy
              </Button>
              <Button type="button" onClick={() => window.print()}>
                <Printer size={16} aria-hidden="true" />
                Print
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            Generate a draft, then ask for a referral or family visit summary.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
