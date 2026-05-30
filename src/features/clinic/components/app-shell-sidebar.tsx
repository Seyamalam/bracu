"use client";

import {
  Activity,
  ClipboardList,
  Home,
  LogOut,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/features/marketing/components/brand-mark";

const workspaceNav = [
  { href: "#clinic-overview", icon: Home, label: "Overview" },
  { href: "#intake", icon: ClipboardList, label: "Intake" },
  { href: "#clinical-review", icon: ShieldCheck, label: "Review" },
  { href: "#patient-comms", icon: Printer, label: "Patient" },
  { href: "#operations", icon: Activity, label: "Ops" },
] as const;

export function AppShellSidebar({
  clinicName,
  role,
  onLogout,
}: {
  clinicName: string;
  onLogout: () => void;
  role: string;
}) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-slate-200 border-r bg-white lg:flex lg:flex-col">
        <div className="border-slate-200 border-b p-5">
          <BrandMark />
          <div className="mt-5 rounded-md bg-[#eaf6f1] p-3">
            <p className="font-semibold text-primary text-sm">{clinicName}</p>
            <p className="mt-1 text-muted-foreground text-xs capitalize">
              {role} workspace
            </p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3" aria-label="Workspace">
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                className="flex items-center gap-3 rounded-md px-3 py-2.5 font-semibold text-sm transition hover:bg-[#eaf6f1]"
                href={item.href}
                key={item.href}
              >
                <Icon className="text-primary" size={18} aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>
        <div className="border-slate-200 border-t p-3">
          <Button
            className="w-full justify-start"
            type="button"
            variant="outline"
            onClick={onLogout}
          >
            <LogOut size={17} aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </aside>

      <div className="border-slate-200 border-b bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandMark compact />
          <Button size="sm" type="button" variant="outline" onClick={onLogout}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </Button>
        </div>
        <nav
          className="mt-3 flex gap-2 overflow-x-auto pb-1"
          aria-label="Workspace"
        >
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            return (
              <a
                className="flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold text-xs"
                href={item.href}
                key={item.href}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </a>
            );
          })}
        </nav>
      </div>
    </>
  );
}
