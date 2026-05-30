import type { ReactNode } from "react";
import { CardDescription, CardTitle } from "@/components/ui/card";

export function SectionHeading({
  icon,
  title,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white">
        {icon}
      </div>
      <div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </div>
    </div>
  );
}
