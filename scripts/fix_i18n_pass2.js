/**
 * Fix i18n pass 2 — remaining untranslated content
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output');

// Translation maps
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

const metaLabels = {
  'CPC': 'CPC',
  'Status': '状态',
  'Active': '活跃',
  'Verified': '已验证'
};

// Fix all files
function fixAll() {
  const pagesDir = path.join(OUTPUT_DIR, 'pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

  // Fix index.html breadcrumb final segments (not applicable - no breadcrumb on index)
  // But fix the category description paragraph on category pages

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let count = 0;

    // --- Fix breadcrumb links and final segments ---
    // Fix bare "Home" link text in breadcrumbs
    html = html.replace(
      /(<a href="\/output\/">)Home(<\/a>)(\s*&rsaquo;)/g,
      '$1<span data-lang="en">Home</span><span data-lang="zh">首页</span>$2$3'
    );

    // Fix bare "Products" link text in breadcrumbs
    html = html.replace(
      /(<a href="\/output\/#products">)Products(<\/a>)(\s*&rsaquo;)/g,
      '$1<span data-lang="en">Products</span><span data-lang="zh">产品中心</span>$2$3'
    );

    // Fix breadcrumb final segments
    for (const [en, zh] of Object.entries(productNames)) {
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match breadcrumb: &rsaquo; EN\n or &rsaquo; EN</div>
      const bcRe = new RegExp(`(&rsaquo;\\s*)${escaped}(\\s*</div>)`, 'g');
      if (bcRe.test(html)) {
        html = html.replace(bcRe, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
        count++;
      }
    }

    for (const [en, zh] of Object.entries(categoryNames)) {
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const bcRe = new RegExp(`(&rsaquo;\\s*)${escaped}(\\s*</div>)`, 'g');
      if (bcRe.test(html)) {
        html = html.replace(bcRe, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
        count++;
      }
    }

    // Fix breadcrumb for competitor/entity/material/tech names
    const otherNames = {
      'Bard': 'Bard',
      'Boston Scientific': 'Boston Scientific',
      'Competitor Disruption': '竞争格局颠覆',
      'Cook Medical': 'Cook Medical',
      'Ethicon': 'Ethicon',
      'Medtronic': 'Medtronic',
      'Olympus': 'Olympus',
      'Teleflex': 'Teleflex',
      'Terumo': 'Terumo',
      'ViaSurg Academy': 'ViaSurg 学院',
      'Compliance Framework': '合规框架',
      'Endoscopic Procedures': '内镜手术',
      'Ethicon B5LT': 'Ethicon B5LT',
      'Hangzhou Sode': '杭州苏迪',
      'Johnson CDH29P': 'J&J CDH29P',
      'Laparoscopic Surgery': '腹腔镜手术',
      'Teleflex Hem-o-lok': 'Teleflex Hem-o-lok',
      'ViaSurg': 'ViaSurg',
      'PGA Material': 'PGA 材料',
      'Polypropylene Material': '聚丙烯材料',
      'NomoFlow Technology': 'NomoFlow 技术'
    };

    for (const [en, zh] of Object.entries(otherNames)) {
      if (en === zh) continue;
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const bcRe = new RegExp(`(&rsaquo;\\s*)${escaped}(\\s*</div>)`, 'g');
      if (bcRe.test(html)) {
        html = html.replace(bcRe, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
        count++;
      }
    }

    // --- Category page h1 titles ---
    if (file.startsWith('category-')) {
      for (const [en, zh] of Object.entries(categoryNames)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match h1 with bare text (may have whitespace)
        const h1Re = new RegExp(`(<h1>)\\s*${escaped}\\s*(</h1>)`, 'g');
        if (h1Re.test(html)) {
          html = html.replace(h1Re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Category page product cards ---
    if (file.startsWith('category-')) {
      // h3 product names (bare text in category cards)
      for (const [en, zh] of Object.entries(productNames)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<h3>)${escaped}(<\/h3>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // .cat divs (category labels in product cards)
      for (const [en, zh] of Object.entries(categoryNames)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<div class="cat">)${escaped}(<\/div>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // .desc divs (product descriptions in category cards)
      for (const [en, zh] of Object.entries(productDescs)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<div class="desc">)${escaped}(<\/div>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // .meta-label spans
      for (const [en, zh] of Object.entries(metaLabels)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<span class="meta-label">)${escaped}(<\/span>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // .name divs (category link names)
      for (const [en, zh] of Object.entries(categoryNames)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<div class="name">)${escaped}(<\/div>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Category description paragraphs (Chinese-only, need English wrapper)
      // Pattern: <p>基础临床耗材...</p> — this should be wrapped
      html = html.replace(
        /(<p>)基础临床耗材，包括可吸收与非可吸收材料。(<\/p>)/,
        '$1<span data-lang="en">Foundational clinical consumables including absorbable and non-absorbable materials.</span><span data-lang="zh">基础临床耗材，包括可吸收与非可吸收材料。</span>$2'
      );

      // Fix other Chinese-only descriptions on category pages
      const catDescMap = {
        '覆盖通路类器械，包括穿刺器和气腹针。': { en: 'Access instruments including trocars and Veress needles.', zh: '覆盖通路类器械，包括穿刺器和气腹针。' },
        '覆盖夹闭类器械，包括止血夹和高分子结扎夹。': { en: 'Closure devices including hemoclips and polymer clips.', zh: '覆盖夹闭类器械，包括止血夹和高分子结扎夹。' },
        '覆盖操作类器械，包括活检钳、圈套器、吻合器和超声刀。': { en: 'Operational instruments including biopsy forceps, snares, staplers, and ultrasonic shears.', zh: '覆盖操作类器械，包括活检钳、圈套器、吻合器和超声刀。' },
        'AI 驱动的质量保证和供应链智能。': { en: 'AI-powered quality assurance and supply chain intelligence.', zh: 'AI 驱动的质量保证和供应链智能。' },
        '覆盖腹腔镜手术所需的核心器械和耗材。': { en: 'Core instruments and consumables for laparoscopic surgery.', zh: '覆盖腹腔镜手术所需的核心器械和耗材。' },
        'NomoFlow™ 闭环控制平台相关产品和技术。': { en: 'Products and technologies related to the NomoFlow™ closed-loop control platform.', zh: 'NomoFlow™ 闭环控制平台相关产品和技术。' },
        '覆盖伤口闭合类产品，包括缝合线、吻合器和疝修补片。': { en: 'Wound closure products including sutures, staplers, and hernia meshes.', zh: '覆盖伤口闭合类产品，包括缝合线、吻合器和疝修补片。' }
      };

      for (const [zh, { en }] of Object.entries(catDescMap)) {
        const escaped = zh.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<p>)${escaped}(<\/p>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Competitor page fixes ---
    if (file.startsWith('competitor-')) {
      // Fix bare text in comparison table cells
      const compTableCells = {
        'FDA / CE (varies)': 'FDA / CE（因产品而异）',
        'FDA 510(k) + CE MDR': 'FDA 510(k) + CE MDR',
        'Premium pricing': '高端定价',
        'Opaque pricing': '定价不透明',
        'High': '高',
        'Medium': '中',
        'Low': '低',
        'Premium': '高端',
        'Standard': '标准',
        'Verified': '已验证',
        'Partial': '部分',
        'Full': '完整'
      };

      for (const [en, zh] of Object.entries(compTableCells)) {
        if (en === zh) continue;
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(>)${escaped}(<)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix "Dominant Products" section tags
      for (const [en, zh] of Object.entries(productNames)) {
        // These appear as bare text in spans/divs on competitor pages
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match product names in tag-like divs
        const re = new RegExp(`(>\\s*)${escaped}(\\s*<)`, 'g');
        // Only apply if it's inside a relevant context (not already wrapped)
        // Skip this - too risky for false positives
      }
    }

    // --- Entity page fixes ---
    if (file.startsWith('entity-')) {
      // Fix description paragraphs that might be bare English
      const entDescs = {
        'FDA 510(k) and CE MDR certified medical devices with transparent manufacturing and evidence-backed performance.': 'FDA 510(k) 和 CE MDR 认证医疗器械，制造透明、性能有循证支持。',
        'Clinical-grade medical devices for endoscopic procedures.': '用于内镜手术的临床级医疗器械。',
        'Clinical-grade medical devices for laparoscopic surgery.': '用于腹腔镜手术的临床级医疗器械。',
        'Quality management and regulatory compliance framework.': '质量管理和法规合规框架。',
        'Ethicon B5LT equivalent trocar system.': '等效于 Ethicon B5LT 的穿刺器系统。',
        'Hangzhou Sode Medical Technology partner products.': '杭州苏迪医疗科技合作伙伴产品。',
        'Johnson & Johnson CDH29P equivalent circular stapler.': '等效于 J&J CDH29P 的圆形吻合器。',
        'Teleflex Hem-o-lok equivalent polymer clips.': '等效于 Teleflex Hem-o-lok 的高分子结扎夹。'
      };

      for (const [en, zh] of Object.entries(entDescs)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<p>)${escaped}(<\/p>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Material page fixes ---
    if (file.startsWith('material-')) {
      // Fix material description paragraphs
      const matDescs = {
        'A biodegradable, thermoplastic polymer and the simplest linear, aliphatic polyester. Used extensively in synthetic absorbable sutures.': '一种可生物降解的热塑性聚合物，是最简单的线性脂肪族聚酯。广泛用于合成可吸收缝合线。',
        'A rugged and unusually resistant thermoplastic polymer. In surgery, it is used for non-absorbable monofilament sutures and hernia meshes.': '一种坚固且耐腐蚀的热塑性聚合物。在外科手术中，用于非可吸收单丝缝合线和疝修补片。',
        'Absorption Method: Hydrolysis.': '吸收方式：水解。',
        'Tensile Strength Retention: High for the first 14-21 days.': '抗拉强度保持率：前 14-21 天较高。',
        'Durability: Permanent wound support.': '耐久性：永久性伤口支撑。',
        'Reactivity: Extremely low tissue reaction.': '反应性：极低的组织反应。'
      };

      for (const [en, zh] of Object.entries(matDescs)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<p>)${escaped}(<\/p>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }

      // Fix spec lines in material pages
      const matSpecs = {
        'Hydrolysis.': '水解。',
        'High for the first 14-21 days.': '前 14-21 天较高。',
        'Permanent wound support.': '永久性伤口支撑。',
        'Extremely low tissue reaction.': '极低的组织反应。'
      };

      for (const [en, zh] of Object.entries(matSpecs)) {
        const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(<span[^>]*>)${escaped}(<\/span>)`, 'g');
        if (re.test(html)) {
          html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
          count++;
        }
      }
    }

    // --- Tech page fixes ---
    if (file === 'tech-nomoflow-technology.html') {
      // Fix NomoFlow description if bare
      const techDesc = 'NomoFlow™ is a closed-loop control platform designed to reduce batch variability through high-frequency parameter compensation.';
      const techDescZh = 'NomoFlow™ 是一个闭环控制平台，通过高频参数补偿减少批次变异性。';
      const escaped = techDesc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(<p>)${escaped}(<\/p>)`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `$1<span data-lang="en">${techDesc}</span><span data-lang="zh">${techDescZh}</span>$2`);
        count++;
      }
    }

    fs.writeFileSync(filePath, html, 'utf8');
    if (count > 0) {
      console.log(`✅ ${file}: ${count} additional fixes`);
    }
  }
}

console.log('🔧 Pass 2: Fixing remaining i18n issues...\n');
fixAll();
console.log('\n✅ Pass 2 complete.');
