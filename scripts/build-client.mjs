/**
 * dsh-cyui — 把 assets/ 下的自绘 SVG 与令牌表注入 lib/client.template.js，
 * 产出 lib/client.js（浏览器端 bundle）。
 *
 * 为什么要这一步：client bundle 是单文件，宿主按 package.json 的
 * exports["./client"] 直接取它，运行时读不到 assets/ —— 图形必须以字符串形式
 * 内联。assets 仍是唯一真源，改图后重跑本脚本即可。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const ASSETS = path.join(ROOT, "assets");
const TEMPLATE = path.join(ROOT, "lib", "client.template.js");
const OUT = path.join(ROOT, "lib", "client.js");
const TOKENS_JSON = path.join(ASSETS, "tokens.json");
const REF_CLIENT = path.join(ROOT, "scripts", "client.reference.js");

const read = (file) => fs.readFileSync(file, "utf8").replace(/^\uFEFF/, "");

/** 从上一版 client.js 里抽出两份令牌表，落成 assets/tokens.json。 */
function extractTokensFromReference() {
  if (fs.existsSync(TOKENS_JSON)) return JSON.parse(read(TOKENS_JSON));
  if (!fs.existsSync(REF_CLIENT)) {
    throw new Error(`missing ${TOKENS_JSON}; cannot extract tokens without ${REF_CLIENT}`);
  }
  const src = read(REF_CLIENT);
  const grab = (name, next) => {
    const start = src.indexOf(`const ${name}`);
    const stop = src.indexOf(next, start);
    if (start < 0 || stop < 0) throw new Error(`cannot locate ${name}`);
    const chunk = src.slice(start, stop);
    const pairs = [...chunk.matchAll(/"(--dsw-alias-[a-z0-9-]+)"\s*:\s*"([^"]+)"/g)];
    const out = {};
    for (const pair of pairs) out[pair[1]] = pair[2];
    return out;
  };
  const tokens = {
    night: grab("TOKENS_NIGHT", "const TOKENS_DAWN"),
    dawn: grab("TOKENS_DAWN", "const AMBIENCE_CSS")
  };
  fs.writeFileSync(TOKENS_JSON, `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  return tokens;
}

const tokens = extractTokensFromReference();

/** placeholder -> [file under assets/, mime] — inlined as data URIs. */
const assets = {
  __CUP_PNG__: ["pixel/cup.png", "image/png"],
  __PENGUIN_PNG__: ["pixel/penguin.png", "image/png"],
  __CATEAR_PNG__: ["pixel/catear-headset.png", "image/png"],
  __RADIO_PNG__: ["pixel/radio.png", "image/png"]
};

let body = read(TEMPLATE);
let inlineBytes = 0;

for (const [placeholder, [file, mime]] of Object.entries(assets)) {
  const filePath = path.join(ASSETS, file);
  if (!fs.existsSync(filePath)) throw new Error(`missing asset: ${file}`);
  const bytes = fs.readFileSync(filePath);
  inlineBytes += bytes.length;
  body = body.replace(placeholder, JSON.stringify(`data:${mime};base64,${bytes.toString("base64")}`));
}

body = body.replace("__TOKENS_NIGHT__", JSON.stringify(tokens.night, null, "\t"));
body = body.replace("__TOKENS_DAWN__", JSON.stringify(tokens.dawn, null, "\t"));

const leftovers = body.match(/__[A-Z_]+__/g);
if (leftovers) throw new Error(`unreplaced placeholders: ${leftovers.join(", ")}`);

fs.writeFileSync(OUT, body, "utf8");

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
console.log(`tokens: night=${Object.keys(tokens.night).length} dawn=${Object.keys(tokens.dawn).length}`);
console.log(`assets: ${Object.values(assets).map(([f]) => f).join(", ")} (${kb(inlineBytes)} raw)`);
console.log(`wrote ${path.relative(ROOT, OUT)} (${kb(fs.statSync(OUT).size)})`);
