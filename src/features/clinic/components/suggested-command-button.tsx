"use client";

import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SuggestedCommandButton({
  command,
  onRunCommand,
}: {
  command: string;
  onRunCommand: (command: string) => void | Promise<void>;
}) {
  return (
    <Button
      className="h-auto min-h-9 whitespace-normal px-2 py-1 text-left text-xs"
      type="button"
      variant="secondary"
      onClick={() => void onRunCommand(command)}
    >
      <Wand2 size={14} aria-hidden="true" />
      {command}
    </Button>
  );
}
