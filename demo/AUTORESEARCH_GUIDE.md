# Autoresearch 效果查看指南

## 🎯 如何查看 Autoresearch 的作用效果

### 方式一：专用仪表板（推荐）

1. **启动服务器**
   ```bash
   cd /d/test/demo
   node server.js
   # 或
   start_server.bat
   ```

2. **访问 Autoresearch 仪表板**
   - 直接访问: http://localhost:3000/autoresearch_dashboard.html
   - 或从主控制台点击: "🔬 查看 Autoresearch 效果"

3. **仪表板功能**
   - 📊 **统计概览**: 显示竞争对手数量、关键词机会、薄弱内容等
   - 🔑 **关键词差距分析**: 高 CPC 但未覆盖的关键词
   - 🏢 **竞争对手分析**: 分析 10 个主要竞争对手
   - 📝 **内容深度分析**: 识别内容薄弱的实体
   - 💡 **优化建议**: 基于分析结果的行动建议
   - 📈 **CPC 分布图表**: 可视化关键词价值

---

### 方式二：API 直接调用

#### 1. 运行 Autoresearch 分析

```bash
curl -X POST http://localhost:3000/api/autoresearch/run \
  -H "Content-Type: application/json" \
  -d '{"goal": "Full analysis"}'
```

#### 2. 返回结果示例

```json
{
  "status": "success",
  "data": {
    "skill": "autoresearch",
    "status": "completed",
    "mode": "fallback",
    "results": {
      "competitiveIntelligence": {
        "competitorsAnalyzed": 10,
        "details": [
          {
            "name": "Ethicon",
            "wordCount": 84,
            "painPoints": [],
            "advantages": []
          }
        ]
      },
      "keywordGaps": {
        "gapsFound": 15,
        "topGaps": [
          {
            "keyword": "endoscopic clip",
            "cpc": 60,
            "searches": 5000
          }
        ]
      },
      "contentDepth": {
        "thinEntities": 21,
        "details": [
          {
            "name": "NomoFlow Solutions",
            "words": 21
          }
        ]
      }
    }
  }
}
```

---

## 📊 Autoresearch 功能详解

### 1. 竞争对手分析 (Competitive Intelligence)

**作用**: 分析知识图谱中的竞争对手实体，识别市场定位

**分析内容**:
- 竞争对手数量和名称
- 每个竞争对手的内容深度（词数）
- 痛点和优势提取

**示例结果**:
```
已分析 10 个竞争对手:
- Ethicon: 84 词
- Medtronic: 80 词
- Olympus: 74 词
- Boston Scientific: 72 词
```

**如何使用**:
- 识别内容薄弱的竞争对手
- 发现市场定位机会
- 制定差异化策略

---

### 2. 关键词差距分析 (Keyword Gap Analysis)

**作用**: 发现高价值但未覆盖的关键词

**分析标准**:
- CPC > $5 的高价值关键词
- ViaSurg 知识图谱中未覆盖
- 按 CPC 降序排列

**示例结果**:
```
发现 15 个关键词机会:
1. endoscopic clip - CPC: $60, 搜索量: 5000
2. 5 0 monocryl - CPC: $28.65, 搜索量: 500
3. chromic gut monofilament - CPC: $28.1, 搜索量: 50
```

**如何使用**:
- 优先创建高 CPC 关键词的落地页
- 优化现有页面覆盖更多关键词
- 提升 SEO 流量获取

---

### 3. 内容深度分析 (Content Depth Analysis)

**作用**: 识别内容薄弱的实体（少于 100 词）

**分析标准**:
- 实体内容词数 < 100
- 按词数升序排列
- 标记需要扩充的内容

**示例结果**:
```
发现 21 个薄弱实体:
- NomoFlow Solutions: 21 词 ⚠️
- Access: 22 词 ⚠️
- Clips: 22 词 ⚠️
- Minimally Invasive Surgery: 23 词 ⚠️
```

**如何使用**:
- 优先扩充最薄弱的实体内容
- 添加产品规格、认证信息、临床数据
- 提升内容质量和 SEO 表现

---

### 4. SERP 机会识别 (SERP Opportunities)

**作用**: 识别高搜索量的关键词机会

**分析标准**:
- 月搜索量 > 100,000
- 计算机会分数（搜索量/10000 + CPC）
- 按机会分数降序排列

**如何使用**:
- 优先创建高搜索量关键词的内容
- 优化标题和元描述
- 提升搜索引擎排名

---

## 🔧 高级用法

### 1. 配置 LLM 分析（可选）

如果要启用 LLM 驱动的深度分析，需要设置环境变量：

```bash
# DeepSeek API
export DEEPSEEK_API_KEY=your_api_key
export DEEPSEEK_BASE_URL=https://api.deepseek.com
export LLM_MODEL=deepseek-chat

# 或 OpenAI API
export OPENAI_API_KEY=your_api_key
```

启用后，Autoresearch 会提供：
- 更深入的竞争对手分析
- 市场定位建议
- 威胁等级评估

### 2. 定时运行

设置定时任务，持续监控市场变化：

```bash
# 每天运行一次
0 0 * * * cd /d/test/demo && curl -X POST http://localhost:3000/api/autoresearch/run

# 每周运行一次
0 0 * * 0 cd /d/test/demo && curl -X POST http://localhost:3000/api/autoresearch/run
```

### 3. 集成到工作流

在完整流程中自动运行 Autoresearch：

```bash
curl -X POST http://localhost:3000/api/pipeline/run
```

完整流程包括：
1. Strategy Operator - 信号分析
2. Wiki Compiler - 知识编译
3. Site Generator - 页面生成
4. **Autoresearch** - 效果分析和优化建议

---

## 📈 效果指标

### 当前分析结果

| 指标 | 数值 | 说明 |
| ---- | ---- | ---- |
| 竞争对手分析 | 10 | 已分析知识图谱中的竞争对手 |
| 关键词机会 | 15 | 高 CPC 但未覆盖的关键词 |
| 薄弱内容 | 21 | 内容不足 100 词的实体 |
| 最高 CPC | $60 | endoscopic clip |

### 预期效果

通过应用 Autoresearch 的建议：

1. **流量提升**
   - 创建 15 个高价值关键词落地页
   - 预计增加 50,000+ 月搜索流量

2. **转化率提升**
   - 优化薄弱内容，提升用户体验
   - 预计转化率从 3.8% 提升到 5%+

3. **竞争优势**
   - 差异化定位，避开竞争对手优势
   - 突出 ViaSurg 的成本和认证优势

---

## 🎯 行动计划

基于 Autoresearch 分析结果，建议按以下优先级执行：

### 高优先级

1. **创建 endoscopic clip 落地页**
   - CPC: $60
   - 月搜索量: 5,000
   - 预计流量: 500-1000/月

2. **扩充 NomoFlow Solutions 内容**
   - 当前: 21 词
   - 目标: 500+ 词
   - 添加产品规格、认证、优势

### 中优先级

3. **创建 5 0 monocryl 对比页面**
   - CPC: $28.65
   - 突出 ViaSurg 的性价比

4. **优化 21 个薄弱实体**
   - 添加详细的产品信息
   - 补充技术规格和临床数据

### 低优先级

5. **设置定时 Autoresearch**
   - 每周自动运行
   - 持续监控市场变化

---

## 📚 相关资源

- [Autoresearch 技能定义](../../.gemini/skills/autoresearch/SKILL.md)
- [API 文档](README.md)
- [项目总览](../project_overview.html)
- [主控制台](index.html)

---

## 🆘 常见问题

### Q: 为什么 LLM Insights 是 null？

A: 未配置 LLM API 密钥。设置 `DEEPSEEK_API_KEY` 或 `OPENAI_API_KEY` 环境变量即可启用。

### Q: 如何验证分析结果？

A: 检查以下指标：
1. 关键词 CPC 数据是否准确
2. 竞争对手实体是否完整
3. 内容词数统计是否正确

### Q: 可以自定义分析目标吗？

A: 可以。在 API 请求中修改 `goal` 参数：
```json
{"goal": "Focus on sutures market"}
```

### Q: 分析结果如何应用？

A: 按照行动计划执行：
1. 优先创建高 CPC 关键词页面
2. 扩充薄弱内容
3. 持续运行 Autoresearch 监控效果
