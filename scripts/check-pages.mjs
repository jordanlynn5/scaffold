// Checks that the pages behind log-in render for a logged-in person:
//   npm run dev   (in another terminal)
//   node --env-file=.env.local scripts/check-pages.mjs [base address]
// Logs in as a throwaway account, requests each page, then deletes the account.
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

const pages = [
  ["/", "Every dream house starts with a plan"],
  ["/progress", "Nothing to track yet"],
  ["/plan", "No plan yet"],
  ["/team", "Helps you find and design your goal"],
  ["/profile", "Houses built"],
];

const stamp = Date.now();
const email = `scaffold.pages.${stamp}@gmail.com`;
const password = `pages-${stamp}-Aa1!`;
const created = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: { whatsapp: "+34600000003", timezone: "Europe/Madrid" },
});
const id = created.data.user?.id;

try {
  // Logged out: every page sends you to log-in.
  for (const [path] of pages) {
    const res = await fetch(base + path, { redirect: "manual" });
    check(
      `logged out, ${path} sends you to log-in`,
      res.status === 307 && (res.headers.get("location") ?? "").endsWith("/log-in"),
      `status ${res.status}`,
    );
  }
  const logIn = await fetch(`${base}/log-in`);
  check("log-in page opens", logIn.status === 200 && (await logIn.text()).includes("Welcome back"));
  const signUp = await fetch(`${base}/sign-up`);
  check("sign-up page opens", signUp.status === 200 && (await signUp.text()).includes("WhatsApp number"));

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

  for (const [path, expected] of pages) {
    const res = await fetch(base + path, { headers: { cookie }, redirect: "manual" });
    const html = await res.text();
    check(
      `logged in, ${path} shows "${expected}"`,
      res.status === 200 && html.includes(expected),
      `status ${res.status}`,
    );
    if (path === "/profile") {
      check("profile shows this account's email", html.includes(email));
      check("profile shows the WhatsApp number", html.includes("+34600000003"));
    }
  }
  const authPage = await fetch(`${base}/log-in`, { headers: { cookie }, redirect: "manual" });
  check("logged in, log-in sends you Home", authPage.status === 307);
} finally {
  if (id) await admin.auth.admin.deleteUser(id);
}

console.log(failed ? "\nSome checks failed." : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
