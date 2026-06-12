import { CornerDownLeft, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useClinicText } from "@/features/clinic/use-clinic-text";
import { cn } from "@/lib/utils";

export function Agent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const t = useClinicText();
  return (
    <section
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-background shadow-sm",
        className,
      )}
      aria-label={t("AI agent workspace")}
    >
      {children}
    </section>
  );
}

export function AgentHeader({
  detail,
  name,
  model,
  status,
}: {
  detail?: ReactNode;
  name: string;
  model: string;
  status: string;
}) {
  const t = useClinicText();
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-border border-b bg-[#fbfaf6] p-4">
      <div>
        <p className="font-black text-lg">{name}</p>
        <p className="mt-1 text-muted-foreground text-xs">
          {detail ?? t("Agentic clinic operating layer")}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{model}</Badge>
        <Badge variant="secondary">{status}</Badge>
      </div>
    </div>
  );
}

export function AgentContent({ children }: { children: ReactNode }) {
  return <div className="space-y-3 p-4">{children}</div>;
}

export function PromptInput({
  disabled = false,
  onChange,
  onSubmit,
  placeholder,
  value,
}: {
  disabled?: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (value?: string) => void;
  placeholder: string;
}) {
  const t = useClinicText();
  return (
    <form
      className="grid gap-2 rounded-lg border border-border bg-white p-2 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto]"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const input = form.elements.namedItem("agent-command");
        const value =
          input instanceof HTMLTextAreaElement ? input.value : undefined;
        onSubmit(value);
      }}
    >
      <textarea
        aria-label={t("Agent command")}
        name="agent-command"
        className="min-h-24 resize-none rounded-md border-0 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-0"
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <Button
        className="h-full min-h-12 self-stretch"
        disabled={disabled}
        type="submit"
      >
        {disabled ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          <CornerDownLeft size={16} aria-hidden="true" />
        )}
        {disabled ? t("Running") : t("Run agent")}
      </Button>
    </form>
  );
}

export function Reasoning({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <details className="rounded-md border border-sky-200 bg-sky-50 p-3" open>
      <summary className="cursor-pointer font-semibold text-sm">
        {title}
      </summary>
      <div className="mt-2 text-muted-foreground text-xs leading-5">
        {children}
      </div>
    </details>
  );
}

export function Plan({ steps }: { steps: string[] }) {
  return (
    <ol className="grid gap-2 md:grid-cols-3">
      {steps.map((step, index) => (
        <li className="rounded-md border border-border bg-white p-3" key={step}>
          <Badge variant="outline">{index + 1}</Badge>
          <p className="mt-2 font-semibold text-sm">{step}</p>
        </li>
      ))}
    </ol>
  );
}

export function ToolCard({
  command,
  description,
  displayCommand,
  label,
  onRun,
  tone = "neutral",
}: {
  command: string;
  description: string;
  displayCommand?: string;
  label: string;
  onRun: (command: string) => void;
  tone?: "danger" | "neutral" | "success";
}) {
  const t = useClinicText();
  return (
    <button
      aria-label={`${t("Run agent tool")}: ${label}`}
      className={cn(
        "rounded-md border border-border bg-background p-3 text-left transition hover:border-primary hover:bg-[#eaf6f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        tone === "danger" && "border-red-200 bg-red-50",
        tone === "success" && "border-emerald-200 bg-emerald-50",
      )}
      type="button"
      onClick={() => onRun(command)}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="font-semibold text-sm">{label}</p>
        <Badge variant="outline">{t("tool")}</Badge>
      </div>
      <p className="mt-2 text-muted-foreground text-xs leading-5">
        {description}
      </p>
      <code className="mt-2 block truncate rounded bg-slate-950 px-2 py-1 text-[0.68rem] text-white">
        {displayCommand ?? command}
      </code>
    </button>
  );
}

export function TaskQueue({
  items,
  onRun,
}: {
  items: { command: string; label: string; owner: string; priority: string }[];
  onRun: (command: string) => void;
}) {
  const t = useClinicText();
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          className="grid gap-2 rounded-md border border-border bg-background p-3 sm:grid-cols-[1fr_auto]"
          key={item.command}
        >
          <div>
            <p className="font-semibold text-sm">{item.label}</p>
            <p className="mt-1 text-muted-foreground text-xs">
              {item.owner} · {item.priority}
            </p>
          </div>
          <Button
            aria-label={`${t("Run queued agent task")}: ${item.label}`}
            size="sm"
            type="button"
            variant="outline"
            onClick={() => onRun(item.command)}
          >
            {t("Run")}
          </Button>
        </div>
      ))}
    </div>
  );
}

export function Message({
  children,
  from,
  meta,
}: {
  from: "agent" | "clinic";
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3 text-sm leading-6",
        from === "agent"
          ? "border-primary/20 bg-[#eaf6f1]"
          : "border-border bg-background",
      )}
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <p className="font-semibold text-xs uppercase tracking-normal">
          {from}
        </p>
        {meta ? (
          <span className="text-muted-foreground text-xs">{meta}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Suggestion({
  children,
  command,
  onRun,
}: {
  children: ReactNode;
  command: string;
  onRun: (command: string) => void;
}) {
  return (
    <Button
      className="h-auto justify-start px-3 py-2 text-left text-xs"
      type="button"
      variant="outline"
      onClick={() => onRun(command)}
    >
      {children}
    </Button>
  );
}
