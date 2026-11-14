# dsh-cyui

雨夜书桌 · DeepSeek Harness Web GUI 氛围主题。**不含角色形象，也不含任何第三方图片**——壁纸由你自己导入。

## 装法

```powershell
dsh plugin --profile desktop add "C:\path\to\dsh-cyui-2.0.0.tgz"
```

或手动：把 `dsh-cyui` 追加进 profile 的 `dsh.profile.bundles`，重启宿主。

桌面端没有页面刷新，client 改动一律靠重启生效。

## 背景：自己导入

装上后界面右下角有一个很淡的圆按钮 `▣`，点开是背景面板：

| 控件 | 作用 |
|---|---|
| 选择文件 | png / jpg / webp，≤24 MB |
| 缩放 | 100–320% |
| 填充 | 铺满（裁切）/ 完整（留边）/ 拉伸铺满 / 平铺 |
| 对齐 | 居中 / 顶部 / 底部 / 靠左 / 靠右 |
| 压暗 | 0–80，越高图案越沉 |
| 磨砂 | 0–24px，作用在骨架层与输入框（`backdrop-filter`，默认关闭以免吃 GPU） |

图片与参数都存在本机 `localStorage`，重启后自动恢复。不需要重新导入。

**不导入也能用**：没有图片时底色是深紫渐变 + 暗角 + 赛博网格，看起来是设计过的，不是“图丢了”。

图片会被压缩到宽度 ≤2560、JPEG q=0.86 再存，避免撑爆配额。状态行会明确告诉你结果——`已保存 xxx KB · 重启后仍在` 或 `图片过大，浏览器存不下；已临时应用`。

## 五层

| 层 | 做法 |
|---|---|
| 令牌 | `theme.register()` 提交 `--dsw-alias-*`；同时用 CSSOM 以 `important` 重写这些变量（冷启动时宿主会抢先写一份自己的调色板，后写的 inline-important 才赢） |
| 背景 | `var(--cyui-wall, none)` 画在 `<html>` 上，其余两层是暗角与压暗渐变 |
| 骨架 | `_frame` / `_centerCol` / `_card` / composer 系列按实测类名直接设属性 |
| 动效 | 指针暖光、顶部滚动进度、侧栏数据流与霓虹流光、行 hover 电磁边、四角取景框 |
| 启幕 | 宿主注入的“来电”屏；若 `tapIndex` 未生效，client 侧兜底一份。点击后 CRT 坍缩 → 白幕展开 |

## 已验证的宿主覆盖点

下面这些类名与优先级结论是打点实测出来的，不是推断。宿主升级后哪里又亮起来，先对照这张表。

| 目标 | 真实类名（哈希会变，用后缀匹配） | 为什么必须这样写 |
|---|---|---|
| 应用骨架 | `mP3x-q_frame`、`mP3x-q_centerCol` | 它们用 `background: var(--dsw-alias-bg-base)`；主题服务把变量写在 `<body>` 的**内联 important** 上，样式表的 `!important` 压不过，所以直接改 `background-color` 属性 |
| 对话区容器 | `an3WzG_root`、`an3WzG_scrollBody` | 同上，且里面还有自己的滚动容器 |
| 输入框座位 | `an3WzG_composerSeat`、`an3WzG_composerStack` | 座位本身深了不代表内容深，里面还有一层 |
| 输入框卡片 | `GRgSLq_card` | `_card` 这个后缀与 composer 无关，只能从 composer 子树里定位，否则会误伤消息卡片 |
| 输入框按钮 | `composerStack button` / `[role=button]` | “+”按钮是浅底深字，刷深底的同时要把 `color` 提亮，否则图标变黑 |
| 消息气泡 | `LOmm4q_bubble` | 底色 `rgb(237,243,254)` 浅蓝白，与 `bg-base` 无关，只能按气泡自己的类名覆盖 |
| 浮层 | `[role="dialog"]`、`_modal`、`_popover` 等 | 不能清成透明，否则文字压在壁纸上；也不能用宽泛的 `menu` 匹配，会刷到侧栏 |
| 标题栏 / 侧栏 | `mP3x-q_frame:before`、`wtg9ga_root` | Windows 下用 `--dsw-specific-sidebar-fill`，不是 `bg-base` |

两条通用原则：

1. **属性 > 变量**：任何 `var()` 驱动的填充都可能被内联 important 改写，直接设 `background-color` 才稳。
2. **限定祖先**：`_root` `_card` `_header` 这类后缀到处都有，必须挂在具体子树上。

排查“某处还是白的”的正确顺序：扫一遍 `background-color` 接近纯白的元素并打印 `className|颜色`，不要靠肉眼在截图里找；拿到类名后确认是否需要祖先限定；改底色时同时给 `color`；不要用“给 body 铺不透明底色”这种兜底，它会连壁纸一起盖掉。

## 兼容性铁律

上一版曾把整个窗口的交互锁死，原因是在宿主元素上写了 `overflow: hidden` / `isolation` / `position` / 超高 `z-index`。现在的约束：

- 只改「画出来的东西」：`color`、`background-color`、`background-image`、`box-shadow`、`border-color`、`backdrop-filter`
- 自有元素一律 `pointer-events: none` 且 `z-index ≤ 5`（面板与按钮除外，它们是交互元素）
- 不覆盖宿主容器的背景
- 选择器先定位到侧栏/对话区再匹配，且只认矮行（高度 < 72px、非 fixed/absolute）
- `<html data-dsh-cyui="off">` 一键关停所有效果

## 素材

- **物件图标**（水杯 / 企鹅 / 猫耳耳机 / 收音机）：逐像素手绘，原创
- **无第三方图片**：包内不含任何壁纸，用户自行导入
- **代码**：MIT

## 重新生成

```powershell
python scripts/pixel-art.py       # 四个物件图标
node   scripts/build-client.mjs   # 内联图标与令牌 → lib/client.js
```
