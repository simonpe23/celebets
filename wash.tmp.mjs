import { chromium } from "playwright";
import { launchOpts } from "./testbrowser.mjs";
const b = await chromium.launch(launchOpts());
for (const [w,h,label] of [[320,800,"320"],[393,852,"393"],[1512,800,"1512"],[1512,1600,"tall"]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto("http://localhost:3320/preview/performance-home", { waitUntil: "networkidle" });
  await p.waitForTimeout(400);
  const out = await p.evaluate(() => [...document.querySelectorAll("img")].map((i) => {
    const r = i.getBoundingClientRect();
    return { src: (i.getAttribute("src")||"").slice(0,60), fit: getComputedStyle(i).objectFit,
      drawn: +(r.width/r.height).toFixed(3), nat: i.naturalWidth ? +(i.naturalWidth/i.naturalHeight).toFixed(3) : null,
      box: `${Math.round(r.width)}x${Math.round(r.height)}` };
  }));
  console.log(`\n${label}:`);
  for (const o of out) console.log(`  fit=${o.fit.padEnd(8)} drawn ${o.drawn} nat ${o.nat} box ${o.box}  ${o.src}`);
  await p.close();
}
await b.close();
