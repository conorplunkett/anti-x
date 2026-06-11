// E2E test: loads the real extension into Chromium against a local mock of
// X's DOM (test/fake-x-server.py) with x.com mapped to 127.0.0.1.
//
// Usage:
//   1. openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 2 \
//        -nodes -subj "/CN=x.com" -addext "subjectAltName=DNS:x.com,DNS:twitter.com"
//   2. sudo python3 test/fake-x-server.py   (serves HTTPS on :443)
//   3. node test/e2e.mjs                    (needs `npm i playwright` + a chromium)
//
// Env vars: CHROME_PATH to point at a Chromium binary.

import { chromium } from "playwright";

const EXT = new URL("../source", import.meta.url).pathname;
const CHROME = process.env.CHROME_PATH;

const ctx = await chromium.launchPersistentContext("/tmp/anti-timeline-e2e-profile", {
  ...(CHROME ? { executablePath: CHROME } : {}),
  headless: false,
  ignoreHTTPSErrors: true,
  args: [
    "--headless=new",
    "--no-sandbox",
    "--ignore-certificate-errors",
    "--host-resolver-rules=MAP x.com 127.0.0.1,MAP twitter.com 127.0.0.1",
    `--disable-extensions-except=${EXT}`,
    `--load-extension=${EXT}`,
  ],
  viewport: { width: 1440, height: 900 },
});

const p = ctx.pages()[0] || (await ctx.newPage());
let failures = 0;
const check = (name, ok) => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures++;
};
const go = async (url) => {
  await p.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await p.waitForTimeout(1500);
};
const blockedScreen = () =>
  p.evaluate(() => !!document.getElementById("anti-timeline-blocked"));
const hidden = (sel) =>
  p.evaluate((s) => {
    const el = document.querySelector(s);
    return !!el && getComputedStyle(el).display === "none";
  }, sel);

await go("https://x.com/home");
check("/home shows blocked screen", await blockedScreen());
check("/home feed hidden", await hidden('div[aria-label="Home timeline"]'));
check("sidebar trends hidden", await hidden('[data-testid="sidebarColumn"] [aria-label*="Trending" i]'));
check("who-to-follow hidden", await hidden('[data-testid="sidebarColumn"] aside[aria-label*="who to follow" i]'));
check("explore nav link hidden", await hidden('a[data-testid="AppTabBar_Explore_Link"]'));
check(
  "blocked screen has shortcuts",
  await p.evaluate(
    () => document.getElementById("anti-timeline-blocked")?.querySelectorAll("a").length >= 6
  )
);

await go("https://x.com/explore");
check("/explore blocked", await blockedScreen());

await go("https://x.com/messages");
check(
  "/messages untouched",
  await p.evaluate(
    () =>
      !document.getElementById("anti-timeline-blocked") &&
      [...document.querySelectorAll('[data-testid="cellInnerDiv"]')].some(
        (c) => getComputedStyle(c).display !== "none"
      )
  )
);

await go("https://x.com/notifications");
check("/notifications untouched", !(await blockedScreen()));

await go("https://x.com/someuser/status/12345");
const st = await p.evaluate(() => {
  const cells = [...document.querySelectorAll('[data-testid="cellInnerDiv"]')];
  const dmIdx = cells.findIndex((c) => /discover more/i.test(c.textContent));
  const disp = (c) => getComputedStyle(c).display;
  return {
    noScreen: !document.getElementById("anti-timeline-blocked"),
    dmHidden: dmIdx >= 0 && disp(cells[dmIdx]) === "none",
    afterHidden: cells.slice(dmIdx + 1).every((c) => disp(c) === "none"),
    beforeVisible: cells.slice(0, dmIdx).every((c) => disp(c) !== "none"),
  };
});
check("tweet page not blocked", st.noScreen);
check("replies above Discover-more visible", st.beforeVisible);
check("Discover-more header hidden", st.dmHidden);
check("posts after Discover-more hidden", st.afterHidden);

await go("https://twitter.com/home");
check("twitter.com/home blocked", await blockedScreen());

await ctx.close();
console.log(failures === 0 ? "\nAll checks passed ✓" : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
