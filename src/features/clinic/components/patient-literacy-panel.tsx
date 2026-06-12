import { CheckSquare, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CopilotOutput } from "../types";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export type LiteracyMode = "audio" | "pictogram" | "simple_bn" | "teach_back";

export function PatientLiteracyPanel({
  activeMode,
  onModeChange,
  output,
}: {
  activeMode: LiteracyMode;
  onModeChange: (mode: LiteracyMode) => void;
  output: CopilotOutput | null;
}) {
  const t = useClinicText();
  const simpleText = output
    ? simplifyBangla(output.patientHandout.plainSummary)
    : "ড্রাফট তৈরি করলে সহজ বাংলা নির্দেশনা দেখা যাবে।";
  const urgentWarnings = output?.patientHandout.urgentReturnWarnings ?? [];

  function readAloud() {
    if (!("speechSynthesis" in window)) {
      return;
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(new SpeechSynthesisUtterance(simpleText));
  }

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<CheckSquare size={18} aria-hidden="true" />}
          title={t("Patient Literacy Modes")}
          subtitle={t(
            "Simple Bangla, pictograms, audio, and teach-back confirmation",
          )}
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["simple_bn", "Simple Bangla"],
            ["pictogram", "Pictogram"],
            ["audio", "Audio readout"],
            ["teach_back", "Teach-back"],
          ].map(([mode, label]) => (
            <Button
              aria-label={`${t("Switch patient literacy mode to")}: ${t(label)}`}
              className={cn(
                "h-auto px-2 py-2 text-xs",
                activeMode === mode && "ring-2 ring-primary",
              )}
              key={mode}
              type="button"
              variant={activeMode === mode ? "default" : "outline"}
              onClick={() => onModeChange(mode as LiteracyMode)}
            >
              {t(label)}
            </Button>
          ))}
        </div>

        <div className="mt-3 rounded-md bg-[#f7f4ee] p-3">
          {activeMode === "simple_bn" ? (
            <p className="text-sm leading-7">{simpleText}</p>
          ) : null}
          {activeMode === "pictogram" ? (
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {[
                ["💧", "পানি/তরল"],
                ["💊", "ডাক্তার বলা ওষুধ"],
                ["📞", "ফলো-আপ"],
                ["⚠", "বিপদ চিহ্ন"],
                ["🧾", "প্রিন্ট স্লিপ"],
                ["👨‍👩‍👧", "পরিবার বুঝেছে"],
              ].map(([symbol, label]) => (
                <div
                  className="rounded-md border border-border bg-background p-2"
                  key={label}
                >
                  <div className="text-2xl" aria-hidden="true">
                    {symbol}
                  </div>
                  <p className="mt-1 font-semibold">{label}</p>
                </div>
              ))}
            </div>
          ) : null}
          {activeMode === "audio" ? (
            <div>
              <Button type="button" onClick={readAloud}>
                <Volume2 size={16} aria-hidden="true" />
                {t("Read patient instructions aloud")}
              </Button>
              <p className="mt-2 text-muted-foreground text-xs leading-5">
                {t(
                  "Uses the device speech engine when available; staff should still review wording.",
                )}
              </p>
            </div>
          ) : null}
          {activeMode === "teach_back" ? (
            <div className="space-y-2 text-sm">
              <p className="font-semibold">
                {t("Family must repeat before leaving:")}
              </p>
              <label className="flex gap-2">
                <input type="checkbox" />{" "}
                {t("What care steps will happen at home.")}
              </label>
              <label className="flex gap-2">
                <input type="checkbox" />{" "}
                {t("When and how follow-up will happen.")}
              </label>
              <label className="flex gap-2">
                <input type="checkbox" />{" "}
                {t("Which danger signs require urgent return.")}
              </label>
              {urgentWarnings.length ? (
                <p className="text-muted-foreground text-xs">
                  {t("Key warning")}: {urgentWarnings[0]}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function simplifyBangla(text: string) {
  return text
    .replace(/clinician|doctor/gi, "ডাক্তার")
    .replace(/follow-up/gi, "ফলো-আপ")
    .slice(0, 420);
}
