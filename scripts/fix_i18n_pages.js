/**
 * Fix i18n translations in all sub-pages
 * Run: node scripts/fix_i18n_pages.js
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

// Translation maps
const NAV_LINKS = {
  'Home': '首页',
  'Products': '产品中心',
  'Competitors': '竞品分析',
  'Sitemap': '站点地图',
  'Request Quote': '询价',
  'Contact ViaSurg': '联系 ViaSurg',
  'Download PDF': '下载 PDF',
  'View Dashboard': '查看仪表板',
  'View Products': '查看产品',
  'View Details': '了解更多',
  'Browse Products': '浏览产品',
  'Back to Home': '返回首页',
  'Request Clinical Evidence Package': '申请临床证据包',
};

const CATEGORY_MAP = {
  'Sutures': '缝合线',
  'Instrumentation': '器械操作',
  'Medical Device': '医疗器械',
  'Clips': '结扎夹',
  'Access': '通路管理',
  'Intelligence': '算法与智能',
  'Minimally Invasive Surgery': '微创外科',
  'NomoFlow Solutions': 'NomoFlow 方案',
  'Wound Closure': '伤口闭合',
};

const PRODUCT_MAP = {
  'Absorbable Sutures': '可吸收缝合线',
  'Biopsy Forceps': '一次性活检钳',
  'Guidewires': '导丝',
  'Hemoclips': '止血夹',
  'Hernia Meshes': '疝气修补网片',
  'Non Absorbable Sutures': '非吸收缝合线',
  'Polymer Clips': '高分子结扎夹',
  'Snares': '息肉圈套器',
  'Staplers': '吻合器',
  'Trocars': '穿刺器',
  'Ultrasonic Shears': '超声刀头',
  'Veress Needles': '气腹针',
};

const MATERIAL_MAP = {
  'PGA Material': 'PGA 聚乙交酯',
  'Polypropylene Material': '聚丙烯',
  'NomoFlow Technology': 'NomoFlow 技术',
};

const COMPETITOR_MAP = {
  'Bard': 'Bard',
  'Boston Scientific': 'Boston Scientific',
  'Cook Medical': 'Cook Medical',
  'Ethicon': 'Ethicon',
  'Medtronic': 'Medtronic',
  'Olympus': 'Olympus',
  'Teleflex': 'Teleflex',
  'Terumo': 'Terumo',
  'ViaSurg Academy': 'ViaSurg 学院',
  'Competitor Disruption': '竞品颠覆',
};

function wrapBilingual(html, enText, zhText) {
  return `<span data-lang="en">${enText}</span><span data-lang="zh">${zhText}</span>`;
}

function fixFile(filePath) {
  let html = fs.readFileSync(filePath, 'utf-8');
  let changed = false;
  const original = html;

  // 1. Fix setLang function - add html lang update
  if (html.includes("document.body.className = lang === 'zh' ? 'lang-zh' : '';") &&
      !html.includes('document.documentElement.lang')) {
    html = html.replace(
      "document.body.className = lang === 'zh' ? 'lang-zh' : '';",
      "document.body.className = lang === 'zh' ? 'lang-zh' : '';\n        document.documentElement.lang = lang;"
    );
  }

  // 2. Fix breadcrumb - wrap "Home"
  html = html.replace(
    /<a href="\/output\/">Home<\/a>/g,
    '<a href="/output/" data-lang="en">Home</a><a href="/output/" data-lang="zh">首页</a>'
  );

  // 3. Fix breadcrumb - wrap "Products"
  html = html.replace(
    /<a href="\/output\/#products">Products<\/a>/g,
    '<a href="/output/#products" data-lang="en">Products</a><a href="/output/#products" data-lang="zh">产品中心</a>'
  );

  // 4. Fix "Sitemap" links in nav (not in breadcrumb)
  html = html.replace(
    /<a href="\/output\/sitemap\.xml">Sitemap<\/a>/g,
    '<a href="/output/sitemap.xml" data-lang="en">Sitemap</a><a href="/output/sitemap.xml" data-lang="zh">站点地图</a>'
  );

  // 5. Fix "Request Quote" CTA button
  html = html.replace(
    /<a href="\/output\/" class="cta-button">Request Quote<\/a>/g,
    '<a href="/output/" class="cta-button"><span data-lang="en">Request Quote</span><span data-lang="zh">询价</span></a>'
  );

  // 6. Fix sidebar spec-values for Category
  for (const [en, zh] of Object.entries(CATEGORY_MAP)) {
    const regex = new RegExp(`(<span class="spec-value">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/span>)`, 'g');
    if (regex.test(html)) {
      html = html.replace(regex, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
    }
  }

  // 7. Fix sidebar spec-values for Materials
  for (const [en, zh] of Object.entries(MATERIAL_MAP)) {
    const regex = new RegExp(`(<span class="spec-value">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/span>)`, 'g');
    if (regex.test(html)) {
      html = html.replace(regex, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
    }
  }

  // 8. Fix related entity links
  for (const [en, zh] of Object.entries({...CATEGORY_MAP, ...PRODUCT_MAP, ...MATERIAL_MAP, ...COMPETITOR_MAP})) {
    const regex = new RegExp(`(<a href="/output/pages/[^"]*">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/a>)`, 'g');
    if (regex.test(html)) {
      html = html.replace(regex, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
    }
  }

  // 9. Fix "Market Strategy" section content
  html = html.replace(
    /(<h2><span data-lang="en">Market Strategy<\/span><span data-lang="zh">市场策略<\/span><\/h2>)(<p>)([^<]+)(<\/p>)/g,
    function(match, h2, pOpen, content, pClose) {
      // Don't wrap if already wrapped
      if (content.includes('data-lang')) return match;
      // Translate known strategy descriptions
      const strategyMap = {
        'Target generic search intent': '覆盖通用搜索意图',
        'Stable volume-driver': '稳定的销量驱动产品',
        'Material-first messaging': '以材料为核心的信息传递',
        'Comprehensive SKU Matrix': '全面的 SKU 矩阵',
        'Ecosystem capture': '生态系统锁定',
        'Volume standard': '标准化批量产品',
        'Clinically validated medical device with transparent manufacturing and evidence-backed performance.': '经临床验证的医疗设备，透明制造，性能有循证支持。',
      };
      const zhContent = strategyMap[content] || content;
      return `${h2}${pOpen}<span data-lang="en">${content}</span><span data-lang="zh">${zhContent}</span>${pClose}`;
    }
  );

  // 10. Fix "Target Brands" section content
  html = html.replace(
    /(<h2><span data-lang="en">Target Brands<\/span><span data-lang="zh">目标品牌<\/span><\/h2>)(<p>)([^<]+)(<\/p>)/g,
    function(match, h2, pOpen, content, pClose) {
      if (content.includes('data-lang')) return match;
      return `${h2}${pOpen}<span data-lang="en">${content}</span><span data-lang="zh">${content}</span>${pClose}`;
    }
  );

  // 11. Fix Technical Specifications list items
  html = html.replace(
    /<li><strong>(Structure|Coating|Absorption Time|Durability|Reactivity|Absorption Method|Tensile Strength Retention):<\/strong>\s*/g,
    function(match, label) {
      const labelMap = {
        'Structure': '结构',
        'Coating': '涂层',
        'Absorption Time': '吸收时间',
        'Durability': '耐久性',
        'Reactivity': '反应性',
        'Absorption Method': '吸收方式',
        'Tensile Strength Retention': '抗拉强度保持率',
      };
      const zhLabel = labelMap[label] || label;
      return `<li><strong><span data-lang="en">${label}</span><span data-lang="zh">${zhLabel}</span></strong> `;
    }
  );

  // 12. Fix FAQ meta "X monthly searches"
  html = html.replace(
    /<span class="faq-meta">([\d,]+ monthly searches)<\/span>/g,
    function(match, text) {
      const num = text.replace(' monthly searches', '');
      return `<span class="faq-meta"><span data-lang="en">${text}</span><span data-lang="zh">月搜索量 ${num}</span></span>`;
    }
  );

  // 13. Fix footer links
  html = html.replace(
    /(<a href="\/output\/" data-lang="en">Home<\/a><a href="\/output\/" data-lang="zh">首页<\/a> \| <a href="\/output\/sitemap\.xml">Sitemap<\/a>)/g,
    '<a href="/output/" data-lang="en">Home</a><a href="/output/" data-lang="zh">首页</a> | <a href="/output/sitemap.xml" data-lang="en">Sitemap</a><a href="/output/sitemap.xml" data-lang="zh">站点地图</a>'
  );

  // 14. Fix "Browse Products" heading in category pages
  html = html.replace(
    /(<h2[^>]*>)Browse Products(<\/h2>)/g,
    '$1<span data-lang="en">Browse Products</span><span data-lang="zh">浏览产品</span>$2'
  );

  // 15. Fix competitor table headers
  html = html.replace(
    /(<th[^>]*>)INCUMBENT(<\/th>)/g,
    '$1<span data-lang="en">INCUMBENT</span><span data-lang="zh">现有品牌</span>$2'
  );
  html = html.replace(
    /(<th[^>]*>)PRODUCT LINE(<\/th>)/g,
    '$1<span data-lang="en">PRODUCT LINE</span><span data-lang="zh">产品线</span>$2'
  );
  html = html.replace(
    /(<th[^>]*>)MARKET PAIN POINT(<\/th>)/g,
    '$1<span data-lang="en">MARKET PAIN POINT</span><span data-lang="zh">市场痛点</span>$2'
  );
  html = html.replace(
    /(<th[^>]*>)VIASURG DISRUPTION(<\/th>)/g,
    '$1<span data-lang="en">VIASURG DISRUPTION</span><span data-lang="zh">ViaSurg 颠覆</span>$2'
  );

  // 16. Fix "Market inefficiency" and "Transparent manufacturing" in competitor pages
  html = html.replace(
    /(<td[^>]*>)Market inefficiency(<\/td>)/g,
    '$1<span data-lang="en">Market inefficiency</span><span data-lang="zh">市场低效</span>$2'
  );
  html = html.replace(
    /(<td[^>]*>)Opaque(<\/td>)/g,
    '$1<span data-lang="en">Opaque</span><span data-lang="zh">不透明</span>$2'
  );
  html = html.replace(
    /(<td[^>]*>)Transparent manufacturing(<\/td>)/g,
    '$1<span data-lang="en">Transparent manufacturing</span><span data-lang="zh">透明制造</span>$2'
  );
  html = html.replace(
    /(<td[^>]*>)Verified(<\/td>)/g,
    '$1<span data-lang="en">Verified</span><span data-lang="zh">已验证</span>$2'
  );
  html = html.replace(
    /(<td[^>]*>)Multiple lines(<\/td>)/g,
    '$1<span data-lang="en">Multiple lines</span><span data-lang="zh">多条产品线</span>$2'
  );

  // 17. Fix "Disruption Advantage" section in competitor pages
  html = html.replace(
    /(<h2[^>]*>)Disruption Advantage(<\/h2>)/g,
    '$1<span data-lang="en">Disruption Advantage</span><span data-lang="zh">颠覆优势</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Competitive Analysis(<\/h2>)/g,
    '$1<span data-lang="en">Competitive Analysis</span><span data-lang="zh">竞争分析</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Product Cross-Reference(<\/h2>)/g,
    '$1<span data-lang="en">Product Cross-Reference</span><span data-lang="zh">产品交叉对照</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Related Products(<\/h2>)/g,
    '$1<span data-lang="en">Related Products</span><span data-lang="zh">相关产品</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Overview(<\/h2>)/g,
    '$1<span data-lang="en">Overview</span><span data-lang="zh">产品概述</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Technical Specifications(<\/h2>)/g,
    '$1<span data-lang="en">Technical Specifications</span><span data-lang="zh">技术规格</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Frequently Asked Questions(<\/h2>)/g,
    '$1<span data-lang="en">Frequently Asked Questions</span><span data-lang="zh">常见问题</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Market Strategy(<\/h2>)/g,
    '$1<span data-lang="en">Market Strategy</span><span data-lang="zh">市场策略</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Target Brands(<\/h2>)/g,
    '$1<span data-lang="en">Target Brands</span><span data-lang="zh">目标品牌</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Clinical Evidence(<\/h2>)/g,
    '$1<span data-lang="en">Clinical Evidence</span><span data-lang="zh">临床证据</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Compliance Framework(<\/h2>)/g,
    '$1<span data-lang="en">Compliance Framework</span><span data-lang="zh">合规框架</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Key Entities(<\/h2>)/g,
    '$1<span data-lang="en">Key Entities</span><span data-lang="zh">关键实体</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Material Properties(<\/h2>)/g,
    '$1<span data-lang="en">Material Properties</span><span data-lang="zh">材料特性</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Applications(<\/h2>)/g,
    '$1<span data-lang="en">Applications</span><span data-lang="zh">应用场景</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Technology Details(<\/h2>)/g,
    '$1<span data-lang="en">Technology Details</span><span data-lang="zh">技术详情</span>$2'
  );
  html = html.replace(
    /(<h2[^>]*>)Quality Assurance(<\/h2>)/g,
    '$1<span data-lang="en">Quality Assurance</span><span data-lang="zh">质量保证</span>$2'
  );

  // 18. Fix sidebar h3 labels
  html = html.replace(
    /(<h3[^>]*><span data-lang="en">Product Details<\/span>)/,
    '$1'
  );
  // Already handled by data-lang pattern

  // 19. Fix "Related Entities" and "Related Keywords" h3
  html = html.replace(
    /(<h3[^>]*>)Related Entities(<\/h3>)/g,
    '$1<span data-lang="en">Related Entities</span><span data-lang="zh">相关实体</span>$2'
  );
  html = html.replace(
    /(<h3[^>]*>)Related Keywords(<\/h3>)/g,
    '$1<span data-lang="en">Related Keywords</span><span data-lang="zh">相关关键词</span>$2'
  );
  html = html.replace(
    /(<h3[^>]*>)Related Products(<\/h3>)/g,
    '$1<span data-lang="en">Related Products</span><span data-lang="zh">相关产品</span>$2'
  );
  html = html.replace(
    /(<h3[^>]*>)Key Competitors(<\/h3>)/g,
    '$1<span data-lang="en">Key Competitors</span><span data-lang="zh">主要竞争对手</span>$2'
  );

  // 20. Fix "Product Details" h3
  html = html.replace(
    /(<h3[^>]*>)Product Details(<\/h3>)/g,
    '$1<span data-lang="en">Product Details</span><span data-lang="zh">产品详情</span>$2'
  );

  // 21. Fix "Category" and "Material" spec labels
  html = html.replace(
    /(<span class="spec-label">)Category(<\/span>)/g,
    '$1<span data-lang="en">Category</span><span data-lang="zh">类别</span>$2'
  );
  html = html.replace(
    /(<span class="spec-label">)Material(<\/span>)/g,
    '$1<span data-lang="en">Material</span><span data-lang="zh">材质</span>$2'
  );
  html = html.replace(
    /(<span class="spec-label">)Avg CPC(<\/span>)/g,
    '$1<span data-lang="en">Avg CPC</span><span data-lang="zh">平均点击成本</span>$2'
  );
  html = html.replace(
    /(<span class="spec-label">)Certification(<\/span>)/g,
    '$1<span data-lang="en">Certification</span><span data-lang="zh">认证</span>$2'
  );
  html = html.replace(
    /(<span class="spec-label">)Status(<\/span>)/g,
    '$1<span data-lang="en">Status</span><span data-lang="zh">状态</span>$2'
  );

  // 22. Fix breadcrumb product names
  for (const [en, zh] of Object.entries(PRODUCT_MAP)) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // In breadcrumb (after &rsaquo;)
    html = html.replace(
      new RegExp(`(&rsaquo; )${escaped}(</div>)`, 'g'),
      `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`
    );
  }

  // 23. Fix breadcrumb category names
  for (const [en, zh] of Object.entries(CATEGORY_MAP)) {
    const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(
      new RegExp(`(&rsaquo; )${escaped}(</div>)`, 'g'),
      `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`
    );
  }

  // 24. Fix breadcrumb for entity pages
  html = html.replace(
    /(&rsaquo; )Entities(&rsaquo;)/g,
    '$1<span data-lang="en">Entities</span><span data-lang="zh">实体</span>$2'
  );
  html = html.replace(
    /(&rsaquo; )Competitors(&rsaquo;)/g,
    '$1<span data-lang="en">Competitors</span><span data-lang="zh">竞品</span>$2'
  );
  html = html.replace(
    /(&rsaquo; )Materials(&rsaquo;)/g,
    '$1<span data-lang="en">Materials</span><span data-lang="zh">材料</span>$2'
  );
  html = html.replace(
    /(&rsaquo; )Categories(&rsaquo;)/g,
    '$1<span data-lang="en">Categories</span><span data-lang="zh">类别</span>$2'
  );
  html = html.replace(
    /(&rsaquo; )Technology(&rsaquo;)/g,
    '$1<span data-lang="en">Technology</span><span data-lang="zh">技术</span>$2'
  );

  // 25. Fix "Verified" badge in product pages
  html = html.replace(
    /(<span class="badge badge-category"><span data-lang="en">Verified<\/span><span data-lang="zh">已验证<\/span><\/span>)/g,
    '$1'
  );

  // 26. Fix "Sitemap" in footer that might still be unwrapped
  html = html.replace(
    /\| <a href="\/output\/sitemap\.xml">Sitemap<\/a>/g,
    '| <a href="/output/sitemap.xml" data-lang="en">Sitemap</a><a href="/output/sitemap.xml" data-lang="zh">站点地图</a>'
  );

  if (html !== original) {
    fs.writeFileSync(filePath, html, 'utf-8');
    return true;
  }
  return false;
}

// Process all pages
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
let fixedCount = 0;
for (const file of files) {
  const filePath = path.join(PAGES_DIR, file);
  if (fixFile(filePath)) {
    fixedCount++;
    console.log(`✅ Fixed: ${file}`);
  } else {
    console.log(`⏭️  No changes: ${file}`);
  }
}
console.log(`\nDone! Fixed ${fixedCount}/${files.length} pages.`);
