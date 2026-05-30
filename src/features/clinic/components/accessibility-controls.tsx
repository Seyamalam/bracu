"use client";

import { Contrast, Eye, PauseCircle, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { accessibilityControlCopy } from "../data";
import { SectionHeading } from "./section-heading";

export type AccessibilitySettings = {
  calmMotion: boolean;
  highContrast: boolean;
  largeText: boolean;
};

export function AccessibilityControls({
  settings,
  onChange,
}: {
  settings: AccessibilitySettings;
  onChange: (settings: AccessibilitySettings) => void;
}) {
  const controls = [
    {
      key: "largeText",
      icon: Type,
      label: accessibilityControlCopy.largeText,
    },
    {
      key: "highContrast",
      icon: Contrast,
      label: accessibilityControlCopy.highContrast,
    },
    {
      key: "calmMotion",
      icon: PauseCircle,
      label: accessibilityControlCopy.calmMotion,
    },
  ] satisfies Array<{
    key: keyof AccessibilitySettings;
    icon: typeof Type;
    label: string;
  }>;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Eye size={18} aria-hidden="true" />}
          title={accessibilityControlCopy.title}
          subtitle={accessibilityControlCopy.subtitle}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {controls.map((control) => {
            const Icon = control.icon;
            const enabled = settings[control.key];

            return (
              <Button
                aria-pressed={enabled}
                className={cn(
                  "h-auto min-h-11 justify-start px-3 py-2 text-left",
                  enabled &&
                    "border-primary bg-primary text-primary-foreground",
                )}
                key={control.key}
                type="button"
                variant="outline"
                onClick={() =>
                  onChange({
                    ...settings,
                    [control.key]: !enabled,
                  })
                }
              >
                <Icon size={17} aria-hidden="true" />
                <span>{control.label}</span>
              </Button>
            );
          })}
        </div>
        <p className="mt-3 rounded-md bg-[#f7f4ee] p-3 text-muted-foreground text-xs leading-5">
          {accessibilityControlCopy.proof}
        </p>
      </CardContent>
    </Card>
  );
}
