const fs = require('fs');
const path = require('path');

const DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

// Complete translation data for each product
const DATA = {
  'absorbable-sutures': {
    overview: '合成可吸收外科缝合线（如 PGA、PGLA）。设计用于提供可靠的伤口支撑，在愈合期间保持张力，然后通过水解被人体安全吸收。',
    ms: '目标通用搜索意图',
    tb: 'Ethicon（Vicryl、Monocryl）',
    specs: [
      ['Structure:', '结构：', 'Braided / Monofilament.', '编织 / 单丝。'],
      ['Coating:', '涂层：', 'Polycaprolactone and Calcium Stearate.', '聚己内酯和硬脂酸钙。'],
      ['Absorption Time:', '吸收时间：', '~60-90 days (complete).', '约 60-90 天（完全吸收）。']
    ]
  },
  'biopsy-forceps': {
    overview: '一次性活检钳是内镜室的标准消耗品。通过「底价+现货」模式主导该品类，替代现有供应商。',
    ms: '以「底价+现货」模式主导该品类，替代现有供应商',
    tb: 'Olympus、ConMed',
    specs: [
      ['Jaw Design:', '钳口设计：', 'Oval / Rat-tooth / Alligator variants.', '椭圆形 / 鼠齿 / 鳄口等多种型号。'],
      ['Compatibility:', '兼容性：', 'Universal 2.0mm / 2.6mm working channel.', '通用 2.0mm / 2.6mm 工作通道。']
    ]
  },
  'guidewires': {
    overview: '用于消化内科、泌尿外科和外周血管通路的高性能导丝。稳定的放量产品。',
    ms: '稳定的放量产品',
    tb: 'Terumo、Boston Scientific',
    specs: [
      ['Core Material:', '芯丝材料：', 'Nitinol core for superior torque control.', '镍钛合金芯丝，提供卓越的扭矩控制。'],
      ['Coating:', '涂层：', 'Hydrophilic / PTFE options.', '亲水 / PTFE 可选。'],
      ['Tip Configurations:', '头端构型：', 'Straight, J-tip, Angled.', '直头、J 头、成角头。'],
      ['Lengths:', '长度：', '260cm, 450cm (exchange length).', '260cm、450cm（交换长度）。']
    ]
  },
  'hemoclips': {
    overview: '全面的止血解决方案，覆盖内镜（可旋转）和腹腔镜（高分子）应用场景。',
    ms: '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出',
    tb: null,
    specs: [
      ['Rotatable Hemoclips:', '可旋转止血夹：', '360° bidirectional rotation provides precise lesion targeting. High-clamping force ensures effective immediate hemostasis.', '360° 双向旋转，精确定位病灶。高夹持力确保有效的即时止血。'],
      ['Polymer Clips:', '高分子结扎夹：', 'Integrated locking mechanism with tactile "click" feedback. Atraumatic teeth prevent vessel slippage.', '集成锁定机制，带触觉「咔嗒」反馈。无创齿防止血管滑脱。'],
      ['Reference Standard:', '参考标准：', 'Equivalent to Teleflex Hem-o-lok and Olympus QuickClip.', '等效于 Teleflex Hem-o-lok 和 Olympus QuickClip。'],
      ['Revenue Capture:', '收入锁定：', 'Targets the highest CPC procurement intent categories.', '锁定 CPC 采购意向最高的品类。'],
      ['Free-Applier Strategy:', '免费施夹器策略：', 'Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital.', '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出。'],
      ['Market Arbitrage:', '市场套利：', 'Capture of premium market share from high-cost incumbents through verified technical parity.', '通过经验证的技术对等性，从高成本现有企业手中夺取高端市场份额。'],
      ['Biocompatibility:', '生物相容性：', 'Medical Grade POM/PC, certified for long-term implantation.', '医疗级 POM/PC，经认证可用于长期植入。'],
      ['MRI Safety:', 'MRI 安全性：', 'Non-metallic, MRI-conditional (verified via ISO 10993).', '非金属材质，MRI 条件安全（经 ISO 10993 验证）。'],
      ['Verification ID:', '验证 ID：', 'V-HC-2025-04 (Closure security test).', 'V-HC-2025-04（闭合安全性测试）。']
    ]
  },
  'hernia-meshes': {
    overview: '用于疝修补术中软组织加固的外科补片。以材料为核心的信息传递。',
    ms: '以材料为核心的信息传递',
    tb: 'Bard（BD）、Ethicon',
    specs: [
      ['Material:', '材料：', 'Polypropylene (monofilament knit).', '聚丙烯（单丝编织）。'],
      ['Pore Size:', '孔径：', '> 75μm (optimized for tissue ingrowth).', '> 75μm（优化组织长入）。']
    ]
  },
  'non-absorbable-sutures': {
    overview: '永久性外科缝合线（如聚丙烯、尼龙）。适用于血管、心脏和骨科手术。',
    ms: '全面的 SKU 矩阵',
    tb: 'Ethicon（Prolene、Ethilon）',
    specs: [
      ['Materials:', '材料：', 'Polypropylene, Nylon, Polyester.', '聚丙烯、尼龙、聚酯。'],
      ['Coating:', '涂层：', 'Silicone or uncoated options.', '硅胶涂层或无涂层可选。']
    ]
  },
  'polymer-clips': {
    overview: '用于血管和组织束高安全性闭合的不可吸收高分子结扎夹。生态系统锁定。',
    ms: '生态系统锁定',
    tb: 'Teleflex（Hem-o-lok）',
    specs: [
      ['Locking Mechanism:', '锁定机制：', 'Integrated click-lock with visual confirmation.', '集成咔嗒锁定，带视觉确认。'],
      ['Size Range:', '规格范围：', 'M, ML, L, XL for vessel/tissue bundles.', 'M、ML、L、XL，适用于血管/组织束。'],
      ['Clip Material:', '夹子材料：', 'Medical-grade polymer (non-absorbable).', '医疗级高分子（不可吸收）。']
    ]
  },
  'snares': {
    overview: '用于内镜下息肉切除术的冷圈套器和热圈套器。遵循全球向「冷圈套息肉切除术」转变的趋势。',
    ms: '聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案',
    tb: 'Olympus、Cook Medical',
    specs: [
      ['Cold Snare:', '冷圈套器：', 'Thin-wire design for clean transection without electrocautery.', '细丝设计，无需电凝即可干净切除。'],
      ['Hot Snare:', '热圈套器：', 'Compatible with all standard electrosurgical units.', '兼容所有标准电外科设备。'],
      ['Sizes:', '规格：', '10mm, 15mm, 25mm loop diameter.', '10mm、15mm、25mm 圈套直径。']
    ]
  },
  'staplers': {
    overview: '外科吻合器（腹腔镜和圆形）是技术含量高、监管严格的产品。终极 SKU 狙击战。',
    ms: '终极 SKU 狙击战',
    tb: 'Ethicon、Medtronic',
    specs: [] // staplers might have 0 specs based on earlier check
  },
  'trocars': {
    overview: '高精度腹腔镜通路器械。通过 NomoFlow 技术实现确定性制造。',
    ms: null, // already fixed
    tb: null,
    specs: [
      ['Low-Friction Entry:', '低摩擦进入：', 'Verified reduction in insertion force (< 15.0 N) minimizes abdominal wall trauma.', '经验证的插入力降低（< 15.0 N），最大限度减少腹壁创伤。'],
      ['Visual Stability:', '视觉稳定性：', 'Proprietary dual-seal valve maintains pneumoperitoneum during high-frequency instrument exchange, preventing "scope-fogging" and loss of visualization.', '专利双密封阀在高频器械交换时维持气腹，防止「镜面起雾」和视野丧失。'],
      ['Reference Standard:', '参考标准：', '1:1 tactile equivalence to Ethicon B5LT and Applied_Medical CFF03.', '与 Ethicon B5LT 和 Applied_Medical CFF03 的 1:1 触觉等效。'],
      ['40% Cost Reduction:', '40% 成本降低：', 'Direct replacement of OEM SKUs with no loss in clinical performance.', '直接替代 OEM SKU，临床性能无损失。'],
      ['Simplified Inventory:', '简化库存：', 'Universal compatibility reduces the need for multiple vendor SKU variants.', '通用兼容性减少了对多个供应商 SKU 变体的需求。'],
      ['ROI Projection:', 'ROI 预测：', 'High-frequency consumable. Estimated annual savings for a standard ASC: $12,000 - $18,000.', '高频消耗品。标准 ASC 预计年节省：$12,000 - $18,000。'],
      ['FDA 510(k):', 'FDA 510(k)：', 'Registered via OBL (Relabeler) Protocol VS-TR-21.', '通过 OBL（再贴标签商）协议 VS-TR-21 注册。'],
      ['ISO 13485:', 'ISO 13485：', 'Manufacturing lot-traceability integrated into NomoFlow_Technology ledger.', '制造批次可追溯性集成到 NomoFlow 技术账本中。'],
      ['Verification ID:', '验证 ID：', 'V-TR-2025-01 (Air-tightness certification).', 'V-TR-2025-01（气密性认证）。']
    ]
  },
  'ultrasonic-shears': {
    overview: '用于同时切割和凝固组织的有源能量设备。兼容性战争。',
    ms: '兼容性战争',
    tb: 'Ethicon（Harmonic Scalpel）',
    specs: [
      ['Frequency:', '频率：', '55.5 kHz ultrasonic vibration.', '55.5 kHz 超声振动。'],
      ['Blade Design:', '刀头设计：', 'Curved blade with active jaw for precise dissection.', '弯曲刀头带主动钳口，用于精确解剖。'],
      ['Generator Compatibility:', '发生器兼容性：', 'Compatible with Ethicon Harmonic and Medtronic Sonicision generators.', '兼容 Ethicon Harmonic 和 Medtronic Sonicision 发生器。'],
      ['Vessel Sealing:', '血管闭合：', 'Seals vessels up to 7mm diameter.', '可闭合直径达 7mm 的血管。']
    ]
  },
  'veress-needles': {
    overview: '用于腹腔镜手术中建立气腹的一次性气腹针。配备弹簧加载钝头针芯，确保安全插入。',
    ms: '放量标杆产品',
    tb: 'Ethicon',
    specs: [
      ['Safety Mechanism:', '安全机制：', 'Spring-loaded retracting blunt tip.', '弹簧加载可回缩钝头。'],
      ['Length:', '长度：', '120mm / 150mm.', '120mm / 150mm。'],
      ['Luer Lock:', 'Luer 锁定：', 'High-flow stopcock for rapid CO2 insufflation.', '高流量旋塞阀，用于快速 CO2 注气。']
    ]
  }
};

let totalFixed = 0;

for (const [slug, data] of Object.entries(DATA)) {
  const file = path.join(DIR, slug + '.html');
  if (!fs.existsSync(file)) continue;

  let html = fs.readFileSync(file, 'utf8');
  let before = html;

  // 1. Fix overview: replace fake zh with real translation
  // Pattern: <p><span data-lang="en">EN</span><span data-lang="zh">EN_COPY</span></p>
  const overviewRe = /(<p><span data-lang="en">)(.*?)(<\/span><span data-lang="zh">)(.*?)(<\/span><\/p>)/;
  const m = html.match(overviewRe);
  if (m) {
    const enText = m[2];
    // Only replace if zh is same as en (fake translation) or if we have a real translation
    html = html.replace(overviewRe, '$1' + enText + '$3' + data.overview + '$5');
  }

  // 2. Fix Market Strategy: wrap bare <p> after the h2
  if (data.ms) {
    const msRe = /(市场策略<\/span><\/h2>)(<p>)(.*?)(<\/p>)/;
    const msM = html.match(msRe);
    if (msM && !msM[3].includes('data-lang')) {
      html = html.replace(msRe, '$1$2<span data-lang="en">' + msM[3] + '</span><span data-lang="zh">' + data.ms + '</span>$4');
    }
  }

  // 3. Fix Target Brands: wrap bare <p> after the h2
  if (data.tb) {
    const tbRe = /(目标品牌<\/span><\/h2>)(<p>)(.*?)(<\/p>)/;
    const tbM = html.match(tbRe);
    if (tbM && !tbM[3].includes('data-lang')) {
      html = html.replace(tbRe, '$1$2<span data-lang="en">' + tbM[3] + '</span><span data-lang="zh">' + data.tb + '</span>$4');
    }
  }

  // 4. Fix Technical Specifications <li> items
  for (const [enLabel, zhLabel, enVal, zhVal] of data.specs) {
    const enFull = '<strong>' + enLabel + '</strong> ' + enVal;
    const zhFull = '<strong>' + zhLabel + '</strong> ' + zhVal;
    // Escape for regex
    const escaped = enFull.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const liRe = new RegExp('(<li>)' + escaped + '(</li>)');
    if (liRe.test(html)) {
      html = html.replace(liRe, '$1<span data-lang="en">' + enFull + '</span><span data-lang="zh">' + zhFull + '</span>$2');
    }
  }

  if (html !== before) {
    fs.writeFileSync(file, html, 'utf8');
    const diff = html.split('data-lang').length - before.split('data-lang').length;
    console.log('✅ ' + slug + '.html: fixed');
    totalFixed++;
  } else {
    console.log('⏭️  ' + slug + '.html: no changes needed');
  }
}

console.log('\nTotal files fixed: ' + totalFixed);
