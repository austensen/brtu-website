/**
 * Local maintainer tool only — generates a PNG QR code for a given URL.
 * Do not run in CI or commit outputs (especially bootstrap links with `t=` secrets).
 */

import { config } from "dotenv";
import { mkdirSync } from "fs";
import { dirname, join, resolve } from "path";
import QRCode from "qrcode";
import { fileURLToPath } from "url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const repoRoot = join(webRoot, "../..");
config({ path: join(webRoot, ".env") });
config({ path: join(repoRoot, ".env") });

const DEFAULT_WIDTH = 512;
const DEFAULT_OUT_DIR = join(repoRoot, ".local", "qr");

function usage(): void {
  console.error(`Usage: npm run qr -- --url <url> [--out <path>] [--width <px>]

  --url    Full URL to encode (query params allowed)
  --out    Output PNG path (default: .local/qr/brtu-qr-<slug>.png)
  --width  QR image width in pixels (default: ${DEFAULT_WIDTH})`);
}

function parseArgs(argv: string[]): { url?: string; out?: string; width: number } {
  let url: string | undefined;
  let out: string | undefined;
  let width = DEFAULT_WIDTH;

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--url") {
      url = argv[++i];
    } else if (arg === "--out") {
      out = argv[++i];
    } else if (arg === "--width") {
      const n = Number(argv[++i]);
      if (!Number.isFinite(n) || n < 64) {
        console.error("generate-qr: --width must be a number >= 64");
        process.exit(1);
      }
      width = n;
    } else if (arg === "--help" || arg === "-h") {
      usage();
      process.exit(0);
    } else {
      console.error(`generate-qr: unknown argument: ${arg}`);
      usage();
      process.exit(1);
    }
  }

  return { url, out, width };
}

function slugPart(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** e.g. bootstrap URL → `brtu-qr-api-members-bootstrap-t-abc-to-en-events.png` */
function qrDownloadFilename(pageUrl: string): string {
  let pathSlug = "home";
  try {
    const u = new URL(pageUrl);
    const segments = u.pathname.split("/").map(slugPart).filter(Boolean);
    pathSlug = segments.length ? segments.join("-") : "home";
    if (u.search.length > 1) {
      const qs = u.search
        .slice(1)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 80);
      if (qs) pathSlug = `${pathSlug}-${qs}`;
    }
  } catch {
    pathSlug = "page";
  }

  const base = `brtu-qr-${pathSlug}`.replace(/-+/g, "-");
  const capped = base.length > 180 ? `${base.slice(0, 180)}`.replace(/-+$/, "") : base;
  return `${capped || "brtu-qr"}.png`;
}

function redactUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.searchParams.has("t")) {
      u.searchParams.set("t", "[REDACTED]");
    }
    return u.toString();
  } catch {
    return url.replace(/([?&]t=)[^&]*/i, "$1[REDACTED]");
  }
}

function defaultOutPath(url: string): string {
  return join(DEFAULT_OUT_DIR, qrDownloadFilename(url));
}

const { url, out, width } = parseArgs(process.argv.slice(2));

if (!url) {
  console.error("generate-qr: --url is required");
  usage();
  process.exit(1);
}

try {
  new URL(url);
} catch {
  console.error("generate-qr: invalid URL");
  process.exit(1);
}

const outPath = resolve(out ?? defaultOutPath(url));
mkdirSync(dirname(outPath), { recursive: true });

await QRCode.toFile(outPath, url, {
  margin: 2,
  width,
  errorCorrectionLevel: "M",
});

console.log(`generate-qr: wrote ${outPath}`);
console.log(`generate-qr: encoded ${redactUrl(url)}`);
