import { ShieldCheck } from "lucide-react";

export function SafetyBanner({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <div className="flex gap-3">
        <ShieldCheck className="mt-0.5 shrink-0" size={19} aria-hidden="true" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6">{body}</p>
        </div>
      </div>
    </div>
  );
}
