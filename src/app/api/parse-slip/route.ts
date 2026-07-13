import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { SPORTS, SUBCATEGORIES } from "@/lib/types";

// Reading a slip can take a little while on slow images.
export const maxDuration = 30;

const FOOTBALL_CATEGORIES = (SUBCATEGORIES.Football ?? [])
  .flatMap((item) =>
    typeof item === "string"
      ? [item]
      : item.children.map((child) => `${item.label}: ${child}`)
  )
  .join('", "');

const SYSTEM_PROMPT = `You read screenshots of sports bet slips (Kalshi, Polymarket, sportsbooks).
Respond with ONLY a JSON object, no other text, in this exact shape:
{
  "stake": number or null,
  "to_collect": number or null,
  "legs": [
    { "sport": string or null, "category": string or null, "pick": string or null, "percent": number or null }
  ]
}
Rules:
- stake: the total amount wagered (Kalshi calls it Cost). USD number, no symbols.
- to_collect: the total payout if the bet wins (Max Payout / Payout if right). USD number.
- One leg per pick shown on the slip. A single bet has exactly one leg.
- sport must be exactly one of: "${SPORTS.join('", "')}". Soccer, FIFA and World Cup football are "Football". Bitcoin, Ethereum and other crypto price markets are "Crypto". Use null when unsure.
- category: for Football prefer exactly one of: "${FOOTBALL_CATEGORIES}". For other sports or unusual bets write a short fitting category yourself, or null.
- pick: a short human name for the pick, like "France advances" or "Mbappe 1+ goals".
- percent: the chance percentage shown next to the pick (like 44 for 44%), else null.
- Never invent numbers that are not visible on the slip.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not logged in." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "The AI key is not set up yet. Add ANTHROPIC_API_KEY in Vercel and redeploy.",
      },
      { status: 500 }
    );
  }

  let image: unknown;
  try {
    ({ image } = await request.json());
  } catch {
    return NextResponse.json({ error: "No image received." }, { status: 400 });
  }

  const match = /^data:(image\/(?:png|jpeg|jpg|webp|gif));base64,(.+)$/.exec(
    typeof image === "string" ? image : ""
  );
  if (!match) {
    return NextResponse.json(
      { error: "That does not look like an image." },
      { status: 400 }
    );
  }
  const mediaType = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const data = match[2];

  const aiResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: { type: "base64", media_type: mediaType, data },
            },
            { type: "text", text: "Read this bet slip." },
          ],
        },
      ],
    }),
  });

  if (!aiResponse.ok) {
    return NextResponse.json(
      { error: "The AI service could not read the image. Try again." },
      { status: 502 }
    );
  }

  const payload = await aiResponse.json();
  const text: string = payload?.content?.[0]?.text ?? "";
  const jsonText = text.match(/\{[\s\S]*\}/)?.[0];

  if (!jsonText) {
    return NextResponse.json(
      { error: "Could not find a bet slip in that image." },
      { status: 422 }
    );
  }

  try {
    const parsed = JSON.parse(jsonText);
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(
      { error: "Could not read the bet slip. Try a clearer screenshot." },
      { status: 422 }
    );
  }
}
