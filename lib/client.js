window.__ModuleLoader__.load({
	id: "dsh-cyui",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;

/**
 * dsh-cyui — 雨夜书桌 · 环境主题。
 *
 * ── 兼容性铁律（上一版把整个窗口的交互锁死，就是违反了这些）──
 *
 * 1. 只改「画出来的东西」：color / background-image / box-shadow / border-color。
 *    绝不在宿主元素上写 position、overflow、isolation、z-index、margin、padding、
 *    transform —— 这些会改变布局与命中测试，一旦选择器误命中容器，整页就不能点。
 * 2. 绝不用 z-index 抢占顶层。自有元素一律 `pointer-events: none` 且 z-index ≤ 5，
 *    只为不遮挡，不为盖住任何东西。
 * 3. 绝不覆盖宿主容器的背景色（`body > div` 那种写法上一版把鲸鱼挂件的底涂黑）。
 *    壁纸只画在 `html` 上，谁也不需要让位。
 * 4. 选择器必须先定位到侧栏那一个容器，再在里面匹配；并且只标记「矮行」
 *    （高度 < 72px），跳过任何 fixed 定位、超过 200px 的元素，避免命中根容器。
 * 5. 一切效果可通过给 `<html>` 加 `data-dsh-cyui="off"` 一次性关掉。
 *
 * 违反其中任何一条，最坏结果是「看起来不对」，而不是「点不动」。
 */

const THEME_ID = "cyui-night";
const THEME_ID_DAWN = "cyui-dawn";
const BODY_ATTR = "data-dsh-cyui";
const ROOT_ID = "dsh-cyui-root";
const STYLE_ID = "dsh-cyui-style";
const PROGRESS_ID = "dsh-cyui-progress";
const FALLBACK_ID = "dsh-cyui-boot-fallback";
const OFF_ATTR = "data-dsh-cyui";

/* ---- assets, inlined by scripts/build-client.mjs ---- */
const IMG_CUP = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAaElEQVR4nGNgGNTg5II7/6mi8SS5BhEDGGGMN4+uEG2LiJwOXB8jssTJriCChpiXrUPRw4LMuf/oDQOpgBGZ8/3Dc6K9wSkgCdbLxEAhYBpwA1hI1QDzO04Dnj++jVOzpKwqqfbRAQAA3ewbwrQQ6uUAAAAASUVORK5CYII=";
const IMG_PENGUIN = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAmklEQVR4nGNgGPKAEV3g5II7//FpME9QQdHDRHUXgICFoQ9OV5w4vwW/CyzQNO/fPxuvPBMum+49PA/XDGLjAky4JB7eO4PCRncJVgMs0Jz3/cBEMEYHyOqYsAUQLttg4sgByYjLdGyGODqmYhjAhNUqEgCGATDTYbbhsx0EsCakdxsqwN7warwC9gosIIUCOrCqxwvwpUqQPABP50XWPy2LnAAAAABJRU5ErkJggg==";
const IMG_CATEAR = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAmUlEQVR4nGNgoBAwInP+F6z4j6FgQgQjNnEYYMJr+oQIRkLyLMgCL09cgrMlTrQxoouDxF5YVP1HlmfCZjKyZmxiyGxGGCNDyAqnP7GBGe+OgfWywATUeCVI0c/A8A7JBRlotsNMRwfY1DEhu4AYV6CrY4IxCh38wJgQQFfHxEAhYIEx+g9sIkoDujoWGOPW5xdEGUCsuiEEABZpNN7aV4m8AAAAAElFTkSuQmCC";
const IMG_RADIO = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAiElEQVR4nGNgoBfYsOvM/2FqCCOIyPMxIsvUSVvOMTJR6hoWEKGhIMHwSMwHqwK5V1sYpPyaMMSfbapDGAAC9XmBDNjA/JotDA4/1jEc4AgC85HZKAY0TlqP1QA5BgYUDchsol3wDOpcbICFGBfAwgcUHshsol3AgAcQ5QKYbcg2YxiALkE3AADkwjudhptmaAAAAABJRU5ErkJggg==";

/**
 * 壁纸用内联 data URI，不是 http 路由。
 * 桌面端的页面 baseURI 是 dsh-app://app/，绝对路径 "/dsh-cyui/room.jpg"
 * 会被解析成 dsh-app://app/dsh-cyui/room.jpg —— 请求根本到不了宿主的 HTTP 服务。
 * 内联字节没有 URL 解析这一步，谁都拦不住它。
 */

/** workspace menu row text → object icon */
const NAV_ICONS = [
	{ text: "插件市场", img: IMG_PENGUIN, key: "penguin" },
	{ text: "自动化任务", img: IMG_CATEAR, key: "catear" },
	{ text: "上下文洞察", img: IMG_RADIO, key: "radio" },
	{ text: "插件", img: IMG_CUP, key: "cup" }
];

/** 夜读主令牌 */
const TOKENS_NIGHT = {
	"--dsw-alias-bg-base": "rgba(23, 19, 28, 0.26)",
	"--dsw-alias-bg-layer-1": "rgba(30, 25, 38, 0.34)",
	"--dsw-alias-bg-layer-2": "rgba(38, 32, 48, 0.42)",
	"--dsw-alias-bg-layer-3": "rgba(47, 39, 57, 0.46)",
	"--dsw-alias-bg-overlay": "rgba(26, 21, 32, 0.70)",
	"--dsw-alias-bg-mask-1": "rgba(23, 19, 28, 0.35)",
	"--dsw-alias-bg-mask-2": "rgba(23, 19, 28, 0.62)",
	"--dsw-alias-bg-mask-3": "rgba(23, 19, 28, 0.82)",
	"--dsw-alias-bg-mask-photo": "rgba(16, 13, 22, 0.55)",
	"--dsw-alias-bg-module-platform": "rgba(27, 22, 34, 0.38)",
	"--dsw-alias-bg-multi-select": "rgba(201, 160, 220, 0.16)",
	"--dsw-alias-bg-skeleton": "rgba(43, 36, 51, 0.34)",
	"--dsw-alias-label-primary": "#efe9f5",
	"--dsw-alias-label-secondary": "#c3b7d0",
	"--dsw-alias-label-tertiary": "#9a8ea8",
	"--dsw-alias-label-caption": "#857a92",
	"--dsw-alias-label-dimmed": "#6e6479",
	"--dsw-alias-label-primary-inverted": "#17131c",
	"--dsw-alias-label-primary-foreground": "#f6f1fa",
	"--dsw-alias-label-primary-dimmed": "#cfc6da",
	"--dsw-alias-label-primary-bluish": "#b8a6e8",
	"--dsw-alias-border-l1": "#2f2739",
	"--dsw-alias-border-l2": "#3b3148",
	"--dsw-alias-border-l3": "#4a3e59",
	"--dsw-alias-border-l4": "#5c4d6e",
	"--dsw-alias-border-inverted": "rgba(255, 255, 255, 0.08)",
	"--dsw-alias-border-inverted2": "rgba(255, 255, 255, 0.14)",
	"--dsw-alias-border-l2-darkmode-thin": "rgba(255, 255, 255, 0.06)",
	"--dsw-alias-brand-primary": "#c9a0dc",
	"--dsw-alias-brand-primary-invert": "#1a1520",
	"--dsw-alias-brand-text": "#17131c",
	"--dsw-alias-button-primary-fill": "#c9a0dc",
	"--dsw-alias-button-primary-hover": "#d8b4e6",
	"--dsw-alias-button-primary-dimmed": "rgba(201, 160, 220, 0.35)",
	"--dsw-alias-button-contrast-fill": "#f0b27a",
	"--dsw-alias-button-elevated-fill": "#2a2333",
	"--dsw-alias-button-floating-fill": "#241e2c",
	"--dsw-alias-button-floating-hover": "#302838",
	"--dsw-alias-button-ghost-active-fill": "rgba(201, 160, 220, 0.18)",
	"--dsw-alias-button-ghost-active-hover": "rgba(201, 160, 220, 0.26)",
	"--dsw-alias-button-ghost-active-border": "rgba(201, 160, 220, 0.45)",
	"--dsw-alias-button-info-fill": "#7f6ba8",
	"--dsw-alias-button-info-hover": "#8f7ab8",
	"--dsw-alias-button-tool-bar-fill": "rgba(38, 32, 48, 0.85)",
	"--dsw-alias-button-tool-bar-fill-invisible": "transparent",
	"--dsw-alias-button-tool-bar-hover": "rgba(201, 160, 220, 0.14)",
	"--dsw-alias-interactive-bg-hover": "rgba(201, 160, 220, 0.10)",
	"--dsw-alias-interactive-bg-hover-accent": "rgba(240, 178, 122, 0.16)",
	"--dsw-alias-interactive-bg-hover-danger": "rgba(226, 110, 120, 0.16)",
	"--dsw-alias-interactive-bg-hover-solid": "#2b2434",
	"--dsw-alias-interactive-bg-active": "rgba(201, 160, 220, 0.20)",
	"--dsw-alias-markdown-code-block": "#1b1622",
	"--dsw-alias-markdown-code-block-banner": "#221b2a",
	"--dsw-alias-markdown-inline-code": "rgba(240, 178, 122, 0.14)",
	"--dsw-alias-markdown-citation": "#8f7ab8",
	"--dsw-alias-markdown-tag": "rgba(201, 160, 220, 0.18)",
	"--dsw-alias-markdown-placeholder": "#6e6479",
	"--dsw-alias-markdown-code-segment-selected": "rgba(201, 160, 220, 0.28)",
	"--dsw-alias-markdown-code-segment-unselected": "rgba(255, 255, 255, 0.05)",
	"--dsw-alias-scrollbar-bg-l1": "rgba(255, 255, 255, 0.10)",
	"--dsw-alias-scrollbar-bg-l2": "rgba(255, 255, 255, 0.14)",
	"--dsw-alias-scrollbar-hover-l1": "rgba(201, 160, 220, 0.35)",
	"--dsw-alias-scrollbar-hover-l2": "rgba(201, 160, 220, 0.45)",
	"--dsw-alias-state-business-primary": "#c9a0dc",
	"--dsw-alias-state-business-tertiary": "rgba(201, 160, 220, 0.20)",
	"--dsw-alias-state-error-primary": "#e26e78",
	"--dsw-alias-state-error-secondary": "#f08a92",
	"--dsw-alias-state-success-primary": "#8fbf9a",
	"--dsw-alias-state-success-secondary": "#a5d0ae",
	"--dsw-alias-state-success-tertiary": "rgba(143, 191, 154, 0.18)",
	"--dsw-alias-state-warn-primary": "#f0b27a",
	"--dsw-alias-state-warn-secondary": "#f5c496",
	"--dsw-alias-state-warn-tertiary": "rgba(240, 178, 122, 0.18)",
	"--dsw-alias-state-warn-label": "#f0b27a",
	"--dsw-alias-toast-bg": "#2a2233",
	"--dsw-alias-tooltip-bg": "#322a3c",
	"--dsw-specific-sidebar-fill": "rgba(16, 13, 22, 0.28)"
};

/** 晨光变体 */
const TOKENS_DAWN = {
	"--dsw-alias-bg-base": "rgba(250, 247, 242, 0.42)",
	"--dsw-alias-bg-layer-1": "rgba(252, 249, 244, 0.50)",
	"--dsw-alias-bg-layer-2": "rgba(244, 238, 230, 0.56)",
	"--dsw-alias-bg-layer-3": "rgba(236, 228, 218, 0.60)",
	"--dsw-alias-bg-overlay": "rgba(252, 249, 244, 0.78)",
	"--dsw-alias-bg-mask-1": "rgba(246, 241, 233, 0.35)",
	"--dsw-alias-bg-mask-2": "rgba(246, 241, 233, 0.65)",
	"--dsw-alias-bg-mask-3": "rgba(246, 241, 233, 0.85)",
	"--dsw-alias-bg-mask-photo": "rgba(246, 241, 233, 0.72)",
	"--dsw-alias-bg-module-platform": "rgba(246, 240, 232, 0.54)",
	"--dsw-alias-bg-multi-select": "rgba(122, 92, 140, 0.14)",
	"--dsw-alias-bg-skeleton": "rgba(238, 230, 220, 0.48)",
	"--dsw-alias-label-primary": "#2a2233",
	"--dsw-alias-label-secondary": "#5c5265",
	"--dsw-alias-label-tertiary": "#7d7288",
	"--dsw-alias-label-caption": "#8b8195",
	"--dsw-alias-label-dimmed": "#a298ac",
	"--dsw-alias-label-primary-inverted": "#fbf7f1",
	"--dsw-alias-label-primary-foreground": "#241d2c",
	"--dsw-alias-label-primary-dimmed": "#3e3548",
	"--dsw-alias-label-primary-bluish": "#5a4a86",
	"--dsw-alias-border-l1": "#e3d8ca",
	"--dsw-alias-border-l2": "#d5c8b8",
	"--dsw-alias-border-l3": "#c4b5a3",
	"--dsw-alias-border-l4": "#b09f8b",
	"--dsw-alias-border-inverted": "rgba(42, 34, 51, 0.08)",
	"--dsw-alias-border-inverted2": "rgba(42, 34, 51, 0.14)",
	"--dsw-alias-border-l2-darkmode-thin": "rgba(42, 34, 51, 0.06)",
	"--dsw-alias-brand-primary": "#7a5c8c",
	"--dsw-alias-brand-primary-invert": "#fbf7f1",
	"--dsw-alias-brand-text": "#fbf7f1",
	"--dsw-alias-button-primary-fill": "#7a5c8c",
	"--dsw-alias-button-primary-hover": "#8a6b9c",
	"--dsw-alias-button-primary-dimmed": "rgba(122, 92, 140, 0.30)",
	"--dsw-alias-button-contrast-fill": "#b4703c",
	"--dsw-alias-button-elevated-fill": "#fbf7f1",
	"--dsw-alias-button-floating-fill": "#fbf7f1",
	"--dsw-alias-button-floating-hover": "#f1e9df",
	"--dsw-alias-button-ghost-active-fill": "rgba(122, 92, 140, 0.14)",
	"--dsw-alias-button-ghost-active-hover": "rgba(122, 92, 140, 0.20)",
	"--dsw-alias-button-ghost-active-border": "rgba(122, 92, 140, 0.38)",
	"--dsw-alias-button-info-fill": "#6d5a94",
	"--dsw-alias-button-info-hover": "#7d69a4",
	"--dsw-alias-button-tool-bar-fill": "rgba(251, 247, 241, 0.88)",
	"--dsw-alias-button-tool-bar-fill-invisible": "transparent",
	"--dsw-alias-button-tool-bar-hover": "rgba(122, 92, 140, 0.12)",
	"--dsw-alias-interactive-bg-hover": "rgba(122, 92, 140, 0.08)",
	"--dsw-alias-interactive-bg-hover-accent": "rgba(180, 112, 60, 0.12)",
	"--dsw-alias-interactive-bg-hover-danger": "rgba(190, 70, 80, 0.12)",
	"--dsw-alias-interactive-bg-hover-solid": "#f1e9df",
	"--dsw-alias-interactive-bg-active": "rgba(122, 92, 140, 0.16)",
	"--dsw-alias-markdown-code-block": "#f3ece2",
	"--dsw-alias-markdown-code-block-banner": "#ece2d6",
	"--dsw-alias-markdown-inline-code": "rgba(180, 112, 60, 0.14)",
	"--dsw-alias-markdown-citation": "#6d5a94",
	"--dsw-alias-markdown-tag": "rgba(122, 92, 140, 0.16)",
	"--dsw-alias-markdown-placeholder": "#a298ac",
	"--dsw-alias-markdown-code-segment-selected": "rgba(122, 92, 140, 0.22)",
	"--dsw-alias-markdown-code-segment-unselected": "rgba(42, 34, 51, 0.06)",
	"--dsw-alias-scrollbar-bg-l1": "rgba(42, 34, 51, 0.12)",
	"--dsw-alias-scrollbar-bg-l2": "rgba(42, 34, 51, 0.18)",
	"--dsw-alias-scrollbar-hover-l1": "rgba(122, 92, 140, 0.32)",
	"--dsw-alias-scrollbar-hover-l2": "rgba(122, 92, 140, 0.42)",
	"--dsw-alias-state-business-primary": "#7a5c8c",
	"--dsw-alias-state-business-tertiary": "rgba(122, 92, 140, 0.18)",
	"--dsw-alias-state-error-primary": "#b8464f",
	"--dsw-alias-state-error-secondary": "#c95c64",
	"--dsw-alias-state-success-primary": "#4f7d5c",
	"--dsw-alias-state-success-secondary": "#628f6f",
	"--dsw-alias-state-success-tertiary": "rgba(79, 125, 92, 0.16)",
	"--dsw-alias-state-warn-primary": "#b4703c",
	"--dsw-alias-state-warn-secondary": "#c48250",
	"--dsw-alias-state-warn-tertiary": "rgba(180, 112, 60, 0.16)",
	"--dsw-alias-state-warn-label": "#b4703c",
	"--dsw-alias-toast-bg": "#fbf7f1",
	"--dsw-alias-tooltip-bg": "#ece2d6",
	"--dsw-specific-sidebar-fill": "rgba(248, 243, 236, 0.44)"
};

/* ------------------------------------------------------------------ *
 * 样式：全部是「画」的属性，没有一条改布局
 * ------------------------------------------------------------------ */

/** Render a token dictionary as declarations. */
function tokenCss(tokens) {
	return Object.entries(tokens).map(([key, value]) => `\t${key}: ${value} !important;`).join("\n");
}

function buildCss() {
	return `
/* ---- 1. wallpaper: painted on <html>, below everything, touches nothing ---- */
html {
	background-color: #0e0b14 !important;
	background-image:
		radial-gradient(120% 90% at 50% 42%, rgba(12,10,16,0) 26%, rgba(12,10,16,.30) 72%, rgba(12,10,16,.64) 100%),
		linear-gradient(180deg,
			rgba(12, 10, 16, var(--cyui-dim-top, .34)),
			rgba(12, 10, 16, var(--cyui-dim-mid, .04)) 22%,
			rgba(12, 10, 16, var(--cyui-dim-mid, .04)) 70%,
			rgba(12, 10, 16, var(--cyui-dim-bottom, .40))),
		var(--cyui-wall, none) !important;
	background-size: cover, cover, var(--cyui-wall-size, cover) !important;
	background-position: center, center, var(--cyui-wall-pos, center 46%) !important;
	background-repeat: no-repeat !important;
	background-attachment: fixed !important;
}
html[data-cyui-mode="dawn"] {
	background-image:
		linear-gradient(rgba(250, 246, 238, .34), rgba(250, 246, 238, .34)),
		radial-gradient(120% 90% at 50% 42%, rgba(250,246,238,.05) 26%, rgba(250,246,238,.42) 72%, rgba(250,246,238,.78) 100%),
		var(--cyui-wall, none) !important;
}

/* body 只让出「底色」这一件事；不动任何子容器，鲸鱼那类挂件的底不会被碰到 */
body { background-color: transparent !important; }

/* ---- 0. palette forced onto <body> ----
   The theme service applies tokens as inline variables on <body>; a stylesheet
   declaration with !important outranks an inline one without it, so this wins
   no matter what the host restored as its stored appearance preference.
   Without this, every restart handed the UI back to the built-in light theme. */
html[data-cyui-mode="night"] body {
${tokenCss(TOKENS_NIGHT)}
}
html[data-cyui-mode="dawn"] body {
${tokenCss(TOKENS_DAWN)}
}

/* ---- 1b. pointer lamp: painted, never structural ---- */
#${ROOT_ID} .lamp {
	position: absolute; left: 0; top: 0;
	width: 560px; height: 560px; margin: -280px 0 0 -280px;
	background: radial-gradient(circle, rgba(240,178,122,.16), rgba(240,178,122,.06) 45%, transparent 66%);
	opacity: 0;
	transition: opacity .5s ease;
	will-change: transform;
}
#${ROOT_ID}[data-lamp="on"] .lamp { opacity: 1; }
#${ROOT_ID} .lamp::after {
	content: ""; position: absolute; left: 50%; top: 50%;
	width: 5px; height: 5px; margin: -2.5px 0 0 -2.5px; border-radius: 50%;
	background: rgba(255, 232, 196, .45);
	box-shadow: 0 0 10px rgba(255, 214, 160, .55);
}
#${ROOT_ID}[data-mode="dawn"] .lamp {
	background: radial-gradient(circle, rgba(255,214,150,.18), rgba(255,214,150,.07) 45%, transparent 66%);
}

/* ---- 1c. let the wallpaper reach the panes ----
   Only the conversation containers are cleared. An earlier version also cleared
   every body > div, which stripped the fill off modals and popovers and left
   their text sitting on the wallpaper. */
[class*="conversation"],
[class*="Conversation"],
[class*="transcript"],
[class*="Transcript"],
[class*="chat-"],
[class*="chat_"],
[class*="messages"] {
	background-color: transparent !important;
}

/* ---- 1c2. popups get their own back plate ----
   Whatever the host paints them with, a panel of text must not be see-through.
   Matched by role and by the specific surface suffixes, deliberately avoiding a
   bare menu (that would repaint the sidebar rows). */
[role="dialog"],
[role="alertdialog"],
[role="menu"],
[role="listbox"],
[class*="_modal"],
[class*="_Modal"],
[class*="_dialog"],
[class*="_Dialog"],
[class*="_popover"],
[class*="_Popover"],
[class*="_drawer"],
[class*="_Drawer"],
[class*="_sheet"],
[class*="_Sheet"],
[class*="_dropdown"],
[class*="_Dropdown"],
[class*="_popup"],
[class*="_Popup"],
[class*="_tooltip"],
[class*="_Tooltip"] {
	background-color: rgba(13, 10, 19, .97) !important;
	background-image: none !important;
}
html[data-cyui-mode="dawn"] [role="dialog"],
html[data-cyui-mode="dawn"] [role="menu"],
html[data-cyui-mode="dawn"] [class*="_modal"],
html[data-cyui-mode="dawn"] [class*="_dialog"],
html[data-cyui-mode="dawn"] [class*="_popover"],
html[data-cyui-mode="dawn"] [class*="_popup"] {
	background-color: rgba(250, 247, 242, .98) !important;
}

/* ---- 1d. the skeleton itself ----
   .frame and .centerCol paint background: var(--dsw-alias-bg-base). The theme
   service writes that variable inline on <body>, and inline-important outranks
   stylesheet-important, so fighting over the variable can lose. We set the
   property on the elements instead. *= rather than $= because a compiled
   class attribute may carry more than one token. */
[class*="_frame"],
[class*="_centerCol"] {
	background-color: rgba(14, 11, 20, .30) !important;
	/* 磨砂玻璃：参数来自面板，默认 0 等于关闭 */
	-webkit-backdrop-filter: blur(var(--cyui-glass, 0px)) saturate(1.05);
	backdrop-filter: blur(var(--cyui-glass, 0px)) saturate(1.05);
}
[class*="composerStack"],
[class*="composerSeat"] {
	-webkit-backdrop-filter: blur(var(--cyui-glass, 0px));
	backdrop-filter: blur(var(--cyui-glass, 0px));
}
/* the composer sits on top of the pane and paints its own fill from bg-base,
   including a gradient to transparent — cover the property, not the variable */
[class*="composer"],
[class*="Composer"],
[class*="ComposerSeat"] {
	background-color: rgba(14, 11, 20, .62) !important;
	background-image: none !important;
}
/* message bubbles carry their own light-blue fill (probe: LOmm4q_bubble
   rgb(237,243,254)), independent of bg-base. Darken every bubble surface. */
[class*="_bubble"],
[class*="_Bubble"] {
	background-color: rgba(40, 34, 52, .82) !important;
	background-image: none !important;
	border-color: rgba(96, 124, 190, .3) !important;
	color: #eae2f4 !important;
	box-shadow: inset 0 0 0 1px rgba(120, 130, 220, .12) !important;
}
[class*="_bubble"] a,
[class*="_bubble"] code,
[class*="_bubble"] strong,
[class*="_bubble"] span,
[class*="_bubble"] p {
	color: inherit !important;
}
html[data-cyui-mode="dawn"] [class*="_bubble"],
html[data-cyui-mode="dawn"] [class*="_Bubble"] {
	background-color: rgba(255, 252, 246, .88) !important;
	color: #241d2c !important;
}

/* the "+" button (add file / call command) sits inside the composer and keeps a
   near-white fill from the light palette. Darken the control itself and let its
   glyph follow via currentColor. */
[class*="composerStack"] button,
[class*="composerSeat"] button,
[class*="composerStack"] [role="button"],
[class*="composerSeat"] [role="button"] {
	background-color: rgba(38, 32, 48, .88) !important;
	background-image: none !important;
	color: #d6cde6 !important;
	border-color: rgba(96, 124, 190, .28) !important;
}
[class*="composerStack"] button:hover,
[class*="composerSeat"] button:hover,
[class*="composerStack"] [role="button"]:hover,
[class*="composerSeat"] [role="button"]:hover {
	background-color: rgba(53, 224, 240, .16) !important;
	color: #eafcff !important;
}
[class*="composerStack"] button svg,
[class*="composerSeat"] button svg,
[class*="composerStack"] [role="button"] svg,
[class*="composerSeat"] [role="button"] svg {
	color: inherit !important;
}

/* the composer card: class ends in _card and shares no word with "composer",
   so it has to be addressed from inside the composer subtree (probe v3) */
[class*="composerStack"] [class*="_card"],
[class*="composerSeat"] [class*="_card"],
[class*="composer"] [class*="_card"],
[class*="Composer"] [class*="_card"] {
	background-color: rgba(14, 11, 20, .58) !important;
	background-image: none !important;
	border-color: rgba(96, 124, 190, .34) !important;
}

/* the seat holds a card that paints its own fill one level down */
[class*="composer"] > *,
[class*="Composer"] > *,
[class*="composerSeat"] > * {
	background-color: transparent !important;
	background-image: none !important;
}
[class*="_centerCol"] [class*="_root"],
[class*="conversation"],
[class*="Conversation"],
[class*="transcript"],
[class*="Transcript"],
[class*="chat-"],
[class*="chat_"],
[class*="messages"] {
	background-color: transparent !important;
}
html[data-cyui-mode="dawn"] [class*="_frame"],
html[data-cyui-mode="dawn"] [class*="_centerCol"] {
	background-color: rgba(250, 247, 242, .42) !important;
}

/* ---- 1e. wallpaper panel ---- */
#dsh-cyui-wall-btn {
	position: absolute !important; right: 16px !important; bottom: 16px !important;
	left: auto !important; top: auto !important;
	z-index: 2147482004 !important; box-sizing: border-box !important;
	width: 34px; height: 34px; border-radius: 999px; cursor: pointer;
	border: 1px solid rgba(53, 224, 240, .35);
	background: rgba(16, 13, 24, .72);
	color: #bfe9f5; display: grid; place-items: center;
	font: 13px/1 system-ui, sans-serif;
	opacity: .28; transition: opacity .18s ease, transform .18s ease;
	pointer-events: auto;
}
#dsh-cyui-wall-btn:hover { opacity: 1; transform: scale(1.06); }
#dsh-cyui-wall-panel {
	position: absolute !important;
	right: 16px !important;
	bottom: 58px !important;
	left: auto !important;
	top: auto !important;
	z-index: 2147482005 !important;
	box-sizing: border-box !important;
	width: 272px !important;
	max-width: calc(100vw - 32px) !important;
	max-height: min(72vh, 560px) !important;
	overflow-y: auto !important;
	padding: 14px !important;
	margin: 0 !important;
	border-radius: 12px;
	background: rgba(12, 10, 18, .96);
	border: 1px solid rgba(53, 224, 240, .3);
	box-shadow: 0 14px 40px rgba(0, 0, 0, .6);
	color: #d8e8f2;
	font: 12px/1.6 "Microsoft YaHei", system-ui, sans-serif !important;
	text-align: left;
	pointer-events: auto;
}
#dsh-cyui-wall-panel[hidden] { display: none; }
#dsh-cyui-wall-panel h4 {
	margin: 0 0 10px !important; padding: 0 !important;
	font-size: 12px !important; font-weight: 500 !important; line-height: 1.4 !important;
	letter-spacing: .16em; color: #8fe6f4 !important;
}
#dsh-cyui-wall-panel .row {
	display: flex !important; align-items: center !important;
	gap: 8px !important; margin: 0 0 9px !important; padding: 0 !important;
	min-height: 24px !important;
}
#dsh-cyui-wall-panel .row label {
	flex: 0 0 42px !important; color: #8e9bb0 !important;
	font-size: 12px !important; line-height: 1.4 !important; white-space: nowrap;
}
#dsh-cyui-wall-panel input[type="range"] { flex: 1; accent-color: #35e0f0; }
#dsh-cyui-wall-panel select,
#dsh-cyui-wall-panel button {
	background: rgba(38, 32, 48, .9); color: #d8e8f2;
	border: 1px solid rgba(96, 124, 190, .32); border-radius: 7px;
	padding: 4px 8px; font: inherit; cursor: pointer;
}
#dsh-cyui-wall-panel button:hover,
#dsh-cyui-wall-panel select:hover { border-color: rgba(53, 224, 240, .55); }
#dsh-cyui-wall-panel .pick { width: 100% !important; margin: 0 0 9px !important; font-size: 11px !important; }
#dsh-cyui-wall-panel .hint { color: #6f7a8c; font-size: 11px; line-height: 1.5; margin: 4px 0 0; }
#dsh-cyui-wall-panel .status { color: #8fbf9a; font-size: 11px; min-height: 14px; }

/* ---- 2. overlay: corners + progress, both below the UI and non-interactive ---- */
#${ROOT_ID} {
	position: fixed; inset: 0;
	z-index: 1;                 /* 低层级：不参与遮挡，任何情况下都不抢点击 */
	pointer-events: none;
}
#${ROOT_ID} .frame i {
	position: absolute; width: 16px; height: 16px;
	border: 1px solid rgba(201, 160, 220, .22);
}
#${ROOT_ID} .frame i:nth-child(1) { left: 14px; top: 14px; border-right: 0; border-bottom: 0; }
#${ROOT_ID} .frame i:nth-child(2) { right: 14px; top: 14px; border-left: 0; border-bottom: 0; }
#${ROOT_ID} .frame i:nth-child(3) { left: 14px; bottom: 14px; border-right: 0; border-top: 0; }
#${ROOT_ID} .frame i:nth-child(4) { right: 14px; bottom: 14px; border-left: 0; border-top: 0; }
#${ROOT_ID}[data-mode="dawn"] .frame i { border-color: rgba(122, 92, 140, .22); }

#${PROGRESS_ID} {
	position: fixed; top: 0; left: 0; right: 0; height: 2px;
	z-index: 5; pointer-events: none;
	background: linear-gradient(90deg, rgba(53,224,240,0), #35e0f0 30%, #7a5cff 62%, #ff2b8a 100%);
	transform: scaleX(0); transform-origin: 0 50%;
	transition: transform .1s linear;
	box-shadow: 0 0 14px rgba(53,224,240,.5);
}

/* ---- 2b. cyber / data field over the whole window ----
   Drawn on our own overlay (pointer-events:none, z-index 1), masked to the
   edges so the middle stays clean and text keeps its contrast. */
#${ROOT_ID}::before {
	content: "";
	position: absolute; inset: 0;
	pointer-events: none;
	background-image:
		repeating-linear-gradient(0deg, rgba(53, 224, 240, .11) 0 1px, transparent 1px 36px),
		repeating-linear-gradient(90deg, rgba(122, 92, 255, .09) 0 1px, transparent 1px 36px);
	-webkit-mask-image: radial-gradient(125% 105% at 50% 50%, transparent 34%, #000 96%);
	mask-image: radial-gradient(125% 105% at 50% 50%, transparent 34%, #000 96%);
	opacity: .6;
	animation: cyui-grid-drift 26s linear infinite;
}
@keyframes cyui-grid-drift {
	to { background-position: 0 36px, 36px 0; }
}

/* ---- 3. sidebar chrome: box-shadow + border-colour only ---- */
[data-cyui-side] {
	border-right: 1px solid rgba(104, 134, 202, .45) !important;
	box-shadow:
		inset -1px 0 0 rgba(134, 100, 188, .34),
		inset -34px 0 56px -40px rgba(58, 74, 132, .65) !important;
	/* a stream of fine cyan rules running upward — data, not decoration */
	background-image:
		repeating-linear-gradient(180deg,
			rgba(53, 224, 240, .11) 0 1px,
			rgba(53, 224, 240, 0) 1px 34px) !important;
	background-size: 100% 34px !important;
	background-repeat: repeat !important;
	animation: cyui-stream 5.5s linear infinite;
}
@keyframes cyui-stream {
	to { background-position: 0 34px; }
}

/* the dividing edge between rail and pane: a neon ribbon drifting down it.
   Only enabled when the rail is actually positioned, otherwise the pseudo
   element would anchor to some far ancestor and draw the line in the wrong
   place — a decoration is never worth that risk. */
[data-cyui-side]:not([data-cyui-side-static])::after {
	content: "";
	position: absolute; top: 0; right: 0; bottom: 0; width: 2px;
	pointer-events: none;
	background-image:
		linear-gradient(180deg,
			rgba(112, 142, 216, 0) 0%,
			rgba(112, 142, 216, .38) 16%,
			rgba(150, 110, 208, .38) 84%,
			rgba(150, 110, 208, 0) 100%),
		linear-gradient(180deg,
			transparent 0%,
			rgba(53, 224, 240, .30) 42%,
			rgba(122, 92, 255, .30) 50%,
			rgba(255, 43, 138, .24) 58%,
			transparent 100%);
	background-size: 100% 100%, 100% 24%;
	background-repeat: no-repeat, no-repeat;
	background-position: 0 0, 0 -30%;
	animation: cyui-edge-flow 6.5s linear infinite;
	filter: drop-shadow(0 0 5px rgba(120, 130, 220, .35));
}
@keyframes cyui-edge-flow {
	0% { background-position: 0 0, 0 -30%; }
	100% { background-position: 0 0, 0 130%; }
}


/* ---- 4. rail rows: outline on hover, no layout, no clipping ---- */
[data-cyui-row] {
	/* resting: a dim data rail on the left edge, painted with an inset shadow
	   so nothing moves and nothing clips */
	box-shadow: inset 2px 0 0 rgba(53, 224, 240, .18);
	background-image: linear-gradient(90deg, rgba(53, 224, 240, .06), transparent 52%);
	background-size: 100% 100%;
	transition: box-shadow .18s ease, background-image .18s ease, color .18s ease;
}
[data-cyui-row]:hover {
	box-shadow:
		inset 3px 0 0 rgba(53, 224, 240, .9),
		0 0 0 1px rgba(53, 224, 240, .55),
		0 0 14px -3px rgba(53, 224, 240, .45),
		inset 0 0 16px -6px rgba(255, 43, 138, .6);
	color: #eafcff !important;
	background-image: linear-gradient(100deg,
		rgba(53, 224, 240, .10) 0%,
		rgba(122, 92, 255, .16) 34%,
		rgba(255, 43, 138, .12) 58%,
		rgba(53, 224, 240, .10) 100%);
	background-size: 260% 100%;
	animation: cyui-rowscan 1.8s linear infinite;
}
@keyframes cyui-rowscan {
	from { background-position: 100% 0; }
	to { background-position: -60% 0; }
}

[data-cyui-row][aria-current="page"],
[data-cyui-row][aria-current="true"],
[data-cyui-row][aria-selected="true"],
[data-cyui-row][data-active="true"] {
	box-shadow:
		inset 2px 0 0 rgba(53, 224, 240, .65),
		inset 0 0 14px -8px rgba(122, 92, 255, .8);
	background-image: linear-gradient(90deg, rgba(53, 224, 240, .10), rgba(122, 92, 255, .05) 46%, transparent 78%);
}

/* ---- 5. workspace menu icons ---- */
[data-cyui-nav] svg { display: none !important; }
[data-cyui-nav]::before {
	content: "";
	display: inline-block;
	width: 18px; height: 18px; margin-right: 10px;
	background: var(--cyui-nav-icon) center / contain no-repeat;
	image-rendering: pixelated;
	opacity: .9;
	vertical-align: -4px;
}
[data-cyui-nav]:hover::before { opacity: 1; }

/* ---- 6. kill switch: <html data-dsh-cyui="off"> disables every effect ---- */
html[data-dsh-cyui="off"] {
	background-image: none !important;
	background-color: transparent !important;
}
html[data-dsh-cyui="off"] [data-cyui-side] { border-right: 0 !important; box-shadow: none !important; }
html[data-dsh-cyui="off"] [data-cyui-row]:hover { box-shadow: none !important; }
html[data-dsh-cyui="off"] [data-cyui-nav]::before { display: none !important; }
html[data-dsh-cyui="off"] [data-cyui-nav] svg { display: revert !important; }


/* ---- 8. fallback launch screen (only when the host-injected one is missing) ---- */
#${FALLBACK_ID} {
	position: fixed; inset: 0; z-index: 2147482200;
	display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px;
	background: radial-gradient(120% 100% at 50% 30%, #0b1020 0%, #06060c 60%, #04040a 100%);
	font-family: "Microsoft YaHei", system-ui, sans-serif; color: #cfe9f2;
	transition: opacity .45s ease, transform .45s ease;
	animation: cyui-fb-out .5s ease 8s forwards;
}
#${FALLBACK_ID}.is-out {
	animation: cyui-fb-crt .52s cubic-bezier(.65, 0, .35, 1) forwards;
	pointer-events: none;
}
#${FALLBACK_ID} + .fb-flash {
	position: fixed; inset: 0; z-index: 2147482199; pointer-events: none;
	opacity: 0; transform: scaleY(.004);
	background-image:
		repeating-linear-gradient(0deg,
			rgba(255, 255, 255, .20) 0 1px,
			rgba(255, 255, 255, 0) 1px 3px),
		radial-gradient(120% 72% at 50% 50%,
			rgba(255, 255, 255, .94) 0%,
			rgba(196, 232, 255, .80) 38%,
			rgba(120, 180, 255, .35) 60%,
			transparent 76%);
	background-size: 100% 3px, 100% 100%;
}
#${FALLBACK_ID} + .fb-flash.is-on {
	animation: cyui-fb-power-on .78s cubic-bezier(.18, .8, .24, 1) forwards;
}
@keyframes cyui-fb-crt {
	0% { clip-path: inset(0 0 0 0); filter: brightness(1); opacity: 1; }
	42% { clip-path: inset(48.6% 0 48.6% 0); filter: brightness(4.5); opacity: 1; }
	60% { clip-path: inset(48.6% 0 48.6% 0); filter: brightness(7); opacity: 1; }
	100% { clip-path: inset(48.6% 0 48.6% 0); filter: brightness(9); opacity: 0; visibility: hidden; }
}
@keyframes cyui-fb-power-on {
	0% { transform: scaleY(.004) scaleX(.92); opacity: 1; filter: brightness(5); }
	22% { transform: scaleY(.014) scaleX(1); opacity: 1; filter: brightness(7); }
	30% { transform: scaleY(.014) scaleX(1); opacity: 1; filter: brightness(11); }
	62% { transform: scaleY(1) scaleX(1); opacity: .62; filter: brightness(2.2); }
	72% { transform: scaleY(1) scaleX(1); opacity: .5; filter: brightness(3.6); }
	100% { transform: scaleY(1) scaleX(1); opacity: 0; filter: brightness(1); }
}
#${FALLBACK_ID} .fb-grid {
	position: absolute; inset: -20%; opacity: .8; pointer-events: none;
	background-image:
		repeating-linear-gradient(0deg, rgba(53,224,240,.16) 0 1px, transparent 1px 36px),
		repeating-linear-gradient(90deg, rgba(122,92,255,.14) 0 1px, transparent 1px 36px);
	transform: perspective(600px) rotateX(58deg);
	-webkit-mask-image: radial-gradient(60% 50% at 50% 45%, #000 30%, transparent 78%);
	mask-image: radial-gradient(60% 50% at 50% 45%, #000 30%, transparent 78%);
}
#${FALLBACK_ID} .fb-core { position: relative; width: 200px; height: 200px; display: grid; place-items: center; }
#${FALLBACK_ID} .fb-core svg { width: 104px; height: 104px;
	filter: drop-shadow(0 0 14px rgba(53,224,240,.55)) drop-shadow(0 0 26px rgba(255,43,138,.28)); }
#${FALLBACK_ID} .fb-ring {
	position: absolute; inset: 12px; border-radius: 50%;
	box-shadow: inset 0 0 0 1px rgba(53,224,240,.22);
	animation: cyui-fb-pulse 2.4s ease-out infinite;
}
#${FALLBACK_ID} .fb-label { position: relative; text-align: center; letter-spacing: .34em; line-height: 1.9; }
#${FALLBACK_ID} .fb-label i { display: block; font-style: normal; font-size: 11px; color: #35e0f0; opacity: .8; }
#${FALLBACK_ID} .fb-label b { display: block; font-size: 20px; font-weight: 500; letter-spacing: .5em;
	text-shadow: 0 0 16px rgba(53,224,240,.5); }
#${FALLBACK_ID} .fb-bar { position: relative; width: 132px; height: 2px; overflow: hidden;
	background: rgba(53,224,240,.14); border-radius: 2px; }
#${FALLBACK_ID} .fb-bar::after {
	content: ""; position: absolute; inset: 0;
	background: linear-gradient(90deg, transparent, #35e0f0, #ff2b8a, transparent);
	animation: cyui-fb-scan 1.4s linear infinite;
}
#${FALLBACK_ID} .fb-call {
	position: relative;
	width: 68px; height: 68px; border-radius: 50%; cursor: pointer;
	margin-top: 2px;
	border: 1px solid rgba(53, 224, 240, .55);
	background: radial-gradient(circle at 50% 35%, rgba(53, 224, 240, .28), rgba(10, 16, 28, .92));
	display: grid; place-items: center;
	box-shadow:
		0 0 0 1px rgba(255, 43, 138, .16),
		0 0 20px rgba(53, 224, 240, .34),
		inset 0 0 16px rgba(53, 224, 240, .22);
	animation: cyui-fb-shake .9s ease-in-out infinite;
	transition: transform .18s ease, box-shadow .18s ease;
}
#${FALLBACK_ID} .fb-call:hover {
	transform: scale(1.06);
	box-shadow:
		0 0 0 1px rgba(255, 43, 138, .45),
		0 0 30px rgba(53, 224, 240, .58),
		inset 0 0 22px rgba(255, 43, 138, .3);
}
#${FALLBACK_ID} .fb-call:active { transform: scale(.94); }
#${FALLBACK_ID} .fb-call svg {
	width: 30px; height: 30px; fill: none; stroke: #dff6ff; stroke-width: 1.8;
	stroke-linecap: round; stroke-linejoin: round;
	filter: drop-shadow(0 0 8px rgba(53, 224, 240, .8));
}
@keyframes cyui-fb-shake {
	0%, 100% { transform: translate(0, 0) rotate(0); }
	20% { transform: translate(-1.4px, .6px) rotate(-1.2deg); }
	40% { transform: translate(1.4px, -.6px) rotate(1.2deg); }
	60% { transform: translate(-1px, -.4px) rotate(-.8deg); }
	80% { transform: translate(1px, .4px) rotate(.8deg); }
}
@keyframes cyui-fb-pulse { 0% { transform: scale(.8); opacity: .9 } 100% { transform: scale(1.2); opacity: 0 } }
@keyframes cyui-fb-scan { from { transform: translateX(-100%) } to { transform: translateX(100%) } }
@keyframes cyui-fb-out { to { opacity: 0; visibility: hidden } }

@media (prefers-reduced-motion: reduce) {
	#${PROGRESS_ID}, [data-cyui-row] { transition: none; }
	#${ROOT_ID}::before,
	[data-cyui-side], [data-cyui-side]::after,
	[data-cyui-row]:hover { animation: none !important; }
}
`;
}

/* ------------------------------------------------------------------ *
 * 工具
 * ------------------------------------------------------------------ */

function resolveThemeService(ctx) {
	if (ctx && ctx.theme) return ctx.theme;
	try {
		if (typeof ctx.get === "function") {
			const got = ctx.get("theme");
			if (got) return got;
		}
	} catch { /* ignore */ }
	return null;
}

/**
 * Set every token as inline-important on <body>.
 *
 * The host writes its stored palette the same way during a cold start; because
 * CSSOM assignments apply in order for equal priority, our later write wins.
 */
function writeTokens(node, tokens) {
	for (const [key, value] of Object.entries(tokens)) {
		node.style.setProperty(key, value, "important");
	}
}

/** Undo writeTokens, leaving whatever the host had put there. */
function clearTokens(node, tokens) {
	for (const key of Object.keys(tokens)) node.style.removeProperty(key);
}

function el(tag, cls) {
	const node = document.createElement(tag);
	if (cls) node.className = cls;
	return node;
}

/** The rail: narrow, tall, hugging the left edge. Returns at most one node. */
function findSidebar() {
	const all = document.body.querySelectorAll('aside, nav, [class*="sidebar"], [class*="Sidebar"]');
	let best = null;
	for (const node of all) {
		const rect = node.getBoundingClientRect();
		if (rect.left > 80) continue;
		if (rect.width < 40 || rect.width > 460) continue;
		if (rect.height < window.innerHeight * 0.45) continue;
		if (!best || rect.width < best.getBoundingClientRect().width) best = node;
	}
	return best;
}

/** A row is safe to decorate only if it is small and not a fixed overlay. */
function isRowLike(node) {
	const rect = node.getBoundingClientRect();
	if (rect.height === 0 || rect.height > 72) return false;
	if (rect.width === 0 || rect.width > 460) return false;
	const position = window.getComputedStyle(node).position;
	if (position === "fixed" || position === "absolute") return false;
	return true;
}

/* ------------------------------------------------------------------ *
 * 入口
 * ------------------------------------------------------------------ */

function apply(ctx) {
	if (typeof document === "undefined") return;

	const theme = resolveThemeService(ctx);
	if (!theme || typeof theme.register !== "function") {
		console.error("dsh-cyui: theme service unavailable; enable @deepseek-ai/dsh-client-ui-theme");
		return;
	}

	const style = el("style");
	style.id = STYLE_ID;
	style.textContent = buildCss();
	document.head.appendChild(style);
	document.body.setAttribute(BODY_ATTR, "on");

	// ---- overlay: corners only, low z-index, never interactive ----
	const root = el("div");
	root.id = ROOT_ID;
	root.dataset.mode = "night";
	const frameBox = el("div", "frame");
	for (let i = 0; i < 4; i += 1) frameBox.appendChild(document.createElement("i"));
	root.appendChild(frameBox);
	root.appendChild(el("div", "lamp"));
	document.body.appendChild(root);

	// ---- pointer lamp ----
	let pointerFrame = 0;
	let pointerX = 0;
	let pointerY = 0;
	const paintLamp = () => {
		pointerFrame = 0;
		lamp.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0)`;
	};
	const onPointerMove = (event) => {
		pointerX = event.clientX;
		pointerY = event.clientY;
		if (root.dataset.lamp !== "on") root.dataset.lamp = "on";
		if (!pointerFrame) pointerFrame = requestAnimationFrame(paintLamp);
	};
	const onPointerLeave = () => { root.dataset.lamp = "off"; };
	window.addEventListener("pointermove", onPointerMove, { passive: true });
	window.addEventListener("pointerleave", onPointerLeave);

	// ---- proof marker: lets the wall be verified from outside devtools ----
	document.documentElement.setAttribute("data-cyui-wall", "CYUI_WALL_OK");

	// ---- one-time migration from the old satone keys ----
	// Renaming the plugin must not silently discard a wallpaper the user already
	// imported, so the old keys are copied over before anything reads them.
	try {
		const moves = [
			["dsh-satone-wall-data", "dsh-cyui-wall-data"],
			["dsh-satone-wall-prefs", "dsh-cyui-wall-prefs"]
		];
		for (const [oldKey, newKey] of moves) {
			const value = localStorage.getItem(oldKey);
			if (value && !localStorage.getItem(newKey)) localStorage.setItem(newKey, value);
			if (value) localStorage.removeItem(oldKey);
		}
	} catch { /* private mode */ }

	// ---- wallpaper manager ----
	const WALL_KEY = "dsh-cyui-wall-prefs";
	const readPrefs = () => {
		try { return JSON.parse(localStorage.getItem(WALL_KEY) || "{}"); } catch { return {}; }
	};
	const writePrefs = (next) => {
		try { localStorage.setItem(WALL_KEY, JSON.stringify(next)); } catch { /* private mode */ }
	};

	const applyWallPrefs = (next) => {
		const target = document.documentElement;
		const zoom = Number(next.zoom) || 100;
		const fill = next.fill || "cover";
		let size;
		if (fill === "contain") size = "contain";
		else if (fill === "stretch") size = "100% 100%";
		else if (fill === "tile") size = "auto";
		else size = zoom <= 100 ? "cover" : `${zoom}%`;
		target.style.setProperty("--cyui-wall-size", size);
		target.style.setProperty("--cyui-wall-pos", next.anchor || "center 46%");
		// dim: one number drives the top/mid/bottom alphas of the overlay gradient
		const dim = Number(next.dim);
		const d = Number.isFinite(dim) ? Math.min(0.8, Math.max(0, dim / 100)) : 0.34;
		target.style.setProperty("--cyui-dim-top", String(d));
		target.style.setProperty("--cyui-dim-mid", String(Math.min(d, 0.04)));
		target.style.setProperty("--cyui-dim-bottom", String(Math.min(0.8, d + 0.06)));
		const glass = Number(next.glass);
		target.style.setProperty("--cyui-glass", `${Number.isFinite(glass) ? glass : 0}px`);
	};

	let prefs = readPrefs();
	applyWallPrefs(prefs);

	const wallBtn = el("button");
	wallBtn.id = "dsh-cyui-wall-btn";
	wallBtn.type = "button";
	wallBtn.title = "背景图片";
	wallBtn.textContent = "▣";
	// anchored inside our own full-viewport overlay: the grid layer already proves
	// that box tracks the viewport, so position:absolute inside it is predictable
	root.appendChild(wallBtn);

	const wallPanel = el("div");
	wallPanel.id = "dsh-cyui-wall-panel";
	wallPanel.hidden = true;
	wallPanel.innerHTML = [
		"<h4>背景</h4>",
		'<input class="pick" type="file" accept="image/png,image/jpeg,image/webp">',
		'<div class="row"><label>缩放</label><input class="zoom" type="range" min="100" max="320" step="5" value="100"></div>',
		'<div class="row"><label>填充</label><select class="fill">',
		'<option value="cover">铺满（裁切）</option>',
		'<option value="contain">完整（留边）</option>',
		'<option value="stretch">拉伸铺满</option>',
		'<option value="tile">平铺</option>',
		"</select></div>",
		'<div class="row"><label>对齐</label><select class="anchor">',
		'<option value="center 46%">居中</option>',
		'<option value="center top">顶部</option>',
		'<option value="center bottom">底部</option>',
		'<option value="left center">靠左</option>',
		'<option value="right center">靠右</option>',
		"</select></div>",
		'<div class="row"><label>压暗</label><input class="dim" type="range" min="0" max="80" step="5" value="34"></div>',
		'<div class="row"><label>磨砂</label><input class="glass" type="range" min="0" max="24" step="1" value="0"></div>',
		'<div class="row"><button class="reset" type="button">重置</button><span class="status"></span></div>',
		'<div class="hint">图片与参数都保存在本机，重启后自动恢复。</div>',
		'<div class="hint clear-wrap"><button class="clear" type="button">移除自定义图</button></div>'
	].join("");
	root.appendChild(wallPanel);

	const wallInput = wallPanel.querySelector("input.pick");
	const wallZoom = wallPanel.querySelector("input.zoom");
	const wallFill = wallPanel.querySelector("select.fill");
	const wallAnchor = wallPanel.querySelector("select.anchor");
	const wallDim = wallPanel.querySelector("input.dim");
	const wallGlass = wallPanel.querySelector("input.glass");
	const wallReset = wallPanel.querySelector("button.reset");
	const wallClear = wallPanel.querySelector("button.clear");
	const wallStatus = wallPanel.querySelector("span.status");

	wallZoom.value = String(prefs.zoom || 100);
	wallFill.value = prefs.fill || "cover";
	wallAnchor.value = prefs.anchor || "center 46%";
	wallDim.value = String(Number.isFinite(Number(prefs.dim)) ? prefs.dim : 34);
	wallGlass.value = String(Number.isFinite(Number(prefs.glass)) ? prefs.glass : 0);

	const wallSay = (text, bad) => {
		wallStatus.textContent = text;
		wallStatus.style.color = bad ? "#e26e78" : "#8fbf9a";
	};

	const commit = () => {
		prefs = {
			...prefs,
			zoom: Number(wallZoom.value),
			fill: wallFill.value,
			anchor: wallAnchor.value,
			dim: Number(wallDim.value),
			glass: Number(wallGlass.value)
		};
		writePrefs(prefs);
		applyWallPrefs(prefs);
	};

	wallZoom.addEventListener("input", commit);
	wallFill.addEventListener("change", commit);
	wallAnchor.addEventListener("change", commit);
	wallDim.addEventListener("input", commit);
	wallGlass.addEventListener("input", commit);

	wallBtn.addEventListener("click", () => {
		wallPanel.hidden = !wallPanel.hidden;
	});

	wallReset.addEventListener("click", () => {
		prefs = { zoom: 100, fill: "cover", anchor: "center 46%", dim: 34, glass: 0 };
		writePrefs(prefs);
		wallZoom.value = "100";
		wallFill.value = "cover";
		wallAnchor.value = "center 46%";
		wallDim.value = "34";
		wallGlass.value = "0";
		applyWallPrefs(prefs);
		wallSay("已重置参数");
	});

	wallClear.addEventListener("click", () => {
		try { localStorage.removeItem(WALL_DATA_KEY); } catch { /* ignore */ }
		document.documentElement.style.removeProperty("--cyui-wall");
		wallSay("已移除，使用默认底");
	});

	// ---- imported wallpaper: stored in localStorage, not fetched over http ----
	const WALL_DATA_KEY = "dsh-cyui-wall-data";

	const shrink = (dataUrl, maxWidth = 2560, quality = 0.86) => new Promise((resolve) => {
		const img = new Image();
		img.onload = () => {
			if (img.naturalWidth <= maxWidth) {
				resolve(dataUrl);
				return;
			}
			const scale = maxWidth / img.naturalWidth;
			const canvas = document.createElement("canvas");
			canvas.width = maxWidth;
			canvas.height = Math.round(img.naturalHeight * scale);
			const ctx = canvas.getContext("2d");
			if (!ctx) {
				resolve(dataUrl);
				return;
			}
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			const asJpeg = canvas.toDataURL("image/jpeg", quality);
			resolve(asJpeg.length < dataUrl.length ? asJpeg : dataUrl);
		};
		img.onerror = () => resolve(dataUrl);
		img.src = dataUrl;
	});

	const paintWall = (dataUrl) => {
		document.documentElement.style.setProperty("--cyui-wall", `url("${dataUrl}")`);
	};

	// restore the imported picture before the user opens anything
	try {
		const saved = localStorage.getItem(WALL_DATA_KEY);
		if (saved && saved.indexOf("data:image/") === 0) paintWall(saved);
	} catch { /* private mode */ }

	wallInput.addEventListener("change", () => {
		const file = wallInput.files && wallInput.files[0];
		if (!file) return;
		if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
			wallSay("只支持 png / jpg / webp", true);
			return;
		}
		if (file.size > 24 * 1024 * 1024) {
			wallSay("图片超过 24 MB", true);
			return;
		}
		wallSay("读取中…");
		const reader = new FileReader();
		reader.onload = async () => {
			const raw = String(reader.result || "");
			wallSay("处理中…");
			const dataUrl = await shrink(raw);
			paintWall(dataUrl);
			let stored = false;
			try {
				localStorage.setItem(WALL_DATA_KEY, dataUrl);
				stored = true;
			} catch (error) {
				stored = false;
			}
			if (stored) wallSay(`已保存 ${Math.round(dataUrl.length / 1024)} KB · 重启后仍在`);
			else wallSay("图片过大，浏览器存不下；已临时应用", true);
			fetch("/dsh-cyui/wall", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ dataUrl })
			})
				.then((response) => response.json())
				.then((info) => {
					if (info && info.ok && !stored) wallSay(`已写入 ${Math.round(info.bytes / 1024)} KB`);
				})
				.catch(() => { /* dsh-app:// has no http origin; localStorage already holds it */ });
		};
		reader.onerror = () => wallSay("读取失败", true);
		reader.readAsDataURL(file);
	});

	// ---- fallback launch screen ----

	// The host half injects a richer "incoming call" screen into index.html. If
	// that did not reach the document (host version dependent), draw a compact
	// copy here and clear it after 3.4s. Never both.
	if (!document.getElementById("dsh-cyui-boot")) {
		const fb = el("div");
		fb.id = FALLBACK_ID;
		const grid = el("div", "fb-grid");
		const core = el("div", "fb-core");
		const ring = el("span", "fb-ring");
		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "0 0 64 64");
		svg.innerHTML =
			'<path d="M8 30c0-13 10.7-24 24-24s24 11 24 24" stroke="#8fe6f4" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
			+ '<rect x="4" y="28" width="11" height="20" rx="5" fill="#0d2233" stroke="#35e0f0" stroke-width="2"/>'
			+ '<rect x="49" y="28" width="11" height="20" rx="5" fill="#0d2233" stroke="#ff2b8a" stroke-width="2"/>'
			+ '<path d="M11 10L17-3l9 4-5 11z" fill="#35e0f0" opacity=".9"/>'
			+ '<path d="M53 12l9-4 6 13-9 3z" fill="#ff2b8a" opacity=".9"/>';
		core.appendChild(ring);
		core.appendChild(svg);
		const label = el("div", "fb-label");
		const kicker = document.createElement("i");
		kicker.textContent = "INCOMING / LINK";
		const name = document.createElement("b");
		name.textContent = "聪音";
		label.appendChild(kicker);
		label.appendChild(name);
		const bar = el("div", "fb-bar");
		const call = el("button", "fb-call");
		call.type = "button";
		call.setAttribute("aria-label", "接听");
		call.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">'
			+ '<path d="M6.5 4.5c.9-.4 1.9 0 2.3.9l1 2.2c.3.7.1 1.6-.5 2.1l-.9.8c.8 1.7 2.1 3 3.8 3.8l.8-.9c.5-.6 1.4-.8 2.1-.5l2.2 1c.9.4 1.3 1.4.9 2.3l-.5 1.1c-.4.9-1.4 1.4-2.4 1.2C10.2 18.2 5.8 13.8 4.2 8.6c-.2-1 .3-2 1.2-2.4z"/>'
			+ '</svg>';
		fb.appendChild(grid);
		fb.appendChild(core);
		fb.appendChild(label);
		fb.appendChild(bar);
		fb.appendChild(call);
		document.body.appendChild(fb);
		const drop = () => {
			if (!fb.parentNode || fb.dataset.dropping === "1") return;
			fb.dataset.dropping = "1";
			fb.classList.add("is-out");
			// the sheet unfolds out of the collapsing line, just like the host copy
			const flash = el("div", "fb-flash");
			document.body.appendChild(flash);
			requestAnimationFrame(() => flash.classList.add("is-on"));
			setTimeout(() => { if (flash.parentNode) flash.remove(); }, 1300);
			setTimeout(() => { if (fb.parentNode) fb.remove(); }, 1300);
		};
		call.addEventListener("click", (event) => { event.stopPropagation(); drop(); });
		fb.addEventListener("click", drop);
		setTimeout(drop, 8000);
	}

	// ---- scroll progress ----
	const progress = el("div");
	progress.id = PROGRESS_ID;
	document.body.appendChild(progress);
	const paintProgress = () => {
		let best = 0;
		const walk = (node) => {
			const max = node.scrollHeight - node.clientHeight;
			if (max > 24) {
				const ratio = Math.min(1, Math.max(0, node.scrollTop / max));
				if (ratio > 0.001 && ratio > best) best = ratio;
			}
			for (const child of node.children) walk(child);
		};
		walk(document.body);
		progress.style.transform = `scaleX(${best})`;
	};
	let progressFrame = 0;
	const onScroll = () => {
		if (progressFrame) return;
		progressFrame = requestAnimationFrame(() => { progressFrame = 0; paintProgress(); });
	};
	window.addEventListener("scroll", onScroll, { passive: true, capture: true });

	// ---- rail decoration: scoped, size-gated, never structural ----
	const paintRows = () => {
		const side = findSidebar();
		if (!side) return;
		if (!side.hasAttribute("data-cyui-side")) {
			side.setAttribute("data-cyui-side", "");
			// the edge ribbon is an absolutely positioned pseudo element: it needs a
			// positioned rail, otherwise it anchors to some far ancestor
			if (window.getComputedStyle(side).position === "static") {
				side.setAttribute("data-cyui-side-static", "");
			}
		}

		const rows = side.querySelectorAll("button, a, [role='button'], [role='menuitem'], [role='tab']");
		for (const row of rows) {
			if (row.hasAttribute("data-cyui-row")) continue;
			if (!isRowLike(row)) continue;
			row.setAttribute("data-cyui-row", "");
		}

		const nodes = [...side.querySelectorAll("button, a, [role='menuitem'], li, div, span")];
		for (const node of nodes) {
			const text = (node.textContent || "").replace(/\s+/g, "");
			if (!text || text.length > 12) continue;
			const hit = NAV_ICONS.find((item) => text === item.text);
			if (!hit) continue;
			if (!node.querySelector("svg")) continue;
			if (node.dataset.cyuiNav === hit.key) continue;
			if (node.querySelector("[data-cyui-nav]")) continue;
			if (!isRowLike(node)) continue;
			node.dataset.cyuiNav = hit.key;
			node.style.setProperty("--cyui-nav-icon", `url("${hit.img}")`);
		}
	};
	paintRows();

	let rowTimer = 0;
	const scheduleRows = () => {
		if (rowTimer) return;
		rowTimer = setTimeout(() => { rowTimer = 0; paintRows(); }, 300);
	};
	const rowObserver = typeof MutationObserver === "function" ? new MutationObserver(scheduleRows) : null;
	if (rowObserver) rowObserver.observe(document.body, { childList: true, subtree: true });

	// ---- theme ----
	const disposeNight = theme.register({ id: THEME_ID, colorScheme: "dark", tokens: TOKENS_NIGHT });
	const disposeDawn = theme.register({ id: THEME_ID_DAWN, colorScheme: "light", tokens: TOKENS_DAWN });

	let current = THEME_ID;
	const syncMode = (id) => {
		const dawn = id === THEME_ID_DAWN;
		current = dawn ? THEME_ID_DAWN : THEME_ID;
		document.documentElement.dataset.cyuiMode = dawn ? "dawn" : "night";
		root.dataset.mode = dawn ? "dawn" : "night";
		// inline-important beats stylesheet-important, so this is the only write
		// that survives a cold start where the host re-applies its own palette
		clearTokens(document.body, dawn ? TOKENS_NIGHT : TOKENS_DAWN);
		writeTokens(document.body, dawn ? TOKENS_DAWN : TOKENS_NIGHT);
	};
	const setTheme = (id) => {
		syncMode(id);
		try { theme.setTheme(id); } catch (error) {
			console.error("dsh-cyui: setTheme failed", error);
		}
	};
	setTheme(THEME_ID);

	const offChange =
		typeof ctx.on === "function"
			? ctx.on("theme/change", (snapshot) => {
					const preference = snapshot && snapshot.preference;
					if (preference === THEME_ID || preference === THEME_ID_DAWN) {
						syncMode(preference);
						return;
					}
					try { theme.setTheme(current); } catch { /* next change retries */ }
				})
			: null;

	// ---- teardown: put every attribute back ----
	const dispose = () => {
		if (typeof offChange === "function") offChange();
		disposeNight();
		disposeDawn();
		if (rowObserver) rowObserver.disconnect();
		if (rowTimer) clearTimeout(rowTimer);
		window.removeEventListener("pointermove", onPointerMove);
		window.removeEventListener("pointerleave", onPointerLeave);
		window.removeEventListener("scroll", onScroll, { capture: true });
		if (pointerFrame) cancelAnimationFrame(pointerFrame);
		if (progressFrame) cancelAnimationFrame(progressFrame);
		clearTokens(document.body, TOKENS_NIGHT);
		clearTokens(document.body, TOKENS_DAWN);
		document.querySelectorAll("[data-cyui-side]").forEach((n) => {
			n.removeAttribute("data-cyui-side");
			n.removeAttribute("data-cyui-side-static");
		});
		document.querySelectorAll("[data-cyui-row]").forEach((n) => n.removeAttribute("data-cyui-row"));
		document.querySelectorAll("[data-cyui-nav]").forEach((n) => {
			n.removeAttribute("data-cyui-nav");
			n.style.removeProperty("--cyui-nav-icon");
		});
		delete document.documentElement.dataset.cyuiMode;
		document.documentElement.removeAttribute("data-cyui-wall");
		root.remove();
		progress.remove();
		style.remove();
		document.body.removeAttribute(BODY_ATTR);
	};

	if (typeof ctx.effect === "function") {
		ctx.effect(() => dispose);
		return;
	}
	return dispose;
}

exports.isPlugin = true;
exports.inject = ["theme"];
exports.apply = apply;
exports.meta = { id: THEME_ID, variant: THEME_ID_DAWN, kind: "ambience" };
		return module.exports;
	}
});
