import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add logic between createServerClient and getUser.
  // getUser refreshes the auth token, and skipping it can log users out.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // The landing page at "/" is public. Logged-in users skip it and go
  // straight to the app.
  if (pathname === "/") {
    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/app";
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  // THE FOOTER PAGES ARE PUBLIC TO EVERYONE, ALWAYS.
  //
  // They were missing from the list below, so the login gate bounced
  // every logged-out visitor who tapped Terms or Privacy in the landing
  // page footer straight to /login. It looked fine to anyone already
  // logged in, which is exactly why it survived: the owner only found
  // it when Google asked for the URLs and they were dead.
  //
  // Any new footer link belongs on this list the same day it is added,
  // About included. A page a stranger is invited to read cannot be
  // behind the login gate.
  //
  // They are also kept out of isAuthPage on purpose, so a logged-IN
  // user is not redirected away to /app when they want to read the
  // terms they agreed to.
  const isPublicPage =
    pathname.startsWith("/terms") ||
    pathname.startsWith("/privacy") ||
    pathname.startsWith("/about") ||
    // THE DESIGN PREVIEWS ARE PUBLIC. The owner's ruling, 28 August
    // 2026: "open the preview without login, nothing needs to be
    // locked." They carry made up demo numbers, never user data, and
    // he reviews them on his phone without a session. Public means
    // public for everyone: they must be here with the footer pages,
    // NOT in isAuthPage below, because an auth page bounces a
    // logged-IN visitor to /app, which would lock the owner himself
    // out of his own previews.
    pathname.startsWith("/preview");

  if (isPublicPage) return supabaseResponse;

  // Pages reachable without being logged in. /signup, /forgot-password
  // and /reset-password used to be here; they are redirects to /login
  // now (next.config.ts) and never reach the middleware.
  // The previews used to sit here behind a development-only
  // exception, which kept them login-gated in production. That gate
  // was lifted 28 August 2026 by the owner's ruling; they are public
  // pages above now.
  const isAuthPage = pathname.startsWith("/login");

  // The /auth routes turn emailed links into sessions, so they are
  // never redirected. The demo login route is in the same business:
  // its whole point is being called logged out, and the gate answering
  // 307 instead of the route was found by the demo door test, not by
  // eye.
  const isAuthRoute =
    pathname.startsWith("/auth/") || pathname === "/api/demo-login";
  // Note: /api/connect/* is NOT here on purpose. Those routes act on
  // the logged in user's own connection, so the gate protecting them
  // is exactly right.

  if (!user && !isAuthPage && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
