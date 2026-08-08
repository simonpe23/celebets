import { createClient } from "@/lib/supabase/server";
import Settings from "@/components/Settings";
import type { BetWithLegs } from "@/lib/types";

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Start fresh needs today's balance, both to prefill the box and to
  // work out the transaction it has to write.
  const [{ data: transactions }, { data: bets }] = await Promise.all([
    supabase.from("transactions").select("type, amount"),
    supabase.from("bets").select("stake, payout"),
  ]);

  const allTransactions = transactions ?? [];
  const allBets = (bets ?? []) as Pick<BetWithLegs, "stake" | "payout">[];

  const deposits = allTransactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = allTransactions
    .filter((t) => t.type === "withdrawal")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const staked = allBets.reduce((sum, b) => sum + Number(b.stake), 0);
  const payouts = allBets.reduce((sum, b) => sum + Number(b.payout ?? 0), 0);

  const balance = deposits - withdrawals - staked + payouts;

  // The same name the Track page greets with: the Google account's, or
  // whatever the user typed here. Never an email prefix.
  const fullName = user?.user_metadata?.full_name as string | undefined;

  return (
    <Settings
      email={user?.email ?? ""}
      name={fullName?.trim() ? fullName : null}
      userId={user!.id}
      balance={balance}
      trackingSince={
        (user?.user_metadata?.tracking_since as string | undefined) ?? null
      }
    />
  );
}
