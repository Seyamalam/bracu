import { Keyboard } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

const shortcuts = [
  ["⌘/Ctrl K", "Focus Command Copilot"],
  ["⌘/Ctrl G", "Generate draft"],
  ["⌘/Ctrl P", "Presentation mode"],
  ["Esc", "Close presentation mode"],
];

export function ShortcutHelp() {
  const t = useClinicText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<Keyboard size={18} aria-hidden="true" />}
          title={t("Fast Demo Keys")}
          subtitle={t("Keyboard-first clinic operation")}
        />
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          {shortcuts.map(([keys, label]) => (
            <div className="flex items-center justify-between gap-2" key={keys}>
              <kbd className="rounded border border-border bg-background px-2 py-1 font-semibold text-xs">
                {keys}
              </kbd>
              <span className="text-muted-foreground text-xs">{t(label)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
