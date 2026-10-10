import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";

const authPages = ["/log-in", "/sign-up"];

// Runs before every page. Keeps the log-in session fresh, sends logged-out
// visitors to log-in, and sends logged-in visitors away from the auth pages.
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let loggedIn = false;

  if (supabaseConfigured) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    const { data } = await supabase.auth.getClaims();
    loggedIn = Boolean(data?.claims);
  }

  const { pathname } = request.nextUrl;
  const onAuthPage = authPages.includes(pathname);

  if (!loggedIn && !onAuthPage) {
    return redirectKeepingCookies(request, response, "/log-in");
  }
  if (loggedIn && onAuthPage) {
    return redirectKeepingCookies(request, response, "/");
  }
  return response;
}

function redirectKeepingCookies(
  request: NextRequest,
  from: NextResponse,
  to: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = to;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  for (const cookie of from.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Everything except Next.js internals, files with an extension, and /api
  // (the bell and the WhatsApp inbox are called by other services and check
  // their own secrets).
  matcher: ["/((?!_next/static|_next/image|api/|.*\\.[\\w]+$).*)"],
};
