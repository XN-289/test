const fs = require('fs');
const path = require('path');

const CONTENT_ZH_DIR = 'i18n/content/zh';

// Ensure output directory exists
if (!fs.existsSync(CONTENT_ZH_DIR)) {
    fs.mkdirSync(CONTENT_ZH_DIR, { recursive: true });
}

// All 40 entities with Chinese translations (absorbable-sutures already exists)
const translations = {
    "access": {
        page_title: "通路管理 | ViaSurg",
        content_title: "通路管理 (Access)",
        content_category: "微创外科 > 通路管理",
        content_material: "",
        content_body: "<p>手术切口建立与维护工具，包括一次性穿刺器和气腹针。为腹腔镜手术提供稳定、安全的腹腔通道。</p>",
        evidence_links: ""
    },
    "bard": {
        page_title: "Bard (BD) | ViaSurg",
        content_title: "Bard (BD)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>C.R. Bard, Inc. 是一家领先的医疗技术公司，现隶属于 BD（碧迪医疗）。在血管通路、泌尿外科和外科手术领域具有广泛产品线。</p>",
        evidence_links: ""
    },
    "biopsy-forceps": {
        page_title: "一次性活检钳 | ViaSurg",
        content_title: "一次性活检钳 (Biopsy Forceps)",
        content_category: "微创外科 > 器械操作",
        content_material: "",
        content_body: `<p>一次性活检钳是内镜室的标准耗材，被视为 ViaSurg 的"现金牛"产品。用于内镜下组织取样，广泛应用于消化内科和呼吸科。</p>`,
        evidence_links: ""
    },
    "boston-scientific": {
        page_title: "波士顿科学 | ViaSurg",
        content_title: "波士顿科学 (Boston Scientific)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>波士顿科学是一家全球性的医疗器械开发商、制造商和营销商，产品应用于介入医学各专业领域。</p>",
        evidence_links: ""
    },
    "clips": {
        page_title: "结扎夹 | ViaSurg",
        content_title: "结扎夹 (Clips)",
        content_category: "伤口闭合 > 结扎夹",
        content_material: "",
        content_body: "<p>用于止血或组织结扎的机械装置，涵盖内镜止血夹和腹腔镜高分子结扎夹两大产品线。</p>",
        evidence_links: ""
    },
    "competitor-disruption": {
        page_title: "竞品颠覆与市场套利 | ViaSurg",
        content_title: "竞品颠覆与市场套利 (Competitor Disruption)",
        content_category: "市场策略",
        content_material: "",
        content_body: `<p>ViaSurg 通过提供与高成本 incumbent 品牌直接对标的技术等效产品，颠覆传统大厂的"不透明定价"和"供应链不可见性"，实现 B2B 采购流量的套利。</p>`,
        evidence_links: ""
    },
    "compliance-framework": {
        page_title: "合规框架 | ViaSurg",
        content_title: "合规框架 (Compliance Framework)",
        content_category: "合规与监管",
        content_material: "",
        content_body: `<p>ViaSurg 采用严格的"可验证透明度"合规模式，充分利用现有工厂认证（ISO 13485、FDA 510(k)），同时保持独立的质量审计。</p>`,
        evidence_links: ""
    },
    "cook-medical": {
        page_title: "库克医疗 | ViaSurg",
        content_title: "库克医疗 (Cook Medical)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>库克医疗是一家家族式医疗器械公司，专注于开发和制造用于微创医疗手术的产品，在介入放射学和消化内科领域具有领先地位。</p>",
        evidence_links: ""
    },
    "endoscopic-procedures": {
        page_title: "内镜诊疗 | ViaSurg",
        content_title: "内镜诊疗 (Endoscopic Procedures)",
        content_category: "术式分类",
        content_material: "",
        content_body: "<p>内镜诊疗是一种通过内窥镜观察体内空腔器官或腔道内部的医学检查和治疗技术。广泛应用于消化内科、呼吸科和泌尿外科。</p>",
        evidence_links: ""
    },
    "ethicon": {
        page_title: "强生 Ethicon | ViaSurg",
        content_title: "强生 Ethicon (Johnson & Johnson)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>全球领先的外科缝合线、吻合器和能量器械制造商，隶属于强生医疗科技板块。是外科缝合和吻合领域的标杆品牌。</p>",
        evidence_links: ""
    },
    "ethicon-b5lt": {
        page_title: "Ethicon B5LT 穿刺器 | ViaSurg",
        content_title: "Ethicon B5LT (ENDOPATH XCEL 穿刺器)",
        content_category: "竞品 SKU 对标",
        content_material: "",
        content_body: "<p>强生旗下的行业标准带刃穿刺器，以易于插入和腹壁固定著称。是腹腔镜手术中最常用的穿刺器型号之一。</p>",
        evidence_links: ""
    },
    "guidewires": {
        page_title: "导丝 | ViaSurg",
        content_title: "导丝 (Guidewires)",
        content_category: "通路管理",
        content_material: "",
        content_body: "<p>高性能导丝，适用于消化内科、泌尿外科和外周血管介入。采用斑马纹设计提供运动可视确认，亲水涂层实现超低摩擦。</p>",
        evidence_links: ""
    },
    "hangzhou-sode": {
        page_title: "杭州硕德 | ViaSurg",
        content_title: "杭州硕德 (Hangzhou Sode)",
        content_category: "供应链伙伴",
        content_material: "",
        content_body: "<p>杭州硕德是 ViaSurg 的核心供应链合作伙伴，作为中国领先的微创外科器械 OEM/ODM 工厂，为多个产品线提供制造支撑。</p>",
        evidence_links: ""
    },
    "hemoclips": {
        page_title: "止血夹与结扎夹 | ViaSurg",
        content_title: "止血夹与结扎夹 (Hemoclips & Ligating Clips)",
        content_category: "伤口闭合 > 结扎夹",
        content_material: "",
        content_body: "<p>综合止血解决方案，覆盖内镜（可旋转止血夹）和腹腔镜（高分子结扎夹）两大应用场景。提供即时止血和长期结扎的完整产品矩阵。</p>",
        evidence_links: ""
    },
    "hernia-meshes": {
        page_title: "疝气修补网片 | ViaSurg",
        content_title: "疝气修补网片 (Hernia Meshes)",
        content_category: "伤口闭合",
        content_material: "材质: 聚丙烯 (Polypropylene)",
        content_body: "<p>用于疝气修补中软组织缺损加固的外科网片。主要由合成不可吸收高分子材料（如聚丙烯）制成，提供持久的组织支撑。</p>",
        evidence_links: ""
    },
    "instrumentation": {
        page_title: "器械操作 | ViaSurg",
        content_title: "器械操作 (Instrumentation)",
        content_category: "微创外科 > 器械操作",
        content_material: "",
        content_body: "<p>微创外科中的功能性操作工具，包括超声刀头、吻合器、息肉圈套器和活检钳等核心产品线。</p>",
        evidence_links: ""
    },
    "intelligence": {
        page_title: "算法与智能 | ViaSurg",
        content_title: "算法与智能 (Intelligence)",
        content_category: "NomoFlow 方案 > 算法与智能",
        content_material: "",
        content_body: "<p>NomoFlow 核心逻辑与 ViaSurg 知识体系，涵盖确定性控制技术和临床教育平台。</p>",
        evidence_links: ""
    },
    "johnson-cdh29p": {
        page_title: "强生 CDH29P 吻合器 | ViaSurg",
        content_title: "强生 CDH29P (Proximate ILS 圆形吻合器)",
        content_category: "竞品 SKU 对标",
        content_material: "",
        content_body: "<p>强生旗下 29mm 圆形吻合器，广泛用于结直肠和胃部吻合手术。是消化外科中最常用的圆形吻合器型号之一。</p>",
        evidence_links: ""
    },
    "laparoscopic-surgery": {
        page_title: "腹腔镜手术 | ViaSurg",
        content_title: "腹腔镜手术 (Laparoscopic Surgery)",
        content_category: "术式分类",
        content_material: "",
        content_body: "<p>一种现代外科技术，通过在远离手术部位的小切口（通常 0.5-1.5 cm）进行操作。具有创伤小、恢复快、疤痕少的优势。</p>",
        evidence_links: ""
    },
    "medtronic": {
        page_title: "美敦力 | ViaSurg",
        content_title: "美敦力 (Medtronic / Covidien)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>全球领先的医疗技术公司，尤其在外科手术、患者监护和心脏病学领域。2015 年收购柯惠医疗，巩固了其在微创/腹腔镜市场的地位。</p>",
        evidence_links: ""
    },
    "minimally-invasive-surgery": {
        page_title: "微创外科 | ViaSurg",
        content_title: "微创外科 (Minimally Invasive Surgery)",
        content_category: "微创外科",
        content_material: "",
        content_body: "<p>涵盖腹腔镜手术所需的通路工具和精细操作器械，是 ViaSurg 的核心业务板块之一。</p>",
        evidence_links: ""
    },
    "nomoflow-solutions": {
        page_title: "NomoFlow 数字化方案 | ViaSurg",
        content_title: "NomoFlow 方案 (NomoFlow Solutions)",
        content_category: "NomoFlow 方案",
        content_material: "",
        content_body: "<p>ViaSurg 的前瞻性数字化业务，聚焦算法控制和临床培训，通过确定性制造和可验证证据链实现医疗采购透明化。</p>",
        evidence_links: ""
    },
    "nomoflow-technology": {
        page_title: "NomoFlow 确定性控制技术 | ViaSurg",
        content_title: "NomoFlow 技术 (Deterministic Control)",
        content_category: "NomoFlow 方案 > 算法与智能",
        content_material: "",
        content_body: "<p>NomoFlow 是一个闭环控制平台，通过高频参数补偿减少批次差异。实现从原材料到成品的全链路可追溯性和确定性质量控制。</p>",
        evidence_links: ""
    },
    "non-absorbable-sutures": {
        page_title: "非吸收缝合线 | ViaSurg",
        content_title: "非吸收缝合线 (Non-Absorbable Sutures)",
        content_category: "伤口闭合 > 缝合线",
        content_material: "材质: 聚丙烯 (Polypropylene)",
        content_body: "<p>永久性外科缝合线（如聚丙烯、尼龙），适用于血管、心脏和骨科手术中需要长期伤口支撑的场景。</p>",
        evidence_links: ""
    },
    "olympus": {
        page_title: "奥林巴斯 | ViaSurg",
        content_title: "奥林巴斯 (Olympus)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>日本医疗技术公司，全球内窥镜解决方案领导者。产品覆盖消化内科、呼吸科和泌尿外科等领域。</p>",
        evidence_links: ""
    },
    "pga-material": {
        page_title: "PGA 聚乙交酯 | ViaSurg",
        content_title: "PGA 聚乙交酯 (Polyglycolic Acid)",
        content_category: "材料科学",
        content_material: "",
        content_body: "<p>一种可生物降解的热塑性聚合物，是最简单的线性脂肪族聚酯。广泛用于合成可吸收缝合线，吸收时间约60-90天。</p>",
        evidence_links: ""
    },
    "polymer-clips": {
        page_title: "高分子结扎夹 | ViaSurg",
        content_title: "高分子结扎夹 (Polymer Clips)",
        content_category: "伤口闭合 > 结扎夹",
        content_material: "",
        content_body: "<p>不可吸收高分子结扎夹，用于血管和组织束的高安全性结扎。专为腹腔镜手术设计，具有集成锁定机构和触觉反馈。</p>",
        evidence_links: ""
    },
    "polypropylene-material": {
        page_title: "聚丙烯 | ViaSurg",
        content_title: "聚丙烯 (Polypropylene)",
        content_category: "材料科学",
        content_material: "",
        content_body: "<p>一种坚固且耐化学腐蚀的热塑性聚合物。在外科领域，用于不可吸收单丝缝合线和疝气修补网片。</p>",
        evidence_links: ""
    },
    "snares": {
        page_title: "息肉圈套器 | ViaSurg",
        content_title: "息肉圈套器 (Snares)",
        content_category: "微创外科 > 器械操作",
        content_material: "",
        content_body: `<p>冷圈套和热圈套息肉切除器，适用于内镜下息肉切除术。顺应全球"冷圈套息肉切除术"(CSP) 趋势，在门诊环境中兼顾安全性和效率。</p>`,
        evidence_links: ""
    },
    "staplers": {
        page_title: "吻合器 | ViaSurg",
        content_title: "吻合器 (Staplers)",
        content_category: "微创外科 > 器械操作",
        content_material: "",
        content_body: "<p>外科吻合器（腹腔镜和圆形）是高技术含量、严格监管的产品。虽然量大利高，但受到严格监管审查，需要通过组织爆破压力测试和动物试验。</p>",
        evidence_links: ""
    },
    "sutures": {
        page_title: "缝合线 | ViaSurg",
        content_title: "缝合线 (Sutures)",
        content_category: "伤口闭合 > 缝合线",
        content_material: "",
        content_body: "<p>基础临床耗材，包括可吸收和不可吸收两大类材质。是外科手术中最基本的伤口闭合工具。</p>",
        evidence_links: ""
    },
    "teleflex": {
        page_title: "泰利福 | ViaSurg",
        content_title: "泰利福 (Teleflex)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>全球性医疗技术提供商，致力于改善人们的健康和生活质量。在血管通路、麻醉和外科领域具有广泛产品组合。</p>",
        evidence_links: ""
    },
    "teleflex-hem-o-lok": {
        page_title: "泰利福 Hem-o-lok 结扎夹 | ViaSurg",
        content_title: "泰利福 Hem-o-lok (高分子结扎夹)",
        content_category: "竞品 SKU 对标",
        content_material: "",
        content_body: `<p>行业标杆高分子结扎夹，以其高安全性的"集成凸轮"锁定机制享誉全球。是腹腔镜手术中血管结扎的参考标准。</p>`,
        evidence_links: ""
    },
    "terumo": {
        page_title: "泰尔茂 | ViaSurg",
        content_title: "泰尔茂 (Terumo)",
        content_category: "竞品品牌",
        content_material: "",
        content_body: "<p>日本医疗器械公司，全球血管和介入技术领导者。在注射器、输液器和血管介入器械领域具有领先地位。</p>",
        evidence_links: ""
    },
    "trocars": {
        page_title: "一次性穿刺器 | ViaSurg",
        content_title: "一次性穿刺器 (Disposable Trocars)",
        content_category: "微创外科 > 通路管理",
        content_material: "",
        content_body: "<p>高精度腹腔镜通路器械，通过 NomoFlow 技术实现确定性制造。低摩擦插入（< 15.0 N）减少腹壁创伤，双密封阀维持气腹稳定。</p>",
        evidence_links: ""
    },
    "ultrasonic-shears": {
        page_title: "超声刀头 | ViaSurg",
        content_title: "超声刀头 (Ultrasonic Shears)",
        content_category: "微创外科 > 器械操作",
        content_material: "",
        content_body: "<p>有源能量器械，可同时实现组织切割和凝血。以超声频率（如 55.5 kHz）工作，最大限度减少热扩散，保护周围组织。</p>",
        evidence_links: ""
    },
    "veress-needles": {
        page_title: "气腹针 | ViaSurg",
        content_title: "气腹针 (Veress Needles)",
        content_category: "微创外科 > 通路管理",
        content_material: "",
        content_body: "<p>一次性气腹针，用于腹腔镜手术中建立气腹。采用弹簧加载钝头针芯设计，确保安全插入。</p>",
        evidence_links: ""
    },
    "viasurg": {
        page_title: "ViaSurg | 全球医疗标准验证",
        content_title: "ViaSurg",
        content_category: "",
        content_material: "",
        content_body: `<p>ViaSurg 定位为"全球医疗标准流量套利机器"。战略目标是利用已建立的行业标准（Ethicon、Medtronic 等），通过优化数字存在和竞争性定价捕获 B2B 采购流量。</p>`,
        evidence_links: ""
    },
    "viasurg-academy": {
        page_title: "ViaSurg 学院 | ViaSurg",
        content_title: "ViaSurg 学院 (Clinical Education)",
        content_category: "NomoFlow 方案 > 算法与智能",
        content_material: "",
        content_body: `<p>仿照行业标准（如美敦力学院）打造的专业教育和验证门户。作为"内容磁铁"，将 ViaSurg 建立为临床权威。</p>`,
        evidence_links: ""
    },
    "wound-closure": {
        page_title: "伤口闭合与管理 | ViaSurg",
        content_title: "伤口闭合 (Wound Closure)",
        content_category: "伤口闭合",
        content_material: "",
        content_body: "<p>ViaSurg 的核心业务支柱之一，涵盖从传统缝合线到高分子结扎夹的全系列伤口闭合解决方案。</p>",
        evidence_links: ""
    }
};

// Write each translation file
let count = 0;
for (const [slug, data] of Object.entries(translations)) {
    const filePath = path.join(CONTENT_ZH_DIR, `${slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
    count++;
    console.log(`  Created: ${slug}.json`);
}

console.log(`\nGenerated ${count} zh content files.`);
