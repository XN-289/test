# LLM 集成指南

## 概述

Project Ouroboros 支持可选的 LLM (Large Language Model) 集成，用于增强分析能力。系统会自动回退到 JS 分析，无需 LLM 即可运行。

## 支持的 LLM 提供商

| 提供商 | 模型 | Base URL |
|--------|------|----------|
| DeepSeek | deepseek-chat | https://api.deepseek.com |
| OpenAI | gpt-4o-mini | https://api.openai.com/v1 |

## 配置方法

### 方法 1: 通过 Web 界面

1. 打开项目总览页面: `D:\test\project_overview.html`
2. 找到 "LLM 集成配置" 部分
3. 选择提供商 (DeepSeek 或 OpenAI)
4. 输入 API Key
5. 点击 "保存配置"

### 方法 2: 直接编辑配置文件

编辑 `config/llm_config.json`:

```json
{
  "deepseek": {
    "api_key": "sk-your-deepseek-key",
    "base_url": "https://api.deepseek.com",
    "model": "deepseek-chat"
  },
  "openai": {
    "api_key": "sk-your-openai-key",
    "base_url": "https://api.openai.com/v1",
    "model": "gpt-4o-mini"
  },
  "active_provider": "deepseek",
  "fallback_to_js": true,
  "max_tokens": 1500,
  "temperature": 0
}
```

### 方法 3: 环境变量

设置环境变量:

```bash
# DeepSeek
export DEEPSEEK_API_KEY="sk-your-key"
export DEEPSEEK_BASE_URL="https://api.deepseek.com"
export LLM_MODEL="deepseek-chat"

# 或 OpenAI
export OPENAI_API_KEY="sk-your-key"
export OPENAI_BASE_URL="https://api.openai.com/v1"
```

## 测试连接

### 命令行测试

```bash
# 测试当前配置的提供商
python scripts/test_llm.py

# 测试特定提供商
python scripts/test_llm.py deepseek
python scripts/test_llm.py openai
```

### API 测试

```bash
# 检查 LLM 配置状态
curl http://localhost:3001/api/llm/config

# 检查 SDK 和 LLM 状态
curl http://localhost:3001/api/sdk/status
```

## LLM 增强的功能

### 1. Strategy Operator (OODA 分析)

- **信号分析**: 分析市场信号与洞察的关联
- **策略推荐**: 基于信号-洞察对推荐战略行动
- **优先级排序**: 自动评估信号优先级

### 2. Wiki Compiler (知识编译)

- **实体分类**: 自动分类实体类型 (Product, Category, Competitor 等)
- **关系发现**: 发现实体间的隐含关系
- **内容增强**: 为实体添加缺失的元数据

### 3. Autoresearch (自动研究)

- **竞对分析**: 深度分析竞争对手定位
- **市场差距**: 识别市场空白和机会
- **威胁评估**: 评估竞争威胁级别

## 工作原理

```
┌─────────────────────────────────────────────────────────────┐
│                    Pipeline 运行流程                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 检查 LLM 配置 (config/llm_config.json)                 │
│         ↓                                                   │
│  2. 尝试调用 Python 脚本 + LLM API                          │
│         ↓                                                   │
│  3. 如果成功 → 使用 LLM 增强结果                            │
│         ↓                                                   │
│  4. 如果失败 → 自动回退到 JS 分析                           │
│         ↓                                                   │
│  5. 返回结果 (包含 mode: "llm" 或 "fallback")              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/llm/config` | GET | 获取 LLM 配置 |
| `/api/llm/config` | POST | 更新 LLM 配置 |
| `/api/sdk/status` | GET | 获取 SDK 和 LLM 状态 |

### POST /api/llm/config

请求体:

```json
{
  "active_provider": "deepseek",
  "deepseek": {
    "api_key": "sk-your-key"
  }
}
```

响应:

```json
{
  "success": true,
  "message": "LLM config updated",
  "config": { ... }
}
```

## 故障排除

### 问题: API Key 未配置

**症状**: `mode: "fallback"`, `hasApiKey: false`

**解决**:
1. 通过 Web 界面设置 API Key
2. 或编辑 `config/llm_config.json`
3. 或设置环境变量

### 问题: API 调用失败

**症状**: `mode: "fallback"`, 错误信息包含 "API" 或 "timeout"

**解决**:
1. 检查 API Key 是否有效
2. 检查网络连接
3. 检查 API 配额
4. 运行 `python scripts/test_llm.py` 诊断

### 问题: Python 脚本执行失败

**症状**: SDK 状态显示 `available: false`

**解决**:
1. 确保 Python 已安装: `python --version`
2. 确保 openai 包已安装: `pip install openai`
3. 检查脚本路径: `d:/test/kealin/scripts/skill_executor.py`

## 最佳实践

1. **API Key 安全**: 不要将 API Key 提交到 Git
2. **成本控制**: 使用 `max_tokens` 限制输出长度
3. **回退机制**: 保持 `fallback_to_js: true` 确保系统稳定
4. **测试验证**: 配置后运行 `python scripts/test_llm.py` 验证

## 文件结构

```
kealin/
├── config/
│   └── llm_config.json      # LLM 配置文件
├── scripts/
│   ├── skill_executor.py    # 技能路由器
│   ├── test_llm.py          # LLM 测试脚本
│   └── skills/
│       ├── strategy_operator.py  # OODA 分析 (含 LLM)
│       ├── wiki_compiler.py      # 知识编译 (含 LLM)
│       └── autoresearch.py       # 自动研究 (含 LLM)
└── demo/
    └── server.js            # 服务器 (LLM 配置管理)
```
