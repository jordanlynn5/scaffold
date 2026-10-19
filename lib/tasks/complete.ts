import { createAdminClient } from "../supabase/admin";

export type Completion = {
  alreadyDone: boolean;
  celebrations: { id: string; kind: "weekly" | "stage" | "house"; payload: Record<string, unknown> }[];
  photoWarning?: string;
};

// Trusted server callers supply the authenticated user (or verified WhatsApp
// sender). The database checks ownership and saves completion atomically.
export async function completeTask(input: {
  userId: string; taskId: string; note?: string; source: "app" | "whatsapp";
  photo?: Blob;
}): Promise<Completion> {
  const db = createAdminClient();
  const { data, error } = await db.rpc("complete_task", {
    p_user_id: input.userId, p_task_id: input.taskId,
    p_note: input.note ?? "", p_source: input.source,
  });
  if (error) throw error;
  const result = data as Completion;
  if (!input.photo || result.alreadyDone) return result;
  const photo = input.photo;
  const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
  const path = `${input.userId}/${input.taskId}/${crypto.randomUUID()}.${extensions[photo.type] ?? 'bin'}`;
  try {
    if (!extensions[photo.type] || photo.size > 5 * 1024 * 1024) throw new Error("Invalid photo");
    const upload = await db.storage.from("proofs").upload(path, photo, { contentType: photo.type });
    if (upload.error) throw upload.error;
    const saved = await db.from("proofs").update({ photo_path: path, updated_at: new Date().toISOString() }).eq("task_id", input.taskId).select("id").single();
    if (saved.error) {
      await db.storage.from("proofs").remove([path]);
      throw saved.error;
    }
  } catch {
    result.photoWarning = "Your photo didn’t save. You can add it later from Plan.";
  }
  return result;
}
