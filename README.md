# CYUI

> 给 DeepSeek Harness 的窗口换一个房间：雨夜、灯、和一点赛博。

不是换配色。配色只改颜色，CYUI 改的是「这个窗口待在什么地方」——一张你自己选的背景图，一层压暗的暗角，一束跟着鼠标走的暖光，一条沿侧栏缓慢上行的数据流。界面还是那个界面，但坐进去的感觉变了。

**包里不含任何图片。** 壁纸由你导入，装上是深紫渐变底，不会出现"图丢了"的空洞感。

![插件图标](icon.png)

<sub>图标为 AI 生成的图像，非原创手绘，详见文末「许可」。</sub>

## 特点

### 背景是你自己的

右下角一个几乎看不见的圆按钮 `▣`，点开是背景面板：

| 控件 | 说明 |
|---|---|
| 导入 | png / jpg / webp，≤24 MB，导入后自动压到宽 ≤2560 的 JPEG |
| 缩放 | 100–320% |
| 填充 | 铺满（裁切）/ 完整（留边）/ 拉伸铺满 / 平铺 |
| 对齐 | 居中 / 顶部 / 底部 / 靠左 / 靠右 |
| 压暗 | 0–80，越高图案越沉、文字越清楚 |
| 磨砂 | 0–24px，骨架层与输入框的 `backdrop-filter`，默认关闭以免吃 GPU |

图片和参数都存在本机 `localStorage`，**重启自动恢复**，不用每次重新导入。状态行会如实告诉你结果——`已保存 320 KB · 重启后仍在`，或 `图片过大，浏览器存不下；已临时应用`。

### 只有一套配色，但覆盖三层

主题 `cyui`，**168 个令牌**：146 个 `--dsw-alias-*` 加 22 个 `--dsw-specific-*`。

早先有夜/晨两套，取消了：切换后总有些页面只覆盖了一半，看起来是花的。现在只有一套深紫配暖灯，所有页面一致。

覆盖三层是关键——只改 alias 的时候，菜单、输入框、提示气泡、侧栏玻璃都还是宿主的浅色，因为它们读的是 specific 层。

令牌不只是提交给主题服务——还用 CSSOM 以 `important` 重写一遍。宿主的主题服务会在启动时把存储的配色**以内联 important 写在 `<body>` 上**，样式表里的 `!important` 压不过它；后写的内联声明才赢。这是重启后颜色不回退的关键。

### 会动的部分，克制

| 效果 | 位置 | 做法 |
|---|---|---|
| 指针暖光 | 全局，跟随鼠标 | 560px 径向光，`translate3d` + `rAF` 合帧 |
| 滚读进度 | 顶部 2px | 青→紫→品红渐变 |
| 数据流 | 侧栏 | 34px 间距的青色细线，5.5s 上行 |
| 霓虹流光 | 侧栏与对话区的分界线 | 24% 高的光带，6.5s 下行，压在 2px 宽的线上 |
| 电磁边 | 菜单行 / 会话行 | 左缘数据轨常驻，hover 时通电、外框、内发光、光带横滚 |
| 取景框 | 四角 | 16px 直角括号 |
| 数据网格 | 整个窗口 | 36px 网格，径向遮罩只留边缘，26s 缓漂 |

全部是 `background-image` / `box-shadow` / `background-position` 动画。**没有一条碰布局**——最坏情况是多一点光，不会点不动。

### 启幕像接一通电话

打开时不是直接出现界面，而是一个来电画面：透视网格、猫耳耳机、脉冲环、`INCOMING / LINK`、聪音的名字。

点通话按钮后：

```
0–520ms   来电屏 clip-path 收拢 → 压成一条横线，brightness 拉到 9 过曝
400ms     白幕从那条线的位置开始，带着 CRT 扫描行展开
22–30%    线上闪一次（brightness 11）
62%       铺满全屏
72%       整屏再闪一次（brightness 3.6）
1.3s      两个节点移除，界面接管
```

宿主注入版是纯 CSS（`checkbox` + 兄弟选择器），CSP 拦掉脚本也照样能接；如果注入没生效，客户端会画一份简化的兜底屏，3.4 秒自动退场。

### 菜单图标是手绘的

水杯、企鹅、猫耳耳机、收音机——16×16 逐像素画的，替换宿主菜单里的默认字形。选中态由 `aria-current` / `aria-selected` 驱动，不用猜。

## 安装

```powershell
dsh plugin --profile desktop add https://github.com/Lygus-496/dsh-cyui/releases/download/v1.0.3/dsh-cyui-1.0.3.tgz
```

或下载 tarball 后：

```powershell
dsh plugin --profile desktop add "C:\path\to\dsh-cyui-1.0.3.tgz"
```

**装完重启一次。** 桌面端没有页面刷新，client 改动一律靠重启生效。

## 兼容性是这一路最花功夫的部分

上一版曾把整个窗口的交互锁死——原因是在宿主元素上写了 `overflow: hidden` / `isolation` / `position` / 超高 `z-index`。现在的铁律：

- 只改画出来的东西：`color`、`background-color`、`background-image`、`box-shadow`、`border-color`、`backdrop-filter`
- 自有元素一律 `pointer-events: none`，`z-index ≤ 5`
- 不覆盖宿主容器的背景（曾经把余额小鲸鱼挂件涂成黑块）
- 选择器先定位到侧栏/对话区再匹配，且只认矮行
- `<html data-dsh-cyui="off">` 一键关停所有效果

### 实测过的宿主覆盖点

下面这些类名不是从文档抄的，是在真机上逐层打点测出来的。宿主升级后哪里又亮起来，先对照这张表。

| 目标 | 类名（哈希会变，用后缀匹配） | 为什么必须这样写 |
|---|---|---|
| 应用骨架 | `*_frame`、`*_centerCol` | 用 `background: var(--dsw-alias-bg-base)`，变量可能被内联 important 覆盖 → 改为直接设 `background-color` 属性 |
| 对话区 | `an3WzG_root`、`an3WzG_scrollBody` | 同上，且内部还有滚动容器 |
| 输入框 | `an3WzG_composerSeat`、`composerStack`、`GRgSLq_card` | 座位深了不代表内容深；`_card` 与 composer 无关，必须从子树里定位 |
| 消息气泡 | `LOmm4q_bubble` | 底色 `rgb(237,243,254)` 浅蓝白，与 `bg-base` 无关，只能按气泡自己的类名覆盖 |
| 浮层 | `[role="dialog"]`、`_modal`、`_popover` | 不能清成透明；也不能用宽泛的 `menu`，会刷到侧栏 |
| 标题栏 / 侧栏 | `*_frame:before`、`wtg9ga_root` | Windows 下用 `--dsw-specific-sidebar-fill`，不是 `bg-base` |

两条通用原则：

1. **属性 > 变量** —— 任何 `var()` 驱动的填充都可能被内联 important 改写。
2. **限定祖先** —— `_root` `_card` `_header` 这类后缀到处都有，必须挂在具体子树上。

## 开发

```powershell
node scripts/build-client.mjs   # 内联图标与令牌 → lib/client.js
python scripts/pixel-art.py     # 重新生成四个物件图标
python scripts/make-icon.py     # 从原图生成插件图标
```

推送用 `push.ps1`（本机 Git 缺 `git-remote-https`，脚本走便携版 `E:\Git-mini`）。

## 许可

代码：MIT。

**插件图标（`icon.png`，猫耳耳机头像）是 AI 图像生成工具的输出，不是原创手绘**，作者不对此图主张著作权。如果介意这一点：

```powershell
# 换成你自己的图
python scripts/make-icon.py   # 改脚本里的 SRC 路径为新图片
```

或者直接删掉 `icon.png` 并从 `package.json` 的 `files`、`exports` 里去掉它——没有图标时，插件列表会显示默认图案，功能不受影响。

菜单里的四个物件图标（水杯 / 企鹅 / 猫耳耳机 / 收音机）是 `scripts/pixel-art.py` 逐像素画的原创图，16×16。

包内不含任何第三方图片素材：壁纸由使用者导入，不进包。

