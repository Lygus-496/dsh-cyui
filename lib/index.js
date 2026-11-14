/**
 * dsh-cyui — host half.
 *
 * The look lives in the browser half (`exports["./client"]`). This half exists
 * for one reason: a launch screen has to be in the served HTML, not appended by
 * a client module — by then the page has already painted.
 *
 * So we tap the index document (`tapIndex`) and inline a self-contained
 * "incoming call" screen: Cyui's marker (the cat-ear headset) pulsing in the
 * middle of a cyber grid, a shaking call button under it, and the page only
 * starts once the visitor answers.
 *
 * Dismissal is a **checkbox**, not a script. A host with a strict CSP drops
 * inline scripts, and a script-driven close would then leave the screen stuck
 * until its timeout — which reads to the user as "the animation vanished".
 * `<input type="checkbox">` + `<label for>` needs no script at all; the small
 * script that follows only adds the vibration pulse and clears the node.
 */

import { mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/** Wallpaper bytes, read once. Served over HTTP because a 172 KB data: URI in
 *  a stylesheet is at the mercy of the host's CSP img-src. */
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOM_PATH = join(HERE, "..", "assets", "room-bg.jpg");
const ROOM_ROUTE = "/dsh-cyui/room.jpg";
let roomCache = null;
function roomBytes() {
  if (roomCache === null) roomCache = readFileSync(ROOM_PATH);
  return roomCache;
}

/**
 * Where a user may drop their own wallpaper, in priority order.
 *
 * The first hit wins. A build that ships no artwork simply resolves to nothing
 * and the client falls back to its gradients — that is what makes this package
 * publishable without bundling someone else's screenshot.
 */
/** Where user wallpapers live.
 *
 * Resolved from the home directory, not from a relative path: the desktop host
 * does not always export DSH_HOME, and the old fallback resolved into
 * node_modules — so uploads landed somewhere a restart could not find again.
 */
const DSH_HOME = process.env.DSH_HOME || join(homedir(), ".dsh");
const WALL_DIR = join(DSH_HOME, "theme-cyui");
/** Pre-rename location, still read so an existing wallpaper survives the rename. */
const LEGACY_WALL_DIR = join(DSH_HOME, "theme-satone");
const WALL_CANDIDATES = [
  join(WALL_DIR, "background.webp"),
  join(WALL_DIR, "background.png"),
  join(WALL_DIR, "background.jpg"),
  join(WALL_DIR, "background.jpeg"),
  join(LEGACY_WALL_DIR, "background.webp"),
  join(LEGACY_WALL_DIR, "background.png"),
  join(LEGACY_WALL_DIR, "background.jpg"),
  join(LEGACY_WALL_DIR, "background.jpeg"),
  ROOM_PATH,
];

const MIME = { ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
const EXT_OF = { "image/webp": ".webp", "image/png": ".png", "image/jpeg": ".jpg" };

/** Read a whole request body with a hard ceiling (a wallpaper is a few MB). */
function readBody(request, limit = 24 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

/** Inline the wallpaper as a CSS variable, or nothing when none exists. */
function wallStyle() {
  for (const file of WALL_CANDIDATES) {
    let bytes;
    try {
      bytes = readFileSync(file);
    } catch {
      continue;
    }
    if (!bytes.length) continue;
    const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
    const mime = MIME[ext] || "image/jpeg";
    return `<style id="dsh-cyui-wall">:root{--cyui-wall:url("data:${mime};base64,${bytes.toString("base64")}")}</style>`;
  }
  return "";
}

/** Boot screen: cyber grid + pulsing headset + shaking call button. */
const BOOT_HTML = `
<style id="dsh-cyui-boot-style">
#dsh-cyui-ack{position:fixed;left:0;top:0;width:0;height:0;opacity:0;pointer-events:none}
#dsh-cyui-boot{position:fixed;inset:0;z-index:2147483600;overflow:hidden;
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:26px;
  background:radial-gradient(120% 100% at 50% 30%,#0b1020 0%,#06060c 60%,#04040a 100%);
  font-family:"Microsoft YaHei",system-ui,sans-serif;color:#cfe9f2;
  transition:opacity .45s ease,transform .45s ease;
  animation:dsh-cyui-boot-fallback .6s ease 60s forwards}
#dsh-cyui-ack:checked ~ #dsh-cyui-boot{
  animation:dsh-cyui-crt .52s cubic-bezier(.65,0,.35,1) forwards}
/* the sheet that unfolds out of the collapsing line */
#dsh-cyui-boot + .s-flash{
  position:fixed;inset:0;z-index:2147483599;pointer-events:none;
  opacity:0;transform:scaleY(.004);
  background-image:
    repeating-linear-gradient(0deg,
      rgba(255,255,255,.20) 0 1px,
      rgba(255,255,255,0) 1px 3px),
    radial-gradient(120% 72% at 50% 50%,
      rgba(255,255,255,.94) 0%,
      rgba(196,232,255,.80) 38%,
      rgba(120,180,255,.35) 60%,
      transparent 76%);
  background-size:100% 3px, 100% 100%;
  will-change:transform,opacity,filter}
#dsh-cyui-ack:checked ~ .s-flash{
  animation:dsh-cyui-on .78s cubic-bezier(.18,.8,.24,1) .40s forwards}

@keyframes dsh-cyui-crt{
  0%{clip-path:inset(0 0 0 0);filter:brightness(1);opacity:1}
  42%{clip-path:inset(48.6% 0 48.6% 0);filter:brightness(4.5);opacity:1}
  60%{clip-path:inset(48.6% 0 48.6% 0);filter:brightness(7);opacity:1}
  100%{clip-path:inset(48.6% 0 48.6% 0);filter:brightness(9);opacity:0;visibility:hidden}
}
@keyframes dsh-cyui-on{
  0%{transform:scaleY(.004) scaleX(.92);opacity:1;filter:brightness(5)}
  22%{transform:scaleY(.014) scaleX(1);opacity:1;filter:brightness(7)}
  30%{transform:scaleY(.014) scaleX(1);opacity:1;filter:brightness(11)}
  62%{transform:scaleY(1) scaleX(1);opacity:.62;filter:brightness(2.2)}
  72%{transform:scaleY(1) scaleX(1);opacity:.5;filter:brightness(3.6)}
  100%{transform:scaleY(1) scaleX(1);opacity:0;filter:brightness(1)}
}

/* grid + scan */
#dsh-cyui-boot .s-grid{position:absolute;inset:-20%;pointer-events:none;opacity:.8;
  background-image:
    repeating-linear-gradient(0deg,rgba(53,224,240,.16) 0 1px,transparent 1px 36px),
    repeating-linear-gradient(90deg,rgba(122,92,255,.14) 0 1px,transparent 1px 36px);
  transform:perspective(600px) rotateX(58deg);
  mask-image:radial-gradient(60% 50% at 50% 45%,#000 30%,transparent 78%)}
#dsh-cyui-boot .s-scan{position:absolute;left:0;right:0;height:2px;top:0;pointer-events:none;
  background:linear-gradient(90deg,transparent,rgba(53,224,240,.55),rgba(255,43,138,.55),transparent);
  box-shadow:0 0 22px rgba(53,224,240,.55);
  animation:dsh-cyui-scan 4.2s linear infinite}

/* core */
#dsh-cyui-boot .s-core{position:relative;width:264px;height:264px;display:grid;place-items:center}
#dsh-cyui-boot .s-ring{position:absolute;inset:0;border-radius:50%;pointer-events:none}
#dsh-cyui-boot .s-ring.a{box-shadow:inset 0 0 0 1px rgba(53,224,240,.22);animation:dsh-cyui-pulse 2.4s ease-out infinite}
#dsh-cyui-boot .s-ring.b{box-shadow:inset 0 0 0 1px rgba(255,43,138,.18);animation:dsh-cyui-pulse 2.4s ease-out .9s infinite}
#dsh-cyui-boot .s-ring.c{inset:26px;border-radius:50%;
  background:conic-gradient(from 0deg,transparent 0deg,rgba(53,224,240,.5) 40deg,transparent 90deg,transparent 200deg,rgba(255,43,138,.45) 250deg,transparent 300deg);
  filter:blur(1px);opacity:.75;animation:dsh-cyui-spin 5.5s linear infinite}
#dsh-cyui-boot .s-core svg{width:132px;height:132px;position:relative;
  filter:drop-shadow(0 0 14px rgba(53,224,240,.55)) drop-shadow(0 0 30px rgba(255,43,138,.28))}

/* copy */
#dsh-cyui-boot .s-label{position:relative;text-align:center;letter-spacing:.34em;line-height:1.9}
#dsh-cyui-boot .s-label i{display:block;font-style:normal;font-size:11px;color:#35e0f0;opacity:.8;
  animation:dsh-cyui-blink 1.6s steps(1) infinite}
#dsh-cyui-boot .s-label b{display:block;font-size:22px;font-weight:500;color:#e8f6fb;letter-spacing:.5em;
  text-shadow:0 0 16px rgba(53,224,240,.5),0 0 34px rgba(255,43,138,.25)}

/* call button (a label — works with scripts blocked) */
#dsh-cyui-boot .s-call{position:relative;width:86px;height:86px;border-radius:50%;cursor:pointer;
  border:1px solid rgba(53,224,240,.55);background:radial-gradient(circle at 50% 35%,rgba(53,224,240,.28),rgba(10,16,28,.9));
  display:grid;place-items:center;
  box-shadow:0 0 0 1px rgba(255,43,138,.18),0 0 22px rgba(53,224,240,.35),inset 0 0 18px rgba(53,224,240,.22);
  animation:dsh-cyui-shake .9s ease-in-out infinite;
  transition:transform .18s ease,box-shadow .18s ease}
#dsh-cyui-boot .s-call:hover{transform:scale(1.06);
  box-shadow:0 0 0 1px rgba(255,43,138,.45),0 0 34px rgba(53,224,240,.6),inset 0 0 24px rgba(255,43,138,.3)}
#dsh-cyui-boot .s-call:active{transform:scale(.94)}
#dsh-cyui-boot .s-call svg{width:38px;height:38px;fill:none;stroke:#dff6ff;stroke-width:1.8;
  stroke-linecap:round;stroke-linejoin:round;filter:drop-shadow(0 0 8px rgba(53,224,240,.8))}
#dsh-cyui-boot .s-hint{position:relative;font-size:11.5px;letter-spacing:.3em;color:rgba(207,233,242,.45)}

@keyframes dsh-cyui-scan{0%{top:-4%}100%{top:104%}}
@keyframes dsh-cyui-pulse{0%{transform:scale(.72);opacity:.9}100%{transform:scale(1.18);opacity:0}}
@keyframes dsh-cyui-spin{to{transform:rotate(360deg)}}
@keyframes dsh-cyui-blink{0%,60%{opacity:.85}61%,100%{opacity:.25}}
@keyframes dsh-cyui-shake{
  0%,100%{transform:translate(0,0) rotate(0)}
  20%{transform:translate(-1.4px,.6px) rotate(-1.2deg)}
  40%{transform:translate(1.4px,-.6px) rotate(1.2deg)}
  60%{transform:translate(-1px,-.4px) rotate(-.8deg)}
  80%{transform:translate(1px,.4px) rotate(.8deg)}}
@keyframes dsh-cyui-boot-fallback{to{opacity:0;visibility:hidden}}
@media (prefers-reduced-motion:reduce){
  #dsh-cyui-boot *{animation-duration:.01ms!important;animation-iteration-count:1!important}
  #dsh-cyui-boot .s-call{animation:none}
}
</style>
<input type="checkbox" id="dsh-cyui-ack" autocomplete="off" aria-hidden="true" tabindex="-1">
<div id="dsh-cyui-boot" aria-label="聪音来电">
  <div class="s-grid"></div>
  <div class="s-scan"></div>
  <div class="s-core">
    <span class="s-ring a"></span><span class="s-ring b"></span><span class="s-ring c"></span>
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M8 30c0-13 10.7-24 24-24s24 11 24 24" stroke="#8fe6f4" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      <rect x="4" y="28" width="11" height="20" rx="5" fill="#0d2233" stroke="#35e0f0" stroke-width="2"/>
      <rect x="49" y="28" width="11" height="20" rx="5" fill="#0d2233" stroke="#ff2b8a" stroke-width="2"/>
      <path d="M11 10L17-3l9 4-5 11z" fill="#35e0f0" opacity=".9"/>
      <path d="M53 12l9-4 6 13-9 3z" fill="#ff2b8a" opacity=".9"/>
      <path d="M22 40h20" stroke="#7a5cff" stroke-width="1.6" opacity=".6"/>
    </svg>
  </div>
  <div class="s-label"><i>INCOMING / LINK</i><b>聪音</b></div>
  <label class="s-call" for="dsh-cyui-ack" aria-label="接听">
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.5 4.5c.9-.4 1.9 0 2.3.9l1 2.2c.3.7.1 1.6-.5 2.1l-.9.8c.8 1.7 2.1 3 3.8 3.8l.8-.9c.5-.6 1.4-.8 2.1-.5l2.2 1c.9.4 1.3 1.4.9 2.3l-.5 1.1c-.4.9-1.4 1.4-2.4 1.2C10.2 18.2 5.8 13.8 4.2 8.6c-.2-1 .3-2 1.2-2.4z"/>
    </svg>
  </label>
  <div class="s-hint">TAP TO CONNECT</div>
</div>
<div class="s-flash" aria-hidden="true"></div>
<script>
(function () {
  var boot = document.getElementById("dsh-cyui-boot");
  var ack = document.getElementById("dsh-cyui-ack");
  if (!boot || !ack) return;
  ack.checked = false;   // browsers restore form state; a ticked box would skip the screen
  ack.addEventListener("change", function () {
    try { if (navigator.vibrate) navigator.vibrate([18, 40, 18]); } catch (e) {}
    setTimeout(function () { if (boot.parentNode) boot.remove(); }, 1300);
  });
})();
</script>
`;

/** Insert the boot screen as the first thing inside `<body>`. */
function injectBoot(html) {
  const wall = wallStyle();
  if (html.includes("dsh-cyui-boot")) return html;
  const payload = `${wall}${BOOT_HTML}`;
  if (/<body[^>]*>/i.test(html)) {
    return html.replace(/<body([^>]*)>/i, (match) => `${match}${payload}`);
  }
  return `${payload}${html}`;
}

/**
 * Mount the boot screen into the served index document.
 *
 * `webServer` arrives through `inject`, so a composition without the browser
 * carrier (headless, ACP, SDK) simply never runs this.
 */
export function apply(ctx) {
  ctx.inject(["webServer"], (scoped) => {
    scoped.webServer.tapIndex(injectBoot);

    // accept an uploaded wallpaper and store it in the user slot
    scoped.webServer.register({
      kind: "exact",
      path: "/dsh-cyui/wall",
      handler: async (request, response) => {
        if (request.method !== "POST") {
          response.writeHead(405, { allow: "POST" });
          response.end();
          return;
        }
        try {
          const body = await readBody(request);
          const payload = JSON.parse(body.toString("utf8"));
          const match = typeof payload.dataUrl === "string"
            ? payload.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/s)
            : null;
          if (!match) {
            response.writeHead(400, { "content-type": "application/json" });
            response.end(JSON.stringify({ ok: false, error: "expected data:image/(png|jpeg|webp);base64," }));
            return;
          }
          const mime = match[1];
          const bytes = Buffer.from(match[2], "base64");
          if (!bytes.length) {
            response.writeHead(400, { "content-type": "application/json" });
            response.end(JSON.stringify({ ok: false, error: "empty image" }));
            return;
          }
          mkdirSync(WALL_DIR, { recursive: true });
          // clear old variants so the priority order cannot serve a stale file
          for (const file of WALL_CANDIDATES) {
            try { if (file !== ROOM_PATH) unlinkSync(file); } catch { /* not there */ }
          }
          const target = join(WALL_DIR, `background${EXT_OF[mime] || ".jpg"}`);
          writeFileSync(target, bytes);
          roomCache = null;
          // read it back: if this fails the caller must know, not think it worked
          const written = statSync(target).size;
          response.writeHead(written === bytes.length ? 200 : 500, { "content-type": "application/json" });
          response.end(JSON.stringify({
            ok: written === bytes.length,
            bytes: written,
            file: target,
            dir: WALL_DIR,
          }));
        } catch (error) {
          response.writeHead(500, { "content-type": "application/json" });
          response.end(JSON.stringify({ ok: false, error: String(error && error.message || error) }));
        }
      },
    });

    // what is on disk right now
    scoped.webServer.register({
      kind: "exact",
      path: "/dsh-cyui/wall-meta",
      handler: (request, response) => {
        let found = null;
        for (const file of WALL_CANDIDATES) {
          try {
            const stat = statSync(file);
            found = { file, bytes: stat.size, updated: stat.mtimeMs };
            break;
          } catch { /* try next */ }
        }
        response.writeHead(200, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: true, wall: found }));
      },
    });

    scoped.webServer.register({
      kind: "exact",
      path: ROOM_ROUTE,
      handler: (request, response) => {
        if (request.method !== "GET" && request.method !== "HEAD") {
          response.writeHead(405, { allow: "GET, HEAD" });
          response.end();
          return;
        }
        let body;
        try {
          body = roomBytes();
        } catch {
          response.writeHead(404);
          response.end();
          return;
        }
        response.writeHead(200, {
          "content-type": "image/jpeg",
          "content-length": body.length,
          "cache-control": "public, max-age=86400",
        });
        if (request.method === "HEAD") {
          response.end();
          return;
        }
        response.end(body);
      },
    });
  });
}
