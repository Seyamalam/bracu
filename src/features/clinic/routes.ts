import type { WorkspacePage } from "./components/app-shell-sidebar";

export const defaultWorkspacePage: WorkspacePage = "ai";

export const workspacePageToSlug: Record<WorkspacePage, string> = {
  admin: "admin",
  ai: "copilot",
  builder: "builder",
  case: "case",
  operations: "operations",
  queue: "queue",
};

export const workspaceSlugToPage: Record<string, WorkspacePage> = {
  admin: "admin",
  ai: "ai",
  builder: "builder",
  case: "case",
  copilot: "ai",
  operations: "operations",
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
