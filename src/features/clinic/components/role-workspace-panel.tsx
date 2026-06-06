import {
  BriefcaseMedical,
  ClipboardList,
  PhoneCall,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { WorkspacePage } from "./app-shell-sidebar";
import { SectionHeading } from "./section-heading";

export type ClinicRole =
  | "admin"
  | "doctor"
  | "follow_up"
  | "nurse"
  | "reception";

const roleConfig: Record<
  ClinicRole,
  {
    label: string;
    page: WorkspacePage;
    icon: typeof ClipboardList;
    focus: string;
    tasks: string[];
  }
> = {
  reception: {
    label: "Reception",
    page: "queue",
    icon: ClipboardList,
    focus: "Capture notes, vitals, documents, and missing basics.",
    tasks: [
      "Register patient",
      "Record vitals",
      "Attach prescription or lab text",
    ],
  },
  nurse: {
    label: "Nurse",
    page: "case",
    icon: BriefcaseMedical,
    focus: "Prepare triage, red flags, and staff handoff.",
    tasks: ["Check vitals", "Confirm allergies", "Escalate red flags"],
  },
  doctor: {
    label: "Doctor",
    page: "case",
    icon: ShieldCheck,
    focus: "Review SOAP draft, approve, and close safely.",
    tasks: ["Review draft", "Check safety gates", "Approve handout"],
  },
  follow_up: {
    label: "Follow-up desk",
    page: "operations",
    icon: PhoneCall,
    focus: "Own call-backs, reply triage, and patient understanding.",
    tasks: ["Schedule callback", "Triage replies", "Confirm teach-back"],
  },
  admin: {
    label: "Admin",
    page: "admin",
    icon: Users,
    focus: "Monitor queue, staffing load, audit, and clinic readiness.",
    tasks: ["Watch queue pressure", "Review audit trail", "Assign owners"],
  },
};

export function RoleWorkspacePanel({
  activeRole,
  onRoleChange,
  onOpenPage,
}: {
  activeRole: ClinicRole;
  onRoleChange: (role: ClinicRole) => void;
  onOpenPage: (page: WorkspacePage) => void;
}) {
  const config = roleConfig[activeRole];
  const ActiveIcon = config.icon;

  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={<ActiveIcon size={18} aria-hidden="true" />}
          title="Role View"
          subtitle="Focused workflows for each clinic worker"
        />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-5">
          {(Object.keys(roleConfig) as ClinicRole[]).map((role) => (
            <Button
              aria-label={`Switch role view to ${roleConfig[role].label}`}
              className={cn(
                "h-auto px-2 py-2 text-xs",
                activeRole === role && "ring-2 ring-primary",
              )}
              key={role}
              type="button"
              variant={activeRole === role ? "default" : "outline"}
              onClick={() => {
                onRoleChange(role);
                onOpenPage(roleConfig[role].page);
              }}
            >
              {roleConfig[role].label}
            </Button>
          ))}
        </div>
        <div className="mt-3 rounded-md bg-[#f7f4ee] p-3">
          <p className="font-semibold text-sm">{config.focus}</p>
          <ul className="mt-2 space-y-1 text-muted-foreground text-xs">
            {config.tasks.map((task) => (
              <li key={task}>• {task}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
