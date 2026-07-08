# Design System: reOpenTest

## 1. Visual Theme & Atmosphere

reOpenTest 的界面设计是对“精密医疗仪器”与“工业级蓝图”的数字化转译。我们的设计理念是**“临床级的极简主义 (Clinical Minimalism)”**——一切视觉决策只为建立毫无保留的、基于证据的确定性。我们不仅展示结果，我们还把推导出该结果的过程、数据和背书，以最高优先级呈现给用户。

整个系统在两种截然不同的氛围中切换，以控制阅读节奏：
1. **临床工作台 (Clinical Light Mode)**：大面积的临床白、实验室灰与 1px 的极细边框交织，如同明亮、无菌、结构分明的现代化实验室。用于展示产品规格、解决方案和日常业务流。
2. **分析暗室 (Analytical Dark Mode)**：深邃的“蓝图黑”与“终端绿”荧光对比，如同显微镜的暗场、X光阅片室或底层代码终端。仅用于揭示 `NomoFlow™` 的核心算法、高精尖制造工艺或深层临床数据，制造“进入系统后台”的硬核科技感。

**Key Characteristics:**
- **骨架级网格**：拒绝大面积阴影，全面采用 1px 的极细边框（Hairlines）进行物理切割。
- **机械感交互**：零延迟的阻尼反馈、无渐变的直接状态切换，UI响应如物理按键般干脆。
- **数据隔离排版**：一切实验数据、规格型号、批次号必须强制使用等宽字体（Monospace）呈现，营造“不可篡改的测量值”心智。
- **X光透视影像**：拒绝虚假的商品摆拍，产品展示采用工业爆炸图、3D拆解和微距透视，展现“透明工程师”的极致掌控力。
- **证据锚点化**：没有任何孤立的商业承诺，所有效能声明必定伴随一个可点击的 `Evidence Protocol`（证据调取）组件。

## 2. Color Palette & Roles

我们的色彩排斥情绪化，具有严格的医疗与工程语意。

### Primary & Action (行动与骨架)
- **Foundational Blue (基石蓝)** (`#00539F`): 品牌主色，用于 Logo、Hero 主视觉结构、高亮标识。深沉且带有工业力量感。
- **Action Blue (行动蓝)** (`#0066CC`): `--rot-action-primary`。仅用于主要 CTA（按钮、可交互文字）。
- **Action Hover** (`#004C99`): `--rot-action-hover`。交互元素的悬停状态。

### Clinical Light Mode (临床工作台 - 日常环境)
- **Clinical White (临床白)** (`#FFFFFF`): 页面主背景，数据面板（Slides）背景。
- **Lab Gray (实验室灰)** (`#F8FAFC`): `--rot-bg-secondary`。次级背景色，用于区分内容区块、规格表格的表头。
- **Surface Divider (刻度线)** (`#E2E8F0`): `--rot-border-subtle`。1px 的边框色，构建界面的最核心元素。

### Analytical Dark Mode (分析暗室 - 深度技术环境)
- **Blueprint Dark (蓝图黑)** (`#0A1128`): 暗场主背景。极深的靛蓝色，比纯黑更具科技纵深感。
- **Dark Surface (暗场面板)** (`#131B33`): 暗场下的卡片与区块底色。
- **Terminal Green (终端绿)** (`#4ADE80`): 暗场下的核心数据高亮色、微动效点缀色，模仿心电图仪或代码终端的生命体征。
- **Dark Divider (暗场刻度)** (`rgba(255, 255, 255, 0.1)`): 暗场中的 1px 结构线。

### Typography Colors (文本与阅读)
- **Slate Heavy (深岩灰)** (`#0F172A`): 用于所有标题（Heading）和基准数据。
- **Slate Core (中岩灰)** (`#475569`): 用于正文（Body）、辅助说明。
- **Slate Light (浅岩灰)** (`#94A3B8`): 用于占位符、极其微小的注脚、大写标签分类。

### IVD Semantic Status (体外诊断专属语意)
*注：在IVD领域，不能简单用绿/红代表好/坏。*
- **Valid / Control Passed (验证通过/质控有效)** (`#10B981`, 背景 `#ECFDF5`): 仅用于合规认证、质控通过、有效置信区间。
- **Out of Range / Pending (超限/待定)** (`#F59E0B`, 背景 `#FFFBEB`): 提示数据处于临界值、报告生成中、或待审核状态。
- **Invalid / Error (无效/系统阻断)** (`#EF4444`, 背景 `#FEF2F2`): 仅用于测试无效（C线不显色）、系统级错误。

## 3. Typography Rules

### Font Family
- **Display & Headings**: `Montserrat`, with fallbacks: `Helvetica Neue, sans-serif`
- **Body**: `Lato`, with fallbacks: `Helvetica, Arial, sans-serif`
- **Data & Specs**: `JetBrains Mono` or `Roboto Mono` (用于一切产品参数、试剂体积、临床数据)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Hero Title | Montserrat | 48px | 700 (Bold) | 1.15 | -0.02em | 核心价值主张 |
| Section Head | Montserrat | 32px | 600 (Semi) | 1.25 | -0.01em | 模块标题 |
| Component Title | Montserrat | 24px | 600 (Semi) | 1.30 | normal | 面板标题，产品名 |
| Blueprint Label | Montserrat | 12px | 700 (Bold) | 1.50 | 0.1em | **强制大写**，分类标签、表头，具工业图纸感 |
| Body Large | Lato | 18px | 400 (Reg) | 1.60 | normal | 导语，重要段落 |
| Body Standard | Lato | 16px | 400 (Reg) | 1.50 | normal | 基础阅读文本 |
| Data / Spec | Mono | 14px | 500 (Med) | 1.40 | normal | 规格型号 (如 *99.8%*) |
| Micro Data | Mono | 12px | 400 (Reg) | 1.40 | normal | 脚注数据，版本号 |
| Link/Button | Lato | 16px | 700 (Bold) | 1.00 | normal | 按钮文字 |

**排版原则：**
- **工程图纸化 (Blueprint Labelling)**：所有的元数据属性（如 "PRODUCT CODE", "SENSITIVITY"）必须使用 `Blueprint Label`（大写、宽字距），营造看机械图纸的心理预设。
- **数据绝对隔离**：凡是具体的数值表现，必须无条件从 Lato 切换为 Mono 等宽字体。

## 4. Motion & Mechanical Feedback (机械级动效协议)

我们拒绝一切互联网产品那种“轻浮、漂浮、缓慢渐变”的动效。我们的系统是一台精密的机床。

- **按下反馈 (Active State)**：按钮被点击时，禁止阴影变化，必须使用 `transform: translateY(1px)`，模拟真实的物理阻尼按键。
- **状态切换 (State Change)**：颜色变化必须是瞬间的（`0ms`）或极其短促的（`100ms`），类似于指示灯的切面开关。
- **折叠与展开 (Disclosure)**：如下拉菜单、手风琴面板，必须使用极其短促的“滑轨展开”（`duration: 150ms`, `timing-function: cubic-bezier(0.16, 1, 0.3, 1)`），如同推拉仪器的金属抽屉。
- **骨架加载 (Skeleton)**：数据加载时，不使用柔和的波浪渐变，而使用 Mono 字体随机闪烁占位符（如 `[---.---]`）直至真实数据渲染完毕，强化计算感。

## 5. Component Stylings

### Action Components
**Primary Engineer Action (核心行动)**
- Bg: `#0066CC` | Text: `#FFFFFF` | Padding: 10px 24px | Radius: 2px (近乎锋利)
- Hover: 切换为 `#004C99`，无浮动。Active: 向下位移 1px。

**Evidence Protocol (证据调取器 - 核心独有组件)**
- Bg: `#FFFFFF` | Text: `#00539F` | Border: `1px solid #CBD5E1` | Radius: 2px
- 样式：必须左置一个表示严谨文档的 Icon（如线框 PDF 徽标）。用于所有需背书之处（下载IFU、查看临床表现）。

### Containers & Structure
**Data Slide (数据载玻片/卡片)**
- Bg: `#FFFFFF` | Border: `1px solid #E2E8F0` | Radius: 4px | Shadow: 无（仅依靠1px刻度线切分）
- Padding: 24px（数据展示区），底栏 16px（证据留存区）。

**Specs Table (规格参数表)**
- 表头：背景 `#F8FAFC`，文字 `Blueprint Label`。
- 单元格：底边框 `1px solid #F1F5F9`，数据强制使用 `Mono` 字体。
- 交互：Hover 整行背景变为 `#F8FAFC`，供工程师精准校对。

## 6. Imagery & Visualization Protocol (X光透视影像法)

在视觉物料上，我们绝不拍摄“普通的塑料壳”或“对着镜头微笑的医生”。

- **Exploded Views (爆炸图拆解)**：展示试剂盒或耗材时，必须使用 3D 渲染的工业爆炸图。将外壳、硝酸纤维素膜、样本垫、吸水垫在 Z 轴上分离悬浮，旁边用引线连接 Mono 字体的规格参数。
- **Micro / Macro (宏观与微观)**：配图必须体现极端的反差。上一张图是 NomoFlow™ 巨大的、冷酷的自动化流水线（Macro）；下一张图必须是微距镜头下，极其清晰的流体在试纸条上层析的细节（Micro）。
- **Data as Art (数据即艺术)**：在暗场模式下，直接将跑胶图、扩增曲线图、批间差质控散点图作为核心视觉装饰元素。真实的数据就是我们最强大的美学。

## 7. Layout Principles

- **8px 绝对网格**：一切间距服从 4, 8, 16, 24, 32, 48, 64, 96, 128px。
- **宏观开阔，微观致密**：大模块之间留出巨大空白（96-128px），展现无菌实验室般的洁净感；卡片内部的参数名称与数值则极度致密（4-8px），展现工业仪器的集成度。
- **The Split View (工作流对切)**：讲解原理时采用 50/50 布局。左侧文字讲 Logic（逻辑），右侧图片出 Proof（证据），图文比例永远是 1:1，杜绝空口无凭。

## 8. Do's and Don'ts (最终审查断言)

### Do
- 必须用 1px 的 `#E2E8F0` 边框构建界面，让页面看起来像 AutoCAD 蓝图或 Excel 报表。
- 必须将所有的百分比、时间、批次号用 Mono 等宽字体包裹。
- 必须要为每一项产品效能声明配置 `Evidence Protocol` 组件。
- 必须将深层技术原理模块切换为 `Analytical Dark Mode`。
- 按钮按下时必须有 `translateY(1px)` 的物理按压反馈。

### Don'ts
- 绝不使用超过 6px 的圆角。这是医疗仪器，不许呈现消费级电子的“药丸”圆润感。
- 绝不使用弥散阴影或彩色光晕。一切在现实实验室中不存在的光影效果，在 UI 中均不可存在。
- 绝不使用“缓慢淡入”的动画。机器不讲究优雅，机器只讲究精准与瞬间响应。
- 绝不在没有临床证据作支撑的上下文中，随意使用绿色 (`#10B981`)。

## 9. Responsive Behavior (移动端数据保全法则)

在 B2B 与 IVD 领域，手机端不是用来“看酷炫效果”的，是用来在仓储或实验室随时查阅数据的。

- **数据完整性高于排版美学**：当规格表格在移动端无法显示时，**严禁换行破坏列结构**，必须保留原有表格形式，开启横向滚动（Horizontal Scroll），右侧附带微弱阴影提示滑动。
- **行动锁死**：将 `Evidence Protocol`（如“下载临床报告”）固定在移动端屏幕底部（Sticky Bottom），确保工程师在阅读长篇参数时，一键即可拉取源文件。

## 10. Agent Prompt Guide (设计AI执行指令)

### Component Prompts (生成范例)

- **"生成一个产品规格面板 (Product Slide)"**:
  "背景 #FFFFFF，边框 1px solid #E2E8F0，2px 圆角，绝对不加阴影。顶部左上角使用 Montserrat 12px 大写加粗 (Blueprint Label) 显示产品线分类，颜色 #94A3B8。主标题 Montserrat 24px #0F172A。信息区分为左右两列，标签使用大写，数值强制使用 Mono 字体 14px，颜色 #0F172A。面板底部单独划出一个 64px 高的区块，放置一个白底蓝字的幽灵按钮 'Download CE Certificate'，必须带有文档 Icon。"

- **"生成一个深度的技术解密区块 (Analytical Dark Section)"**:
  "启用暗场模式。背景色使用 #0A1128 (蓝图黑)。左侧布置技术概念文本，主标题 Montserrat 32px，颜色纯白。右侧放置一张 3D 爆炸图，将试剂盒分层悬浮，用极细的 rgba(255,255,255,0.2) 实线引出结构部件名称。图像和文字之间穿插使用 #4ADE80 (终端绿) 的等宽字体数据显示测试算法的置信区间。"

- **"生成一个精密数据表格 (Specs Table)"**:
  "无边框的整体容器。表头背景色 #F8FAFC，表头字体使用大写的 Blueprint Label 规范。每一行底部有 1px 的 #F1F5F9 刻度线。单元格内的数值（如 'Specificity: 99.8%'）必须是 JetBrains Mono 字体。无需加入任何进入动画。"

## SEO / Meta
- **Schema**: Validated JSON-LD only.
- **D3 Graph**: Indigo links, Slate nodes.
