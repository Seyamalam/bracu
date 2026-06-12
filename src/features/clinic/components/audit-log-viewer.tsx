import { History } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { useClinicText } from "../use-clinic-text";
import { SectionHeading } from "./section-heading";

export function AuditLogViewer({
  logs,
}: {
  logs: Doc<"auditLogs">[] | undefined;
}) {
  const t = useClinicText();
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<History size={18} aria-hidden="true" />}
          title={t("Audit Trail")}
          subtitle={t("Every important AI and workflow action")}
        />
      </CardHeader>
      <CardContent>
        <div className="max-h-72 space-y-3 overflow-auto pr-1">
          {(logs ?? []).map((log) => (
            <div
              className="rounded-md border border-border bg-background p-3"
              key={log._id}
            >
              <p className="font-semibold text-sm">{log.action}</p>
              <p className="mt-1 text-muted-foreground text-xs leading-5">
                {log.detail}
              </p>
              <p className="mt-2 text-muted-foreground text-[0.68rem]">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
          {logs?.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {t("Audit events will appear after actions.")}
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
