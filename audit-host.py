"""Re-check the host selectors after a DSH upgrade.

Extracts the shipped client bundles from app.asar and reports whether the class
names this theme depends on still exist. Prints a compact table so a rename is
obvious at a glance.
"""
import json
import re
import struct
from pathlib import Path

ASAR = Path(r"D:\dsh\resources\app.asar")
OUT = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui\.audit")
OUT.mkdir(exist_ok=True)

with ASAR.open("rb") as fh:
    _, header_size, _, json_size = struct.unpack("<4I", fh.read(16))
    header = json.loads(fh.read(json_size).decode("utf-8"))
    fh.seek(8 + header_size)
    data = fh.read()

print(f"asar data {len(data)/1024/1024:.1f} MB")


def walk(node, prefix=""):
    for name, meta in node.get("files", {}).items():
        path = f"{prefix}{name}"
        if "files" in meta:
            yield from walk(meta, path + "/")
        else:
            yield path, meta


def extract(meta):
    if "offset" not in meta:
        return b""
    start = int(meta["offset"])
    return data[start:start + int(meta["size"])]


entries = list(walk(header))
bundles = {}
for path, meta in entries:
    if not path.endswith("client.js"):
        continue
    low = path.lower()
    if not any(k in low for k in ("ui-layout", "ui-conversation", "ui-sidebar", "ui-session", "ui-composer")):
        continue
    raw = extract(meta)
    if raw:
        bundles[path] = raw.decode("utf-8", "replace")
        print(f"  {path.split('node_modules/')[-1]}  {len(raw)//1024} KB")

# every CSS class the theme targets, by suffix
TARGETS = [
    "frame", "centerCol", "root", "scrollBody",
    "composerSeat", "composerStack", "card",
    "bubble", "header",
    "sidebarCol", "overlayLayer", "bottomRow",
]
SIDEBAR = ["wtg9ga_root"]

corpus = "\n".join(bundles.values())
classes = set(re.findall(r"\.[A-Za-z0-9_-]{3,}?\b(?:_([a-zA-Z][A-Za-z0-9]*))\b", corpus))
# collect full class names like mP3x-q_frame
full = set(re.findall(r"\.[A-Za-z0-9][A-Za-z0-9_-]*-[A-Za-z][A-Za-z0-9]*", corpus))

print("\n=== does each target still exist? ===")
for t in TARGETS:
    hits = sorted(c.strip(".") for c in full if c.endswith("_" + t))
    print(f"  {t:16} {'YES ' if hits else 'MISSING'}  {', '.join(hits[:4])}")

print("\n=== sidebar root ===")
for name in SIDEBAR:
    print(f"  {name:22} {'YES' if name in corpus else 'MISSING'}")

# selector prefixes used with [class$=...]
print("\n=== exact class names around the skeleton ===")
for m in sorted(set(re.findall(r"\.[A-Za-z0-9_-]+_(?:frame|centerCol|composerSeat|composerStack|card|bubble)\b", corpus))):
    print("  ", m)

(OUT / "bundles.txt").write_text(corpus, encoding="utf-8")
print(f"\nfull corpus saved to {OUT / 'bundles.txt'}  ({len(corpus)//1024} KB)")
