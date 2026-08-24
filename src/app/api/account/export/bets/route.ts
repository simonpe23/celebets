import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { effectiveResult, legShares } from "@/lib/stats";
import { CSV_BOM, toCsv } from "@/lib/csv";
import type { BetWithLegs } from "@/lib/types";

// EXPORT MY BETS, as a CSV. Replaces the JSON export the owner tried
// first: "pretty useless for most ppl that dont read code right?"
// He was right. A spreadsheet a person can actually open beats a
// data structure only a program can read.
//
// ONE ROW PER LEG, ruled by the owner over one row per bet with legs
// squeezed into a single cell. A parlay's legs stay fully visible
// and filterable in Excel or Numbers, at the cost of a big parlay
// taking several rows for one bet. "Bet #" ties those rows back
// together; it is assigned here for readability and is not a
// database id.
//
// STAKE AND PAYOUT ARE THE BET'S OWN NUMBERS, never a per-leg split.
// legShares/legStakeShares exist to answer a modelling question
// ("how much did Football earn me"), for the stats screens. This
// file is a record of what actually happened, and the stake and
// payout a bet slip shows are hard facts, so they repeat on every
// leg row rather than being divided. Profit per leg is the one
// place a computed split belongs, because it is the exact number
// Performance already shows for that leg.
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("bets")
    .select("*, legs(*), bet_buys(*)")
    .eq("user_id", user.id)
    .order("placed_at", { ascending: true });

  if (error) {
    return NextResponse.json(
      { error: "Could not read your bets. Please try again." },
      { status: 500 }
    );
  }

  const bets = (data ?? []) as BetWithLegs[];
  const dateOnly = (iso: string | null) => (iso ? iso.slice(0, 10) : "");
  const titleCase = (s: string) => s[0].toUpperCase() + s.slice(1);

  const header = [
    "Bet #",
    "Date placed",
    "Date settled",
    "Type",
    "Status",
    "Cashed out",
    "Bet stake ($)",
    "Bet payout ($)",
    "Sport",
    "Category",
    "Market",
    "Competition",
    "Period",
    "Pick",
    "Odds",
    "Leg result",
    "Leg profit ($)",
  ];

  const rows: (string | number | null)[][] = [];
  bets.forEach((bet, betIndex) => {
    const shares = legShares(bet);
    bet.legs.forEach((leg, i) => {
      // The same fallback the app itself uses: an optional pick
      // description falls back to the category, then the sport.
      const pick = leg.description || leg.subcategory || leg.sport;
      rows.push([
        betIndex + 1,
        dateOnly(bet.placed_at),
        dateOnly(bet.settled_at),
        bet.legs.length > 1 ? "Parlay" : "Single",
        titleCase(bet.status),
        bet.cashed_out ? "Yes" : "No",
        Number(bet.stake).toFixed(2),
        bet.payout === null ? "" : Number(bet.payout).toFixed(2),
        leg.sport,
        leg.subcategory ?? "",
        leg.market ?? "",
        leg.competition ?? "",
        leg.period ?? "Full time",
        pick,
        leg.odds === null ? "" : Number(leg.odds).toFixed(2),
        titleCase(effectiveResult(bet, leg)),
        // legShares only means something once a bet has settled; for
        // a pending bet it is a row of zeros, and printing "0.00" on
        // a leg with no result yet would read as a loss.
        bet.status === "pending" ? "" : (shares[i] ?? 0).toFixed(2),
      ]);
    });
  });

  const csv = CSV_BOM + toCsv(header, rows);
  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="actuals-bets-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
