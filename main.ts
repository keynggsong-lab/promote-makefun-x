// Promote make.fun's make-your-own-bounty post on X — entry validator.
// Reads POST.json (the X post this entry names) and POST_TEXT.md (the text
// posted with the promo picture), checks every rule the bounty states for
// the post, and copies POST.json into the output directory for the grader.
// Node 22, standard library only. No network, no randomness, no clock:
// the same inputs always produce the same report and the same exit code.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? ".";
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "out";

const POST_URL_RE = /^https:\/\/(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/[0-9]+$/;
const PLAY_CODE_RE = /makefun-[a-z]+-[a-z]+-[a-z]+/;
const MAKEFUN_LINK_RE = /https?:\/\/(www\.)?make\.fun(\/\S*)?/i;
const MAKEFUN_WORD_RE = /(?<![A-Za-z0-9])make\.fun(?![A-Za-z0-9])/i;
const MAKEFUNAI_RE = /@makefunai/i;

interface CheckResult {
  name: string;
  ok: boolean;
  detail: string;
}

function readText(path: string): string | null {
  try {
    return readFileSync(path, "utf8");
  } catch {
    return null;
  }
}

function pngSize(path: string): { width: number; height: number } | null {
  try {
    const buf = readFileSync(path);
    // PNG signature (8 bytes) + IHDR chunk: width at offset 16, height at 20.
    if (buf.length < 24) return null;
    if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4e || buf[3] !== 0x47) return null;
    if (buf.toString("ascii", 12, 16) !== "IHDR") return null;
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function main(): number {
  const results: CheckResult[] = [];

  // 1. POST.json names the X post.
  const postJsonPath = join(BOT_DIR, "POST.json");
  const postJsonText = readText(postJsonPath);
  let postUrl = "";
  if (postJsonText === null) {
    results.push({ name: "post_json_present", ok: false, detail: "POST.json is missing" });
  } else {
    try {
      const parsed = JSON.parse(postJsonText) as { url?: unknown };
      postUrl = typeof parsed.url === "string" ? parsed.url : "";
    } catch {
      results.push({ name: "post_json_parse", ok: false, detail: "POST.json is not valid JSON" });
    }
  }
  if (postJsonText !== null) {
    results.push({
      name: "post_url_shape",
      ok: POST_URL_RE.test(postUrl),
      detail: postUrl === "" ? "POST.json has no post URL yet — post on X first, then fill it in" : `post URL: ${postUrl}`,
    });
  }

  // 2. POST_TEXT.md carries make.fun (link or written out) or @makefunai,
  //    plus a play code.
  const postText = readText(join(BOT_DIR, "POST_TEXT.md"));
  if (postText === null) {
    results.push({ name: "post_text_present", ok: false, detail: "POST_TEXT.md is missing" });
  } else {
    const hasMakefun = MAKEFUN_LINK_RE.test(postText) || MAKEFUN_WORD_RE.test(postText);
    const hasTag = MAKEFUNAI_RE.test(postText);
    results.push({
      name: "makefun_or_tag",
      ok: hasMakefun || hasTag,
      detail: hasMakefun
        ? "text carries make.fun"
        : hasTag
          ? "text tags @makefunai"
          : "text must carry make.fun (link or written out) or tag @makefunai",
    });
    const code = postText.match(PLAY_CODE_RE);
    results.push({
      name: "play_code",
      ok: code !== null,
      detail: code !== null ? `play code in text: ${code[0]}` : "text must carry a makefun-xxx-yyy-zzz play code",
    });
  }

  // 3. The promo picture exists and is a real PNG.
  const promoPath = join(BOT_DIR, "promo.png");
  const size = existsSync(promoPath) ? pngSize(promoPath) : null;
  results.push({
    name: "promo_png",
    ok: size !== null,
    detail: size !== null ? `promo.png is a PNG, ${size.width}x${size.height}` : "promo.png is missing or not a PNG",
  });

  // 4. Hand the post link to the grader.
  mkdirSync(OUT_DIR, { recursive: true });
  if (postUrl !== "") {
    copyFileSync(postJsonPath, join(OUT_DIR, "POST.json"));
  }

  const report = { competition: "post-x-promote-make-your-own-bounty-01", checks: results };
  writeFileSync(join(OUT_DIR, "report.json"), JSON.stringify(report, null, 2) + "\n", "utf8");
  for (const r of results) {
    console.log(`${r.ok ? "PASS" : "FAIL"} ${r.name}: ${r.detail}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed === 0 ? "All checks passed." : `${failed} check(s) failed.`);
  return failed === 0 ? 0 : 1;
}

process.exit(main());
