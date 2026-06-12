import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useClinicText } from "../use-clinic-text";

export type WorkflowStepStatus = "blocked" | "complete" | "idle" | "running";

export type WorkflowStep = {
  id: string;
  label: string;
  detail: string;
  status: WorkflowStepStatus;
};

export type ToastNotice = {
  id: string;
  title: string;
  body: string;
  tone: "error" | "info" | "success" | "warning";
};

export function WorkflowProgress({
  steps,
  toast,
}: {
  steps: WorkflowStep[];
  toast: ToastNotice | null;
}) {
  const t = useClinicText();
  const blockedCount = steps.filter((step) => step.status === "blocked").length;
  const runningStep = steps.find((step) => step.status === "running");
  const completeCount = steps.filter(
    (step) => step.status === "complete",
  ).length;

  return (
    <section className="space-y-3" aria-label={t("Clinic workflow progress")}>
      {toast ? (
        <div
          className={cn(
            "rounded-md border px-4 py-3 shadow-sm",
            toast.tone === "success" && "border-emerald-200 bg-emerald-50",
            toast.tone === "warning" && "border-amber-200 bg-amber-50",
            toast.tone === "error" && "border-red-200 bg-red-50",
            toast.tone === "info" && "border-sky-200 bg-sky-50",
          )}
          role={toast.tone === "error" ? "alert" : "status"}
          aria-live="polite"
        >
          <p className="font-semibold text-sm">{toast.title}</p>
          <p className="mt-1 text-muted-foreground text-xs leading-5">
            {toast.body}
          </p>
        </div>
      ) : null}
      <Card>
        <CardContent className="p-3">
          <details>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3">
              <span className="flex items-center gap-2 font-bold text-sm">
                <StepIcon
                  status={
                    blockedCount ? "blocked" : runningStep ? "running" : "idle"
                  }
                />
                {t("Clinic status")}
              </span>
              <span className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 font-semibold text-emerald-900">
                  {completeCount}/{steps.length} {t("complete")}
                </span>
                <span
                  className={cn(
                    "rounded-full border px-2 py-1 font-semibold",
                    blockedCount
                      ? "border-red-200 bg-red-50 text-red-900"
                      : "border-emerald-200 bg-emerald-50 text-emerald-900",
                  )}
                >
                  {blockedCount
                    ? `${blockedCount} ${t("blocked")}`
                    : t("No hard blocks")}
                </span>
                {runningStep ? (
                  <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 font-semibold text-sky-900">
                    {t("Running")}: {t(runningStep.label)}
                  </span>
                ) : null}
              </span>
            </summary>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
              {steps.map((step) => (
                <div
                  className={cn(
                    "rounded-md border bg-background p-3",
                    step.status === "complete" &&
                      "border-emerald-200 bg-emerald-50",
                    step.status === "running" && "border-sky-200 bg-sky-50",
                    step.status === "blocked" && "border-red-200 bg-red-50",
                  )}
                  key={step.id}
                >
                  <div className="flex items-center gap-2">
                    <StepIcon status={step.status} />
                    <p className="font-semibold text-sm">{t(step.label)}</p>
                  </div>
                  <p className="mt-1 text-muted-foreground text-xs leading-4">
                    {t(step.detail)}
                  </p>
                </div>
              ))}
            </div>
          </details>
        </CardContent>
      </Card>
    </section>
  );
}

function StepIcon({ status }: { status: WorkflowStepStatus }) {
  if (status === "complete") {
    return (
      <CheckCircle2 className="text-emerald-700" size={17} aria-hidden="true" />
    );
  }
  if (status === "running") {
    return (
      <Loader2
        className="animate-spin text-sky-700"
        size={17}
        aria-hidden="true"
      />
    );
  }
  if (status === "blocked") {
    return <XCircle className="text-red-700" size={17} aria-hidden="true" />;
  }
  return (
    <Circle className="text-muted-foreground" size={17} aria-hidden="true" />
  );
}
