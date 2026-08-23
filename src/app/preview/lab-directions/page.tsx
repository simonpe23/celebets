import { Deck, Ledger, Tiles } from "./directions";

// Three art directions for the Lab, one screen each, chosen with
// ?v=tiles | ledger | deck. Local preview, gitignored.
export default async function LabDirections({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  if (v === "ledger") return <Ledger />;
  if (v === "deck") return <Deck />;
  return <Tiles />;
}
