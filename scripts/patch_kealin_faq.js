/**
 * Patch FAQ sections in kealin/demo/output/pages/ to add Chinese translations.
 * Uses data-lang="en" / data-lang="zh" pattern already used in these pages.
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

// Question pattern translations
const qPatterns = [
  [/^What is (.+)\?$/, (m) => ({ en: `What is ${m[1]}?`, zh: `什么是 ${m[1]}？` })],
  [/^Where to buy (.+)\?$/, (m) => ({ en: `Where to buy ${m[1]}?`, zh: `哪里可以购买 ${m[1]}？` })],
  [/^(.+) vs alternatives for (.+)\?$/, (m) => ({ en: `${m[1]} vs alternatives for ${m[2]}?`, zh: `${m[1]} 与 ${m[2]} 的替代方案对比？` })],
  [/^How does (.+) compare for (.+)\?$/, (m) => ({ en: `How does ${m[1]} compare for ${m[2]}?`, zh: `${m[1]} 在 ${m[2]} 方面表现如何？` })],
  [/^What are the specifications of (.+)\?$/, (m) => ({ en: `What are the specifications of ${m[1]}?`, zh: `${m[1]} 的规格参数是什么？` })],
  [/^What are the different types of (.+)\?$/, (m) => ({ en: `What are the different types of ${m[1]}?`, zh: `${m[1]} 有哪些不同类型？` })],
  [/^How to choose (.+) for (.+)\?$/, (m) => ({ en: `How to choose ${m[1]} for ${m[2]}?`, zh: `如何为 ${m[2]} 选择 ${m[1]}？` })],
  [/^What (.+) does ViaSurg offer for (.+)\?$/, (m) => ({ en: `What ${m[1]} does ViaSurg offer for ${m[2]}?`, zh: `ViaSurg 为 ${m[2]} 提供哪些 ${m[1]}？` })],
];

function translateQuestion(q) {
  for (const [regex, fn] of qPatterns) {
    const m = q.match(regex);
    if (m) return fn(m);
  }
  // Fallback: keep English, add generic Chinese
  return { en: q, zh: q };
}

// Answer pattern translations
function translateAnswer(answer, productName) {
  // Pattern: "{Product} is classified under {Category}. It is designed for..."
  let m;
  if ((m = answer.match(/^(.+) is classified under (.+?)\. It is designed for clinical reliability and precision in (.+?) applications\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 归类于 ${m[2]}。专为 ${m[3]} 应用场景的临床可靠性与精确性而设计。${m[4]}`
    };
  }
  // Pattern: "{Product} is available directly from ViaSurg as a {keyword} solution..."
  if ((m = answer.match(/^(.+) is available directly from ViaSurg as a (.+?) solution\. Market CPC for (.+?) keywords averages \$([0-9.]+)\. Contact ViaSurg for B2B pricing and distributor inquiries\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 可直接从 ViaSurg 购买，作为 ${m[2]} 解决方案。${m[3]} 关键词的市场平均点击成本为 $${m[4]}。请联系 ViaSurg 获取 B2B 报价及经销合作。${m[5]}`
    };
  }
  if ((m = answer.match(/^(.+) is available directly from ViaSurg as a (.+?) solution\. Contact ViaSurg for B2B pricing and distributor inquiries\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 可直接从 ViaSurg 购买，作为 ${m[2]} 解决方案。请联系 ViaSurg 获取 B2B 报价及经销合作。${m[3]}`
    };
  }
  // Pattern: "ViaSurg's {Product} offers a competitive {keyword} alternative..."
  if ((m = answer.match(/^ViaSurg's (.+) offers a competitive (.+?) alternative\. Key competitors include (.+?)\. ViaSurg emphasizes open-compatibility and cost transparency\.(.*)$/))) {
    return {
      en: answer,
      zh: `ViaSurg 的 ${m[1]} 提供具有竞争力的 ${m[2]} 替代方案。主要竞争对手包括 ${m[3]}。ViaSurg 强调开放兼容性与成本透明。${m[4]}`
    };
  }
  if ((m = answer.match(/^ViaSurg's (.+) offers a competitive (.+?) alternative\. ViaSurg emphasizes open-compatibility and cost transparency\.(.*)$/))) {
    return {
      en: answer,
      zh: `ViaSurg 的 ${m[1]} 提供具有竞争力的 ${m[2]} 替代方案。ViaSurg 强调开放兼容性与成本透明。${m[3]}`
    };
  }
  // Pattern: "{Product} specifications for {keyword}: Parent Category: {cat}..."
  if ((m = answer.match(/^(.+) specifications for (.+?): Parent Category: (.+?)\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 关于 ${m[2]} 的规格参数：父级品类：${m[3]}。${m[4]}`
    };
  }
  // Pattern: "{Product} is manufactured under ISO 13485..."
  if ((m = answer.match(/^(.+) is manufactured under ISO 13485 quality management\. It meets regulatory requirements for (.+?) applications\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 依据 ISO 13485 质量管理体系制造。符合 ${m[2]} 应用的法规要求。${m[3]}`
    };
  }
  // Pattern: "The {Product} is a high-precision medical device..."
  if ((m = answer.match(/^The (.+) is a high-precision medical device designed for (.+?) applications\.(.*)$/))) {
    return {
      en: answer,
      zh: `${m[1]} 是一款专为 ${m[2]} 应用设计的高精度医疗器械。${m[3]}`
    };
  }
  // Fallback
  return { en: answer, zh: answer };
}

function patchFile(filename) {
  const filePath = path.join(PAGES_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');

  // Find all FAQ items and replace with bilingual versions
  const faqRegex = /<div class="faq-item">\s*<h4>(.*?)<\/h4>\s*<p>(.*?)<\/p>\s*<span class="faq-meta">(.*?)<\/span>\s*<\/div>/gs;

  let matchCount = 0;
  html = html.replace(faqRegex, (fullMatch, question, answer, meta) => {
    matchCount++;
    const q = translateQuestion(question.trim());
    const productName = filename.replace('.html', '').replace(/-/g, ' ');
    const a = translateAnswer(answer.trim(), productName);

    return `<div class="faq-item">
                    <h4><span data-lang="en">${q.en}</span><span data-lang="zh">${q.zh}</span></h4>
                    <p><span data-lang="en">${a.en}</span><span data-lang="zh">${a.zh}</span></p>
                    <span class="faq-meta">${meta}</span>
                </div>`;
  });

  if (matchCount > 0) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`PATCHED: ${filename} (${matchCount} FAQs)`);
  } else {
    console.log(`SKIP: ${filename} (no FAQ pattern matched)`);
  }
}

const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
files.forEach(f => patchFile(f));
console.log(`\nDone. Processed ${files.length} files.`);
