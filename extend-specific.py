"""Cover the specific-layer variables that 0.2.2 leans on.

The alias layer was not the whole story: menus, inputs, tips, bubbles and the
sidebar glass all read `--dsw-specific-*`. Only `sidebar-fill` was covered, so a
menu came out as a pale plate and settings inputs came out white.
"""
import json
from pathlib import Path

P = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui\assets\tokens.json")
data = json.loads(P.read_text(encoding="utf-8"))

NIGHT = {
    "--dsw-specific-menu": "rgba(18, 14, 24, .97)",
    "--dsw-specific-input-major": "rgba(34, 28, 44, .94)",
    "--dsw-specific-login-input": "rgba(34, 28, 44, .94)",
    "--dsw-specific-tip": "rgba(18, 14, 24, .97)",
    "--dsw-specific-selector": "rgba(34, 28, 44, .92)",
    "--dsw-specific-bubble": "rgba(40, 34, 52, .85)",
    "--dsw-specific-bubble-highlight": "rgba(52, 44, 66, .92)",
    "--dsw-specific-guide-hero": "rgba(20, 16, 28, .92)",
    "--dsw-specific-file-upload-track": "rgba(30, 25, 38, .85)",
    "--dsw-specific-sidebar-glass-fill": "rgba(16, 13, 22, .28)",
    "--dsw-specific-sidebar-glass-hover": "rgba(16, 13, 22, .40)",
    "--dsw-specific-sidebar-glass-collapsed-fill": "rgba(16, 13, 22, .34)",
    "--dsw-specific-sidebar-glass-collapsed-hover": "rgba(16, 13, 22, .46)",
    "--dsw-specific-sidebar-nav-item-active": "rgba(53, 224, 240, .16)",
    "--dsw-specific-sidebar-nav-item-active-accent": "rgba(53, 224, 240, .80)",
    "--dsw-specific-sidebar-right-flash": "rgba(53, 224, 240, .26)",
    "--dsw-specific-sidebar-tint": "rgba(52, 40, 76, .45)",
    "--dsw-specific-sidebar-wash-top": "rgba(12, 10, 18, .50)",
    "--dsw-specific-sidebar-wash-top-clear": "rgba(12, 10, 18, 0)",
    "--dsw-specific-sidebar-wash-bottom": "rgba(12, 10, 18, .55)",
    "--dsw-specific-sidebar-wash-bottom-clear": "rgba(12, 10, 18, 0)",
}

# dawn: same roles, light paper
DAWN = {
    "--dsw-specific-menu": "rgba(255, 252, 246, .98)",
    "--dsw-specific-input-major": "rgba(250, 246, 238, .96)",
    "--dsw-specific-login-input": "rgba(250, 246, 238, .96)",
    "--dsw-specific-tip": "rgba(255, 252, 246, .98)",
    "--dsw-specific-selector": "rgba(248, 243, 236, .95)",
    "--dsw-specific-bubble": "rgba(255, 252, 246, .92)",
    "--dsw-specific-bubble-highlight": "rgba(252, 247, 240, .96)",
    "--dsw-specific-guide-hero": "rgba(252, 249, 244, .95)",
    "--dsw-specific-file-upload-track": "rgba(238, 230, 220, .90)",
    "--dsw-specific-sidebar-glass-fill": "rgba(248, 243, 236, .48)",
    "--dsw-specific-sidebar-glass-hover": "rgba(248, 243, 236, .62)",
    "--dsw-specific-sidebar-glass-collapsed-fill": "rgba(248, 243, 236, .54)",
    "--dsw-specific-sidebar-glass-collapsed-hover": "rgba(248, 243, 236, .68)",
    "--dsw-specific-sidebar-nav-item-active": "rgba(53, 224, 240, .20)",
    "--dsw-specific-sidebar-nav-item-active-accent": "rgba(20, 140, 160, .85)",
    "--dsw-specific-sidebar-right-flash": "rgba(53, 224, 240, .22)",
    "--dsw-specific-sidebar-tint": "rgba(200, 190, 220, .40)",
    "--dsw-specific-sidebar-wash-top": "rgba(250, 246, 238, .55)",
    "--dsw-specific-sidebar-wash-top-clear": "rgba(250, 246, 238, 0)",
    "--dsw-specific-sidebar-wash-bottom": "rgba(250, 246, 238, .60)",
    "--dsw-specific-sidebar-wash-bottom-clear": "rgba(250, 246, 238, 0)",
}

for theme, table in (("night", NIGHT), ("dawn", DAWN)):
    for k, v in table.items():
        data[theme][k] = v

P.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print("night:", len(data["night"]), "dawn:", len(data["dawn"]))
print("menu:", data["night"]["--dsw-specific-menu"])
print("input:", data["night"]["--dsw-specific-input-major"])
