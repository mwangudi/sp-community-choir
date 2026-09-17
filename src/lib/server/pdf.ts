import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const run = promisify(execFile);

/** Set CHROME_PATH when the browser lives somewhere unusual. */
const CANDIDATES = [
  process.env.CHROME_PATH,
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
].filter(Boolean) as string[];

function findBrowser() {
  const found = CANDIDATES.find((c) => existsSync(c));
  if (!found) {
    throw new Error(
      "No Chrome or Chromium found to render the PDF. Install chromium, or set CHROME_PATH.",
    );
  }
  return found;
}

/**
 * Prints a page of our own site to PDF.
 *
 * The page is fetched with the caller's cookie and saved next to a temporary
 * copy, so the browser never needs a session of its own. Root-relative asset
 * URLs are made absolute because that copy is loaded from disk.
 */
export async function renderPagePdf(url: string, cookie: string) {
  const res = await fetch(url, { headers: { cookie }, redirect: "manual" });
  if (res.status !== 200) throw new Error(`page returned ${res.status}`);

  const origin = new URL(url).origin;
  const html = (await res.text())
    .replace(/(href|src)="\/(?!\/)/g, `$1="${origin}/`)
    .replace(/url\(\/(?!\/)/g, `url(${origin}/`);

  const dir = await mkdtemp(path.join(os.tmpdir(), "aid-pdf-"));
  const page = path.join(dir, "page.html");
  const out = path.join(dir, "aid.pdf");

  try {
    await writeFile(page, html, "utf8");
    // --headless=new quietly ignores --print-to-pdf, and without its own
    // profile the browser hands the job to a running instance and prints
    // nothing at all.
    await run(
      findBrowser(),
      [
        "--headless",
        "--disable-gpu",
        "--disable-extensions",
        "--no-first-run",
        "--no-sandbox",
        `--user-data-dir=${path.join(dir, "profile")}`,
        "--no-pdf-header-footer",
        "--virtual-time-budget=20000",
        `--print-to-pdf=${out}`,
        `file://${page.replace(/\\/g, "/")}`,
      ],
      { timeout: 60_000 },
    ).catch(() => undefined);

    if (!existsSync(out)) throw new Error("the browser exited without writing a PDF");
    return await readFile(out);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
