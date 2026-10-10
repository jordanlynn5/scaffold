// Checks checklist slice 1 against the real Supabase project:
//   node --env-file=.env.local scripts/check-accounts.mjs
// Creates two throwaway accounts, checks them, and deletes them again.
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const asVisitor = () =>
  createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

let failed = false;
function check(label, ok, detail = "") {
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${detail ? `  (${detail})` : ""}`);
}

const stamp = Date.now();
const password = `check-${stamp}-Aa1!`;
// Supabase rejects sign-ups from example.com. These addresses do not exist,
// and no email is sent to them because confirmation is checked to be off first.
const people = [
  { email: `scaffold.check.a.${stamp}@gmail.com`, whatsapp: "+34600000001", timezone: "Europe/Madrid" },
  { email: `scaffold.check.b.${stamp}@gmail.com`, whatsapp: "+34600000002", timezone: "" },
];
const ids = [null, null];

const settings = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: anonKey },
}).then((r) => r.json());
check('"Confirm email" is switched off in Supabase', settings.mailer_autoconfirm === true);
if (failed) {
  console.log("\nStopped: switch Confirm email off, save, and run this again.");
  process.exit(1);
}

try {
  // 1. Signing up the way the app does creates a session and a profile row.
  const a = asVisitor();
  const signUp = await a.auth.signUp({
    email: people[0].email,
    password,
    options: {
      data: { whatsapp: people[0].whatsapp, timezone: people[0].timezone, whatsapp_consent: true },
    },
  });
  ids[0] = signUp.data.user?.id ?? null;
  check("sign-up succeeds", !signUp.error, signUp.error?.message);
  check("sign-up logs you straight in", Boolean(signUp.data.session));

  const second = await admin.auth.admin.createUser({
    email: people[1].email,
    password,
    email_confirm: true,
    user_metadata: { whatsapp: people[1].whatsapp, timezone: people[1].timezone },
  });
  ids[1] = second.data.user?.id ?? null;
  check("second account created", !second.error, second.error?.message);
  if (!ids[0] || !ids[1]) throw new Error("Could not create the throwaway accounts.");

  // 2. The profile row exists, with the number and time zone from sign-up.
  const own = await a.from("profiles").select("*").eq("id", ids[0]).maybeSingle();
  check("profile row exists for the new account", Boolean(own.data), own.error?.message);
  check("profile holds the WhatsApp number", own.data?.whatsapp === people[0].whatsapp);
  check("profile holds the browser's time zone", own.data?.timezone === "Europe/Madrid");
  check(
    "defaults: 3 days a week, 09:00, 0 houses",
    own.data?.weekly_target === 3 &&
      own.data?.nudge_time?.startsWith("09:00") &&
      own.data?.houses_built === 0,
  );

  check("profile records the WhatsApp consent that was ticked", own.data?.whatsapp_consent === true);

  const other = await admin
    .from("profiles")
    .select("timezone, whatsapp_consent")
    .eq("id", ids[1])
    .maybeSingle();
  check("a missing time zone falls back to UTC", other.data?.timezone === "UTC");
  check("no tick means no WhatsApp consent", other.data?.whatsapp_consent === false);

  // 3. One person cannot see or change another person's row.
  const all = await a.from("profiles").select("id");
  check(
    "a logged-in person sees only their own row",
    all.data?.length === 1 && all.data[0].id === ids[0],
    `${all.data?.length} rows visible`,
  );
  await a.from("profiles").update({ name: "intruder" }).eq("id", ids[1]);
  const untouched = await admin.from("profiles").select("name").eq("id", ids[1]).maybeSingle();
  check("cannot change someone else's row", untouched.data?.name === null);

  // 4. Settings are editable, the houses-built count is not.
  const rename = await a.from("profiles").update({ name: "Check" }).eq("id", ids[0]).select("name");
  check("can change own name", rename.data?.[0]?.name === "Check", rename.error?.message);
  await a.from("profiles").update({ houses_built: 99 }).eq("id", ids[0]);
  const houses = await admin.from("profiles").select("houses_built").eq("id", ids[0]).maybeSingle();
  check("cannot change own houses-built count", houses.data?.houses_built === 0);

  // 5. A visitor who is not logged in sees nothing.
  const anon = await asVisitor().from("profiles").select("id");
  check("a logged-out visitor sees no rows", (anon.data?.length ?? 0) === 0);

  // 6. Logging back in works.
  const again = await asVisitor().auth.signInWithPassword({ email: people[0].email, password });
  check("can log back in", Boolean(again.data.session), again.error?.message);
} finally {
  const made = ids.filter(Boolean);
  for (const id of made) await admin.auth.admin.deleteUser(id);
  const left = made.length
    ? await admin.from("profiles").select("id").in("id", made)
    : { data: [] };
  check("throwaway accounts and their rows are deleted", (left.data?.length ?? 0) === 0);
}

console.log(failed ? "\nSome checks failed." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
