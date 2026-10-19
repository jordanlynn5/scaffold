"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";

export function MarkDone({ taskId, done }: { taskId: string; done: boolean }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [completed, setCompleted] = useState(done);
  const form = useRef<HTMLFormElement>(null);
  const router = useRouter();
  return <>
    {completed ? <div className="rounded-card bg-yellow-tint p-4" role="status"><p className="text-h3">✓ Today’s brick is laid</p><p className="mt-2 text-body-sm">You can keep practising, or call it a day. Your progress is saved.</p></div> : <div className="flex flex-wrap gap-3"><Button onClick={() => setOpen(true)}>Mark as done</Button><Button variant="link" onClick={() => setOpen(true)}>Add a note</Button><Button variant="link" onClick={() => setOpen(true)}>Add a photo</Button></div>}
    {warning ? <p role="status" className="text-body-sm">{warning}</p> : null}
    <Dialog open={open} onClose={() => { if (!saving) setOpen(false); }} title="Lay today’s brick">
      <p className="text-body-sm text-text-secondary">You did the task. A note or photo is optional — a little something to look back on.</p>
      <form ref={form} className="flex flex-col gap-4" onSubmit={async (event) => {
        event.preventDefault();
        if (saving) return;
        setSaving(true); setError("");
        try {
          const body = new FormData(form.current!);
          body.set("taskId", taskId);
          // Keep large/unsupported photos out of the request, while still
          // recording completion. Hosted functions limit request body size.
          const photo = body.get("photo");
          const rejected = photo instanceof File && photo.size > 0 && (photo.size > 3 * 1024 * 1024 || !["image/jpeg", "image/png", "image/webp"].includes(photo.type));
          if (rejected) body.delete("photo");
          const response = await fetch("/api/tasks/complete", { method: "POST", body });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error);
          setWarning(rejected ? "Your task is done. Your photo didn’t save. Choose a JPG, PNG or WebP under 3 MB next time." : result.photoWarning ?? "");
          setCompleted(true); setOpen(false); router.refresh();
        } catch (cause) {
          setError(cause instanceof Error ? cause.message : "That didn’t save. Try again.");
        } finally { setSaving(false); }
      }}>
        <label className="text-body-sm">Note (optional)<textarea name="note" maxLength={4000} rows={4} className="mt-2 w-full rounded-input border border-input-border bg-surface p-3" placeholder="What did you notice or learn?" /></label>
        <label className="text-body-sm">Photo (optional)<input name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-body-sm" /><span className="mt-1 block text-caption text-text-muted">JPG, PNG or WebP, up to 3 MB.</span></label>
        {error ? <p role="alert" className="text-body-sm">{error}</p> : null}
        <Button type="submit" disabled={saving}>{saving ? "Saving your brick…" : "Mark as done"}</Button>
        <Button type="button" variant="link" disabled={saving} onClick={() => setOpen(false)}>Keep working</Button>
      </form>
    </Dialog>
  </>;
}
