"use client";

import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CommandPlan } from "../types";

export function CommandPlanPreview({
  command,
  isRunning,
  plan,
  state,
  onRunPlan,
}: {
  command: string;
  isRunning: boolean;
  plan: CommandPlan;
  state: "preview" | "running" | "completed";
  onRunPlan: () => void | Promise<void>;
}) {
  return (
    <div className="mt-3 rounded-md border border-border bg-[#f7f4ee] p-3 text-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{plan.summary}</p>
            <Badge className="capitalize" variant="outline">
              {state}
            </Badge>
          </div>
          {command ? (
            <p className="mt-1 text-muted-foreground text-xs">
              Command: {command}
            </p>
          ) : null}
        </div>
        <Button
          disabled={isRunning || plan.actions.length === 0}
          size="sm"
          type="button"
          onClick={() => void onRunPlan()}
        >
          <PlayCircle size={15} aria-hidden="true" />
          Run Plan
        </Button>
      </div>
      <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        {plan.actions.map((action, index) => (
          <div
            className="rounded-md border border-border bg-background p-2"
            key={`${action.type}-${index}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs">
                {index + 1}
              </span>
              <p className="font-semibold text-xs">
                {describeAction(action.type)}
              </p>
            </div>
            <p className="mt-1 text-muted-foreground text-xs leading-5">
              {actionDetail(action)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function describeAction(type: string) {
  const labels: Record<string, string> = {
    answer_patient_question: "Answer patient question",
    approve_case: "Save clinician approval",
    ask_case_assistant: "Ask case assistant",
    check_approval_readiness: "Check approval readiness",
    check_medicine: "Check medicine safety",
    cleanup_intake: "Clean intake",
    close_visit: "Prepare visit closeout",
    compose_briefing: "Brief clinic queue",
    compose_followup: "Compose follow-up",
    compose_handoff: "Create staff handoff",
    compose_referral: "Write paperwork",
    edit_draft: "Edit draft",
    extract_document: "Extract document text",
    fill_intake: "Fill intake",
    filter_cases: "Filter cases",
    generate_draft: "Generate clinical draft",
    load_scenario: "Load scenario",
    plan_next_steps: "Plan next steps",
    presentation_mode: "Toggle presentation",
    print_handout: "Print handout",
    reset_workspace: "Reset workspace",
    run_full_workflow: "Run full workflow",
    run_judge_demo: "Run judge demo",
    schedule_followup: "Schedule follow-up",
    search_cases: "Search cases",
    select_case: "Select case",
    set_model: "Switch model",
    set_status: "Move case status",
    switch_language: "Switch language",
    triage_reply: "Triage patient reply",
    undo_last_command: "Undo last command",
  };

  return labels[type] ?? type.replaceAll("_", " ");
}

function actionDetail(action: CommandPlan["actions"][number]) {
  if (action.type === "fill_intake") {
    return action.patientName
      ? `Adds intake details for ${action.patientName}.`
      : "Adds the typed text to the intake form.";
  }
  if (action.type === "load_scenario") {
    return `Loads ${action.scenarioLabel} demo data.`;
  }
  if (action.type === "check_medicine") {
    return action.medicines
      ? `Checks: ${action.medicines}`
      : "Uses the current or demo medicine list.";
  }
  if (action.type === "ask_case_assistant") {
    return action.question
      ? `Asks: ${truncateText(action.question)}`
      : "Asks the selected-case assistant.";
  }
  if (action.type === "explain_risk" && action.instruction) {
    return `Explains with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "compose_handoff" && action.instruction) {
    return `Creates handoff with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "plan_next_steps" && action.instruction) {
    return `Plans next steps with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "check_approval_readiness" && action.instruction) {
    return `Checks approval with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "schedule_followup" && action.instruction) {
    return `Schedules follow-up with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "close_visit" && action.instruction) {
    return `Closes visit with focus: ${truncateText(action.instruction)}`;
  }
  if (action.type === "set_status") {
    return `Moves the selected case to ${action.status}.`;
  }
  if (action.type === "switch_language") {
    return `Changes UI language to ${action.language}.`;
  }
  if (action.type === "presentation_mode") {
    return action.enabled
      ? "Opens judge presentation view."
      : "Closes presentation view.";
  }
  if (action.type === "search_cases") {
    return `Searches the queue for ${action.query}.`;
  }
  if (action.type === "filter_cases") {
    return `Filters by ${action.severity ?? "any"} priority and ${action.status ?? "any"} status.`;
  }
  if (action.type === "select_case") {
    return `Selects the case matching ${action.patientName}.`;
  }
  if (action.type === "set_model") {
    return `Uses ${action.model} for AI calls.`;
  }
  if (action.type === "reset_workspace") {
    return `Clears ${action.scope}.`;
  }
  if (action.type === "run_judge_demo" || action.type === "run_full_workflow") {
    return action.scenarioLabel
      ? `Starts from ${action.scenarioLabel}.`
      : "Starts the default winning demo scenario.";
  }
  if (action.type === "compose_followup") {
    return action.instruction
      ? `Drafts a ${action.channel} message: ${truncateText(action.instruction)}`
      : `Drafts a ${action.channel} message.`;
  }
  if (action.type === "edit_draft") {
    return action.instruction;
  }
  if (action.type === "compose_referral") {
    return action.instruction
      ? `Creates a ${action.documentType.replace("_", " ")} draft: ${truncateText(action.instruction)}`
      : `Creates a ${action.documentType.replace("_", " ")} draft.`;
  }
  if (action.type === "extract_document" && action.documentText) {
    return `Extracts: ${truncateText(action.documentText)}`;
  }
  if (action.type === "triage_reply" && action.replyText) {
    return `Triages: ${truncateText(action.replyText)}`;
  }
  if (action.type === "answer_patient_question" && action.question) {
    return `Answers: ${truncateText(action.question)}`;
  }
  if (action.type === "undo_last_command") {
    return "Restores the previous local workspace state.";
  }

  return "Runs a safe AI-assisted clinic workflow step.";
}

function truncateText(text: string) {
  return text.length > 90 ? `${text.slice(0, 87)}...` : text;
}
