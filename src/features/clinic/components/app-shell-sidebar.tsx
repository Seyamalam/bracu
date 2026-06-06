"use client";

import {
  Activity,
  Bot,
  BriefcaseMedical,
  Building2,
  GitBranch,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/features/marketing/components/brand-mark";
import { cn } from "@/lib/utils";

export type WorkspacePage =
  | "admin"
  | "ai"
  | "builder"
  | "case"
  | "operations"
  | "queue";

export const workspaceNav = [
  {
    description: "Waiting room, red flags, owners, and follow-ups",
    icon: Activity,
    id: "queue",
    label: "Queue",
  },
  {
    description: "One patient, intake, safety, draft, packet",
    icon: BriefcaseMedical,
    id: "case",
    label: "Case",
  },
  {
    description: "Chat, tools, runs, approvals, memory, MCP",
    icon: Bot,
    id: "ai",
    label: "AI",
  },
  {
    description: "Shift brief, analytics, follow-up, offline sync",
    icon: Building2,
    id: "operations",
    label: "Operations",
  },
  {
    description: "Workflow canvas, protocols, simulation, templates",
    icon: GitBranch,
    id: "builder",
    label: "Builder",
  },
  {
    description: "Settings, roles, MCP, audit, readiness",
    icon: Settings,
    id: "admin",
    label: "Admin",
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
                  "flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left transition hover:border-primary/20 hover:bg-[#eaf6f1]",
                  isActive && "border-primary/30 bg-[#eaf6f1] text-primary",
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
                <span className="min-w-0">
                  <span className="block font-bold text-sm">{item.label}</span>
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

      <div className="border-slate-200 border-b bg-white px-4 py-3 pb-20 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandMark compact />
          <Button size="sm" type="button" variant="outline" onClick={onLogout}>
            <LogOut size={15} aria-hidden="true" />
            Sign out
          </Button>
        </div>
        <nav className="mt-3 grid grid-cols-3 gap-2" aria-label="Workspace">
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                aria-label={`Open ${item.label} workspace`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center justify-center gap-2 rounded-md border border-border bg-background px-2 py-2 font-semibold text-xs",
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
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-slate-200 border-t bg-white/95 px-1 py-1 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        aria-label="Primary mobile workspace"
      >
        {workspaceNav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              aria-label={`Open ${item.label} workspace`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-1 rounded-md px-1 py-1 font-semibold text-[10px]",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground",
              )}
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
