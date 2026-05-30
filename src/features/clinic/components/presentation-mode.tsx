import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CopilotOutput } from "../types";

export function PresentationMode({
  caseCount,
  clinicName,
  output,
  onClose,
}: {
  caseCount: number;
  clinicName: string;
  output: CopilotOutput | null;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-[#12332c] p-4 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-[#f2c14e]">{clinicName}</p>
            <h2 className="font-black text-4xl tracking-normal sm:text-6xl">
              Clinic Copilot BD
            </h2>
          </div>
          <Button type="button" variant="secondary" onClick={onClose}>
            <X size={17} aria-hidden="true" />
            Close
          </Button>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-lg bg-white p-6 text-slate-950">
            <p className="font-semibold text-primary text-sm">Winning flow</p>
            <ol className="mt-4 grid gap-3 text-xl">
              <li>1. Capture Bangla-English intake at reception.</li>
              <li>2. AI finds missing questions and urgent red flags.</li>
              <li>3. Clinician reviews and approves the note.</li>
              <li>4. Patient leaves with a plain Bangla handout.</li>
              <li>5. Clinic tracks follow-up and anonymized trends.</li>
            </ol>
          </div>

          <div className="grid gap-4">
            <Stat label="Seeded demo cases" value={caseCount} />
            <Stat
              label="Missing questions found"
              value={output?.missingQuestions.length ?? 4}
            />
            <Stat
              label="Red flags caught"
              value={output?.redFlags.length ?? 1}
            />
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/20 bg-white/10 p-5">
          <p className="font-semibold text-[#f2c14e]">Current case</p>
          <p className="mt-2 font-bold text-3xl">
            {output?.chiefComplaint ?? "Load a scenario to start"}
          </p>
          <p className="mt-3 max-w-3xl text-white/80 leading-7">
            {output?.summary ??
              "Use the command copilot or judge demo scripts to drive the presentation."}
          </p>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-5">
      <p className="font-black text-5xl text-[#f2c14e]">{value}</p>
      <p className="mt-2 text-white/80">{label}</p>
    </div>
  );
}
