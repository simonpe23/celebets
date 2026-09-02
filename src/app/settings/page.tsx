import { balanceOf, type SettledFields } from "@/lib/stats";
import { createClient } from "@/lib/supabase/server";
import Settings from "@/components/Settings";
import type { BetWithLegs } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Start a new record needs today's balance, both to prefill the box
  // and to work out the transaction it has to write.
  const [{ data: transactions }, { data: bets }] = await Promise.all([
    supabase.from("transactions").select("amount, type, created_at"),
    // `status` and `settled_at` are here so `balanceOf` can tell an open
    // bet from a finished one. Without them this page would compute a
    // different balance from Track's, and it prefills the restart sheet
    // with that number.
    supabase.from("bets").select("stake, payout, placed_at, status, settled_at"),
  ]);

  const allTransactions = transactions ?? [];
  const allBets = (bets ?? []) as (SettledFields & { placed_at: string })[];

  const deposits = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = allTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  // THE SAME BALANCE TRACK SHOWS, through the same function. An open
  // bet moves nothing until it settles, his correction of 2 September
  // 2026, and this page prefills the "Restart my record" sheet with the
  // balance, so a different rule here would restart people on a number
  // they have never seen.
  const balance = balanceOf(allBets, deposits, withdrawals);

  const trackingSince =
    (user?.user_metadata?.tracking_since as string | undefined) ?? null;

  // When the current record began. Normally that is the first thing the
  // user ever tracked, which is the honest answer for the vast majority
  // who never restart. A restart overrides it.
  const firstActivity = [
    ...allBets.map((b) => b.placed_at),
    ...allTransactions.map((t) => t.created_at),
  ]
    .filter(Boolean)
    .sort()[0];
  const recordStartedAt =
    trackingSince ?? firstActivity ?? user?.created_at ?? null;

  // The same name the Track page greets with: the Google account's, or
  // whatever the user typed here. Never an email prefix.
  const fullName = user?.user_metadata?.full_name as string | undefined;

  return (
    <Settings
      email={user?.email ?? ""}
      name={fullName?.trim() ? fullName : null}
      userId={user!.id}
      balance={balance}
      trackingSince={trackingSince}
      recordStartedAt={recordStartedAt}
      trackingResetTx={
        (user?.user_metadata?.tracking_reset_tx as string | undefined) ?? null
      }
    />
  );
}
