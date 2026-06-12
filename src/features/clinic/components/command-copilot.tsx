"use client";

import {
  Bot,
  CheckCircle2,
  CornerDownLeft,
  Eye,
  History,
  Wand2,
} from "lucide-react";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { commandExamples, commandPlaybook } from "../data";
import type { CommandHistoryEntry, CommandPlan } from "../types";
import { useClinicText } from "../use-clinic-text";
import { CommandPlanPreview } from "./command-plan-preview";
import { SectionHeading } from "./section-heading";

type CommandCopilotProps = {
  history: CommandHistoryEntry[];
  model: string;
  onCommandComplete: (entry: CommandHistoryEntry) => void;
  onApplyPlan: (plan: CommandPlan) => void | Promise<void>;
};

type ApiErrorPayload = {
  detail?: string;
  error?: string;
  provider?: string;
};

function formatApiError(data: ApiErrorPayload, fallback: string) {
  const parts = [data.error ?? fallback];
  if (data.provider) {
    parts.push(`Provider: ${data.provider}`);
  }
  if (data.detail) {
    parts.push(`Detail: ${data.detail}`);
  }
  return parts.join(" ");
}

export const CommandCopilot = forwardRef<HTMLInputElement, CommandCopilotProps>(
  function CommandCopilot(
    { history, model, onApplyPlan, onCommandComplete },
    ref,
  ) {
    const [command, setCommand] = useState(
      "Load dengue watch and generate a draft",
    );
    const [lastPlan, setLastPlan] = useState<CommandPlan | null>(null);
    const [lastPlanCommand, setLastPlanCommand] = useState("");
    const [lastPlanMode, setLastPlanMode] =
      useState<CommandHistoryEntry["mode"]>("live");
    const [lastPlanState, setLastPlanState] = useState<
      "preview" | "running" | "completed"
    >("preview");
    const [isRunning, setIsRunning] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [error, setError] = useState("");
    const t = useClinicText();

    async function buildPlan(commandOverride = command) {
      const nextCommand = commandOverride.trim();
      if (!nextCommand) {
        setError(t("Type a command first."));
        return null;
      }

      setError("");
      setCommand(nextCommand);
      const response = await fetch("/api/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nextCommand, model }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(formatApiError(data, t("Command failed.")));
      }
      return {
        command: nextCommand,
        mode: data.mode ?? "live",
        plan: data.output as CommandPlan,
      };
    }

    async function previewCommand(commandOverride = command) {
      setIsPreviewing(true);
      try {
        const planned = await buildPlan(commandOverride);
        if (!planned) {
          return;
        }
        setLastPlan(planned.plan);
        setLastPlanCommand(planned.command);
        setLastPlanMode(planned.mode);
        setLastPlanState("preview");
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : t("Preview failed."),
        );
      } finally {
        setIsPreviewing(false);
      }
    }

    async function runPlannedCommand() {
      if (!lastPlan) {
        await runCommand();
        return;
      }

      setIsRunning(true);
      setError("");
      setLastPlanState("running");
      try {
        await onApplyPlan(lastPlan);
        setLastPlanState("completed");
        onCommandComplete({
          id: crypto.randomUUID(),
          command: lastPlanCommand || command,
          summary: lastPlan.summary,
          actions: lastPlan.actions.map((action) => action.type),
          mode: lastPlanMode,
          createdAt: Date.now(),
        });
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : t("Command failed."),
        );
      } finally {
        setIsRunning(false);
      }
    }

    async function runCommand(commandOverride = command) {
      setIsRunning(true);
      setError("");
      try {
        const planned = await buildPlan(commandOverride);
        if (!planned) {
          return;
        }
        setLastPlan(planned.plan);
        setLastPlanCommand(planned.command);
        setLastPlanMode(planned.mode);
        setLastPlanState("running");
        await onApplyPlan(planned.plan);
        setLastPlanState("completed");
        onCommandComplete({
          id: crypto.randomUUID(),
          command: planned.command,
          summary: planned.plan.summary,
          actions: planned.plan.actions.map((action) => action.type),
          mode: planned.mode,
          createdAt: Date.now(),
        });
      } catch (caught) {
        setError(
          caught instanceof Error ? caught.message : t("Command failed."),
        );
      } finally {
        setIsRunning(false);
      }
    }

    return (
      <Card className="border-primary/30">
        <CardHeader>
          <SectionHeading
            icon={<Bot size={18} aria-hidden="true" />}
            title={t("Command Copilot")}
            subtitle={t("Type your way through the clinic workflow")}
          />
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 lg:grid-cols-[1fr_auto_auto]">
            <Input
              aria-label={t("Command Copilot input")}
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
              disabled={isPreviewing || isRunning}
              variant="outline"
              onClick={() => void previewCommand()}
            >
              <Eye size={17} aria-hidden="true" />
              {isPreviewing ? t("Previewing...") : t("Preview")}
            </Button>
            <Button
              type="button"
              disabled={isRunning}
              onClick={() => void runCommand()}
            >
              <CornerDownLeft size={17} aria-hidden="true" />
              {t("Run")}
            </Button>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-4">
            {commandPlaybook.map((group) => (
              <div
                className="rounded-md border border-border bg-[#f7f4ee] p-2"
                key={group.label}
              >
                <p className="font-semibold text-xs">{t(group.label)}</p>
                <p className="mt-1 text-[0.72rem] text-muted-foreground">
                  {group.examples.map((example) => t(example)).join(" · ")}
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
                {t(example)}
              </Button>
            ))}
          </div>

          {lastPlan ? (
            <CommandPlanPreview
              command={lastPlanCommand}
              isRunning={isRunning}
              plan={lastPlan}
              state={lastPlanState}
              onRunPlan={runPlannedCommand}
            />
          ) : null}
          {error ? (
            <p className="mt-3 text-destructive text-sm">{error}</p>
          ) : null}
          {history.length > 0 ? (
            <div className="mt-3 border-border border-t pt-3">
              <div className="mb-2 flex items-center gap-2 font-semibold text-sm">
                <History size={15} aria-hidden="true" />
                {t("Recent command trail")}
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
                    <span className="mt-2 flex items-center gap-1 text-primary text-xs">
                      <CheckCircle2 size={13} aria-hidden="true" />
                      {t("Run again")}
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
