// Zoomed inspection: the apex seam, the dot, and the l tip, at the
// magnification the owner used when he found the faults.
import { chromium } from "/home/user/celebets/node_modules/playwright/index.mjs";
import { readFileSync, writeFileSync } from "fs";
const B = "/home/user/celebets/brand/actuals";
const load = (f) => "data:image/svg+xml;base64," +
  Buffer.from(readFileSync(`${B}/${f}`)).toString("base64");
const html = `<body style="margin:0;background:#dcdce4;padding:16px;display:flex;flex-direction:column;gap:16px">
<div style="display:flex;gap:16px">
 <div style="background:#fff;border-radius:12px;overflow:hidden;width:400px;height:400px;position:relative">
   <img src="${load("symbol.svg")}" style="position:absolute;width:1100px;left:-330px;top:-40px">
 </div>
 <div style="background:#05050B;border-radius:12px;overflow:hidden;width:400px;height:400px;position:relative">
   <img src="${load("symbol.svg")}" style="position:absolute;width:1100px;left:-120px;top:-560px">
 </div>
 <div style="background:#fff;border-radius:12px;padding:14px"><img src="${load("symbol.svg")}" width="360"></div>
</div>
<div style="background:#05050B;border-radius:12px;overflow:hidden;height:300px;position:relative">
  <img src="${load("wordmark-dark.svg")}" style="position:absolute;width:2600px;left:-1500px;top:-30px">
</div>
<div style="background:#fff;border-radius:12px;padding:20px"><img src="${load("wordmark-light.svg")}" width="1180"></div>
</body>`;
writeFileSync("/tmp/zoom.html", html);
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" });
const p = await (await b.newContext({ viewport: { width: 1260, height: 1080 }, deviceScaleFactor: 2 })).newPage();
await p.goto("file:///tmp/zoom.html");
await p.waitForTimeout(500);
await p.screenshot({ path: "/tmp/claude-0/-home-user-celebets/1db5ff81-a9a7-5fe4-8520-6be8e5866368/scratchpad/shots/zoom.png", fullPage: true });
console.log("zoom done");
await b.close();
