const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

// Entity name translations
const entityTranslations = {
  // Categories
  'Access': '通路',
  'Clips': '夹子',
  'Instrumentation': '器械',
  'Intelligence': '智能分析',
  'Minimally Invasive Surgery': '微创手术',
  'Minimally_Invasive_Surgery': '微创手术',
  'NomoFlow Solutions': 'NomoFlow 解决方案',
  'NomoFlow_Solutions': 'NomoFlow 解决方案',
  'Sutures': '缝合线',
  'Wound Closure': '伤口闭合',
  'Wound_Closure': '伤口闭合',
  // Products
  'Absorbable Sutures': '可吸收缝合线',
  'Non Absorbable Sutures': '非可吸收缝合线',
  'Non_Absorbable_Sutures': '非可吸收缝合线',
  'Biopsy Forceps': '活检钳',
  'Biopsy_Forceps': '活检钳',
  'Guidewires': '导丝',
  'Hemoclips': '止血夹',
  'Hernia Meshes': '疝修补片',
  'Hernia_Meshes': '疝修补片',
  'Polymer Clips': '高分子结扎夹',
  'Polymer_Clips': '高分子结扎夹',
  'Snares': '圈套器',
  'Staplers': '吻合器',
  'Trocars': '穿刺器',
  'Ultrasonic Shears': '超声刀',
  'Ultrasonic_Shears': '超声刀',
  'Veress Needles': '气腹针',
  'Veress_Needles': '气腹针',
  // Materials
  'PGA Material': 'PGA 材质',
  'PGA_Material': 'PGA 材质',
  'Polypropylene Material': '聚丙烯材质',
  'Polypropylene_Material': '聚丙烯材质',
  // Tech
  'NomoFlow Technology': 'NomoFlow 技术',
  'NomoFlow_Technology': 'NomoFlow 技术',
  // Entities
  'Compliance Framework': '合规框架',
  'Endoscopic Procedures': '内窥镜手术',
  'Laparoscopic Surgery': '腹腔镜手术',
  'ViaSurg Academy': 'ViaSurg 学院',
  // Competitors - keep English
  'Bard': 'Bard',
  'Boston Scientific': 'Boston Scientific',
  'Cook Medical': 'Cook Medical',
  'Ethicon': 'Ethicon',
  'Medtronic': 'Medtronic',
  'Olympus': 'Olympus',
  'Teleflex': 'Teleflex',
  'Terumo': 'Terumo',
  'Competitor Disruption': '竞品颠覆分析',
};

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Pattern: "XXX。专为" -> translate XXX
  content = content.replace(/data-lang="zh">([A-Za-z\s_]+)。专为/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'data-lang="zh">' + zh + '。专为';
    }
    return match;
  });

  // Pattern: "XXX 可直接从 ViaSurg 购买" -> translate XXX
  content = content.replace(/data-lang="zh">([A-Za-z\s_]+) 可直接从 ViaSurg 购买/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'data-lang="zh">' + zh + ' 可直接从 ViaSurg 购买';
    }
    return match;
  });

  // Pattern: "ViaSurg 的 XXX 提供" -> translate XXX
  content = content.replace(/ViaSurg 的 ([A-Za-z\s_]+) 提供具有竞争力/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'ViaSurg 的' + zh + '提供具有竞争力';
    }
    return match;
  });

  // Pattern: "XXX 关于" -> translate XXX
  content = content.replace(/data-lang="zh">([A-Za-z\s_]+) 关于/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'data-lang="zh">' + zh + ' 关于';
    }
    return match;
  });

  // Pattern: "XXX 归类于" -> translate XXX
  content = content.replace(/data-lang="zh">([A-Za-z\s_]+) 归类于/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'data-lang="zh">' + zh + ' 归类于';
    }
    return match;
  });

  // Pattern: "归类于 XXX。" -> translate XXX
  content = content.replace(/归类于 ([A-Za-z_]+)。/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return '归类于' + zh + '。';
    }
    return match;
  });

  // Pattern: "Parent: XXX" or "Parent Category: XXX" -> translate
  content = content.replace(/Parent(?: Category)?: ([A-Za-z_]+)/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return '父类别：' + zh;
    }
    return match;
  });

  // Pattern: "Products: - XXX" -> translate product names
  content = content.replace(/Products: - ([A-Za-z\s_]+)\./g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return '产品：- ' + zh + '。';
    }
    return match;
  });

  // Fix FAQ questions - translate entity names in zh question spans
  // "什么是 XXX？" where XXX is English
  content = content.replace(/(data-lang="zh">什么是 )([A-Za-z\s_]+)(？)/g, (match, prefix, name, suffix) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return prefix + zh + suffix;
    }
    return match;
  });

  // "哪里可以购买 XXX？"
  content = content.replace(/(data-lang="zh">哪里可以购买 )([A-Za-z\s_]+)(？)/g, (match, prefix, name, suffix) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return prefix + zh + suffix;
    }
    return match;
  });

  // "XXX 与 YYY 的替代方案对比？"
  content = content.replace(/(data-lang="zh">)([A-Za-z\s_]+)( 与 )([A-Za-z\s_]+)( 的替代方案对比？)/g, (match, prefix, name1, middle, name2, suffix) => {
    const zh1 = entityTranslations[name1.trim()];
    const zh2 = entityTranslations[name2.trim()];
    let newName1 = zh1 || name1;
    let newName2 = zh2 || name2;
    if (newName1 !== name1 || newName2 !== name2) {
      changed = true;
      return prefix + newName1 + middle + newName2 + suffix;
    }
    return match;
  });

  // "XXX 在 YYY 方面表现如何？"
  content = content.replace(/(data-lang="zh">)([A-Za-z\s_]+)( 在 )([A-Za-z\s_]+)( 方面表现如何？)/g, (match, prefix, name1, middle, name2, suffix) => {
    const zh1 = entityTranslations[name1.trim()];
    const zh2 = entityTranslations[name2.trim()];
    let newName1 = zh1 || name1;
    let newName2 = zh2 || name2;
    if (newName1 !== name1 || newName2 !== name2) {
      changed = true;
      return prefix + newName1 + middle + newName2 + suffix;
    }
    return match;
  });

  // "XXX 的规格参数是什么？"
  content = content.replace(/(data-lang="zh">)([A-Za-z\s_]+)( 的规格参数是什么？)/g, (match, prefix, name, suffix) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return prefix + zh + suffix;
    }
    return match;
  });

  // Fix remaining: "XXX 依据 ISO 13485"
  content = content.replace(/data-lang="zh">([A-Za-z\s_]+) 依据 ISO/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return 'data-lang="zh">' + zh + ' 依据 ISO';
    }
    return match;
  });

  // Fix remaining: "符合 XXX 应用的法规要求"
  content = content.replace(/符合 ([A-Za-z\s_]+) 应用的法规要求/g, (match, name) => {
    const zh = entityTranslations[name.trim()];
    if (zh && zh !== name.trim()) {
      changed = true;
      return '符合' + zh + '应用的法规要求';
    }
    return match;
  });

  if (changed) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log('Fixed: ' + file);
  }
}

console.log('Total fixed: ' + totalFixed);
