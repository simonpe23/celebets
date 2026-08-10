// Does the tab bar answer your finger before the page arrives?
//
// This is the bug the owner reported as "i've seen them click the menu
// bar without anything happening". It was happening, the bar just did
// not say so: usePathname only changes once a navigation FINISHES, and
// these pages take a Supabase round trip plus every bet you own.
//
// The test holds the navigation open so it can never finish, then
// checks the tapped tab is already lit. If someone ever goes back to
// deriving the active tab from the pathname alone, this fails.
//
//   node taptest.mjs [port]
import { chromium } from "playwright";

const port = process.argv[2] ?? "3000";
const browser = await chromium.launch({
  executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
const page = await browser.newPage({
  viewport: { width: 393, height: 664 }, hasTouch: true, isMobile: true,
});
await page.goto(`http://localhost:${port}/preview`, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

const litTab = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("nav a")]
      .filter((a) => a.className.includes("text-brand-top"))
      .map((a) => a.textContent.trim())
      .join(",")
  );

const before = await litTab();

// Hold the navigation open. Nothing about the destination can arrive,
// so anything that lights up is the bar answering the tap itself.
await page.route("**/stats**", () => {});
await page.getByRole("link", { name: "Performance" }).click({ noWaitAfter: true });
await page.waitForTimeout(120);
const during = await litTab();

await browser.close();

console.log(`lit before the tap: ${before || "(none)"}`);
console.log(`lit 120ms after it: ${during || "(none)"}`);
if (during === "Performance") {
  console.log("PASS: the tab lights up on touch, not on arrival.");
} else {
  console.log("FAIL: the tap produced no visible response.");
  process.exit(1);
}
