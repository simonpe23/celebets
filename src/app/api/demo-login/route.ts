import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// THE DEMO DOOR (August 2026, for investors). The demo account cannot
// receive a real emailed code: whoever the owner shares it with has no
// access to its mailbox. So the demo email gets one permanent code
// instead, and the flow LOOKS identical: the auth page shows the same
// six boxes, no email is ever sent, and this route checks the code and
// signs into the demo account with its password.
//
// Supabase has this exact feature built in for PHONE numbers (test
// OTPs) but not for email; the community workaround is a trigger
// inside Supabase's own auth tables, which is not something to point
// at a live app. Forty lines here instead, all in our own code.
//
// Three settings in Vercel, never in the repo:
//   NEXT_PUBLIC_DEMO_EMAIL  the demo account's email (public anyway)
//   DEMO_CODE               the permanent six-digit code
//   DEMO_PASSWORD           the demo account's password
// Unset means the door does not exist: the demo email then behaves
// like any other and gets a real emailed code.
export async function POST(request: Request) {
  const email = process.env.NEXT_PUBLIC_DEMO_EMAIL;
  const expected = process.env.DEMO_CODE;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !expected || !password) {
    return NextResponse.json(
      { error: "The demo login is not set up." },
      { status: 500 }
    );
  }

  const { code } = await request.json().catch(() => ({}));
  if (typeof code !== "string" || code !== expected) {
    // The same words a wrong real code gets, so the demo door is
    // indistinguishable from the normal flow.
    return NextResponse.json(
      { error: "That code did not match." },
      { status: 401 }
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
