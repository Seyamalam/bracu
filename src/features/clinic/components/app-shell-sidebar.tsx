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
import { cn } from "@/lib/utils";

export type WorkspacePage =
  | "intake"
  | "operations"
  | "overview"
  | "patient"
  | "review";

export const workspaceNav = [
  {
    description: "Command center, guided flow, safety snapshot",
    icon: Home,
    id: "overview",
    label: "Overview",
  },
  {
    description: "Reception notes, scenario loading, documents",
    icon: ClipboardList,
    id: "intake",
    label: "Intake",
  },
  {
    description: "Clinical draft, risks, handoff, approval",
    icon: ShieldCheck,
    id: "review",
    label: "Review",
  },
  {
    description: "Handout, teach-back, follow-up, referral",
    icon: Printer,
    id: "patient",
    label: "Patient",
  },
  {
    description: "Queue, model, accessibility, audit, trends",
    icon: Activity,
    id: "operations",
    label: "Ops",
  },
] as const;

export function AppShellSidebar({
  activePage,
  clinicName,
  onPageChange,
  onLogout,
  role,
}: {
  activePage: WorkspacePage;
  clinicName: string;
  onPageChange: (page: WorkspacePage) => void;
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
            const isActive = activePage === item.id;
            return (
              <button
                aria-label={`Open ${item.label} workspace: ${item.description}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex w-full items-start gap-3 rounded-md border-l-4 border-transparent px-3 py-2.5 text-left transition hover:bg-[#eaf6f1]",
                  isActive && "border-primary bg-[#eaf6f1] text-primary",
                )}
                key={item.id}
                type="button"
                onClick={() => onPageChange(item.id)}
              >
                <Icon
                  className="mt-0.5 text-primary"
                  size={18}
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-semibold text-sm">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-muted-foreground text-xs leading-4">
                    {item.description}
                  </span>
                </span>
              </button>
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
            const isActive = activePage === item.id;
            return (
              <button
                aria-label={`Open ${item.label} workspace`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md border border-border bg-background px-3 py-2 font-semibold text-xs",
                  isActive &&
                    "border-primary bg-primary text-primary-foreground",
                )}
                key={item.id}
                type="button"
                onClick={() => onPageChange(item.id)}
              >
                <Icon size={15} aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
