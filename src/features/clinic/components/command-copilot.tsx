"use client";

import { Bot, CornerDownLeft, Wand2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { commandExamples } from "../data";
import type { CommandPlan } from "../types";
import { SectionHeading } from "./section-heading";

export function CommandCopilot({
  model,
  onApplyPlan,
}: {
  model: string;
  onApplyPlan: (plan: CommandPlan) => void | Promise<void>;
}) {
  const [command, setCommand] = useState(
    "Load dengue watch and generate a draft",
  );
  const [lastPlan, setLastPlan] = useState<CommandPlan | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  async function runCommand() {
    setIsRunning(true);
    setError("");
    try {
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, model }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error ?? "Command failed.");
      }
      const plan = data.output as CommandPlan;
      setLastPlan(plan);
      await onApplyPlan(plan);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Command failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <SectionHeading
          icon={<Bot size={18} aria-hidden="true" />}
          title="Command Copilot"
          subtitle="Type your way through the clinic workflow"
        />
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            aria-label="Command Copilot input"
            value={command}
            onChange={(event) => setCommand(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void runCommand();
              }
            }}
          />
          <Button type="button" disabled={isRunning} onClick={runCommand}>
            <CornerDownLeft size={17} aria-hidden="true" />
            Run
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {commandExamples.map((example) => (
            <Button
              className="h-auto px-2 py-1 text-xs"
              key={example}
              type="button"
              variant="outline"
              onClick={() => setCommand(example)}
            >
              <Wand2 size={13} aria-hidden="true" />
              {example}
            </Button>
          ))}
        </div>

        {lastPlan ? (
          <div className="mt-3 rounded-md bg-[#f7f4ee] p-3 text-sm">
            <p className="font-semibold">{lastPlan.summary}</p>
            <p className="mt-1 text-muted-foreground">
              Actions:{" "}
              {lastPlan.actions.map((action) => action.type).join(", ")}
            </p>
          </div>
        ) : null}
        {error ? (
          <p className="mt-3 text-destructive text-sm">{error}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
