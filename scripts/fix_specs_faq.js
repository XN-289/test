const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

const translations = {
  'ultrasonic-shears.html': {
    specs: [
      { en: '<strong>Frequency:</strong> 55.5 kHz.', zh: '<strong>频率：</strong>55.5 kHz。' },
      { en: '<strong>Thermal Spread:</strong> &lt; 2.0 mm.', zh: '<strong>热扩散：</strong>&lt; 2.0 mm。' },
      { en: '<strong>Vessel Sealing:</strong> Reliable up to 5mm diameter.', zh: '<strong>血管闭合：</strong>可可靠闭合直径5mm以下血管。' },
      { en: '<strong>Handpiece:</strong> Reusable or Disposable variants available.', zh: '<strong>手柄：</strong>提供可重复使用和一次性两种型号。' },
    ],
    faq: [
      { enQ: 'What is harmonic scalpel ethicon?', zhQ: '什么是 harmonic scalpel ethicon？',
        enA: 'Ultrasonic Shears is classified under Instrumentation. It is designed for clinical reliability and precision in harmonic scalpel ethicon applications.',
        zhA: '超声刀归类于器械。专为 harmonic scalpel ethicon 应用场景的临床可靠性与精确性而设计。' },
      { enQ: 'Where to buy harmonic scalpel?', zhQ: '哪里可以购买 harmonic scalpel？',
        enA: 'Ultrasonic Shears is available directly from ViaSurg as a harmonic scalpel solution. Contact ViaSurg for B2B pricing and distributor inquiries.',
        zhA: '超声刀可直接从 ViaSurg 购买，作为 harmonic scalpel 解决方案。请联系 ViaSurg 获取 B2B 报价及经销合作。' },
      { enQ: 'Ultrasonic Shears vs alternatives for ethicon harmonic?', zhQ: '超声刀与 ethicon harmonic 的替代方案对比？',
        enA: "ViaSurg's Ultrasonic Shears offers a competitive ethicon harmonic alternative. ViaSurg emphasizes open-compatibility and cost transparency.",
        zhA: 'ViaSurg 的超声刀提供具有竞争力的 ethicon harmonic 替代方案。ViaSurg 强调开放兼容性与成本透明。' },
      { enQ: 'How does Ultrasonic Shears compare for ethicon ultrasonic scalpel?', zhQ: '超声刀在 ethicon ultrasonic scalpel 方面表现如何？',
        enA: 'Ultrasonic Shears specifications for ethicon ultrasonic scalpel: Frequency: 55.5 kHz.. Thermal Spread: < 2.0 mm..',
        zhA: '超声刀关于 ethicon ultrasonic scalpel 的规格参数：频率：55.5 kHz。热扩散：< 2.0 mm。' },
      { enQ: 'What are the specifications of Ultrasonic Shears ultrasonic scalpel?', zhQ: '超声刀 ultrasonic scalpel 的规格参数是什么？',
        enA: 'Ultrasonic Shears is manufactured under ISO 13485 quality management. It meets regulatory requirements for ultrasonic scalpel applications.',
        zhA: '超声刀依据 ISO 13485 质量管理体系制造。符合 ultrasonic scalpel 应用的法规要求。' },
    ]
  },
  'hemoclips.html': {
    specs: [
      { en: '<strong>Rotatable Hemoclips:</strong> 360° bidirectional rotation provides precise lesion targeting. High-clamping force ensures effective immediate hemostasis.', zh: '<strong>可旋转止血夹：</strong>360° 双向旋转，精确定位病灶。高夹持力确保有效的即时止血。' },
      { en: '<strong>Polymer Clips:</strong> Integrated locking mechanism with tactile "click" feedback. Atraumatic teeth prevent vessel slippage.', zh: '<strong>高分子结扎夹：</strong>集成锁定机制，带触觉「咔嗒」反馈。无创齿防止血管滑脱。' },
      { en: '<strong>Reference Standard:</strong> Equivalent to Teleflex Hem-o-lok and Olympus QuickClip.', zh: '<strong>参考标准：</strong>等效于 Teleflex Hem-o-lok 和 Olympus QuickClip。' },
      { en: '<strong>Revenue Capture:</strong> Targets the highest CPC procurement intent categories.', zh: '<strong>收入锁定：</strong>锁定 CPC 采购意向最高的品类。' },
      { en: '<strong>Free-Applier Strategy:</strong> Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital.', zh: '<strong>免费施夹器策略：</strong>提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出。' },
      { en: '<strong>Market Arbitrage:</strong> Capture of premium market share from high-cost incumbents through verified technical parity.', zh: '<strong>市场套利：</strong>通过经验证的技术对等性，从高成本现有企业手中夺取高端市场份额。' },
      { en: '<strong>Biocompatibility:</strong> Medical Grade POM/PC, certified for long-term implantation.', zh: '<strong>生物相容性：</strong>医疗级 POM/PC，经认证可用于长期植入。' },
      { en: '<strong>MRI Safety:</strong> Non-metallic, MRI-conditional (verified via ISO 10993).', zh: '<strong>MRI 安全性：</strong>非金属材质，MRI 条件安全（经 ISO 10993 验证）。' },
      { en: '<strong>Verification ID:</strong> V-HC-2025-04 (Closure security test).', zh: '<strong>验证 ID：</strong>V-HC-2025-04（闭合安全性测试）。' },
    ]
  },
  'trocars.html': {
    specs: [
      { en: '<strong>Low-Friction Entry:</strong> Verified reduction in insertion force (&lt; 15.0 N) minimizes abdominal wall trauma.', zh: '<strong>低摩擦进入：</strong>经验证的插入力降低（&lt; 15.0 N），最大程度减少腹壁创伤。' },
      { en: '<strong>Visual Stability:</strong> Proprietary dual-seal valve maintains pneumoperitoneum during high-frequency instrument exchange.', zh: '<strong>视觉稳定性：</strong>专利双密封阀在高频器械交换过程中维持气腹。' },
      { en: '<strong>Reference Standard:</strong> 1:1 tactile equivalence to Ethicon B5LT and Applied Medical CFF03.', zh: '<strong>参考标准：</strong>与 Ethicon B5LT 和 Applied Medical CFF03 实现 1:1 触觉等效。' },
      { en: '<strong>40% Cost Reduction:</strong> Direct replacement of OEM SKUs with no loss in clinical performance.', zh: '<strong>成本降低 40%：</strong>直接替代 OEM SKU，临床性能无损失。' },
      { en: '<strong>Simplified Inventory:</strong> Universal compatibility reduces the need for multiple vendor SKU variants.', zh: '<strong>简化库存：</strong>通用兼容性减少对多供应商 SKU 变体的需求。' },
      { en: '<strong>ROI Projection:</strong> High-frequency consumable. Estimated annual savings for a standard ASC: $12,000 - $18,000.', zh: '<strong>ROI 预测：</strong>高频耗材。标准 ASC 预计年节省：$12,000 - $18,000。' },
      { en: '<strong>FDA 510(k):</strong> Registered via OBL (Relabeler) Protocol VS-TR-21.', zh: '<strong>FDA 510(k)：</strong>通过 OBL（重新标签商）协议 VS-TR-21 注册。' },
      { en: '<strong>ISO 13485:</strong> Manufacturing lot-traceability integrated into NomoFlow Technology ledger.', zh: '<strong>ISO 13485：</strong>生产批次可追溯性集成到 NomoFlow 技术账本。' },
      { en: '<strong>Verification ID:</strong> V-TR-2025-01 (Air-tightness certification).', zh: '<strong>验证 ID：</strong>V-TR-2025-01（气密性认证）。' },
    ]
  },
  'guidewires.html': {
    specs: [
      { en: '<strong>Core Material:</strong> Nitinol (Shape Memory).', zh: '<strong>核心材料：</strong>镍钛合金（形状记忆）。' },
      { en: '<strong>Coating:</strong> Hydrophilic (PVP-based).', zh: '<strong>涂层：</strong>亲水性（PVP 基）。' },
      { en: '<strong>Tip:</strong> Straight, J-tip, Angled.', zh: '<strong>头端：</strong>直头、J 形头、成角头。' },
      { en: '<strong>Radiopacity:</strong> Tungsten-loaded for fluoroscopic visibility.', zh: '<strong>射线不透性：</strong>含钨配方，荧光透视下可见。' },
    ]
  },
  'absorbable-sutures.html': {
    specs: [
      { en: '<strong>Structure:</strong> Braided / Monofilament.', zh: '<strong>结构：</strong>编织型 / 单丝型。' },
      { en: '<strong>Coating:</strong> Polycaprolactone and Calcium Stearate.', zh: '<strong>涂层：</strong>聚己内酯和硬脂酸钙。' },
      { en: '<strong>Absorption Time:</strong> ~60-90 days (complete).', zh: '<strong>吸收时间：</strong>约 60-90 天（完全吸收）。' },
    ]
  },
  'non-absorbable-sutures.html': {
    specs: [
      { en: '<strong>Structure:</strong> Monofilament.', zh: '<strong>结构：</strong>单丝型。' },
      { en: '<strong>Radiopacity:</strong> Non-radiopaque.', zh: '<strong>射线不透性：</strong>非射线不透。' },
    ]
  },
  'hernia-meshes.html': {
    specs: [
      { en: '<strong>Weight:</strong> Ultra-light / Light / Heavyweight options.', zh: '<strong>克重：</strong>超轻 / 轻量 / 重量级可选。' },
      { en: '<strong>Pore Size:</strong> Optimized for tissue ingrowth (e.g., Macroporous).', zh: '<strong>孔径：</strong>优化组织长入（如大孔型）。' },
    ]
  },
  'polymer-clips.html': {
    specs: [
      { en: '<strong>Security:</strong> Integrated "Integrated Boss" locking mechanism for zero-slippage.', zh: '<strong>安全性：</strong>集成「集成凸台」锁定机制，零滑脱。' },
      { en: '<strong>Compatibility:</strong> Compatible with industry-standard appliers.', zh: '<strong>兼容性：</strong>兼容行业标准施夹器。' },
      { en: '<strong>Sizes:</strong> Medium (Purple), Medium-Large (Green), Large (Orange), Extra-Large (Yellow).', zh: '<strong>规格：</strong>中号（紫色）、中大号（绿色）、大号（橙色）、特大号（黄色）。' },
    ]
  },
  'snares.html': {
    specs: [
      { en: '<strong>Loop Shape:</strong> Oval, Hexagonal, Crescent.', zh: '<strong>圈套形状：</strong>椭圆形、六角形、新月形。' },
      { en: '<strong>Wire Diameter:</strong> Optimized for sharp-cutting without thermal damage (for cold snares).', zh: '<strong>丝径：</strong>优化锐利切割，无热损伤（冷圈套器）。' },
      { en: '<strong>Compatibility:</strong> Standard 2.8mm / 3.2mm biopsy channels.', zh: '<strong>兼容性：</strong>标准 2.8mm / 3.2mm 活检通道。' },
    ]
  },
  'veress-needles.html': {
    specs: [
      { en: '<strong>Safety Mechanism:</strong> Spring-loaded retracting blunt tip.', zh: '<strong>安全机制：</strong>弹簧回缩钝头。' },
      { en: '<strong>Length:</strong> 120mm / 150mm.', zh: '<strong>长度：</strong>120mm / 150mm。' },
      { en: '<strong>Luer Lock:</strong> High-flow stopcock for rapid CO2 insufflation.', zh: '<strong>鲁尔锁：</strong>高流量三通阀，快速 CO2 注气。' },
    ]
  },
  'biopsy-forceps.html': {
    specs: [
      { en: '<strong>CPC:</strong> $49.06 (Extremely high CPC).', zh: '<strong>CPC：</strong>$49.06（极高 CPC）。' },
      { en: '<strong>Complexity:</strong> Low (Pure consumable, low risk, standard FDA 510(k) path).', zh: '<strong>复杂度：</strong>低（纯耗材，低风险，标准 FDA 510(k) 路径）。' },
    ]
  },
};

let totalFixed = 0;

for (const [filename, data] of Object.entries(translations)) {
  const filePath = path.join(pagesDir, filename);
  if (!fs.existsSync(filePath)) { console.log('SKIP: ' + filename); continue; }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix Technical Specifications <li> items
  for (const spec of data.specs) {
    const oldLi = '<li>' + spec.en + '</li>';
    const newLi = '<li><span data-lang="en">' + spec.en + '</span><span data-lang="zh">' + spec.zh + '</span></li>';
    if (content.includes(oldLi)) {
      content = content.split(oldLi).join(newLi);
      changed = true;
    }
  }

  // Fix FAQ zh spans that have English text
  for (const faq of (data.faq || [])) {
    // Fix question: find the enQ text and replace the zh span after it
    const qPattern = '<span data-lang="en">' + faq.enQ + '</span><span data-lang="zh">';
    const qIdx = content.indexOf(qPattern);
    if (qIdx >= 0) {
      const zhStart = qIdx + qPattern.length;
      const zhEnd = content.indexOf('</span></h4>', zhStart);
      if (zhEnd >= 0) {
        content = content.substring(0, zhStart) + faq.zhQ + content.substring(zhEnd);
        changed = true;
      }
    }
    // Fix answer
    const aPattern = '<span data-lang="en">' + faq.enA + '</span><span data-lang="zh">';
    const aIdx = content.indexOf(aPattern);
    if (aIdx >= 0) {
      const zhStart = aIdx + aPattern.length;
      const zhEnd = content.indexOf('</span></p>', zhStart);
      if (zhEnd >= 0) {
        content = content.substring(0, zhStart) + faq.zhA + content.substring(zhEnd);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log('Fixed: ' + filename);
  } else {
    console.log('No changes: ' + filename);
  }
}

console.log('Total fixed: ' + totalFixed);
