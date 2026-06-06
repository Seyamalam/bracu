import { notFound, redirect } from "next/navigation";
import { ClinicCopilotApp } from "@/features/clinic/components/clinic-copilot-app";
import {
  getWorkspaceHref,
  parseWorkspaceSlug,
  workspacePageToSlug,
} from "@/features/clinic/routes";

export default async function ClinicWorkspacePage({
  params,
}: {
  params: Promise<{ workspace: string }>;
}) {
  const { workspace } = await params;
  const page = parseWorkspaceSlug(workspace);

  if (!page) {
    notFound();
  }

  if (workspacePageToSlug[page] !== workspace) {
    redirect(getWorkspaceHref(page));
  }

  return <ClinicCopilotApp initialWorkspace={page} />;
}
