"use client";

import { ClipboardCheck, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { teachBackCopy } from "../data";
import type { CopilotOutput } from "../types";
import { SectionHeading } from "./section-heading";

export function TeachBackCheck({ output }: { output: CopilotOutput | null }) {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const essentials = useMemo(() => {
    if (!output) {
      return [];
    }

    return [
      output.patientHandout.plainSummary,
      ...output.patientHandout.careSteps.slice(0, 2),
      ...output.patientHandout.medicineInstructions.slice(0, 2),
      ...output.patientHandout.urgentReturnWarnings.slice(0, 2),
      `Follow-up: ${output.followUp.timing}`,
    ].filter(Boolean);
  }, [output]);

  const progress = Math.round(
    (checkedItems.length / teachBackCopy.checklist.length) * 100,
  );

  function toggleItem(item: string) {
    setCheckedItems((items) =>
      items.includes(item)
        ? items.filter((currentItem) => currentItem !== item)
        : [...items, item],
    );
  }

  return (
    <Card className="border-cyan-200">
      <CardHeader>
        <SectionHeading
          icon={<ClipboardCheck size={18} aria-hidden="true" />}
          title={teachBackCopy.title}
          subtitle={teachBackCopy.subtitle}
        />
      </CardHeader>
      <CardContent>
        {output ? (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-background p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm">
                    {teachBackCopy.scriptTitle}
                  </p>
                  <p className="mt-2 text-muted-foreground text-sm leading-6">
                    {teachBackCopy.script}
                  </p>
                </div>
                <Badge variant={progress === 100 ? "success" : "warning"}>
                  {progress}% {teachBackCopy.progress}
                </Badge>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <TeachBackList
                items={essentials}
                title={teachBackCopy.essentialsTitle}
              />
              <div className="rounded-md bg-[#f7f4ee] p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-xs">
                    {teachBackCopy.checklistTitle}
                  </p>
                  <Button
                    size="sm"
                    type="button"
                    variant="ghost"
                    onClick={() => setCheckedItems([])}
                  >
                    <RotateCcw size={14} aria-hidden="true" />
                    Reset
                  </Button>
                </div>
                <div className="mt-2 space-y-2">
                  {teachBackCopy.checklist.map((item) => (
                    <label
                      className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background p-2 text-xs leading-5"
                      key={item}
                    >
                      <input
                        checked={checkedItems.includes(item)}
                        className="mt-1"
                        type="checkbox"
                        onChange={() => toggleItem(item)}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{teachBackCopy.empty}</p>
        )}
      </CardContent>
    </Card>
  );
}

function TeachBackList({ items, title }: { items: string[]; title: string }) {
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
