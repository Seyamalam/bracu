"use client";

import { ClipboardCopy, FileText, ScanText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { DocumentExtractionOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function DocumentExtractor({
  documentText,
  extractSignal,
  model,
  onApplyAddendum,
}: {
  documentText: string;
  extractSignal: number;
  model: string;
  onApplyAddendum: (addendum: string) => void;
}) {
  const [extraction, setExtraction] = useState<DocumentExtractionOutput | null>(
    null,
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const extractDocument = useCallback(async () => {
    if (documentText.trim().length < 8) {
      setError("Paste or attach lab, prescription, or OCR text first.");
      return;
    }

    setIsExtracting(true);
    setError("");
    try {
      const response = await fetch("/api/document-extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          model,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Document extraction failed.");
      }
      setExtraction(data.output as DocumentExtractionOutput);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Document extraction failed.",
      );
    } finally {
      setIsExtracting(false);
    }
  }, [documentText, model]);

  useEffect(() => {
    if (extractSignal > 0) {
      void extractDocument();
    }
  }, [extractDocument, extractSignal]);

  async function copyCommand(command: string) {
    await navigator.clipboard.writeText(command);
  }

  return (
    <Card className="border-indigo-200">
      <CardHeader>
        <SectionHeading
          icon={<ScanText size={18} aria-hidden="true" />}
          title="Document Extractor"
          subtitle="AI parses lab, prescription, and OCR text into case facts"
        />
      </CardHeader>
      <CardContent>
        <Button
          className="w-full"
          disabled={isExtracting}
          type="button"
          variant="outline"
          onClick={() => void extractDocument()}
        >
          <FileText size={17} aria-hidden="true" />
          {isExtracting ? "Extracting..." : "Extract Document Text"}
        </Button>

        {extraction ? (
          <div className="mt-3 space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold text-sm capitalize">
                  {extraction.documentType.replace("_", " ")}
                </p>
                <Badge className="capitalize" variant="outline">
                  {extraction.confidence} confidence
                </Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {extraction.intakeAddendum}
              </p>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <ExtractionList
                items={extraction.extractedVitals}
                title="Vitals"
              />
              <ExtractionList items={extraction.extractedLabs} title="Labs" />
              <ExtractionList
                items={extraction.extractedMedicines}
                title="Medicines"
              />
              <ExtractionList
                items={extraction.possibleSafetyIssues}
                title="Safety issues"
              />
            </div>
            <ExtractionList
              items={extraction.missingClarifications}
              title="Clarify"
            />

            <div className="rounded-md bg-[#f7f4ee] p-3">
              <p className="font-semibold text-xs">Suggested commands</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {extraction.suggestedCommands.map((command) => (
                  <Button
                    className="h-auto min-h-9 whitespace-normal px-2 py-1 text-left text-xs"
                    key={command}
                    type="button"
                    variant="secondary"
                    onClick={() => void copyCommand(command)}
                  >
                    <ClipboardCopy size={14} aria-hidden="true" />
                    {command}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              className="w-full"
              type="button"
              variant="outline"
              onClick={() => onApplyAddendum(extraction.intakeAddendum)}
            >
              Apply addendum to intake
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-muted-foreground text-sm">
            Attach or paste report text, then ask the command box to extract it.
          </p>
        )}

        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ExtractionList({ items, title }: { items: string[]; title: string }) {
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
