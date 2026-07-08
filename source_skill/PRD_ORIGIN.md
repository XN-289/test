


这份文档是一份标准的 **“Meta-Prompt（元提示词）”与 PRD（产品需求文档）**。你可以直接将以下全部内容保存为 `AI_CMO_PRD.md`，然后直接喂给 Gemini CLI（例如使用命令 `gemini -p "请仔细阅读 AI_CMO_PRD.md，并帮我初始化整个项目结构和所有的 Skill 代码"`）。Gemini 会根据这份蓝图，自动为你写好所有的脚本、目录和配置文件。

---

# 核心系统蓝图：Project Ouroboros (具备战略自进化的知识图谱建站引擎)

## 一、 产品愿景与第一性原理
本系统旨在构建一个**“高度自治、具备自我反思演进能力”的 AI 自动内容引擎**。
系统彻底摒弃了“直接让大模型写网页”的落后模式，采用严格的**三层数据解耦**与**双脑架构**：
1. **左脑（Strategy Graph）**：负责环境感知、竞品记录、战略决策与效果反思（OODA 闭环）。
2. **右脑（LLM Wiki）**：负责吸收原始文档，构建客观、严谨、互联的本体知识图谱。
3. **输出层（Website Out）**：只负责根据设计规范（Configs）和战略意图，将右脑的知识降维渲染为带有严谨 SEO Schema 的网页。

---

## 二、 全局工作区目录架构 (Directory Architecture)
Gemini CLI 在初始化时，必须严格创建以下目录树：

```text
/PROJECT_ROOT
├── /configs/                   # 【全局约束配置】
│   ├── DESIGN.md               # UI/UIX、Tailwind类名、排版基准
│   └── TONES.md                # 品牌语调、行文风格约束
│
├── /raw_docs/                  # 【信息输入源】(大模型只读)
│   └── (存放原始 PDF、访谈录音文本、基础事实文本)
│
├── /strategy_wiki/             # 【系统左脑：战略时序图谱】
│   ├── strategy_graph.json     # 记录信号、洞察、策略、反馈间连线的因果网络
│   ├── /signals/               # 外部信号节点 (竞对动态/市场趋势)
│   ├── /insights/              # 逻辑推演节点
│   ├── /strategies/            # 策略节点 (状态：proposed/executing/completed/aborted)
│   └── /feedbacks/             # 真实世界反馈数据录入点 (GA4/GSC 导出数据)
│
├── /llm_wiki/                  # 【系统右脑：领域本体图谱】
│   ├── ontology_schema.json    # 本领域的本体论定义（哪些算实体，哪些算关系）
│   ├── graph.json              # 客观知识网络连线数据
│   ├── /entities/              # 各个实体的 Markdown 文件（包含双向链接）
│   └── index.md                # 内部知识库总索引
│
├── /website_out/               # 【发布战场】
│   ├── /pages/                 # 渲染后的内容页面
│   ├── /schemas/               # 由专职 Skill 生成的 JSON-LD (Schema.org) 文件
│   ├── index.html              # 带有 D3.js 知识图谱可视化的首页
│   ├── sitemap.xml             # 全站索引
│   └── llms.txt                # 为其他大模型准备的摘要文件
│
└── .gemini/                    # 【AI 智能体引擎】
    └── skills/
        ├── strategy-operator/  # 技能 1：战略推演官
        ├── wiki-compiler/      # 技能 2：本体架构师
        └── site-generator/     # 技能 3：全栈站长与 SEO 工程师
```

---

## 三、 数据字典与状态机约束 (State Machine & Ontology)

在创建数据时，必须遵守以下 Schema 规范：

### 1. 战略图谱状态机 (`strategy_wiki/strategy_graph.json`)
```json
{
  "nodes":[
    {"id": "sig_001", "type": "signal", "status": "adopted", "timestamp": "2026-04-07", "desc": "竞品A发布新功能"},
    {"id": "stg_001", "type": "strategy", "status": "executing", "target": "增加对应功能的 Wiki 词条"}
  ],
  "edges":[
    {"source": "sig_001", "target": "stg_001", "relation": "triggers"}
  ]
}
```

### 2. SEO Schema 标准 (`website_out/schemas/*.json`)
必须严格遵循 Schema.org 标准，禁止在生成 HTML 时拼接错误。必须通过专门的验证。

---

## 四、 Gemini CLI Skills 详细设计

请系统根据以下定义，在 `.gemini/skills/` 目录下生成对应的 `SKILL.md` 和辅助 Python/Node 脚本。

### Skill 1: `strategy-operator` (战略推演官)
*   **触发条件**：用户提供新的市场情报，或者每月定期执行环境扫描。
*   **输入**：网络搜索结果、`/strategy_wiki/feedbacks/` 中的数据。
*   **执行逻辑 (OODA循环)**：
    1. **Observe**: 将外部情报写入 `/strategy_wiki/signals/`。
    2. **Orient**: 读取 `strategy_graph.json` 历史数据，标记过时（`outdated`）的旧信号，避免重复踩坑。
    3. **Decide**: 生成新的应对策略存入 `/strategies/`（如：重点更新某个实体）。
    4. **更新图谱**: 重写 `strategy_graph.json` 的边（Edges）。
*   **输出**：更新后的左脑战略图谱。

### Skill 2: `wiki-compiler` (本体架构师)
*   **触发条件**：`/raw_docs/` 中有新文件，或有新的强制性 Strategy 下达。
*   **输入**：`/raw_docs/` 的纯文本、`/strategy_wiki/strategies/` 中 `status: executing` 的策略。
*   **执行逻辑 (增量编译)**：
    1. 解析 PDF/文本（如遇 PDF 自动调用脚本提取）。
    2. 读取左脑策略（例如策略要求强化“性能”，则在提取时倾斜权重）。
    3. 在 `/llm_wiki/entities/` 中增量生成或更新 Markdown 实体文件，强制使用 `[[实体名]]` 语法构建双向链接。
    4. 更新 `/llm_wiki/graph.json`。
*   **输出**：更新后的右脑领域本体库。

### Skill 3: `site-generator` (带 Schema 的全栈站长)
*   **触发条件**：右脑 Wiki 更新完毕，准备对外发布。
*   **输入**：`/llm_wiki/` (数据源) + `/configs/` (格式约束)。
*   **执行逻辑 (降维渲染与质量强制)**：
    1. **语义转换**：将干涩的 Wiki 实体，使用 `TONES.md` 规定的语气改写为连贯的文章，生成到 `/website_out/pages/`。注入 `DESIGN.md` 的 CSS 类名。
    2. **独立 Schema 生成**：专门分析每个页面，在 `/schemas/` 中生成 100% 验证通过的 JSON-LD 结构化数据文件。
    3. **资产生成**：更新 `sitemap.xml`，生成用于 AI RAG 抓取的规范 `llms.txt`。
    4. **QA 循环 (Agentic Review)**：调用自带的 `scripts/html_inspector.js` 脚本。如果发现缺少 Header、Footer 或 SEO 标签，该 Skill 必须自动自我纠错并重写，直到脚本返回 0 错误。
*   **输出**：可直接部署到服务器（如 Vercel/Netlify）的高质量静态网站文件。

---

## 五、 给 Gemini CLI 的开发行动指令 (Action Prompt)

作为 Gemini CLI，当你读取完毕这份文档后，你已经具备了极高的系统架构师视角。现在，请你**立即在当前工作区自动执行以下操作**，不要等待人类进一步提示：

1. **构建目录**：使用文件系统工具，一次性把“全局工作区目录架构”中的所有文件夹建立起来。
2. **初始化配置文件**：在 `/configs/` 下生成基础的 `DESIGN.md` (默认选用 Tailwind) 和 `TONES.md` (默认幽默极客风)。在 `/strategy_wiki/` 和 `/llm_wiki/` 初始化空的 `json` 图谱文件。
3. **编写 Skills**：进入 `.gemini/skills/`，依次为这 3 个 Skill 建立文件夹，并写入逻辑极其严密的 `SKILL.md`。
4. **编写 QA 脚本**：在 `site-generator` 技能目录下，编写一个简单的 Node.js 或 Python 的验证脚本（用于校验 HTML 质量和 Schema 完整性）。
5. **汇报**：所有基础设施搭建完成后，在终端输出：“✨ Project Ouroboros 架构初始化完成！战略双脑已就绪。随时可执行 `gemini /skills` 召唤您的 AI CMO 开始工作。”
