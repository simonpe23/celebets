import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { decryptSecret, encryptSecret } from "@/lib/connectCrypto";
import { KalshiError, testConnection } from "@/lib/kalshi";

// Connect, inspect, and disconnect a Kalshi account. Read only:
// nothing in the app can trade, and the key is proven against
// Kalshi's smallest read (the balance) BEFORE it is stored, so a
// mistyped key is rejected on the spot instead of failing silently
// on the first sync.

// A user-shaped sentence for the ways this actually fails.
function friendly(e: unknown): string {
  if (e instanceof KalshiError) {
    if (e.status === 401 || e.status === 403)
      return "Kalshi did not accept this key. Check the Key ID and that the private key file was pasted whole.";
    return `Kalshi could not be reached (${e.status}). Try again in a minute.`;
  }
  if (e instanceof Error && e.message.includes("CONNECT_ENC_KEY"))
    return "Connections are not switched on for this deployment yet.";
  return "Something went wrong. Try again.";
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  // Refuse BEFORE talking to Kalshi when this deployment cannot store
  // the key anyway: the encryption setting is missing until the owner
  // adds it in Vercel, and testing first would 500 after a successful
  // test, which reads as a Kalshi problem when it is a setup one.
  if (!/^[0-9a-fA-F]{64}$/.test(process.env.CONNECT_ENC_KEY ?? "")) {
    return NextResponse.json(
      { error: "Connections are not switched on for this deployment yet." },
      { status: 503 }
    );
  }

  const { accessKey, privateKey } = await request.json().catch(() => ({}));
  if (typeof accessKey !== "string" || accessKey.trim() === "")
    return NextResponse.json({ error: "The Key ID is missing." }, { status: 400 });
  if (
    typeof privateKey !== "string" ||
    !privateKey.includes("-----BEGIN") ||
    !privateKey.includes("PRIVATE KEY-----")
  )
    return NextResponse.json(
      {
        error:
          "That does not look like the private key file. Paste everything, including the BEGIN and END lines.",
      },
      { status: 400 }
    );

  // Prove the key against Kalshi before anything is stored.
  let balanceCents: number;
  try {
    ({ balanceCents } = await testConnection(accessKey.trim(), privateKey));
  } catch (e) {
    return NextResponse.json({ error: friendly(e) }, { status: 400 });
  }

  const { error } = await supabase.from("connected_accounts").upsert(
    {
      user_id: user.id,
      platform: "kalshi",
      access_key: accessKey.trim(),
      encrypted_secret: encryptSecret(privateKey),
      connected_at: new Date().toISOString(),
    },
    { onConflict: "user_id,platform" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true, balanceCents });
}

// The connect page asks: am I connected, and since when?
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { data } = await supabase
    .from("connected_accounts")
    .select("platform, connected_at, last_synced_at")
    .eq("platform", "kalshi")
    .maybeSingle();

  return NextResponse.json({ connected: data ?? null });
}

// Re-test an existing connection with the STORED key: the connected
// screen's "Test connection". Proves the whole chain, decryption
// included, without the user retyping anything.
export async function PATCH() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { data } = await supabase
    .from("connected_accounts")
    .select("access_key, encrypted_secret")
    .eq("platform", "kalshi")
    .maybeSingle();
  if (!data)
    return NextResponse.json({ error: "Kalshi is not connected." }, { status: 404 });

  try {
    const { balanceCents } = await testConnection(
      data.access_key,
      decryptSecret(data.encrypted_secret)
    );
    return NextResponse.json({ ok: true, balanceCents });
  } catch (e) {
    return NextResponse.json({ error: friendly(e) }, { status: 400 });
  }
}

export async function DELETE() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not logged in." }, { status: 401 });

  const { error } = await supabase
    .from("connected_accounts")
    .delete()
    .eq("platform", "kalshi");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
