"""Fill in the tokens that 0.2.2 added.

0.2.2-rc.3 ships 145 `--dsw-alias-*` tokens; the theme covers 76. The missing
ones paint cards, hovercards, diff views, json trees and empty-state
illustrations — on the light palette they come out near-white.

Values are derived from this theme's own palette rather than copied from the
host, because the host's values belong to a different colour scheme.
"""
import json
import re
import struct
from pathlib import Path

ASAR = Path(r"D:\dsh\resources\app.asar")
THEME_JSON = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui\assets\tokens.json")

with ASAR.open("rb") as fh:
    _, hs, _, js = struct.unpack("<4I", fh.read(16))
    header = json.loads(fh.read(js).decode("utf-8"))
    fh.seek(8 + hs)
    data = fh.read()


def walk(node, prefix=""):
    for name, meta in node.get("files", {}).items():
        p = f"{prefix}{name}"
        if "files" in meta:
            yield from walk(meta, p + "/")
        else:
            yield p, meta


def extract(meta):
    if "offset" not in meta:
        return b""
    s = int(meta["offset"])
    return data[s:s + int(meta["size"])]


texts = []
for path, meta in walk(header):
    if "dsh-client-ui-theme" in path:
        raw = extract(meta)
        if raw:
            texts.append(raw.decode("utf-8", "replace"))

all_tokens = set()
for t in texts:
    all_tokens |= set(re.findall(r"--dsw-alias-[a-z0-9]+(?:-[a-z0-9]+)*", t))

# drop fragments that are clearly template prefixes (they end on a hyphen boundary)
all_tokens = {k for k in all_tokens if len(k) > len("--dsw-alias-") + 2}

ours = json.loads(THEME_JSON.read_text(encoding="utf-8"))
night = ours["night"]
dawn = ours["dawn"]
missing = sorted(all_tokens - set(k for k in night if k.startswith("--dsw-alias-")))
print(f"host tokens: {len(all_tokens)} · ours: {len(night)} · missing: {len(missing)}")

# palette anchors taken from the existing night set
PAL = {
    "panel": "rgba(26, 21, 34, .82)",
    "panel_solid": "rgba(20, 16, 28, .96)",
    "fill": "rgba(38, 32, 48, .62)",
    "fill_hover": "rgba(48, 41, 60, .75)",
    "line": "rgba(96, 124, 190, .28)",
    "text_1": "#efe9f5",
    "text_2": "#c3b9d4",
    "text_3": "#8e86a0",
    "accent": "#35e0f0",
    "violet": "#7a5cff",
    "pink": "#ff2b8a",
    "green": "rgba(74, 190, 120, .30)",
    "green_text": "#8fe0b0",
    "red": "rgba(210, 80, 100, .30)",
    "red_text": "#f0a0ad",
    "amber": "#f0b27a",
}


def value_for(key: str) -> str:
    """Pick a colour by what the token paints."""
    k = key.replace("--dsw-alias-", "")
    # text-ish first: a label on a coloured button must stay readable
    if "on-color" in k:
        return "#0e0b14"
    if "shimmer" in k:
        return PAL["accent"]
    if "diff-added" in k or "state-done" in k or "added" in k:
        return PAL["green"] if ("bg" in k or "gutter" in k) else PAL["green_text"]
    if "diff-deleted" in k or "state-error" in k or "deleted" in k:
        return PAL["red"] if ("bg" in k or "gutter" in k) else PAL["red_text"]
    if "marker" in k:
        return PAL["accent"]
    if "label" in k or "text" in k:
        if "secondary" in k:
            return PAL["text_2"]
        if "tertiary" in k or "quaternary" in k:
            return PAL["text_3"]
        return PAL["text_1"]
    if "border" in k or "gutter" in k or "selected" in k:
        return PAL["line"]
    if "hover" in k:
        return PAL["fill_hover"]
    if any(w in k for w in ("bg", "fill", "surface", "backing", "backdrop", "card")):
        if "mask" in k:
            return "rgba(8, 6, 12, .55)"
        if "hovercard" in k:
            return PAL["panel_solid"]
        return PAL["fill"] if "fill" in k else PAL["panel"]
    if "json-tree" in k:
        if "string" in k:
            return PAL["green_text"]
        if "number" in k:
            return PAL["amber"]
        if "keyword" in k:
            return PAL["pink"]
        if "property" in k:
            return PAL["accent"]
        if "punctuation" in k:
            return PAL["text_3"]
        if "icon" in k:
            return PAL["violet"]
        return PAL["text_2"]
    if "illustration" in k or "chart" in k:
        return PAL["panel"]
    return PAL["fill"]


added = {}
for key in missing:
    added[key] = value_for(key)

for theme, table in (("night", night), ("dawn", dawn)):
    for key in missing:
        if theme == "night":
            table[key] = added[key]
        else:
            # a light variant: same roles, inverted lightness
            night_val = added[key]
            if night_val.startswith("#"):
                table[key] = night_val
            elif "rgba(26, 21, 34" in night_val or "rgba(20, 16, 28" in night_val:
                table[key] = night_val.replace("26, 21, 34", "252, 249, 244").replace("20, 16, 28", "255, 252, 246")
            elif "rgba(38, 32, 48" in night_val:
                table[key] = night_val.replace("38, 32, 48", "244, 238, 230")
            elif "rgba(48, 41, 60" in night_val:
                table[key] = night_val.replace("48, 41, 60", "236, 228, 218")
            else:
                table[key] = night_val

# light theme needs dark text for the label roles
for key in missing:
    if "label" in key and "--dsw-alias-label" in key:
        dawn[key] = "#241d2c"

THEME_JSON.write_text(json.dumps(ours, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"night tokens: {len(night)} · dawn tokens: {len(dawn)}")
for key in missing[:8]:
    print(f"  {key:44} {night[key]}")
