import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "./env";

// For code that runs in the browser. Acts as the logged-in person.
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
