"use client";

import {
  Activity,
  BookOpen,
  Bot,
  BriefcaseMedical,
  Building2,
  GitBranch,
  HelpCircle,
  Keyboard,
  LogOut,
  Menu,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/features/language/language-context";
import { LanguageToggle } from "@/features/language/language-toggle";
import { BrandMark } from "@/features/marketing/components/brand-mark";
import { cn } from "@/lib/utils";
import { useClinicText } from "../use-clinic-text";

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
    label: "Copilot",
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
  collapsed = false,
  overlay = false,
  onCollapsedChange,
  onPageChange,
  onLogout,
  role,
}: {
  activePage: WorkspacePage;
  clinicName: string;
  collapsed?: boolean;
  overlay?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  onPageChange: (page: WorkspacePage) => void;
  onLogout: () => void;
  role: string;
}) {
  const [helpOpen, setHelpOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const t = useClinicText();
  const sidebar = (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-30 hidden w-72 border-slate-200 border-r bg-white lg:flex lg:flex-col",
        overlay && "z-50 shadow-2xl",
      )}
    >
      <div className="border-slate-200 border-b bg-gradient-to-br from-white via-[#f7fff8] to-[#fff8df] p-5">
        <div className="flex items-start justify-between gap-3">
          <BrandMark />
          {overlay ? (
            <Button
              aria-label={t("Close workspace navigation")}
              size="icon"
              type="button"
              variant="outline"
              onClick={() => onCollapsedChange?.(true)}
            >
              <X size={16} aria-hidden="true" />
            </Button>
          ) : null}
        </div>
        <div className="mt-5 rounded-md border border-primary/15 bg-white p-3 shadow-sm">
          <p className="font-semibold text-primary text-sm">{clinicName}</p>
          <p className="mt-1 text-muted-foreground text-xs capitalize">
            {language === "bn"
              ? `${t(role)} ${t("workspace")}`
              : `${role} workspace`}
          </p>
        </div>
        <LanguageToggle
          className="mt-3"
          value={language}
          onChange={setLanguage}
        />
      </div>
      <nav className="flex-1 space-y-1 p-3" aria-label={t("Workspace")}>
        {workspaceNav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const label = t(item.label);
          const description = t(item.description);
          return (
            <button
              aria-label={`${t("Open workspace navigation")}: ${label}, ${description}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex w-full items-center gap-3 rounded-md border border-transparent px-3 py-3 text-left transition hover:border-primary/20 hover:bg-[#eaf6f1]",
                item.id === "ai" &&
                  "bg-gradient-to-r from-[#fff7d6] to-[#eaf6f1]",
                isActive && "border-primary/30 bg-[#eaf6f1] text-primary",
              )}
              key={item.id}
              type="button"
              onClick={() => {
                onPageChange(item.id);
                if (overlay) {
                  onCollapsedChange?.(true);
                }
              }}
            >
              <Icon
                className="mt-0.5 text-primary"
                size={18}
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-bold text-sm">{label}</span>
                <span className="mt-0.5 block text-muted-foreground text-xs leading-4">
                  {description}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="space-y-2 border-slate-200 border-t p-3">
        <Button
          className="w-full justify-start"
          type="button"
          variant="outline"
          onClick={() => setHelpOpen(true)}
        >
          <HelpCircle size={17} aria-hidden="true" />
          {t("Help and tools")}
        </Button>
        <Button
          className="w-full justify-start"
          type="button"
          variant="outline"
          onClick={onLogout}
        >
          <LogOut size={17} aria-hidden="true" />
          {t("Sign out")}
        </Button>
      </div>
    </aside>
  );

  return (
    <>
      {overlay && collapsed ? (
        <Button
          aria-label={t("Open workspace navigation")}
          className="fixed top-4 left-4 z-40 hidden shadow-lg lg:inline-flex"
          size="icon"
          type="button"
          variant="secondary"
          onClick={() => onCollapsedChange?.(false)}
        >
          <Menu size={18} aria-hidden="true" />
        </Button>
      ) : null}

      {overlay && !collapsed ? (
        <div className="fixed inset-0 z-40 hidden bg-black/20 lg:block">
          {sidebar}
        </div>
      ) : null}
      {!overlay ? sidebar : null}

      <div className="border-slate-200 border-b bg-white px-4 py-3 pb-20 lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <BrandMark compact />
          <div className="flex gap-2">
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => setHelpOpen(true)}
            >
              <HelpCircle size={15} aria-hidden="true" />
              {t("Help")}
            </Button>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={onLogout}
            >
              <LogOut size={15} aria-hidden="true" />
              {t("Sign out")}
            </Button>
          </div>
        </div>
        <LanguageToggle
          className="mt-3"
          value={language}
          onChange={setLanguage}
        />
        <nav
          className="mt-3 grid grid-cols-3 gap-2"
          aria-label={t("Workspace")}
        >
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            const label = t(item.label);
            return (
              <button
                aria-label={`${t("Open workspace navigation")}: ${label}`}
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
                {label}
              </button>
            );
          })}
        </nav>
      </div>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-6 border-slate-200 border-t bg-white/95 px-1 py-1 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden"
        aria-label={t("Primary mobile workspace")}
      >
        {workspaceNav.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const label = t(item.label);
          return (
            <button
              aria-label={`${t("Open workspace navigation")}: ${label}`}
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
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      {overlay && collapsed ? (
        <div className="fixed right-3 bottom-20 left-3 z-30 lg:hidden">
          <Button
            className="w-full justify-center shadow-lg"
            type="button"
            variant="secondary"
            onClick={() => onCollapsedChange?.(false)}
          >
            <Menu size={17} aria-hidden="true" />
            {t("Open workspace navigation")}
          </Button>
        </div>
      ) : null}
      {helpOpen ? (
        <SidebarHelpDrawer onClose={() => setHelpOpen(false)} />
      ) : null}
    </>
  );
}

function SidebarHelpDrawer({ onClose }: { onClose: () => void }) {
  const t = useClinicText();
  return (
    <div className="fixed inset-0 z-50 bg-black/30">
      <aside className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col overflow-y-auto border-slate-200 border-l bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-slate-200 border-b bg-white p-4">
          <div>
            <p className="font-black text-xl">{t("Help")}</p>
            <p className="text-muted-foreground text-sm">
              {t(
                "Shortcuts, safety rules, and tool reference live here so the workspace can stay calm.",
              )}
            </p>
          </div>
          <Button
            aria-label={t("Close help drawer")}
            size="icon"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <X size={17} aria-hidden="true" />
          </Button>
        </div>
        <div className="space-y-4 p-4">
          <HelpBlock
            icon={Keyboard}
            title={t("Shortcuts")}
            items={[
              t("Cmd/Ctrl+K opens Copilot"),
              t("Cmd/Ctrl+G generates a draft"),
              t("Cmd/Ctrl+P opens presentation mode"),
              t("Esc closes presentation mode"),
            ]}
          />
          <HelpBlock
            icon={ShieldCheck}
            title={t("Safety reminders")}
            items={[
              t(
                "Vitals, allergies, escalation, return warnings, and clinician approval stay visible before print.",
              ),
              t("Copilot output is draft support only."),
              t(
                "Use Case for patient work; use Copilot for questions and agent actions.",
              ),
            ]}
          />
          <HelpBlock
            icon={Bot}
            title={t("Useful Copilot asks")}
            items={[
              t("What should I do next?"),
              t("Is this safe to print?"),
              t("Explain this in simple Bangla."),
              t("Prepare follow-up ownership."),
            ]}
          />
          <a
            className="flex items-center justify-between rounded-md border border-primary/20 bg-[#eaf6f1] p-3 font-bold text-primary text-sm"
            href="/docs"
          >
            <span className="flex items-center gap-2">
              <BookOpen size={16} aria-hidden="true" />
              {t("Open public docs and tool catalog")}
            </span>
          </a>
        </div>
      </aside>
    </div>
  );
}

function HelpBlock({
  icon: Icon,
  items,
  title,
}: {
  icon: typeof Keyboard;
  items: string[];
  title: string;
}) {
  return (
    <section className="rounded-md border border-border bg-[#fbfaf6] p-4">
      <div className="flex items-center gap-2">
        <Icon className="text-primary" size={18} aria-hidden="true" />
        <h2 className="font-black text-base">{title}</h2>
      </div>
      <ul className="mt-3 space-y-2 text-muted-foreground text-sm leading-6">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
