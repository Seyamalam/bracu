import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  return (
    <section className="space-y-3" aria-label="Clinic workflow progress">
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
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
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
                  <p className="font-semibold text-sm">{step.label}</p>
                </div>
                <p className="mt-1 text-muted-foreground text-xs leading-4">
                  {step.detail}
                </p>
              </div>
            ))}
          </div>
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
