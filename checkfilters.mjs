import { chromium } from "playwright";
const OUT = "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });

async function shot(name, clicks) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto("http://localhost:3000/preview/stats", { waitUntil: "networkidle" });
  for (const label of clicks) await p.getByRole("button", { name: label, exact: true }).click();
  await p.waitForTimeout(600);
  const card = p.locator("section", { hasText: "Profit over time" }).first();
  await card.screenshot({ path: `${OUT}/${name}.png` });
  await p.close();
}

await shot("chart-week", ["This week"]);
await shot("chart-month", ["This month"]);
await shot("chart-crypto", ["🪙 Crypto"]);
await b.close();
console.log("done");
