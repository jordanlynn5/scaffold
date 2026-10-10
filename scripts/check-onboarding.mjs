// Checks checklist slice 2, the onboarding chat with Alice:
//   npm run dev   (in another terminal)
//   node --env-file=.env.local scripts/check-onboarding.mjs [base address]
// Walks a throwaway account through every question against the real Supabase
// project and the real Claude, then deletes the account. Costs under a cent.
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const base = process.argv[2] ?? "http://localhost:3000";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const admin = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

let failed = false;
function check(label, ok, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
}

const stamp = Date.now();
const email = `scaffold.onboarding.${stamp}@gmail.com`;
const password = `onboarding-${stamp}-Aa1!`;
const created = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { whatsapp: "+34600000004", timezone: "Europe/Madrid", whatsapp_consent: true },
});
const id = created.data.user?.id;
let projectId = null;

const project = async () =>
  (await admin.from("projects").select("*").eq("user_id", id).maybeSingle()).data;
const profile = async () =>
  (await admin.from("profiles").select("*").eq("id", id).maybeSingle()).data;

try {
  const loggedOut = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind: "onboarding", message: null }),
  });
  check("logged out, the chat refuses to answer", loggedOut.status === 401, `status ${loggedOut.status}`);

  // Log in the way the app does, collecting the session cookies.
  const jar = new Map();
  const browserLike = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => [...jar].map(([name, value]) => ({ name, value })),
      setAll: (list) => list.forEach(({ name, value }) => jar.set(name, value)),
    },
  });
  const session = await browserLike.auth.signInWithPassword({ email, password });
  check("throwaway account logs in", Boolean(session.data.session), session.error?.message);
  const cookie = [...jar].map(([n, v]) => `${n}=${v}`).join("; ");

  // One turn of the chat: send an answer (or nothing), read Alice's reply.
  async function turn(message) {
    const res = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify({ kind: "onboarding", message }),
    });
    const events = (await res.text())
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    const reply = events.find((e) => e.type === "message")?.message;
    if (message) console.log(`      you:   ${message}`);
    if (reply) console.log(`      alice: ${reply.body.replaceAll("\n", " ")}`);
    return {
      events,
      reply,
      streamed: events.filter((e) => e.type === "text").map((e) => e.text).join(""),
      failed: events.some((e) => e.type === "error"),
    };
  }
  const page = async (path) =>
    // React marks the joins between pieces of text with <!-- -->.
    (await (await fetch(base + path, { headers: { cookie } })).text()).replaceAll("<!-- -->", "");

  // Opening
  const opening = await turn(null);
  check("Alice opens the chat", opening.reply?.sender === "alice" && !opening.failed);
  check("Alice asks what to call you", /call you/i.test(opening.reply?.body ?? ""));
  check("her words arrive piece by piece", opening.events.filter((e) => e.type === "text").length > 1);
  check("no CHIPS line leaks into the message", !/CHIPS:/.test(opening.streamed + (opening.reply?.body ?? "")));
  let p = await project();
  projectId = p?.id ?? null;
  check("a project is created, waiting on the name", p?.status === "onboarding" && p?.onboarding_step === "name");
  const twice = await turn(null);
  check("opening the chat again does not make Alice repeat herself", twice.events.some((e) => e.type === "idle") && !twice.reply);
  check("Home still shows the new-user lot before any answer", (await page("/")).includes("Every dream house starts with a plan"));

  // You: name, nudge time, days a week
  const name = await turn("Call me Check");
  check("name is saved to the profile", (await profile())?.name === "Check");
  check("step moves on to the nudge time", (await project())?.onboarding_step === "nudge_time");
  check("time suggestions are offered", name.reply?.chips.join("|") === "Morning 8:00|Lunchtime 13:00|Evening 19:00");

  await turn("whenever the bananas are ripe");
  check("an unreadable time does not move on", (await project())?.onboarding_step === "nudge_time");
  const time = await turn("Evening 19:00");
  check("nudge time is saved as 19:00", (await profile())?.nudge_time?.startsWith("19:00"));
  check("step moves on to days a week", (await project())?.onboarding_step === "days");
  check("day suggestions are offered", time.reply?.chips.join("|") === "3 days|4 days|5 days");

  const days = await turn("4 days");
  check("weekly target is saved as 4", (await profile())?.weekly_target === 4);
  check("step moves on to the Wish", (await project())?.onboarding_step === "wish");
  check("Alice suggests example wishes", (days.reply?.chips.length ?? 0) >= 2, days.reply?.chips.join(" | "));

  // Leaving and coming back mid-way
  const home = await page("/");
  check("Home offers to continue where you left off", home.includes("Continue where you left off") && home.includes("Welcome back, Check"));
  const reopened = await page("/onboarding");
  check("reopening the chat shows the saved conversation", reopened.includes("Call me Check") && reopened.includes("4 days"));
  check("reopening the chat is at the Wish step", /aria-current="step"[^>]*>(?:(?!<\/li>).)*Wish/s.test(reopened));

  // Wish, experience
  const wish = await turn("Become a better illustrator");
  p = await project();
  check("Wish is saved", p?.wish === "Become a better illustrator");
  check("step moves on to experience", p?.onboarding_step === "experience");
  check("Alice suggests experience levels", (wish.reply?.chips.length ?? 0) >= 2, wish.reply?.chips.join(" | "));
  check("Home shows the wish so far", (await page("/")).includes("Become a better illustrator"));

  await turn("Complete beginner");
  p = await project();
  check("experience is saved, step moves on to Outcome", p?.experience === "Complete beginner" && p?.onboarding_step === "outcome");

  // Outcome, with a question back first
  await turn("Wait, how is an outcome different from a wish?");
  p = await project();
  check("a question back is answered without being saved as the Outcome", p?.outcome === null && p?.onboarding_step === "outcome");
  await turn("I'd feel proud showing my drawings to friends");
  p = await project();
  check("Outcome is saved, step moves on to Obstacle", p?.outcome === "I'd feel proud showing my drawings to friends" && p?.onboarding_step === "obstacle");

  // Obstacle: a vague answer gets one follow-up
  const vague = await turn("life gets busy");
  p = await project();
  check('"life gets busy" does not move on', p?.onboarding_step === "obstacle");
  check("Alice asks a follow-up question", (vague.reply?.body ?? "").includes("?"));
  const specific = await turn("I scroll Instagram on my phone instead of drawing");
  p = await project();
  check("the specific Obstacle is saved", p?.obstacle === "I scroll Instagram on my phone instead of drawing");
  check("every answer is in: step is done", p?.onboarding_step === "done" && p?.status === "onboarding");
  check("a phone obstacle gets the Screen Time suggestion", /Screen Time/.test(specific.reply?.body ?? ""));
  check("Alice hands over to Georgina by name", /Thank you, Check/.test(specific.reply?.body ?? "") && /Georgina/.test(specific.reply?.body ?? ""));
  check("no suggestions after the last message", specific.reply?.chips.length === 0);

  const after = await turn("one more thing");
  check("nothing more is saved once the design is done", after.events.some((e) => e.type === "idle"));

  // Access rules: you can read your own rows and write none of them.
  const mine = await browserLike.from("projects").select("id");
  check("you can read your own project", mine.data?.length === 1);
  const myMessages = await browserLike.from("messages").select("id");
  check("you can read your own messages", (myMessages.data?.length ?? 0) > 10);
  await browserLike.from("projects").update({ status: "complete" }).eq("id", projectId);
  check("the browser cannot change a project", (await project())?.status === "onboarding");
  const stranger = createClient(url, anonKey, { auth: { persistSession: false } });
  const seen = await stranger.from("messages").select("id");
  check("a logged-out visitor sees no messages", (seen.data?.length ?? 0) === 0);
} finally {
  if (id) await admin.auth.admin.deleteUser(id);
  if (projectId) {
    const left = await admin.from("conversations").select("id").eq("project_id", projectId);
    const gone = await admin.from("projects").select("id").eq("id", projectId);
    check(
      "deleting the account deletes its project and chat",
      (left.data?.length ?? 0) === 0 && (gone.data?.length ?? 0) === 0,
    );
  }
}

console.log(failed ? "\nSome checks failed." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
