import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { CSV_BOM, toCsv } from "@/lib/csv";

// EXPORT MY BALANCE HISTORY, as a CSV. Kept separate from the bets
// export rather than merged into one file: a deposit and a bet leg
// do not share columns, and forcing two different shapes of row
// into one table is exactly the kind of file a spreadsheet renders
// badly.

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Could not read your balance history. Please try again." },
      { status: 500 }
    );
  }

  // "Added" / "Removed", not "Deposit" / "Withdrawal": the same
  // words TransactionsList already shows on this data, and the
  // app's own vocabulary rule. The database column is still typed
  // deposit/withdrawal; only what a person reads changes.
  const rows = (data ?? []).map((t) => [
    String(t.created_at).slice(0, 10),
    t.type === "deposit" ? "Added" : "Removed",
    Number(t.amount).toFixed(2),
  ]);

  const csv = CSV_BOM + toCsv(["Date", "Type", "Amount ($)"], rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="actuals-balance-history-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
