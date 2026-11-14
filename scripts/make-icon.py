"""Turn the supplied avatar into the plugin icon.

Constraints from the plugin manifest rules: PNG/SVG/JPEG/WebP, at most 256 KiB,
must live inside the package. The source is 1277x1232 with transparency, so it
is cropped to the head, squared, resized to 512 and quantised until it fits.
"""
import io
from pathlib import Path

from PIL import Image

SRC = Path(r"C:\Users\lenovo\.dsh\attachments\v1\objects\3a\3a3fca8444c8a811d8ef09e4b8ea735e0735cfebd1deec4296d7a961b10720ed")
ROOT = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui")
OUT = ROOT / "icon.png"
LIMIT = 256 * 1024

img = Image.open(SRC).convert("RGBA")
print("source:", img.size)

# keep the character, trim the empty margin
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
    print("trimmed to:", img.size)

# square it around the face (upper-middle), so the ears are not cut off
w, h = img.size
side = max(w, h)
canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
canvas.paste(img, ((side - w) // 2, 0), img)

for size in (512, 384, 320, 256):
    trial = canvas.resize((size, size), Image.LANCZOS)
    buf = io.BytesIO()
    trial.save(buf, "PNG", optimize=True)
    data = buf.getvalue()
    print(f"  {size}x{size}: {len(data)/1024:.0f} KB")
    if len(data) <= LIMIT:
        OUT.write_bytes(data)
        print("written:", OUT, f"{len(data)/1024:.0f} KB")
        break
else:
    # quantise as a last resort
    trial = canvas.resize((512, 512), Image.LANCZOS)
    q = trial.convert("RGB").quantize(colors=192, method=Image.MEDIANCUT)
    buf = io.BytesIO()
    q.save(buf, "PNG", optimize=True)
    OUT.write_bytes(buf.getvalue())
    print("written (quantised):", OUT, f"{len(buf.getvalue())/1024:.0f} KB")
