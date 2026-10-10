import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabaseAnonKey, supabaseConfigured, supabaseUrl } from "@/lib/supabase/env";

// Pages only a logged-out visitor should see.
const visitorPages = ["/log-in", "/sign-up", "/welcome"];

// Runs before every page. Keeps the log-in session fresh, shows logged-out
// visitors the landing page at "/", sends them to log-in from anywhere else,
// and sends logged-in visitors straight into the app.
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
  const onVisitorPage = visitorPages.includes(pathname);

  if (loggedIn) {
    return onVisitorPage
      ? redirectKeepingCookies(request, response, "/")
      : response;
  }
  if (pathname === "/") {
    // Same address, different page: the landing page lives at /welcome.
    const url = request.nextUrl.clone();
    url.pathname = "/welcome";
    return NextResponse.rewrite(url);
  }
  if (pathname === "/welcome") {
    return redirectKeepingCookies(request, response, "/");
  }
  return onVisitorPage
    ? response
    : redirectKeepingCookies(request, response, "/log-in");
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
