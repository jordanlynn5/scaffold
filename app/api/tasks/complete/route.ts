import { NextResponse } from "next/server";
import { findProfile } from "@/lib/profile";
import { completeTask } from "@/lib/tasks/complete";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return NextResponse.json({ error: "Request not allowed." }, { status: 403 });
  const profile = await findProfile();
  if (!profile) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  const form = await request.formData();
  const taskId = String(form.get("taskId") ?? "");
  const note = String(form.get("note") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(taskId) || note.length > 4000) return NextResponse.json({ error: "Check your task and keep your note under 4,000 characters." }, { status: 400 });
  const photo = form.get("photo");
  try {
    const result = await completeTask({ userId: profile.id, taskId, note, source: "app", photo: photo instanceof File && photo.size ? photo : undefined });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "That didn’t save. Reload and try again. Your note is still here." }, { status: 409 });
  }
}
