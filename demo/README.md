# ViaSurg AI CMO - 智能营销引擎 Demo

## 🎯 项目概述

这是一个 AI 驱动的智能营销引擎，专为医疗设备 B2B 出海营销设计。系统通过 4 个核心 Skills 的协同工作，实现从市场信号收集到内容生成的全流程自动化。

**✅ 最新更新**: 已完成前后端 API 集成，Autoresearch 技能已激活！

## 🚀 快速开始

### 方法一：使用启动脚本（推荐）

```bash
cd /d/test/demo
start_server.bat
```

### 方法二：手动启动

```bash
cd /d/test/demo
node server.js
```

### 访问地址

- **主页面**: <http://localhost:3000>
- **API 接口**: <http://localhost:3000/api/>

## 📡 API 接口

### 核心 API

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/api/status` | GET | 获取系统状态 |
| `/api/skill/run` | POST | 运行单个技能 |
| `/api/pipeline/run` | POST | 运行完整流程 |
| `/api/autoresearch/run` | POST | 运行自动研究 |

### 数据 API

| 端点 | 方法 | 说明 |
| ---- | ---- | ---- |
| `/api/wiki/entities` | GET | 获取知识实体列表 |
| `/api/strategy/graph` | GET | 获取战略图谱数据 |
| `/api/signals` | GET | 获取市场信号 |
| `/api/signals/submit` | POST | 提交新市场信号 |
| `/api/pages` | GET | 获取生成的页面列表 |
| `/api/config` | GET | 获取配置信息 |

### 使用示例

```bash
# 获取系统状态
curl http://localhost:3000/api/status

# 运行自动研究
curl -X POST http://localhost:3000/api/autoresearch/run \
  -H "Content-Type: application/json" \
  -d '{"goal": "Improve SEO"}'

# 运行完整流程
curl -X POST http://localhost:3000/api/pipeline/run

# 提交新信号
curl -X POST http://localhost:3000/api/signals/submit \
  -H "Content-Type: application/json" \
  -d '{"type": "market", "desc": "New competitor entered"}'
```

## 📊 系统功能

### 1. 控制台（Dashboard）
- 实时监控系统状态
- 查看关键指标（信号数、实体数、页面数、策略数）
- 工作流可视化
- 系统日志

### 2. 战略推演官（Strategy Operator）
- 输入市场信号
- 执行 OODA 循环（观察、定向、决策、行动）
- 生成应对策略
- 更新战略图谱

### 3. 本体架构师（Wiki Compiler）
- 处理原始文档
- 提取实体和关系
- 更新知识图谱
- 生成双向链接

### 4. 全栈站长（Site Generator）
- 渲染 SEO 优化的网页
- 生成 JSON-LD Schema
- 更新 sitemap.xml
- 质量检查和自动纠错

### 5. 自动研究（Autoresearch）
- 自主迭代改进
- 质量验证
- 经验学习
- 无人值守运行

## 🔄 完整工作流程

1. **信号收集**：收集市场情报、竞品动态、关键词数据
2. **战略分析**：通过 OODA 循环分析信号，生成应对策略
3. **知识编译**：将原始文档和战略意图编译为结构化知识
4. **内容生成**：将知识图谱渲染为 SEO 优化的网页内容
5. **质量验证**：自动检查和纠错，确保内容质量

## 📁 测试材料

在 `test_materials` 目录中，我们提供了完整的测试材料：

- `market_signals.json`：市场信号数据
- `raw_document.md`：原始产品文档
- `strategies.json`：战略规划文件

这些材料可以用于测试整个系统的流程。

## 🛠️ 技术栈

- **前端**：HTML5, CSS3, JavaScript (ES6+)
- **服务器**：Node.js (http 模块)
- **设计**：响应式设计，支持移动端
- **动画**：CSS3 动画，提升用户体验

## 📝 使用说明

### 输入市场信号

1. 点击侧边栏的"输入新信号"
2. 填写信号标题、来源、内容和紧急程度
3. 点击"提交信号"
4. 系统会自动分析信号并生成策略

### 运行完整流程

1. 点击控制台的"运行完整流程"按钮
2. 观察工作流的 5 个步骤依次执行
3. 查看控制台日志了解执行详情
4. 检查生成的页面和策略

### 单独运行 Skill

1. 在侧边栏选择要运行的 Skill
2. 配置相关参数
3. 点击执行按钮
4. 查看执行结果

## 🔧 自定义配置

### 修改设计规范

编辑 `configs/DESIGN.md` 文件，修改 UI/UX 设计规范。

### 修改语调风格

编辑 `configs/TONES.md` 文件，修改品牌语调和行文风格。

### 添加新的 Skill

1. 在 `.gemini/skills/` 目录下创建新文件夹
2. 编写 `SKILL.md` 文件定义技能逻辑
3. 在前端添加对应的视图和交互

## 🐛 故障排除

### 服务器无法启动

- 检查 Node.js 是否正确安装
- 检查端口 3000 是否被占用
- 查看控制台错误信息

### 页面无法加载

- 检查浏览器控制台是否有错误
- 清除浏览器缓存
- 尝试使用其他浏览器

### 功能异常

- 刷新页面重试
- 检查网络连接
- 查看服务器日志

## 📞 技术支持

如有问题，请查看：
- 项目文档：`howto.md`
- 聊天记录：`chat_history/`
- 项目解析：`chat_history/project_explanation.html`

## 📄 许可证

本项目仅供学习和研究使用。

---

**ViaSurg AI CMO** - 智能营销引擎，让医疗设备出海更简单！