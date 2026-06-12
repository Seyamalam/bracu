import type { WorkspacePage } from "./components/app-shell-sidebar";

export const defaultWorkspacePage: WorkspacePage = "ai";

export const workspacePageToSlug: Record<WorkspacePage, string> = {
  ai: "copilot",
  case: "case",
  queue: "queue",
};

export const workspaceSlugToPage: Record<string, WorkspacePage> = {
  admin: "ai",
  ai: "ai",
  builder: "ai",
  case: "case",
  copilot: "ai",
  operations: "ai",
  queue: "queue",
};

export function getWorkspaceHref(page: WorkspacePage) {
  return `/clinic/${workspacePageToSlug[page]}`;
}

export function parseWorkspaceSlug(slug: string | undefined) {
  if (!slug) {
    return defaultWorkspacePage;
  }
  return workspaceSlugToPage[slug] ?? null;
}
