import { createClient } from "@/lib/supabase/server";
import TransactionsList from "@/components/TransactionsList";
import type { Transaction } from "@/lib/types";

export default async function TransactionsPage() {
  const supabase = await createClient();

  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, type, amount, created_at")
    .order("created_at", { ascending: false });

  return (
    <TransactionsList transactions={(transactions ?? []) as Transaction[]} />
  );
}
