/**
 * Refresh the product screenshots used on the marketing site.
 *
 * Logs into the public demo tenant, captures each module at 1440x900 @2x,
 * then downscales to 1920px-wide WebP into public/shots/.
 *
 * Requires Playwright and ffmpeg (with libwebp) on PATH:
 *   npx playwright install chromium
 *   node scripts/capture-shots.mjs
 */
import { chromium } from "playwright"
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const BASE = process.env.REEF_APP ?? "https://reef.moaj.info"
const DEST = new URL("../public/shots/", import.meta.url).pathname
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), "reef-shots-"))

// Only capture what the site actually renders — keep this list in sync with the pages.
const SHOTS = [
  { file: "dashboard", route: "/" },
  { file: "usine", route: "/usine" },
  { file: "port", route: "/port" },
  { file: "transport", route: "/transport" },
  { file: "commandes", route: "/orders" },
  { file: "analytique", route: "/analytics" },
  { file: "inventaire", route: "/inventory" },
]

// Charts animate in; freeze everything before the shutter.
const FREEZE = `*, *::before, *::after {
  animation-duration: 0s !important; animation-delay: 0s !important;
  transition-duration: 0s !important; transition-delay: 0s !important; }`

fs.mkdirSync(DEST, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
const page = await ctx.newPage()

await page.goto(`${BASE}/login`, { waitUntil: "networkidle", timeout: 60_000 })
const demoButton = page.getByRole("button", { name: /d[ée]mo/i }).first()
if (await demoButton.count()) {
  await demoButton.click()
} else {
  await page.fill("input[type=email]", "admin@mineko.com")
  await page.fill("input[type=password]", "demo1234")
  await page.click("button[type=submit]")
}
await page.waitForTimeout(7000)
if (page.url().includes("/login")) throw new Error("demo login failed — check the demo tenant")

for (const { file, route } of SHOTS) {
  await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45_000 })
  await page.waitForTimeout(3500)
  await page.addStyleTag({ content: FREEZE })
  await page.waitForTimeout(800)

  const png = path.join(TMP, `${file}.png`)
  await page.screenshot({ path: png })
  execFileSync("ffmpeg", [
    "-y", "-loglevel", "error", "-i", png,
    "-vf", "scale=1920:-2:flags=lanczos",
    "-c:v", "libwebp", "-quality", "80", "-compression_level", "6",
    path.join(DEST, `${file}.webp`),
  ])
  console.log(`✓ ${file}.webp`)
}

await browser.close()
fs.rmSync(TMP, { recursive: true, force: true })
