/**
 * Fix i18n for kealin/demo/output/ — all pages
 * Adds data-lang wrappers and real Chinese translations
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output');

// ============================================================
// INDEX.HTML FIXES
// ============================================================
function fixIndex() {
  const file = path.join(OUTPUT_DIR, 'index.html');
  let html = fs.readFileSync(file, 'utf8');
  let count = 0;

  // Helper: wrap bare text in data-lang pairs
  function wrap(html, en, zh) {
    return html.replace(en, `<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>`);
  }

  // --- Product card names (h3.product-name) ---
  const productNames = {
    'Absorbable Sutures': '可吸收缝合线',
    'Biopsy Forceps': '活检钳',
    'Guidewires': '导丝',
    'Hemoclips': '止血夹',
    'Hernia Meshes': '疝修补片',
    'Non Absorbable Sutures': '非可吸收缝合线',
    'Polymer Clips': '高分子结扎夹',
    'Snares': '圈套器',
    'Staplers': '吻合器',
    'Trocars': '穿刺器',
    'Ultrasonic Shears': '超声刀',
    'Veress Needles': '气腹针'
  };

  for (const [en, zh] of Object.entries(productNames)) {
    // Match h3.product-name with this text
    const re = new RegExp(`(<h3 class="product-name">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(</h3>)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Product card descriptions (p.product-desc) ---
  const productDescs = {
    'Target generic search intent': '目标通用搜索意图',
    'Dominate this category with a "Bottom Price + Ready Stock" (底价+现货) model to displace incumbent suppliers': '以「底价+现货」模式主导该品类，替代现有供应商',
    'Stable volume-driver': '稳定的放量产品',
    'Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital': '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出',
    'Material-first messaging': '以材料为核心的信息传递',
    'Comprehensive SKU Matrix': '全面的 SKU 矩阵',
    'Ecosystem capture': '生态系统锁定',
    'Focus on "Cold Snare" as a safety-first, electricity-free alternative for rapid outpatient procedures': '聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案',
    'Ultimate SKU Snipe (终极 SKU 狙击战)': '终极 SKU 狙击战',
    'Clinically validated medical device with transparent manufacturing and evidence-backed performance.': '经临床验证的医疗器械，制造透明、性能有循证支持。',
    '"Compatibility War" (兼容性战争)': '兼容性战争',
    'Volume standard': '放量标杆产品'
  };

  for (const [en, zh] of Object.entries(productDescs)) {
    // Match the first <p class="product-desc"> with this exact text (not the secondary one)
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<p class="product-desc">)${escaped}(</p>)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Product card category labels ---
  const categoryLabels = {
    'Sutures': '缝合线',
    'Instrumentation': '器械',
    'Medical Device': '医疗器械',
    'Clips': '夹子',
    'Access': '通路'
  };

  for (const [en, zh] of Object.entries(categoryLabels)) {
    const re = new RegExp(`(<span class="product-category">)${en}(</span>)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Competitor table data cells ---
  const competitorData = [
    { en: 'Ventralight (Hernia Mesh), PowerPICC (Catheters).', zh: 'Ventralight（疝修补片）、PowerPICC（导管）。' },
    { en: 'Market inefficiency', zh: '市场低效' },
    { en: 'Transparent manufacturing', zh: '透明制造' },
    { en: 'Jagwire (Guidewires), Resolution Clip (Hemoclips), SpyGlass (Endoscopy).', zh: 'Jagwire（导丝）、Resolution Clip（止血夹）、SpyGlass（内窥镜）。' },
    { en: 'Multiple lines', zh: '多产品线' },
    { en: 'Opaque', zh: '不透明' },
    { en: 'Verified', zh: '已验证' },
    { en: 'Amplatz (Guidewires), Bakri Balloon (OB/GYN), Snares.', zh: 'Amplatz（导丝）、Bakri 球囊（妇产科）、圈套器。' },
    { en: 'Vicryl (Sutures), Harmonic Scalpel (Ultrasonic Shears), Echelon (Staplers).', zh: 'Vicryl（缝合线）、Harmonic Scalpel（超声刀）、Echelon（吻合器）。' },
    { en: 'Endo GIA (Staplers), Sonicision (Ultrasonic Shears), Ligasure (Vessel Sealing).', zh: 'Endo GIA（吻合器）、Sonicision（超声刀）、Ligasure（血管闭合）。' },
    { en: 'QuickClip (Hemoclips), Single-Use Biopsy Forceps, Cold Snares.', zh: 'QuickClip（止血夹）、一次性活检钳、冷圈套器。' },
    { en: 'Hem-o-lok (Polymer Clips), Weck (Surgical Clips), LMA (Airway Management).', zh: 'Hem-o-lok（高分子结扎夹）、Weck（外科夹）、LMA（气道管理）。' },
    { en: 'Pinnacle (Access Sheaths), Zebra (Guidewires), Radifocus (Guidewires).', zh: 'Pinnacle（通路鞘）、Zebra（导丝）、Radifocus（导丝）。' }
  ];

  for (const { en, zh } of competitorData) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match inside td tags
    const re = new RegExp(`(>\\s*)${escaped}(\\s*<)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Specs table data cells ---
  const specsData = {
    'Ethicon (Vicryl, Monocryl)': 'Ethicon（Vicryl、Monocryl）',
    'Olympus, ConMed': 'Olympus、ConMed',
    'Terumo, Boston Scientific': 'Terumo、Boston Scientific',
    'OEM Equivalent': 'OEM 等效',
    'Bard (BD), Ethicon': 'Bard（BD）、Ethicon',
    'Ethicon (Prolene, Ethilon)': 'Ethicon（Prolene、Ethilon）',
    'Teleflex (Hem-o-lok)': 'Teleflex（Hem-o-lok）',
    'Olympus, Cook Medical': 'Olympus、Cook Medical',
    'Ethicon, Medtronic': 'Ethicon、Medtronic',
    'Ethicon (Harmonic Scalpel)': 'Ethicon（Harmonic Scalpel）'
  };

  for (const [en, zh] of Object.entries(specsData)) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(<td>)${escaped}(</td>)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Category cards ---
  const categoryNames = {
    'Access': '通路',
    'Clips': '夹子',
    'Instrumentation': '器械',
    'Intelligence': '智能',
    'Minimally Invasive Surgery': '微创手术',
    'NomoFlow Solutions': 'NomoFlow 解决方案',
    'Sutures': '缝合线',
    'Wound Closure': '伤口闭合'
  };

  for (const [en, zh] of Object.entries(categoryNames)) {
    // Category card titles: <div style="...font-weight:600...">Access</div>
    const re = new RegExp(`(font-weight:600;color:var\\(--rot-slate-heavy\\);">)${en}(</div>)`, 'g');
    if (re.test(html)) {
      html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
      count++;
    }
  }

  // --- Material cards ---
  // PGA Material
  html = html.replace(
    /(<div style="font-family:var\(--rot-font-display\);font-size:16px;font-weight:600;color:var\(--rot-slate-heavy\);margin-bottom:8px;">)PGA Material(<\/div>)/,
    '$1<span data-lang="en">PGA Material</span><span data-lang="zh">PGA 材料</span>$2'
  ); count++;

  html = html.replace(
    /(<p style="font-size:14px;color:var\(--rot-slate-core\);margin-bottom:12px;">)A biodegradable, thermoplastic polymer and the simplest linear, aliphatic polyester\. Used extensively in synthetic absorbable sutures\.(<\/p>)/,
    '$1<span data-lang="en">A biodegradable, thermoplastic polymer and the simplest linear, aliphatic polyester. Used extensively in synthetic absorbable sutures.</span><span data-lang="zh">一种可生物降解的热塑性聚合物，是最简单的线性脂肪族聚酯。广泛用于合成可吸收缝合线。</span>$2'
  ); count++;

  html = html.replace(
    /(Absorption Method: Hydrolysis\.)/,
    '<span data-lang="en">$1</span><span data-lang="zh">吸收方式：水解。</span>'
  ); count++;

  html = html.replace(
    /(Tensile Strength Retention: High for the first 14-21 days\.)/,
    '<span data-lang="en">$1</span><span data-lang="zh">抗拉强度保持率：前 14-21 天较高。</span>'
  ); count++;

  // Polypropylene Material
  html = html.replace(
    /(<div style="font-family:var\(--rot-font-display\);font-size:16px;font-weight:600;color:var\(--rot-slate-heavy\);margin-bottom:8px;">)Polypropylene Material(<\/div>)/,
    '$1<span data-lang="en">Polypropylene Material</span><span data-lang="zh">聚丙烯材料</span>$2'
  ); count++;

  html = html.replace(
    /(<p style="font-size:14px;color:var\(--rot-slate-core\);margin-bottom:12px;">)A rugged and unusually resistant thermoplastic polymer\. In surgery, it is used for non-absorbable monofilament sutures and hernia meshes\.(<\/p>)/,
    '$1<span data-lang="en">A rugged and unusually resistant thermoplastic polymer. In surgery, it is used for non-absorbable monofilament sutures and hernia meshes.</span><span data-lang="zh">一种坚固且耐腐蚀的热塑性聚合物。在外科手术中，用于非可吸收单丝缝合线和疝修补片。</span>$2'
  ); count++;

  html = html.replace(
    /(Durability: Permanent wound support\.)/,
    '<span data-lang="en">$1</span><span data-lang="zh">耐久性：永久性伤口支撑。</span>'
  ); count++;

  html = html.replace(
    /(Reactivity: Extremely low tissue reaction\.)/,
    '<span data-lang="en">$1</span><span data-lang="zh">反应性：极低的组织反应。</span>'
  ); count++;

  // NomoFlow Technology
  html = html.replace(
    /(NomoFlow Technology <span style="font-family:var\(--rot-font-mono\);font-size:11px;color:var\(--rot-terminal-green\);background:rgba\(74,222,128,0\.1\);padding:2px 6px;border-radius:2px;">)TECHNOLOGY(<\/span>)/,
    '<span data-lang="en">$1TECHNOLOGY$2</span><span data-lang="zh">NomoFlow 技术 <span style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-terminal-green);background:rgba(74,222,128,0.1);padding:2px 6px;border-radius:2px;">技术</span></span>'
  ); count++;

  html = html.replace(
    /(<p style="font-size:14px;color:var\(--rot-slate-core\);">)NomoFlow™ is a closed-loop control platform designed to reduce batch variability through high-frequency parameter compensation\. 1\. Sensing: 150 nodes sample variables \(Thermal, Pressure, Flow\) at 1000(<\/p>)/,
    '$1<span data-lang="en">NomoFlow™ is a closed-loop control platform designed to reduce batch variability through high-frequency parameter compensation. 1. Sensing: 150 nodes sample variables (Thermal, Pressure, Flow) at 1000</span><span data-lang="zh">NomoFlow™ 是一个闭环控制平台，通过高频参数补偿减少批次变异性。1. 感知：150 个节点以 1000 Hz 采样变量（温度、压力、流量）</span>$2'
  ); count++;

  fs.writeFileSync(file, html, 'utf8');
  console.log(`✅ index.html: ${count} translation blocks fixed`);
}

// ============================================================
// SUBPAGE FIXES
// ============================================================

// Product-specific translations
const PRODUCT_TRANSLATIONS = {
  'absorbable-sutures': {
    name: '可吸收缝合线',
    overview: '合成可吸收外科缝合线（如 PGA、PGLA）。设计用于提供可靠的伤口支撑，在愈合期间保持张力，然后通过水解被人体安全吸收。',
    marketStrategy: '目标通用搜索意图',
    targetBrands: 'Ethicon（Vicryl、Monocryl）',
    specs: [
      { en: 'Structure:', zh: '结构：', enVal: 'Braided / Monofilament.', zhVal: '编织 / 单丝。' },
      { en: 'Coating:', zh: '涂层：', enVal: 'Polycaprolactone and Calcium Stearate.', zhVal: '聚己内酯和硬脂酸钙。' },
      { en: 'Absorption Time:', zh: '吸收时间：', enVal: '~60-90 days (complete).', zhVal: '约 60-90 天（完全吸收）。' }
    ]
  },
  'biopsy-forceps': {
    name: '活检钳',
    overview: '一次性活检钳是内镜室的标准消耗品。通过「底价+现货」模式主导该品类，替代现有供应商。',
    marketStrategy: '以「底价+现货」模式主导该品类，替代现有供应商',
    targetBrands: 'Olympus、ConMed',
    specs: [
      { en: 'Jaw Design:', zh: '钳口设计：', enVal: 'Oval / Rat-tooth / Alligator variants.', zhVal: '椭圆形 / 鼠齿 / 鳄口等多种型号。' },
      { en: 'Compatibility:', zh: '兼容性：', enVal: 'Universal 2.0mm / 2.6mm working channel.', zhVal: '通用 2.0mm / 2.6mm 工作通道。' }
    ]
  },
  'guidewires': {
    name: '导丝',
    overview: '用于消化内科、泌尿外科和外周血管通路的高性能导丝。稳定的放量产品。',
    marketStrategy: '稳定的放量产品',
    targetBrands: 'Terumo、Boston Scientific',
    specs: [
      { en: 'Core Material:', zh: '芯丝材料：', enVal: 'Nitinol core for superior torque control.', zhVal: '镍钛合金芯丝，提供卓越的扭矩控制。' },
      { en: 'Coating:', zh: '涂层：', enVal: 'Hydrophilic / PTFE options.', zhVal: '亲水 / PTFE 可选。' },
      { en: 'Tip Configurations:', zh: '头端构型：', enVal: 'Straight, J-tip, Angled.', zhVal: '直头、J 头、成角头。' },
      { en: 'Lengths:', zh: '长度：', enVal: '260cm, 450cm (exchange length).', zhVal: '260cm、450cm（交换长度）。' }
    ]
  },
  'hemoclips': {
    name: '止血夹',
    overview: '全面的止血解决方案，覆盖内镜（可旋转）和腹腔镜（高分子）应用场景。',
    marketStrategy: '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出',
    targetBrands: null,
    specs: [
      { en: 'Rotatable Hemoclips:', zh: '可旋转止血夹：', enVal: '360° bidirectional rotation provides precise lesion targeting. High-clamping force ensures effective immediate hemostasis.', zhVal: '360° 双向旋转，精确定位病灶。高夹持力确保有效的即时止血。' },
      { en: 'Polymer Clips:', zh: '高分子结扎夹：', enVal: 'Integrated locking mechanism with tactile "click" feedback. Atraumatic teeth prevent vessel slippage.', zhVal: '集成锁定机制，带触觉「咔嗒」反馈。无创齿防止血管滑脱。' },
      { en: 'Reference Standard:', zh: '参考标准：', enVal: 'Equivalent to Teleflex Hem-o-lok and Olympus QuickClip.', zhVal: '等效于 Teleflex Hem-o-lok 和 Olympus QuickClip。' },
      { en: 'Revenue Capture:', zh: '收入锁定：', enVal: 'Targets the highest CPC procurement intent categories.', zhVal: '锁定 CPC 采购意向最高的品类。' },
      { en: 'Free-Applier Strategy:', zh: '免费施夹器策略：', enVal: 'Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital.', zhVal: '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出。' },
      { en: 'Market Arbitrage:', zh: '市场套利：', enVal: 'Capture of premium market share from high-cost incumbents through verified technical parity.', zhVal: '通过经验证的技术对等性，从高成本现有企业手中夺取高端市场份额。' },
      { en: 'Biocompatibility:', zh: '生物相容性：', enVal: 'Medical Grade POM/PC, certified for long-term implantation.', zhVal: '医疗级 POM/PC，经认证可用于长期植入。' },
      { en: 'MRI Safety:', zh: 'MRI 安全性：', enVal: 'Non-metallic, MRI-conditional (verified via ISO 10993).', zhVal: '非金属材质，MRI 条件安全（经 ISO 10993 验证）。' },
      { en: 'Verification ID:', zh: '验证 ID：', enVal: 'V-HC-2025-04 (Closure security test).', zhVal: 'V-HC-2025-04（闭合安全性测试）。' }
    ]
  },
  'hernia-meshes': {
    name: '疝修补片',
    overview: '用于疝修补术中软组织加固的外科补片。以材料为核心的信息传递。',
    marketStrategy: '以材料为核心的信息传递',
    targetBrands: 'Bard（BD）、Ethicon',
    specs: [
      { en: 'Material:', zh: '材料：', enVal: 'Polypropylene (monofilament knit).', zhVal: '聚丙烯（单丝编织）。' },
      { en: 'Pore Size:', zh: '孔径：', enVal: '> 75μm (optimized for tissue ingrowth).', zhVal: '> 75μm（优化组织长入）。' }
    ]
  },
  'non-absorbable-sutures': {
    name: '非可吸收缝合线',
    overview: '永久性外科缝合线（如聚丙烯、尼龙）。适用于血管、心脏和骨科手术。',
    marketStrategy: '全面的 SKU 矩阵',
    targetBrands: 'Ethicon（Prolene、Ethilon）',
    specs: [
      { en: 'Materials:', zh: '材料：', enVal: 'Polypropylene, Nylon, Polyester.', zhVal: '聚丙烯、尼龙、聚酯。' },
      { en: 'Coating:', zh: '涂层：', enVal: 'Silicone or uncoated options.', zhVal: '硅胶涂层或无涂层可选。' }
    ]
  },
  'polymer-clips': {
    name: '高分子结扎夹',
    overview: '用于血管和组织束高安全性闭合的不可吸收高分子结扎夹。生态系统锁定。',
    marketStrategy: '生态系统锁定',
    targetBrands: 'Teleflex（Hem-o-lok）',
    specs: [
      { en: 'Locking Mechanism:', zh: '锁定机制：', enVal: 'Integrated click-lock with visual confirmation.', zhVal: '集成咔嗒锁定，带视觉确认。' },
      { en: 'Size Range:', zh: '规格范围：', enVal: 'M, ML, L, XL for vessel/tissue bundles.', zhVal: 'M、ML、L、XL，适用于血管/组织束。' },
      { en: 'Clip Material:', zh: '夹子材料：', enVal: 'Medical-grade polymer (non-absorbable).', zhVal: '医疗级高分子（不可吸收）。' }
    ]
  },
  'snares': {
    name: '圈套器',
    overview: '用于内镜下息肉切除术的冷圈套器和热圈套器。遵循全球向「冷圈套息肉切除术」转变的趋势。',
    marketStrategy: '聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案',
    targetBrands: 'Olympus、Cook Medical',
    specs: [
      { en: 'Cold Snare:', zh: '冷圈套器：', enVal: 'Thin-wire design for clean transection without electrocautery.', zhVal: '细丝设计，无需电凝即可干净切除。' },
      { en: 'Hot Snare:', zh: '热圈套器：', enVal: 'Compatible with all standard electrosurgical units.', zhVal: '兼容所有标准电外科设备。' },
      { en: 'Sizes:', zh: '规格：', enVal: '10mm, 15mm, 25mm loop diameter.', zhVal: '10mm、15mm、25mm 圈套直径。' }
    ]
  },
  'staplers': {
    name: '吻合器',
    overview: '外科吻合器（腹腔镜和圆形）是技术含量高、监管严格的产品。终极 SKU 狙击战。',
    marketStrategy: '终极 SKU 狙击战',
    targetBrands: 'Ethicon、Medtronic',
    specs: [
      { en: 'Types:', zh: '类型：', enVal: 'Laparoscopic Linear, Endoscopic Linear, Circular.', zhVal: '腹腔镜直线型、内镜直线型、圆形。' },
      { en: 'Cartridge Colors:', zh: '钉仓颜色：', enVal: 'White (vascular), Blue (standard), Green (thick tissue).', zhVal: '白色（血管）、蓝色（标准）、绿色（厚组织）。' },
      { en: 'Staple Heights:', zh: '钉高：', enVal: '2.0mm - 4.2mm depending on tissue type.', zhVal: '2.0mm - 4.2mm，根据组织类型选择。' }
    ]
  },
  'trocars': {
    name: '穿刺器',
    overview: '高精度腹腔镜通路器械。通过 NomoFlow 技术实现确定性制造。',
    marketStrategy: null,
    targetBrands: null,
    specs: [
      { en: 'Low-Friction Entry:', zh: '低摩擦进入：', enVal: 'Verified reduction in insertion force (< 15.0 N) minimizes abdominal wall trauma.', zhVal: '经验证的插入力降低（< 15.0 N），最大限度减少腹壁创伤。' },
      { en: 'Visual Stability:', zh: '视觉稳定性：', enVal: 'Proprietary dual-seal valve maintains pneumoperitoneum during high-frequency instrument exchange, preventing "scope-fogging" and loss of visualization.', zhVal: '专利双密封阀在高频器械交换时维持气腹，防止「镜面起雾」和视野丧失。' },
      { en: 'Reference Standard:', zh: '参考标准：', enVal: '1:1 tactile equivalence to Ethicon B5LT and Applied_Medical CFF03.', zhVal: '与 Ethicon B5LT 和 Applied_Medical CFF03 的 1:1 触觉等效。' },
      { en: '40% Cost Reduction:', zh: '40% 成本降低：', enVal: 'Direct replacement of OEM SKUs with no loss in clinical performance.', zhVal: '直接替代 OEM SKU，临床性能无损失。' },
      { en: 'Simplified Inventory:', zh: '简化库存：', enVal: 'Universal compatibility reduces the need for multiple vendor SKU variants.', zhVal: '通用兼容性减少了对多个供应商 SKU 变体的需求。' },
      { en: 'ROI Projection:', zh: 'ROI 预测：', enVal: 'High-frequency consumable. Estimated annual savings for a standard ASC: $12,000 - $18,000.', zhVal: '高频消耗品。标准 ASC 预计年节省：$12,000 - $18,000。' },
      { en: 'FDA 510(k):', zh: 'FDA 510(k)：', enVal: 'Registered via OBL (Relabeler) Protocol VS-TR-21.', zhVal: '通过 OBL（再贴标签商）协议 VS-TR-21 注册。' },
      { en: 'ISO 13485:', zh: 'ISO 13485：', enVal: 'Manufacturing lot-traceability integrated into NomoFlow_Technology ledger.', zhVal: '制造批次可追溯性集成到 NomoFlow 技术账本中。' },
      { en: 'Verification ID:', zh: '验证 ID：', enVal: 'V-TR-2025-01 (Air-tightness certification).', zhVal: 'V-TR-2025-01（气密性认证）。' }
    ]
  },
  'ultrasonic-shears': {
    name: '超声刀',
    overview: '用于同时切割和凝固组织的有源能量设备。兼容性战争。',
    marketStrategy: '兼容性战争',
    targetBrands: 'Ethicon（Harmonic Scalpel）',
    specs: [
      { en: 'Frequency:', zh: '频率：', enVal: '55.5 kHz ultrasonic vibration.', zhVal: '55.5 kHz 超声振动。' },
      { en: 'Blade Design:', zh: '刀头设计：', enVal: 'Curved blade with active jaw for precise dissection.', zhVal: '弯曲刀头带主动钳口，用于精确解剖。' },
      { en: 'Generator Compatibility:', zh: '发生器兼容性：', enVal: 'Compatible with Ethicon Harmonic and Medtronic Sonicision generators.', zhVal: '兼容 Ethicon Harmonic 和 Medtronic Sonicision 发生器。' },
      { en: 'Vessel Sealing:', zh: '血管闭合：', enVal: 'Seals vessels up to 7mm diameter.', zhVal: '可闭合直径达 7mm 的血管。' }
    ]
  },
  'veress-needles': {
    name: '气腹针',
    overview: '用于腹腔镜手术中建立气腹的一次性气腹针。放量标杆产品。',
    marketStrategy: '放量标杆产品',
    targetBrands: 'Ethicon',
    specs: [
      { en: 'Safety Mechanism:', zh: '安全机制：', enVal: 'Spring-loaded blunt obturator with click confirmation.', zhVal: '弹簧加载钝头闭孔器，带咔嗒确认。' },
      { en: 'Length Options:', zh: '长度选择：', enVal: '120mm, 150mm (bariatric).', zhVal: '120mm、150mm（减重手术用）。' },
      { en: 'Insufflation:', zh: '注气：', enVal: 'Luer-lock connector, high-flow design.', zhVal: 'Luer-lock 接头，高流量设计。' }
    ]
  }
};

function fixSubpages() {
  const pagesDir = path.join(OUTPUT_DIR, 'pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let count = 0;

    // --- Fix breadcrumbs ---
    // Replace bare "Home" link text
    html = html.replace(
      /(<a href="\/output\/">)Home(<\/a>)/g,
      '$1<span data-lang="en">Home</span><span data-lang="zh">首页</span>$2'
    );

    // Replace bare "Products" link text in breadcrumb
    html = html.replace(
      /(<a href="\/output\/#products">)Products(<\/a>)/g,
      '$1<span data-lang="en">Products</span><span data-lang="zh">产品中心</span>$2'
    );

    // --- Fix CTA button ---
    html = html.replace(
      /(<a href="\/output\/" class="cta-button">)Request Quote(<\/a>)/g,
      '$1<span data-lang="en">Request Quote</span><span data-lang="zh">申请报价</span>$2'
    );

    // --- Fix "Sitemap" link ---
    html = html.replace(
      /(<a href="\/output\/sitemap\.xml">)Sitemap(<\/a>)/g,
      '$1<span data-lang="en">Sitemap</span><span data-lang="zh">网站地图</span>$2'
    );

    // --- Fix footer "Home" link ---
    html = html.replace(
      /(<a href="\/output\/" data-lang="en">)Home(<\/a><a href="\/output\/" data-lang="zh">)首页(<\/a> \| <a href="\/output\/sitemap\.xml">)Sitemap(<\/a>)/g,
      '$1Home$2首页$3<span data-lang="en">Sitemap</span><span data-lang="zh">网站地图</span>$4'
    );

    // --- Product page specific fixes ---
    const slug = file.replace('.html', '');
    const tr = PRODUCT_TRANSLATIONS[slug];

    if (tr) {
      // Fix overview paragraph (replace fake zh translation with real one)
      if (tr.overview) {
        // Find the overview <p> with data-lang and replace zh content
        const overviewRe = /(<p><span data-lang="en">)(.*?)(<\/span><span data-lang="zh">)(.*?)(<\/span><\/p>)/;
        const match = html.match(overviewRe);
        if (match && match[2] !== tr.overview && match[4] === match[2]) {
          // zh is a copy of en — replace with real translation
          html = html.replace(overviewRe, `$1${match[2]}$3${tr.overview}$5`);
          count++;
        }
      }

      // Fix Market Strategy paragraph (wrap bare text)
      if (tr.marketStrategy) {
        const msRe = /(<h2><span data-lang="en">Market Strategy<\/span><span data-lang="zh">市场策略<\/span><\/h2>)(<p>)(.*?)(<\/p>)/;
        const msMatch = html.match(msRe);
        if (msMatch) {
          html = html.replace(msRe, `$1$2<span data-lang="en">${msMatch[3]}</span><span data-lang="zh">${tr.marketStrategy}</span>$4`);
          count++;
        }
      }

      // Fix Target Brands paragraph (wrap bare text)
      if (tr.targetBrands) {
        const tbRe = /(<h2><span data-lang="en">Target Brands<\/span><span data-lang="zh">目标品牌<\/span><\/h2>)(<p>)(.*?)(<\/p>)/;
        const tbMatch = html.match(tbRe);
        if (tbMatch) {
          html = html.replace(tbRe, `$1$2<span data-lang="en">${tbMatch[3]}</span><span data-lang="zh">${tr.targetBrands}</span>$4`);
          count++;
        }
      }

      // Fix Technical Specifications <li> items
      if (tr.specs) {
        for (const spec of tr.specs) {
          const enFull = `<strong>${spec.en}</strong> ${spec.enVal}`;
          const zhFull = `<strong>${spec.zh}</strong> ${spec.zhVal}`;
          const escaped = enFull.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const liRe = new RegExp(`(<li>)${escaped}(</li>)`);
          if (liRe.test(html)) {
            html = html.replace(liRe, `$1<span data-lang="en">${enFull}</span><span data-lang="zh">${zhFull}</span>$2`);
            count++;
          }
        }
      }

      // Fix spec-value in sidebar
      const specValueMap = {
        'Sutures': '缝合线',
        'Instrumentation': '器械',
        'Medical Device': '医疗器械',
        'Clips': '夹子',
        'Access': '通路',
        'PGA Material': 'PGA 材料',
        'Polypropylene Material': '聚丙烯材料',
        'FDA 510(k) / CE MDR': 'FDA 510(k) / CE MDR'
      };

      for (const [en, zh] of Object.entries(specValueMap)) {
        if (en === 'FDA 510(k) / CE MDR') continue; // Regulatory acronyms stay as-is
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<span class="spec-value">)${escaped}(<\/span>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix Related Entities links
      const entityMap = {
        'Sutures': '缝合线',
        'Wound Closure': '伤口闭合',
        'PGA Material': 'PGA 材料',
        'Polypropylene Material': '聚丙烯材料',
        'Ethicon': 'Ethicon',
        'Instrumentation': '器械',
        'Minimally Invasive Surgery': '微创手术',
        'Olympus': 'Olympus',
        'Teleflex': 'Teleflex',
        'Bard': 'Bard',
        'Terumo': 'Terumo',
        'Boston Scientific': 'Boston Scientific',
        'Cook Medical': 'Cook Medical',
        'Medtronic': 'Medtronic',
        'NomoFlow Technology': 'NomoFlow 技术',
        'Access': '通路',
        'Trocars': '穿刺器',
        'Biopsy Forceps': '活检钳',
        'Snares': '圈套器',
        'Hemoclips': '止血夹',
        'Guidewires': '导丝',
        'Staplers': '吻合器',
        'Polymer Clips': '高分子结扎夹',
        'Hernia Meshes': '疝修补片',
        'Ultrasonic Shears': '超声刀',
        'Veress Needles': '气腹针',
        'Absorbable Sutures': '可吸收缝合线',
        'Non Absorbable Sutures': '非可吸收缝合线',
        'Clips': '夹子',
        'Sutures': '缝合线'
      };

      // Fix related list links
      for (const [en, zh] of Object.entries(entityMap)) {
        if (en === zh) continue; // Skip if same
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<li><a href="[^"]*">)${escaped}(<\/a><\/li>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Category page fixes ---
    if (file.startsWith('category-')) {
      // Fix h1 page title
      const catTitleMap = {
        'Access': '通路',
        'Clips': '夹子',
        'Instrumentation': '器械',
        'Intelligence': '智能',
        'Minimally Invasive Surgery': '微创手术',
        'NomoFlow Solutions': 'NomoFlow 解决方案',
        'Sutures': '缝合线',
        'Wound Closure': '伤口闭合'
      };

      for (const [en, zh] of Object.entries(catTitleMap)) {
        const re = new RegExp(`(<h1>)${en}(<\/h1>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix product cards in category pages
      for (const [en, zh] of Object.entries(productNames_global)) {
        const re = new RegExp(`(<h3 class="product-name">)${en}(<\/h3>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix product descriptions in category pages
      for (const [en, zh] of Object.entries(productDescs_global)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<p class="product-desc">)${escaped}(<\/p>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix category links at bottom
      for (const [en, zh] of Object.entries(catTitleMap)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(font-weight:600;color:var\\(--rot-slate-heavy\\);">)${escaped}(<\/div>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Competitor page fixes ---
    if (file.startsWith('competitor-')) {
      // Fix h1
      const compName = file.replace('competitor-', '').replace('.html', '');
      const compTitleRe = /(<h1>)(.*?)(<\/h1>)/;
      const compMatch = html.match(compTitleRe);
      if (compMatch) {
        // Company names generally stay the same in Chinese, but add wrapper
        html = html.replace(compTitleRe, `$1<span data-lang="en">${compMatch[2]}</span><span data-lang="zh">${compMatch[2]}</span>$3`);
        count++;
      }
    }

    // --- Entity page fixes ---
    if (file.startsWith('entity-')) {
      // Fix h1
      const entTitleRe = /(<h1>)(.*?)(<\/h1>)/;
      const entMatch = html.match(entTitleRe);
      if (entMatch) {
        const entNames = {
          'Compliance Framework': '合规框架',
          'Endoscopic Procedures': '内镜手术',
          'Ethicon B5LT': 'Ethicon B5LT',
          'Hangzhou Sode': '杭州苏迪',
          'Johnson CDH29P': 'J&J CDH29P',
          'Laparoscopic Surgery': '腹腔镜手术',
          'Teleflex Hem-o-lok': 'Teleflex Hem-o-lok',
          'ViaSurg': 'ViaSurg'
        };
        const zhName = entNames[entMatch[2]] || entMatch[2];
        html = html.replace(entTitleRe, `$1<span data-lang="en">${entMatch[2]}</span><span data-lang="zh">${zhName}</span>$3`);
        count++;
      }
    }

    // --- Material page fixes ---
    if (file.startsWith('material-')) {
      const matTitleRe = /(<h1>)(.*?)(<\/h1>)/;
      const matMatch = html.match(matTitleRe);
      if (matMatch) {
        const matNames = {
          'PGA Material': 'PGA 材料',
          'Polypropylene Material': '聚丙烯材料'
        };
        const zhName = matNames[matMatch[2]] || matMatch[2];
        html = html.replace(matTitleRe, `$1<span data-lang="en">${matMatch[2]}</span><span data-lang="zh">${zhName}</span>$3`);
        count++;
      }
    }

    // --- Tech page fixes ---
    if (file.startsWith('tech-')) {
      const techTitleRe = /(<h1>)(.*?)(<\/h1>)/;
      const techMatch = html.match(techTitleRe);
      if (techMatch) {
        html = html.replace(techTitleRe, `$1<span data-lang="en">${techMatch[2]}</span><span data-lang="zh">NomoFlow 技术</span>$3`);
        count++;
      }
    }

    fs.writeFileSync(filePath, html, 'utf8');
    if (count > 0) {
      console.log(`✅ ${file}: ${count} translation blocks fixed`);
    }
  }
}

// Global maps for category pages
const productNames_global = {
  'Absorbable Sutures': '可吸收缝合线',
  'Biopsy Forceps': '活检钳',
  'Guidewires': '导丝',
  'Hemoclips': '止血夹',
  'Hernia Meshes': '疝修补片',
  'Non Absorbable Sutures': '非可吸收缝合线',
  'Polymer Clips': '高分子结扎夹',
  'Snares': '圈套器',
  'Staplers': '吻合器',
  'Trocars': '穿刺器',
  'Ultrasonic Shears': '超声刀',
  'Veress Needles': '气腹针'
};

const productDescs_global = {
  'Target generic search intent': '目标通用搜索意图',
  'Dominate this category with a "Bottom Price + Ready Stock" (底价+现货) model to displace incumbent suppliers': '以「底价+现货」模式主导该品类，替代现有供应商',
  'Stable volume-driver': '稳定的放量产品',
  'Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital': '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出',
  'Material-first messaging': '以材料为核心的信息传递',
  'Comprehensive SKU Matrix': '全面的 SKU 矩阵',
  'Ecosystem capture': '生态系统锁定',
  'Focus on "Cold Snare" as a safety-first, electricity-free alternative for rapid outpatient procedures': '聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案',
  'Ultimate SKU Snipe (终极 SKU 狙击战)': '终极 SKU 狙击战',
  'Clinically validated medical device with transparent manufacturing and evidence-backed performance.': '经临床验证的医疗器械，制造透明、性能有循证支持。',
  '"Compatibility War" (兼容性战争)': '兼容性战争',
  'Volume standard': '放量标杆产品'
};

// Run
console.log('🔧 Fixing i18n for all output pages...\n');
fixIndex();
fixSubpages();
console.log('\n✅ Done! All pages updated with proper i18n support.');
