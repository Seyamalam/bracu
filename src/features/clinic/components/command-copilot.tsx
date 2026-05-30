"use client";

import { Bot, CornerDownLeft, History, Wand2 } from "lucide-react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { commandExamples, commandPlaybook } from "../data";
import type { CommandHistoryEntry, CommandPlan } from "../types";
import { SectionHeading } from "./section-heading";

type CommandCopilotProps = {
  history: CommandHistoryEntry[];
  model: string;
  onCommandComplete: (entry: CommandHistoryEntry) => void;
  onApplyPlan: (plan: CommandPlan) => void | Promise<void>;
};

export const CommandCopilot = forwardRef<HTMLInputElement, CommandCopilotProps>(
  function CommandCopilot(
    { history, model, onApplyPlan, onCommandComplete },
    ref,
  ) {
    const [command, setCommand] = useState(
      "Load dengue watch and generate a draft",
    );
    const [lastPlan, setLastPlan] = useState<CommandPlan | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [error, setError] = useState("");

    async function runCommand(commandOverride = command) {
      const nextCommand = commandOverride.trim();
      if (!nextCommand) {
        setError("Type a command first.");
        return;
      }

      setIsRunning(true);
      setError("");
      setCommand(nextCommand);
      try {
        const response = await fetch("/api/command", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: nextCommand, model }),
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error ?? "Command failed.");
        }
        const plan = data.output as CommandPlan;
        setLastPlan(plan);
        await onApplyPlan(plan);
        onCommandComplete({
          id: crypto.randomUUID(),
          command: nextCommand,
          summary: plan.summary,
          actions: plan.actions.map((action) => action.type),
          mode: data.mode ?? "live",
          createdAt: Date.now(),
        });
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
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <Input
              aria-label="Command Copilot input"
              ref={ref}
              value={command}
              onChange={(event) => setCommand(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void runCommand();
                }
              }}
            />
            <Button
              type="button"
              disabled={isRunning}
              onClick={() => void runCommand()}
            >
              <CornerDownLeft size={17} aria-hidden="true" />
              Run
            </Button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {commandPlaybook.map((group) => (
              <div
                className="rounded-md border border-border bg-[#f7f4ee] p-2"
                key={group.label}
              >
                <p className="font-semibold text-xs">{group.label}</p>
                <p className="mt-1 text-[0.72rem] text-muted-foreground">
                  {group.examples.join(" · ")}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {commandExamples.map((example) => (
              <Button
                className="h-auto px-2 py-1 text-xs"
                disabled={isRunning}
                key={example}
                type="button"
                variant="outline"
                onClick={() => void runCommand(example)}
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
          {history.length > 0 ? (
            <div className="mt-3 border-border border-t pt-3">
              <div className="mb-2 flex items-center gap-2 font-semibold text-sm">
                <History size={15} aria-hidden="true" />
                Recent command trail
              </div>
              <div className="grid gap-2">
                {history.slice(0, 3).map((entry) => (
                  <button
                    className="rounded-md border border-border bg-background px-3 py-2 text-left transition hover:border-primary"
                    disabled={isRunning}
                    key={entry.id}
                    type="button"
                    onClick={() => void runCommand(entry.command)}
                  >
                    <span className="block font-semibold text-sm">
                      {entry.command}
                    </span>
                    <span className="mt-1 block text-muted-foreground text-xs">
                      {entry.mode} · {entry.actions.join(", ")}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    );
  },
);
