"""Collapse CYUI to a single colour scheme.

Two sets caused real problems: a page that only covered the night palette came out
patchy after a switch, and half the host's surfaces read the specific layer which
had daylight values. One scheme means one set of values everywhere, with no mode
attribute to fall out of sync.
"""
import json
import re
from pathlib import Path

ROOT = Path(r"C:\Users\lenovo\Documents\deepseek-harness\default-workspace\plugins\dsh-cyui")

# ---------------------------------------------------------------- tokens
tok = ROOT / "assets" / "tokens.json"
data = json.loads(tok.read_text(encoding="utf-8"))
single = data["night"]
tok.write_text(json.dumps({"cyui": single}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
print(f"tokens.json -> one set, {len(single)} entries")

# ---------------------------------------------------------------- client
p = ROOT / "lib" / "client.template.js"
t = p.read_text(encoding="utf-8")

# constants
t = t.replace(
    'const THEME_ID = "cyui-night";\nconst THEME_ID_DAWN = "cyui-dawn";',
    'const THEME_ID = "cyui";',
)

# token table
t = t.replace(
    '''/** 夜读主令牌 */
const TOKENS_NIGHT = __TOKENS_NIGHT__;

/** 晨光变体 */
const TOKENS_DAWN = __TOKENS_DAWN__;''',
    '''/** 单套令牌：不再区分昼夜 */
const TOKENS = __TOKENS_CYUI__;''',
)

# token css: no mode selector
t = t.replace(
    '''html[data-cyui-mode="night"] body {
${tokenCss(TOKENS_NIGHT)}
}
html[data-cyui-mode="dawn"] body {
${tokenCss(TOKENS_DAWN)}
}''',
    '''/* 只有一套配色：变量无条件落到 body 上 */
body {
${tokenCss(TOKENS)}
}''',
)

# registration
t = t.replace(
    '''	const disposeNight = theme.register({ id: THEME_ID, colorScheme: "dark", tokens: TOKENS_NIGHT });
	const disposeDawn = theme.register({ id: THEME_ID_DAWN, colorScheme: "light", tokens: TOKENS_DAWN });''',
    '''	const dispose = theme.register({ id: THEME_ID, colorScheme: "dark", tokens: TOKENS });''',
)

# syncMode: single path
t = t.replace(
    '''	let current = THEME_ID;
	const syncMode = (id) => {
		const dawn = id === THEME_ID_DAWN;
		current = dawn ? THEME_ID_DAWN : THEME_ID;
		document.documentElement.dataset.cyuiMode = dawn ? "dawn" : "night";
		root.dataset.mode = dawn ? "dawn" : "night";
		// inline-important beats stylesheet-important, so this is the only write
		// that survives a cold start where the host re-applies its own palette
		clearTokens(document.body, dawn ? TOKENS_NIGHT : TOKENS_DAWN);
		writeTokens(document.body, dawn ? TOKENS_DAWN : TOKENS_NIGHT);
	};''',
    '''	let current = THEME_ID;
	const syncMode = () => {
		current = THEME_ID;
		// inline-important beats stylesheet-important, so this is the only write
		// that survives a cold start where the host re-applies its own palette
		writeTokens(document.body, TOKENS);
	};''',
)

# preference restore
t = t.replace(
    '''					if (preference === THEME_ID || preference === THEME_ID_DAWN) {
						syncMode(preference);
						return;
					}''',
    '''					if (preference === THEME_ID) {
						syncMode();
						return;
					}''',
)

# setTheme signature
t = t.replace("const setTheme = (id) => {\n\t\tsyncMode(id);", "const setTheme = () => {\n\t\tsyncMode();")

# teardown
t = t.replace(
    "\t\tclearTokens(document.body, TOKENS_NIGHT);\n\t\tclearTokens(document.body, TOKENS_DAWN);",
    "\t\tclearTokens(document.body, TOKENS);",
)
t = t.replace("\t\tdisposeNight();", "\t\tdispose();")
t = t.replace("\t\tdisposeDawn();", "")

# any remaining dawn-gated css blocks become unconditional
t = re.sub(r'html\[data-cyui-mode="dawn"\]\s*', "", t)

p.write_text(t, encoding="utf-8")

leftovers = {
    "THEME_ID_DAWN": t.count("THEME_ID_DAWN"),
    "TOKENS_DAWN": t.count("TOKENS_DAWN"),
    "TOKENS_NIGHT": t.count("TOKENS_NIGHT"),
    "cyui-mode": t.count("cyui-mode"),
    "dawn": t.count("dawn"),
}
print("leftovers:", leftovers)
