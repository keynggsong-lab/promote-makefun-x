// Validator for the "Promote make.fun's make-your-own-bounty post on X" entry.
// It reads the X post named in POST.json and the draft text in POST_TEXT.md,
// verifies the post follows every rule the bounty states, confirms the promo
// picture is a genuine PNG, and hands the post link to the grader by copying
// POST.json into the output directory together with a validation report.
// Pure Node 22 standard library (node:fs, node:path). Nothing here touches
// the network, the clock, or any randomness, so identical inputs always
// produce identical output and the same exit code.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? ".";
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "out";
const COMPETITION = "post-x-promote-make-your-own-bounty-01";

const POST_URL_PATTERN = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/;
const PLAY_CODE_PATTERN = /makefun-[a-z]+-[a-z]+-[a-z]+/;
const MAKEFUN_LINK_PATTERN = /https?:\/\/(www\.)?make\.fun(\/\S*)?/i;
const MAKEFUN_WORD_PATTERN = /(?<![A-Za-z0-9])make\.fun(?![A-Za-z0-9])/i;
const MAKEFUNAI_PATTERN = /@makefunai/i;

type Check = { name: string; ok: boolean; detail: string };

function fileText(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

// Read a PNG's pixel size from its IHDR chunk (width at byte 16, height at
// byte 20), after confirming the 8-byte PNG signature. Returns null for
// anything that is not a readable PNG.
function pngDimensions(path: string): { width: number; height: number } | null {
  let data: Buffer;
  try {
    data = readFileSync(path);
  } catch {
    return null;
  }
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (data.length < 24 || !signature.every((b, i) => data[i] === b)) return null;
  if (data.toString("ascii", 12, 16) !== "IHDR") return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

function validatePostLink(): { checks: Check[]; url: string } {
  const checks: Check[] = [];
  const raw = fileText(join(BOT_DIR, "POST.json"));
  let url = "";
  if (raw === null) {
    checks.push({ name: "post_json_present", ok: false, detail: "POST.json is missing" });
    return { checks, url };
  }
  let parsed: { url?: unknown };
  try {
    parsed = JSON.parse(raw) as { url?: unknown };
  } catch {
    checks.push({ name: "post_json_parse", ok: false, detail: "POST.json is not valid JSON" });
    return { checks, url };
  }
  if (typeof parsed.url === "string") url = parsed.url;
  checks.push({
    name: "post_url_shape",
    ok: POST_URL_PATTERN.test(url),
    detail:
      url === ""
        ? "POST.json has no post URL yet — post on X first, then fill it in"
        : `post URL: ${url}`,
  });
  return { checks, url };
}

function validatePostText(): Check[] {
  const text = fileText(join(BOT_DIR, "POST_TEXT.md"));
  if (text === null) {
    return [{ name: "post_text_present", ok: false, detail: "POST_TEXT.md is missing" }];
  }
  const checks: Check[] = [];
  const hasMakefun = MAKEFUN_LINK_PATTERN.test(text) || MAKEFUN_WORD_PATTERN.test(text);
  const hasTag = MAKEFUNAI_PATTERN.test(text);
  checks.push({
    name: "makefun_or_tag",
    ok: hasMakefun || hasTag,
    detail: hasMakefun
      ? "text carries make.fun"
      : hasTag
        ? "text tags @makefunai"
        : "text must carry make.fun (link or written out) or tag @makefunai",
  });
  const code = text.match(PLAY_CODE_PATTERN);
  checks.push({
    name: "play_code",
    ok: code !== null,
    detail: code !== null ? `play code in text: ${code[0]}` : "text must carry a makefun-xxx-yyy-zzz play code",
  });
  return checks;
}

function validatePromo(): Check[] {
  const path = join(BOT_DIR, "promo.png");
  if (!existsSync(path)) {
    return [{ name: "promo_png", ok: false, detail: "promo.png is missing or not a PNG" }];
  }
  const size = pngDimensions(path);
  return [
    {
      name: "promo_png",
      ok: size !== null,
      detail: size !== null ? `promo.png is a PNG, ${size.width}x${size.height}` : "promo.png is missing or not a PNG",
    },
  ];
}

function main(): number {
  const { checks: linkChecks, url } = validatePostLink();
  const checks: Check[] = [...linkChecks, ...validatePostText(), ...validatePromo()];

  mkdirSync(OUT_DIR, { recursive: true });
  if (url !== "") copyFileSync(join(BOT_DIR, "POST.json"), join(OUT_DIR, "POST.json"));
  writeFileSync(
    join(OUT_DIR, "report.json"),
    JSON.stringify({ competition: COMPETITION, checks }, null, 2) + "\n",
    "utf8",
  );

  for (const c of checks) console.log(`${c.ok ? "PASS" : "FAIL"} ${c.name}: ${c.detail}`);
  const failed = checks.filter((c) => !c.ok).length;
  console.log(failed === 0 ? "All checks passed." : `${failed} check(s) failed.`);
  return failed === 0 ? 0 : 1;
}

// Exit 0 only when every check passes; any failure exits 1.
process.exit(main());
