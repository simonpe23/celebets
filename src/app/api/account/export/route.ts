import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// EXPORT MY DATA. Everything Actuals holds about you, as one JSON
// file you can keep.
//
// Neither store requires this. It is here because it sits next to
// Delete my account, and someone about to delete in a bad moment
// should be able to take their record with them first. Deleting is
// permanent; this is the thing that makes it survivable.
//
// It runs on the user's OWN session, not the admin key. Row level
// security is therefore doing the filtering, which is exactly what
// it is for: this route cannot read another person's rows even if
// it tried.
//
// The connected accounts table is summarised, never dumped. It
// holds an encrypted Kalshi private key, and a key that is safe in
// the database is not safe in a file sitting in someone's Downloads
// folder.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const [bets, transactions, connections] = await Promise.all([
    supabase
      .from("bets")
      .select("*, legs(*), bet_buys(*)")
      .eq("user_id", user.id)
      .order("placed_at", { ascending: true }),
    supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("connected_accounts")
      .select("platform, connected_at, last_synced_at")
      .eq("user_id", user.id),
  ]);

  const failed = [bets.error, transactions.error].find((e) => e != null);
  if (failed) {
    return NextResponse.json(
      { error: "Could not read your data. Please try again." },
      { status: 500 }
    );
  }

  const payload = {
    exported_at: new Date().toISOString(),
    app: "Actuals",
    account: {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? null,
      created_at: user.created_at,
      record_started_on: user.user_metadata?.tracking_since ?? null,
    },
    bets: bets.data ?? [],
    transactions: transactions.data ?? [],
    // Which books are linked, and when. Never the credentials.
    connected_accounts: connections.data ?? [],
    counts: {
      bets: (bets.data ?? []).length,
      transactions: (transactions.data ?? []).length,
    },
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="actuals-data-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
