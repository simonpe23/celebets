import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// DELETE MY ACCOUNT. Required by both app stores: Apple's guideline
// 5.1.1(v) and Google Play's data deletion policy both say an app
// that lets you create an account must let you delete it from
// inside the app. "Restart my record" does not count, and should
// not: it deletes nothing, which is its whole point.
//
// NO SQL WAS NEEDED. The schema already cascades from auth.users
// down through profiles to transactions, bets, legs and bet_buys,
// and connected_accounts hangs off auth.users directly. Deleting
// the auth user removes every row the person owns, in one step,
// with nothing orphaned. The name and the record start date live in
// the auth user's own metadata, so they go with it.
//
// Deleting an auth user needs the SERVICE ROLE key, which bypasses
// row level security. That key never touches the browser and never
// enters the repo: it is a Vercel environment variable, and this
// route is the only thing that reads it. Everything below happens
// after the caller's own session has been verified, so the id being
// deleted is always the caller's own and can never be passed in.

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  // THE DEMO DOOR IS NOT DELETABLE. Its login is shared with testers
  // and investors, so one curious tap would wipe the account the
  // owner demonstrates the product with, for everybody, permanently.
  const demo = process.env.NEXT_PUBLIC_DEMO_EMAIL;
  if (demo && user.email && user.email.toLowerCase() === demo.toLowerCase()) {
    return NextResponse.json(
      {
        error:
          "The demo account is shared, so it cannot be deleted. Create your own account to try this.",
      },
      { status: 403 }
    );
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    // Said plainly rather than as a generic failure, because the fix
    // is a missing setting and the owner is the one who can fix it.
    return NextResponse.json(
      {
        error:
          "Account deletion is not configured on this deployment. SUPABASE_SERVICE_ROLE_KEY is missing.",
      },
      { status: 500 }
    );
  }

  const admin = createAdminClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    return NextResponse.json(
      { error: "Could not delete the account. Please try again." },
      { status: 500 }
    );
  }

  // Drop the session cookies too. The user row is already gone, so
  // this only tidies the browser up; a failure here must not report
  // the deletion as failed, because it did not fail.
  try {
    await supabase.auth.signOut();
  } catch {
    // Nothing to recover: the account no longer exists either way.
  }

  return NextResponse.json({ ok: true });
}
