import { Cloud, CloudOff, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import type { IntakeFormState } from "../types";
import { SectionHeading } from "./section-heading";

export type QueuedDraft = IntakeFormState & {
  id: string;
  createdAt: number;
  syncStatus: "queued" | "synced" | "syncing";
};

export function LowConnectivityPanel({
  isOnline,
  queue,
  onQueueDraft,
  onSyncDraft,
}: {
  isOnline: boolean;
  queue: QueuedDraft[];
  onQueueDraft: (note: string) => void;
  onSyncDraft: (draft: QueuedDraft) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <SectionHeading
          icon={
            isOnline ? (
              <Cloud size={18} aria-hidden="true" />
            ) : (
              <CloudOff size={18} aria-hidden="true" />
            )
          }
          title="Low-Connectivity Mode"
          subtitle={
            isOnline
              ? "Online with local backup queue"
              : "Offline intake queue active"
          }
        />
      </CardHeader>
      <CardContent>
        <DraftCapture onQueueDraft={onQueueDraft} />
        <div className="mt-3 space-y-2">
          {queue.map((draft) => (
            <div
              className="rounded-md border border-border bg-background p-3"
              key={draft.id}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-sm">
                    {draft.patientName || "Unnamed offline intake"}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {new Date(draft.createdAt).toLocaleTimeString()} ·{" "}
                    {draft.syncStatus}
                  </p>
                </div>
                <Button
                  aria-label={`Sync queued draft for ${draft.patientName || "unnamed patient"}`}
                  size="sm"
                  type="button"
                  variant="outline"
                  onClick={() => onSyncDraft(draft)}
                >
                  <UploadCloud size={15} aria-hidden="true" />
                  Sync
                </Button>
              </div>
              <p className="mt-2 line-clamp-2 text-muted-foreground text-xs">
                {draft.intake}
              </p>
            </div>
          ))}
          {queue.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No local drafts are waiting to sync.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

function DraftCapture({
  onQueueDraft,
}: {
  onQueueDraft: (note: string) => void;
}) {
  let note = "";

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const value = String(form.get("offline-note") ?? "").trim();
        if (value) {
          onQueueDraft(value);
          event.currentTarget.reset();
        }
      }}
    >
      <Textarea
        aria-label="Offline intake note"
        className="min-h-20 resize-none"
        name="offline-note"
        placeholder="Queue a quick note when the clinic internet is weak..."
        defaultValue={note}
        onChange={(event) => {
          note = event.target.value;
        }}
      />
      <Button className="w-full" type="submit" variant="outline">
        Queue local draft
      </Button>
    </form>
  );
}
