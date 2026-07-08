const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

const productNames = {
  'Absorbable Sutures': '可吸收缝合线',
  'Non Absorbable Sutures': '非可吸收缝合线',
  'Biopsy Forceps': '活检钳',
  'Guidewires': '导丝',
  'Hemoclips': '止血夹',
  'Hernia Meshes': '疝修补片',
  'Polymer Clips': '高分子结扎夹',
  'Snares': '圈套器',
  'Staplers': '吻合器',
  'Trocars': '穿刺器',
  'Ultrasonic Shears': '超声刀',
  'Veress Needles': '气腹针',
};

const categoryNames = {
  'Instrumentation': '器械',
  'Minimally_Invasive_Surgery': '微创手术',
  'Minimally Invasive Surgery': '微创手术',
  'Wound_Closure': '伤口闭合',
  'Wound Closure': '伤口闭合',
  'Clips': '夹子',
  'Sutures': '缝合线',
  'Access': '通路',
  'Intelligence': '智能分析',
};

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html') && !f.startsWith('category-') && !f.startsWith('competitor-') && !f.startsWith('entity-') && !f.startsWith('material-') && !f.startsWith('tech-'));

let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace product names in zh spans
  for (const [en, zh] of Object.entries(productNames)) {
    // In data-lang="zh" spans, replace English product name with Chinese
    const pattern = 'data-lang="zh">' + en;
    if (content.includes(pattern)) {
      content = content.split(pattern).join('data-lang="zh">' + zh);
      changed = true;
    }
  }

  // Replace category names in zh spans (e.g., "Parent Category: Minimally_Invasive_Surgery")
  for (const [en, zh] of Object.entries(categoryNames)) {
    const pattern = 'Parent Category: ' + en;
    if (content.includes(pattern)) {
      // Only replace in zh spans
      const zhPattern = 'data-lang="zh">' + pattern;
      if (content.includes(zhPattern)) {
        content = content.split(zhPattern).join('data-lang="zh">父类别：' + zh);
        changed = true;
      }
    }
  }

  // Fix "is classified under" -> "归类于"
  content = content.replace(/data-lang="zh">([^<]*?)is classified under ([^<]*?)\./g, (match, before, cat) => {
    const catZh = categoryNames[cat] || cat;
    changed = true;
    return 'data-lang="zh">' + before + '归类于' + catZh + '。';
  });

  // Fix "is available directly from ViaSurg" -> "可直接从 ViaSurg 购买"
  content = content.replace(/data-lang="zh">([^<]*?)is available directly from ViaSurg/g, (match, before) => {
    changed = true;
    return 'data-lang="zh">' + before + '可直接从 ViaSurg 购买';
  });

  // Fix "Contact ViaSurg for B2B pricing" -> "请联系 ViaSurg 获取 B2B 报价"
  content = content.replace(/Contact ViaSurg for B2B pricing and distributor inquiries\./g, (match) => {
    changed = true;
    return '请联系 ViaSurg 获取 B2B 报价及经销合作。';
  });

  // Fix "is manufactured under ISO 13485" -> "依据 ISO 13485 制造"
  content = content.replace(/data-lang="zh">([^<]*?)is manufactured under ISO 13485 quality management\./g, (match, before) => {
    changed = true;
    return 'data-lang="zh">' + before + '依据 ISO 13485 质量管理体系制造。';
  });

  // Fix "It meets regulatory requirements for" -> "符合...法规要求"
  content = content.replace(/It meets regulatory requirements for ([^<]*?)applications\./g, (match, app) => {
    changed = true;
    return '符合' + app + '应用的法规要求。';
  });

  // Fix "specifications for" -> "关于...的规格参数"
  content = content.replace(/data-lang="zh">([^<]*?)specifications for ([^<]*?):/g, (match, before, keyword) => {
    changed = true;
    return 'data-lang="zh">' + before + '关于' + keyword + '的规格参数：';
  });

  // Fix "offers a competitive" -> "提供具有竞争力的"
  content = content.replace(/data-lang="zh">ViaSurg's ([^<]*?)offers a competitive ([^<]*?)alternative\./g, (match, prod, alt) => {
    const prodZh = productNames[prod.trim()] || prod.trim();
    changed = true;
    return 'data-lang="zh">ViaSurg 的' + prodZh + '提供具有竞争力的' + alt + '替代方案。';
  });

  // Fix "Key competitors include" -> "主要竞争对手包括"
  content = content.replace(/Key competitors include ([^<]*?)\./g, (match, competitors) => {
    changed = true;
    return '主要竞争对手包括' + competitors + '。';
  });

  // Fix "ViaSurg emphasizes" -> "ViaSurg 强调"
  content = content.replace(/ViaSurg emphasizes open-compatibility and cost transparency\./g, () => {
    changed = true;
    return 'ViaSurg 强调开放兼容性与成本透明。';
  });

  // Fix "Market CPC for" -> "关键词的市场平均点击成本为"
  content = content.replace(/Market CPC for ([^<]*?)keywords averages/g, (match, keyword) => {
    changed = true;
    return keyword + '关键词的市场平均点击成本为';
  });

  // Fix remaining "monthly searches" text is OK (number format)

  if (changed) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log('Fixed: ' + file);
  }
}

console.log('Total fixed: ' + totalFixed);
