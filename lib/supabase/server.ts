import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl } from "./env";

// For code that runs on the server during a page load or a form submit.
// Acts as the logged-in person, read from their cookies, so the database's
// row-level rules still apply.
export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Pages cannot set cookies while rendering. proxy.ts keeps the
          // session fresh, so this is safe to ignore.
        }
      },
    },
  });
}
