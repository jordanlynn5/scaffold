import { generatePlan } from "@/lib/ai/plan";
import { getCurrentProject } from "@/lib/plans/data";
import { findProfile } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export const maxDuration = 300;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json({ error: "Open Scaffold to change your plan." }, { status: 403 });
  }
  const profile = await findProfile();
  if (!profile) return Response.json({ error: "Log in first." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || !["generate", "commit"].includes(body.action)) {
    return Response.json({ error: "Choose a plan action." }, { status: 400 });
  }
  try {
    const project = await getCurrentProject(profile.id);
    if (!project || project.onboarding_step !== "done") {
      return Response.json({ error: "Finish designing your goal with Alice first." }, { status: 409 });
    }
    const db = createAdminClient();
    if (body.action === "commit") {
      if (!Number.isInteger(body.revision)) return Response.json({ error: "Review your plan first." }, { status: 400 });
      const { error } = await db.rpc("commit_draft_plan", { p_user_id: profile.id, p_revision: body.revision });
      if (error) return Response.json({ error: "The plan changed. Reload and review it before committing." }, { status: 409 });
      return Response.json({ committed: true });
    }
    if (project.status === "active") {
      return Response.json({ error: "This plan is already committed." }, { status: 409 });
    }
    const changes = typeof body.changes === "string" ? body.changes.trim() : null;
    if (changes && changes.length > 1200) return Response.json({ error: "Keep changes under 1,200 characters." }, { status: 400 });
    if (project.draft_plan && !changes) {
      return Response.json({ plan: project.draft_plan, revision: project.plan_revision });
    }
    if (project.draft_plan && body.revision !== project.plan_revision) {
      return Response.json({ error: "The plan changed. Reload before asking for changes." }, { status: 409 });
    }
    const { data: conversations, error: conversationError } = await db.from("conversations").select("id").eq("project_id", project.id).eq("user_id", profile.id);
    if (conversationError) throw conversationError;
    const ids = (conversations ?? []).map((c) => c.id);
    const { data: messages, error: messageError } = ids.length
      ? await db.from("messages").select("sender, body").in("conversation_id", ids).order("created_at", { ascending: false }).limit(60)
      : { data: [], error: null };
    if (messageError) throw messageError;
    const plan = await generatePlan({
      facts: { ...profile, ...project },
      conversation: (messages ?? []).reverse().map((m) => `${m.sender}: ${m.body}`).join("\n"),
      previous: project.draft_plan, changes,
    });
    const { data: revision, error } = await db.rpc("save_draft_plan", {
      p_user_id: profile.id, p_project_id: project.id, p_revision: project.plan_revision, p_plan: plan,
    });
    if (error) return Response.json({ error: "Your plan changed in another tab. Reload to see it." }, { status: 409 });
    return Response.json({ plan, revision });
  } catch (error) {
    console.error("Plan request failed", error);
    return Response.json({ error: "Georgina couldn't finish that just now. Your answers and any saved plan are safe. Try again." }, { status: 503 });
  }
}
