"""Pixel-art assets for the Satone theme — original fan work, drawn from scratch.

Everything here is hand-placed pixels: no game textures, no traced artwork.
Output goes to assets/pixel/*.png at native resolution; the CSS scales them up
with `image-rendering: pixelated`.
"""
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "pixel"
OUT.mkdir(parents=True, exist_ok=True)

# ---- palette (lo-fi night, 26 colours) ----
WALL_TOP = (33, 27, 46)
WALL = (27, 22, 38)
WALL_LOW = (22, 18, 31)
WALL_STRIPE = (30, 24, 42)
FLOOR = (33, 25, 41)
FLOOR_LINE = (43, 32, 52)
FRAME = (58, 48, 71)
FRAME_LIT = (79, 66, 96)
GLASS = (16, 24, 44)
GLASS_UP = (24, 35, 60)
RAIN = (138, 174, 212)
CITY = (240, 178, 122)
DESK = (79, 61, 49)
DESK_TOP = (110, 86, 67)
DESK_DARK = (51, 38, 31)
LAMP = (247, 203, 152)
LAMP_HI = (255, 234, 194)
GLOW = (238, 176, 120)
SKIN = (251, 232, 219)
SKIN_SH = (235, 202, 185)
HAIR = (219, 212, 232)
HAIR_SH = (166, 154, 190)
HAIR_HI = (243, 239, 249)
EYE = (98, 79, 130)
EYE_D = (56, 44, 76)
EYE_HI = (246, 242, 252)
SCARF = (233, 162, 108)
SCARF_SH = (196, 127, 79)
COAT = (69, 57, 94)
COAT_SH = (44, 34, 55)
WHITE = (247, 240, 231)
PENG = (56, 49, 76)
BRAND = (201, 160, 220)
GREEN = (79, 125, 92)
GREEN_HI = (99, 150, 111)


class Canvas:
    def __init__(self, w, h, fill):
        self.w, self.h = w, h
        self.img = Image.new("RGBA", (w, h), fill)
        self.px = self.img.load()

    def dot(self, x, y, c):
        if 0 <= x < self.w and 0 <= y < self.h:
            self.px[x, y] = c

    def rect(self, x0, y0, x1, y1, c):
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                self.dot(x, y, c)

    def frame(self, x0, y0, x1, y1, c):
        for x in range(x0, x1 + 1):
            self.dot(x, y0, c)
            self.dot(x, y1, c)
        for y in range(y0, y1 + 1):
            self.dot(x0, y, c)
            self.dot(x1, y, c)

    def hline(self, x0, x1, y, c):
        for x in range(x0, x1 + 1):
            self.dot(x, y, c)

    def vline(self, x, y0, y1, c):
        for y in range(y0, y1 + 1):
            self.dot(x, y, c)

    def blend(self, x, y, c, alpha):
        if not (0 <= x < self.w and 0 <= y < self.h):
            return
        base = self.px[x, y]
        a = alpha / 255.0
        self.px[x, y] = (
            int(base[0] * (1 - a) + c[0] * a),
            int(base[1] * (1 - a) + c[1] * a),
            int(base[2] * (1 - a) + c[2] * a),
            max(base[3], 255),
        )

    def ellipse(self, cx, cy, rx, ry, c, alpha=None):
        for y in range(cy - ry, cy + ry + 1):
            for x in range(cx - rx, cx + rx + 1):
                dx = (x - cx) / max(rx, 1)
                dy = (y - cy) / max(ry, 1)
                if dx * dx + dy * dy <= 1.0:
                    if alpha is None:
                        self.dot(x, y, c)
                    else:
                        self.blend(x, y, c, alpha)

    def save(self, name):
        path = OUT / name
        self.img.save(path)
        print(f"wrote {name} {self.w}x{self.h} ({path.stat().st_size} B)")


# ===================================================================== #
# 1. Satone's room — 240 x 150
# ===================================================================== #
def draw_room():
    c = Canvas(240, 150, WALL)

    # wall bands + wallpaper stripes
    for y in range(0, 110):
        c.hline(0, 239, y, WALL_TOP if y < 22 else (WALL if y < 84 else WALL_LOW))
    for x in range(3, 240, 14):
        c.vline(x, 0, 109, WALL_STRIPE)

    # floor
    c.rect(0, 110, 239, 149, FLOOR)
    for y in range(114, 150, 9):
        c.hline(0, 239, y, FLOOR_LINE)
    for i, x in enumerate(range(8, 240, 34)):
        c.vline(x + (i % 2) * 10, 110, 149, FLOOR_LINE)

    # ---- window ----
    WX0, WY0, WX1, WY1 = 150, 12, 228, 78
    c.rect(WX0, WY0, WX1, WY1, FRAME)
    c.rect(WX0 + 4, WY0 + 4, WX1 - 4, WY1 - 4, GLASS)
    c.rect(WX0 + 4, WY0 + 4, WX1 - 4, 44, GLASS_UP)
    # skyline in the glass
    for x, h in [(158, 10), (170, 16), (182, 8), (196, 14), (210, 11), (220, 17)]:
        c.rect(x, 76 - h, x + 5, 76, (20, 27, 44))
        c.dot(x + 2, 76 - h + 2, CITY)
        c.dot(x + 4, 76 - h + 5, CITY)
    # rain
    for x in range(WX0 + 6, WX1 - 6, 6):
        for y in range(WY0 + 6, WY1 - 8, 11):
            c.vline(x, y + (x % 3), y + (x % 3) + 3, RAIN)
            c.dot(x, y + (x % 3) + 4, (92, 116, 148))
    # muntins
    c.vline((WX0 + WX1) // 2, WY0 + 4, WY1 - 4, FRAME)
    c.hline(WX0 + 4, WX1 - 4, 46, FRAME)
    c.rect(WX0 - 2, WY1, WX1 + 2, WY1 + 3, FRAME_LIT)   # sill
    # curtains
    for side, x0 in (("l", WX0 - 12), ("r", WX1 - 2)):
        c.rect(x0, WY0 - 4, x0 + 12, WY1 + 6, (48, 38, 60))
        c.rect(x0, WY0 - 4, x0 + 2, WY1 + 6, (62, 50, 76))

    # ---- bookshelf ----
    c.rect(8, 26, 58, 102, (42, 33, 51))
    c.frame(8, 26, 58, 102, FRAME)
    for shelf_y in (56, 84, 102):
        c.hline(9, 57, shelf_y, FRAME_LIT)
    books = [
        (11, 36, 18, (122, 92, 140)), (15, 40, 14, (201, 160, 220)), (19, 34, 20, (180, 112, 60)),
        (24, 42, 12, (79, 125, 92)), (29, 38, 16, (138, 107, 156)), (34, 44, 10, (217, 160, 106)),
        (40, 36, 18, (91, 111, 156)), (46, 40, 14, (176, 138, 196)),
        (11, 64, 18, (91, 111, 156)), (16, 68, 14, (201, 160, 220)), (21, 62, 20, (180, 112, 60)),
        (26, 70, 12, (79, 125, 92)), (31, 64, 18, (138, 107, 156)), (38, 68, 14, (217, 160, 106)),
        (44, 62, 20, (122, 92, 140)),
        (11, 94, 14, (201, 160, 220)), (17, 98, 10, (91, 111, 156)), (23, 92, 16, (176, 138, 196)),
    ]
    for x, y, h, col in books:
        c.rect(x, y, x + 2, y + h, col)
        c.dot(x, y, tuple(min(v + 28, 255) for v in col))
        c.dot(x, y + h, tuple(max(v - 28, 0) for v in col))
    # plant on the shelf top
    c.rect(26, 20, 40, 25, (176, 112, 60))
    c.rect(26, 20, 40, 21, (198, 132, 76))
    c.ellipse(33, 13, 8, 7, GREEN)
    c.ellipse(30, 9, 4, 3, GREEN_HI)
    c.ellipse(37, 10, 3, 3, GREEN_HI)

    # ---- poster ----
    c.rect(72, 18, 112, 68, (43, 34, 52))
    c.frame(72, 18, 112, 68, FRAME_LIT)
    c.ellipse(92, 36, 11, 11, BRAND, alpha=105)
    c.ellipse(92, 52, 16, 6, GLOW, alpha=80)
    c.hline(78, 106, 62, (74, 62, 90))

    # ---- desk ----
    c.rect(24, 90, 216, 98, DESK)
    c.hline(24, 216, 90, DESK_TOP)
    c.hline(24, 216, 98, DESK_DARK)
    c.rect(30, 99, 37, 128, DESK_DARK)
    c.rect(30, 99, 31, 128, (64, 48, 39))
    c.rect(198, 99, 205, 128, DESK_DARK)
    c.rect(198, 99, 199, 128, (64, 48, 39))
    # drawer unit under the right side
    c.rect(160, 99, 206, 128, (43, 34, 52))
    c.frame(160, 99, 206, 128, FRAME)
    c.hline(163, 203, 112, FRAME_LIT)
    c.rect(176, 105, 190, 106, FRAME_LIT)
    c.rect(176, 119, 190, 120, FRAME_LIT)

    # ---- lamp ----
    # shade: small trapezoid, warm rim, dark underside
    for y in range(58, 71):
        half = 5 + (y - 58)
        c.hline(152 - half, 152 + half, y, LAMP if y < 68 else (196, 150, 108))
    c.hline(147, 157, 58, LAMP_HI)
    c.hline(140, 164, 70, (132, 100, 74))
    c.rect(151, 71, 153, 88, FRAME_LIT)
    c.rect(150, 71, 150, 88, (96, 80, 112))
    c.rect(143, 89, 161, 91, FRAME)
    c.rect(146, 89, 158, 89, FRAME_LIT)
    # soft pool on the desk only (no hard cone)
    for y in range(72, 94):
        spread = 6 + (y - 72) * 2
        for x in range(152 - spread, 152 + spread + 1):
            edge = abs(x - 152) / max(spread, 1)
            if edge > 1:
                continue
            strength = (1 - edge) ** 1.4 * (1 - (y - 72) / 24)
            c.blend(x, y, GLOW, int(40 * strength) if (x + y) % 2 == 0 else int(18 * strength))

    # ---- desk objects ----
    # mug
    c.rect(92, 80, 104, 90, WHITE)
    c.rect(92, 80, 104, 82, (201, 138, 82))
    c.rect(105, 83, 106, 87, WHITE)
    c.dot(95, 77, BRAND)
    c.dot(98, 75, BRAND)
    c.dot(101, 77, BRAND)
    # headset, lying flat
    c.rect(120, 84, 124, 90, (43, 34, 52))
    c.rect(132, 84, 136, 90, (43, 34, 52))
    for x in range(124, 133):
        c.dot(x, 83, BRAND)
        c.dot(x, 82, (176, 138, 196))
    # penguin plush
    c.ellipse(182, 84, 7, 6, PENG)
    c.ellipse(182, 86, 4, 4, WHITE)
    c.dot(179, 81, (22, 18, 27))
    c.dot(185, 81, (22, 18, 27))
    c.rect(181, 84, 183, 84, GLOW)
    c.dot(179, 90, GLOW)
    c.dot(185, 90, GLOW)
    c.rect(176, 77, 188, 78, BRAND)

    # ---- notebook ----
    c.rect(58, 86, 78, 92, WHITE)
    c.rect(58, 86, 78, 86, (222, 211, 194))
    c.vline(68, 87, 91, (222, 211, 194))
    for x in range(60, 67, 3):
        c.hline(x, x + 1, 89, (206, 190, 172))
    for x in range(70, 78, 3):
        c.hline(x, x + 1, 89, (206, 190, 172))

    # ---- rug ----
    c.ellipse(120, 132, 70, 11, (39, 30, 48))
    for x in range(52, 189, 6):
        c.dot(x, 132, FLOOR_LINE)
    c.ellipse(120, 132, 70, 11, None) if False else None

    # ---- cat asleep by the shelf ----
    c.ellipse(70, 120, 8, 5, (23, 19, 29))
    c.ellipse(61, 116, 4, 4, (23, 19, 29))
    c.dot(59, 111, (23, 19, 29))
    c.dot(62, 111, (23, 19, 29))
    c.hline(74, 79, 122, (30, 25, 37))

    c.save("room.png")


# ===================================================================== #
# 2. Satone — 64 x 96
# ===================================================================== #
def draw_satone():
    c = Canvas(64, 96, (0, 0, 0, 0))

    # ---- back hair: rounded crown + two long falls ----
    c.ellipse(32, 30, 21, 20, HAIR)
    c.rect(13, 26, 51, 60, HAIR)
    c.rect(13, 26, 18, 60, HAIR_SH)
    c.rect(46, 26, 51, 60, HAIR_SH)
    c.rect(11, 58, 18, 80, HAIR)
    c.rect(46, 58, 53, 80, HAIR)
    c.rect(11, 58, 13, 80, HAIR_SH)
    c.rect(51, 58, 53, 80, HAIR_SH)
    c.rect(13, 78, 18, 83, HAIR)
    c.rect(46, 78, 51, 83, HAIR)
    c.rect(15, 83, 17, 86, HAIR)
    c.rect(47, 83, 49, 86, HAIR)
    c.ellipse(32, 16, 17, 7, HAIR_HI, alpha=90)

    # ---- body / coat ----
    c.rect(18, 62, 46, 95, COAT)
    c.rect(18, 62, 23, 95, COAT_SH)
    c.rect(41, 62, 46, 95, COAT_SH)
    c.rect(27, 80, 37, 95, (78, 65, 104))
    # collar
    c.rect(24, 60, 40, 63, WHITE)
    c.rect(30, 63, 34, 65, WHITE)

    # ---- scarf: band + hanging tail ----
    c.rect(19, 64, 44, 68, SCARF)
    c.rect(19, 67, 44, 68, SCARF_SH)
    c.rect(22, 64, 30, 64, (247, 190, 150))
    c.rect(38, 68, 44, 79, SCARF)
    c.rect(38, 76, 44, 79, SCARF_SH)
    c.rect(38, 68, 44, 68, (247, 190, 150))

    # ---- neck + face ----
    c.rect(27, 54, 36, 62, SKIN_SH)
    c.rect(20, 26, 44, 58, SKIN)
    c.rect(20, 52, 44, 58, SKIN_SH)
    c.rect(18, 38, 19, 46, SKIN)     # ears
    c.rect(45, 38, 46, 46, SKIN)

    # ---- bangs ----
    c.ellipse(32, 24, 16, 11, HAIR)
    c.rect(20, 27, 44, 31, HAIR)
    c.rect(20, 31, 25, 37, HAIR)
    c.rect(39, 31, 44, 37, HAIR)
    c.rect(21, 19, 43, 20, HAIR_HI)
    c.rect(28, 31, 30, 35, HAIR)
    c.rect(34, 31, 36, 35, HAIR)
    c.dot(24, 33, HAIR_SH)
    c.dot(40, 33, HAIR_SH)

    # ---- eyes ----
    c.rect(25, 38, 30, 45, EYE)
    c.rect(35, 38, 40, 45, EYE)
    c.rect(26, 40, 29, 44, EYE_D)
    c.rect(36, 40, 39, 44, EYE_D)
    c.dot(26, 39, EYE_HI)
    c.dot(36, 39, EYE_HI)
    c.dot(29, 44, BRAND)
    c.dot(39, 44, BRAND)
    c.hline(24, 26, 37, (44, 34, 54))
    c.hline(39, 41, 37, (44, 34, 54))

    # ---- blush + mouth ----
    c.rect(21, 48, 24, 50, (236, 160, 160))
    c.rect(40, 48, 43, 50, (236, 160, 160))
    c.rect(31, 51, 33, 51, (182, 110, 110))
    c.dot(30, 52, (198, 130, 130))
    c.dot(34, 52, (198, 130, 130))

    # ---- headphones ----
    c.rect(14, 32, 17, 48, (43, 34, 52))
    c.rect(47, 32, 50, 48, (43, 34, 52))
    c.rect(14, 22, 50, 25, (43, 34, 52))
    c.rect(15, 25, 16, 31, (43, 34, 52))
    c.rect(48, 25, 49, 31, (43, 34, 52))
    c.rect(15, 36, 16, 45, (138, 107, 156))
    c.rect(48, 36, 49, 45, (138, 107, 156))
    c.dot(15, 50, GLOW)
    c.dot(49, 50, BRAND)

    # ---- hands + mug ----
    c.rect(43, 74, 55, 85, WHITE)
    c.rect(43, 74, 55, 76, (201, 138, 82))
    c.rect(56, 77, 58, 82, WHITE)
    c.dot(46, 71, BRAND)
    c.dot(49, 69, BRAND)
    c.dot(52, 71, BRAND)
    c.rect(40, 78, 44, 84, SKIN)
    c.rect(54, 78, 57, 84, SKIN)
    c.rect(40, 84, 44, 85, SKIN_SH)

    c.save("satone.png")


# ===================================================================== #
# 3. Object icons — 16 x 16 (drawn at 2x detail, saved 16x16)
# ===================================================================== #
def draw_cup():
    c = Canvas(16, 16, (0, 0, 0, 0))
    c.rect(3, 6, 11, 13, WHITE)
    c.hline(3, 11, 6, (201, 138, 82))
    c.hline(3, 11, 7, (168, 108, 62))
    c.rect(12, 8, 13, 11, WHITE)
    c.hline(4, 10, 13, (222, 211, 194))
    c.rect(2, 5, 12, 5, (236, 226, 212))
    c.dot(5, 3, BRAND)
    c.dot(7, 2, BRAND)
    c.dot(9, 3, BRAND)
    c.save("cup.png")


def draw_headset():
    c = Canvas(16, 16, (0, 0, 0, 0))
    # band
    c.rect(3, 4, 12, 5, (43, 34, 52))
    c.rect(2, 5, 3, 7, (43, 34, 52))
    c.rect(12, 5, 13, 7, (43, 34, 52))
    # cups
    c.rect(1, 7, 3, 12, (43, 34, 52))
    c.rect(12, 7, 14, 12, (43, 34, 52))
    c.rect(2, 8, 2, 11, BRAND)
    c.rect(13, 8, 13, 11, BRAND)
    # mic arm
    c.rect(4, 12, 6, 13, (74, 62, 90))
    c.dot(6, 13, GLOW)
    c.save("headset.png")


def draw_penguin():
    c = Canvas(16, 16, (0, 0, 0, 0))
    c.ellipse(8, 9, 5, 6, PENG)
    c.ellipse(8, 10, 3, 4, WHITE)
    c.rect(6, 7, 6, 7, (22, 18, 27))
    c.rect(9, 7, 9, 7, (22, 18, 27))
    c.rect(7, 9, 8, 10, GLOW)
    c.rect(4, 3, 11, 4, BRAND)
    c.rect(5, 14, 6, 14, GLOW)
    c.rect(9, 14, 10, 14, GLOW)
    c.save("penguin.png")


draw_room()
draw_satone()
draw_cup()
draw_headset()
draw_penguin()
print("done")
