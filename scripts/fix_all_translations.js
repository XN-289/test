const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output');
const PAGES_DIR = path.join(OUTPUT_DIR, 'pages');

// ============ MAPPINGS ============

// Product title translations (h1 in detail pages)
const TITLE_MAP = {
    'Hemoclips': '止血夹',
    'Biopsy Forceps': '活检钳',
    'Absorbable Sutures': '可吸收缝合线',
    'Non Absorbable Sutures': '非可吸收缝合线',
    'Polymer Clips': '高分子结扎夹',
    'Guidewires': '导丝',
    'Hernia Meshes': '疝修补片',
    'Snares': '圈套器',
    'Staplers': '吻合器',
    'Trocars': '穿刺器',
    'Ultrasonic Shears': '超声刀',
    'Veress Needles': '气腹针',
};

// Category translations (for product-category spans and badge-category)
const CATEGORY_MAP = {
    'Sutures': '缝合线',
    'Instrumentation': '器械',
    'Medical Device': '医疗器械',
    'Clips': '夹子',
    'Access': '通路',
};

// Badge material translations
const MATERIAL_MAP = {
    'Polypropylene Material': '聚丙烯材质',
    'PGA Material': 'PGA 材质',
};

// ============ HELPERS ============

function readFile(filePath) {
    return fs.readFileSync(filePath, 'utf-8');
}

function writeFile(filePath, content) {
    fs.writeFileSync(filePath, content, 'utf-8');
}

// ============ FIX 1: Nested data-lang in index.html ============

function fixNestedDataLang(html) {
    // Pattern: <span data-lang="en"><span data-lang="en">VERIFIED</span><span data-lang="zh">已验证</span></span><span data-lang="zh">已验证</span>
    // Replace with: <span data-lang="en">VERIFIED</span><span data-lang="zh">已验证</span>
    const nestedPattern = /<span data-lang="en"><span data-lang="en">(.*?)<\/span><span data-lang="zh">(.*?)<\/span><\/span><span data-lang="zh">(.*?)<\/span>/g;
    let count = 0;
    const result = html.replace(nestedPattern, (match, enText, zhText1, zhText2) => {
        count++;
        return `<span data-lang="en">${enText}</span><span data-lang="zh">${zhText1}</span>`;
    });
    if (count > 0) {
        console.log(`  [Fix 1] Fixed ${count} nested data-lang instances`);
    }
    return result;
}

// ============ FIX 2: product-category spans in index.html ============

function fixProductCategory(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(CATEGORY_MAP)) {
        // Match bare product-category text without data-lang
        const pattern = new RegExp(
            `<span class="product-category">${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</span>`,
            'g'
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `<span class="product-category"><span data-lang="en">${en}</span><span data-lang="zh">${zh}</span></span>`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 2] Fixed ${count} product-category spans`);
    }
    return html;
}

// ============ FIX 3: Translate h1 titles in detail pages ============

function fixH1Titles(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(TITLE_MAP)) {
        // Match h1 where zh span contains English text (same as en)
        const pattern = new RegExp(
            `(<h1><span data-lang="en">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><span data-lang="zh">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><\\/h1>)`
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1${en}$2${zh}$3`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 3] Fixed ${count} h1 title translations`);
    }
    return html;
}

// ============ FIX 4: Translate badge-category spans in detail pages ============

function fixBadgeCategory(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(CATEGORY_MAP)) {
        // Match badge-category where zh span contains English text
        const pattern = new RegExp(
            `(<span class="badge badge-category"><span data-lang="en">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><span data-lang="zh">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><\\/span>)`
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1${en}$2${zh}$3`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 4] Fixed ${count} badge-category translations`);
    }
    return html;
}

// ============ FIX 5: Translate badge-material spans ============

function fixBadgeMaterial(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(MATERIAL_MAP)) {
        const pattern = new RegExp(
            `(<span class="badge badge-material"><span data-lang="en">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><span data-lang="zh">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span><\\/span>)`
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1${en}$2${zh}$3`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 5] Fixed ${count} badge-material translations`);
    }
    return html;
}

// ============ FIX 6: Translate Overview paragraph zh spans ============

// Translation map for overview paragraphs that have English duplicated in zh
const OVERVIEW_TRANSLATIONS = {
    // hemoclips
    'Comprehensive hemostasis solution matrix covering both endoscopic (Rotatable) and laparoscopic (Polymer) applications.':
        '全面的止血解决方案矩阵，涵盖内窥镜（可旋转）和腹腔镜（高分子）应用。',
    // biopsy-forceps
    'Disposable Biopsy Forceps are a standard consumable in endoscopy suites and are considered a "Cash Cow" (第二大现金牛) for ViaSurg.':
        '一次性活检钳是内窥镜室的标准耗材，被视为 ViaSurg 的「第二大现金牛」。',
    // snares
    'Cold and Hot Snares for endoscopic polypectomy. Following the global shift towards "Cold Snare Polypectomy" (CSP) for safety and efficiency in outpatient settings.':
        '用于内窥镜息肉切除术的冷圈套器和热圈套器。顺应全球向「冷圈套器息肉切除术」(CSP) 的转变，以提高门诊手术的安全性和效率。',
    // staplers
    'Surgical Staplers (Laparoscopic and Circular) are highly technical and heavily regulated products. While high in volume and margin, they are subject to strict oversight.':
        '外科吻合器（腹腔镜和管状）是技术含量高、监管严格的产品。虽然销量和利润率高，但受到严格监管。',
    // trocars
    'High-precision laparoscopic access instruments. Deterministic manufacturing via NomoFlow_Technology.':
        '高精度腹腔镜通路器械。通过 NomoFlow_Technology 实现确定性制造。',
    // ultrasonic-shears
    'Active energy device for simultaneous cutting and coagulation of tissue. Operates at ultrasonic frequencies (e.g., 55.5 kHz) to minimize thermal spread.':
        '用于同时切割和凝血组织的有源能量器械。以超声频率（如 55.5 kHz）工作，最大限度减少热扩散。',
    // veress-needles
    'Disposable needles for establishing pneumoperitoneum during laparoscopic surgery. Features a spring-loaded blunt stylet for safe insertion.':
        '用于腹腔镜手术中建立气腹的一次性气腹针。采用弹簧加载钝头针芯，确保安全插入。',
    // guidewires
    'High-performance guidewires for GI, Urology, and Peripheral Vascular access. Featuring Zebra (striped) patterning for visual confirmation of movement and hydrophilic coating for ultra-low friction.':
        '用于消化内科、泌尿外科和外周血管介入的高性能导丝。采用斑马纹（条纹）涂层设计，便于视觉确认移动，亲水涂层实现超低摩擦。',
    // hernia-meshes
    'Surgical mesh for reinforcement of soft tissue defects in hernia repair. Primarily made from synthetic non-absorbable polymers (e.g., Polypropylene).':
        '用于疝修补术中加固软组织缺损的外科补片。主要由合成不可吸收高分子材料（如聚丙烯）制成。',
    // polymer-clips
    'Non-absorbable polymer ligation clips for high-security closure of vessels and tissue bundles. Designed for use in laparoscopic surgery.':
        '不可吸收高分子结扎夹，用于血管和组织束的高安全性闭合。专为腹腔镜手术设计。',
    // non-absorbable-sutures
    'Permanent surgical sutures (e.g., Polypropylene, Nylon). Essential for vascular, cardiac, and orthopedic procedures requiring permanent wound support.':
        '永久性外科缝合线（如聚丙烯、尼龙）。对于需要永久性伤口支撑的血管、心脏和骨科手术至关重要。',
    // absorbable-sutures
    'Synthetic absorbable surgical sutures (e.g., PGA, PGLA). Designed to provide reliable wound support during critical healing and then absorb via hydrolysis.':
        '合成可吸收手术缝合线（如 PGA、PGLA）。旨在关键愈合期提供可靠的伤口支撑，随后通过水解吸收。',
};

function fixOverviewParagraphs(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(OVERVIEW_TRANSLATIONS)) {
        // Escape special regex characters in the English text
        const escapedEn = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(
            `(<p><span data-lang="en">)${escapedEn}(<\\/span><span data-lang="zh">)${escapedEn}(<\\/span><\\/p>)`
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1${en}$2${zh}$3`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 6] Fixed ${count} overview paragraph translations`);
    }
    return html;
}

// ============ FIX 7: Translate FAQ answer zh spans that have English duplicated ============

// Map of English FAQ answers to Chinese translations
// We'll detect these by finding <p> tags where en and zh spans have identical content
// and the zh content is clearly English

function fixFAQEnglishInZh(html) {
    // Find all <p> tags within faq-item that have en and zh spans with identical English content
    const faqAnswerPattern = /<p><span data-lang="en">((?:(?!<\/span>).)+)<\/span><span data-lang="zh">((?:(?!<\/span>).)+)<\/span><\/p>/g;
    let count = 0;

    html = html.replace(faqAnswerPattern, (match, enText, zhText) => {
        // If zh text is identical to en text, it needs translation
        if (enText === zhText && /[a-zA-Z]/.test(zhText)) {
            const translated = translateFAQAnswer(enText);
            if (translated !== zhText) {
                count++;
                return `<p><span data-lang="en">${enText}</span><span data-lang="zh">${translated}</span></p>`;
            }
        }
        return match;
    });

    if (count > 0) {
        console.log(`  [Fix 7] Fixed ${count} FAQ answer translations`);
    }
    return html;
}

function translateFAQAnswer(text) {
    // Generic FAQ answer translations
    // These follow a very predictable pattern, so we can do pattern-based translation

    // "X specifications for Y: ..." pattern
    const specPattern = /^(.+?) specifications for (.+?): (.+)$/;
    const specMatch = text.match(specPattern);
    if (specMatch) {
        let [, product, keyword, details] = specMatch;
        // Translate the details
        details = translateSpecDetails(details);
        return `${product} 关于 ${keyword} 的规格参数： ${details}`;
    }

    // "X is classified under Y. It is designed for..." pattern
    const classPattern = /^(.+?) is classified under (.+?)\. It is designed for clinical reliability and precision in (.+?) applications\.(.*)$/;
    const classMatch = text.match(classPattern);
    if (classMatch) {
        let [, product, category, keyword, extra] = classMatch;
        extra = translateExtra(extra);
        return `${product} 归类于 ${category}。专为 ${keyword} 应用场景的临床可靠性与精确性而设计。${extra}`;
    }

    // "X is classified under Y using Z material. It is designed for..." pattern
    const classMatPattern = /^(.+?) is classified under (.+?) using (.+?) material\. It is designed for clinical reliability and precision in (.+?) applications\.(.*)$/;
    const classMatMatch = text.match(classMatPattern);
    if (classMatMatch) {
        let [, product, category, material, keyword, extra] = classMatMatch;
        extra = translateExtra(extra);
        return `${product} 归类于 ${category} 使用 ${material} 材料。专为 ${keyword} 应用场景的临床可靠性与精确性而设计。${extra}`;
    }

    // "X is available directly from ViaSurg as a Y solution. Market CPC for Y keywords averages $Z. Contact ViaSurg..." pattern
    const availCPCPattern = /^(.+?) is available directly from ViaSurg as a (.+?) solution\. Market CPC for (.+?) keywords averages (\$[\d.]+)\.?\s*Contact ViaSurg for B2B pricing and distributor inquiries\.$/;
    const availCPCMatch = text.match(availCPCPattern);
    if (availCPCMatch) {
        let [, product, keyword1, keyword2, cpc] = availCPCMatch;
        return `${product} 可直接从 ViaSurg 购买，作为 ${keyword1} 解决方案。${keyword2} 关键词的市场平均点击成本为 ${cpc}。请联系 ViaSurg 获取 B2B 报价及经销合作。`;
    }

    // "X is available directly from ViaSurg as a Y solution. Contact ViaSurg..." pattern
    const availPattern = /^(.+?) is available directly from ViaSurg as a (.+?) solution\. Contact ViaSurg for B2B pricing and distributor inquiries\.$/;
    const availMatch = text.match(availPattern);
    if (availMatch) {
        let [, product, keyword] = availMatch;
        return `${product} 可直接从 ViaSurg 购买，作为 ${keyword} 解决方案。请联系 ViaSurg 获取 B2B 报价及经销合作。`;
    }

    // "ViaSurg's X offers a competitive Y alternative. Key competitors include Z.. ViaSurg emphasizes..." pattern
    const compPattern = /^ViaSurg's (.+?) offers a competitive (.+?) alternative\. Key competitors include (.+?)\.\.\s*ViaSurg emphasizes open-compatibility and cost transparency\.$/;
    const compMatch = text.match(compPattern);
    if (compMatch) {
        let [, product, keyword, competitors] = compMatch;
        return `ViaSurg 的 ${product} 提供具有竞争力的 ${keyword} 替代方案。主要竞争对手包括 ${competitors}。ViaSurg 强调开放兼容性与成本透明。`;
    }

    // "ViaSurg's X offers a competitive Y alternative. ViaSurg emphasizes..." pattern (no competitors)
    const compPattern2 = /^ViaSurg's (.+?) offers a competitive (.+?) alternative\. ViaSurg emphasizes open-compatibility and cost transparency\.$/;
    const compMatch2 = text.match(compPattern2);
    if (compMatch2) {
        let [, product, keyword] = compMatch2;
        return `ViaSurg 的 ${product} 提供具有竞争力的 ${keyword} 替代方案。ViaSurg 强调开放兼容性与成本透明。`;
    }

    // "X is manufactured under ISO 13485 quality management. It meets regulatory requirements for Y applications." pattern
    const mfgPattern = /^(.+?) is manufactured under ISO 13485 quality management\. It meets regulatory requirements for (.+?) applications\.$/;
    const mfgMatch = text.match(mfgPattern);
    if (mfgMatch) {
        let [, product, keyword] = mfgMatch;
        return `${product} 依据 ISO 13485 质量管理体系制造。符合 ${keyword} 应用的法规要求。`;
    }

    // "X is manufactured under ISO 13485 quality management. [extra]. It meets regulatory requirements for Y applications." pattern
    const mfgExtraPattern = /^(.+?) is manufactured under ISO 13485 quality management\.(.+?) It meets regulatory requirements for (.+?) applications\.$/;
    const mfgExtraMatch = text.match(mfgExtraPattern);
    if (mfgExtraMatch) {
        let [, product, extra, keyword] = mfgExtraMatch;
        return `${product} 依据 ISO 13485 质量管理体系制造。${extra}符合 ${keyword} 应用的法规要求。`;
    }

    return text; // Return unchanged if no pattern matches
}

function translateSpecDetails(details) {
    // Translate common specification detail phrases
    let d = details;

    // Common spec translations
    const specTranslations = {
        'Parent Category:': '所属分类：',
        'Parent:': '所属分类：',
        'Wound_Closure': 'Wound_Closure',
        'Minimally_Invasive_Surgery': 'Minimally_Invasive_Surgery',
        'NomoFlow_Solutions': 'NomoFlow_Solutions',
    };

    for (const [en, zh] of Object.entries(specTranslations)) {
        d = d.replace(new RegExp(en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), zh);
    }

    return d;
}

function translateExtra(extra) {
    if (!extra) return '';
    // Translate " Verified: ..." pattern
    extra = extra.replace(/ Verified: (.+?)\./g, ' 已验证：$1。');
    return extra;
}

// ============ FIX 8: Translate spec-value that are bare English ============

const SPEC_VALUE_MAP = {
    'Clips': '夹子',
    'Instrumentation': '器械',
    'Sutures': '缝合线',
    'Access': '通路',
    'Medical Device': '医疗器械',
};

function fixSpecValues(html) {
    // These are sidebar spec-values that show category without data-lang
    // We wrap them in data-lang spans
    let count = 0;
    for (const [en, zh] of Object.entries(SPEC_VALUE_MAP)) {
        const pattern = new RegExp(
            `(<span class="spec-value">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span>)`,
            'g'
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 8] Fixed ${count} spec-value translations`);
    }
    return html;
}

// ============ FIX 9: Translate sidebar spec-value for Polypropylene Material ============

function fixSpecValueMaterial(html) {
    let count = 0;
    for (const [en, zh] of Object.entries(MATERIAL_MAP)) {
        const pattern = new RegExp(
            `(<span class="spec-value">)${en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\\/span>)`,
            'g'
        );
        if (pattern.test(html)) {
            html = html.replace(pattern, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
            count++;
        }
    }
    if (count > 0) {
        console.log(`  [Fix 9] Fixed ${count} spec-value material translations`);
    }
    return html;
}

// ============ FIX 10: Fix nested data-lang in competitor pages ============

function fixNestedDataLangDeep(html) {
    // Handle triple-nested pattern: <span data-lang="en"><span data-lang="en"><span data-lang="en">...</span><span data-lang="zh">...</span></span><span data-lang="zh">...</span></span><span data-lang="zh">...</span>
    // This appears in competitor pages like competitor-ethicon.html line 106
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 5) {
        const before = html;
        // Fix double-nested: <span data-lang="X"><span data-lang="X">text</span><span data-lang="Y">text</span></span><span data-lang="Y">text</span>
        html = fixNestedDataLang(html);
        changed = (before !== html);
        iterations++;
    }
    return html;
}

// ============ FIX 11: Translate "Dominant Products" product-tag spans with nested data-lang ============

function fixDominantProductsNested(html) {
    // Pattern: <span class="product-tag" style="..."><span data-lang="en"><span data-lang="en">...</span><span data-lang="zh">...</span></span><span data-lang="zh">...</span></span>
    // These are triple-nested, need to unwrap to single level
    const pattern = /<span class="product-tag"([^>]*)><span data-lang="en"><span data-lang="en">((?:(?!<\/span>).)*)<\/span><span data-lang="zh">((?:(?!<\/span>).)*)<\/span><\/span><span data-lang="zh">((?:(?!<\/span>).)*)<\/span><\/span>/g;
    let count = 0;
    html = html.replace(pattern, (match, attrs, enText, zhText1, zhText2) => {
        count++;
        return `<span class="product-tag"${attrs}><span data-lang="en">${enText}</span><span data-lang="zh">${zhText1}</span></span>`;
    });
    if (count > 0) {
        console.log(`  [Fix 11] Fixed ${count} dominant products nested spans`);
    }
    return html;
}

// ============ FIX 12: Wrap Market Strategy description and Target Brands in data-lang ============

// Map of product pages to their Market Strategy and Target Brands translations
const MARKET_STRATEGY_MAP = {
    'hemoclips': {
        strategy: '提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出',
        targets: 'Olympus, Cook Medical',
    },
    'biopsy-forceps': {
        strategy: '以「底价+现货」模式主导该品类，替代现有供应商',
        targets: 'Olympus, ConMed',
    },
    'snares': {
        strategy: '聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案',
        targets: 'Olympus, Cook Medical',
    },
    'staplers': {
        strategy: '终极 SKU 狙击战',
        targets: 'Ethicon, Medtronic',
    },
    'trocars': {
        strategy: '经临床验证的医疗器械，制造透明、性能有循证支持。',
        targets: 'Ethicon, Applied Medical',
    },
    'ultrasonic-shears': {
        strategy: '兼容性战争',
        targets: 'Ethicon (Harmonic Scalpel)',
    },
    'veress-needles': {
        strategy: '放量标杆产品',
        targets: 'Ethicon',
    },
    'guidewires': {
        strategy: '稳定的放量产品',
        targets: 'Terumo, Boston Scientific',
    },
    'hernia-meshes': {
        strategy: '以材料为核心的信息传递',
        targets: 'Bard (BD), Ethicon',
    },
    'polymer-clips': {
        strategy: '生态系统锁定',
        targets: 'Teleflex (Hem-o-lok)',
    },
    'non-absorbable-sutures': {
        strategy: '全面的 SKU 矩阵',
        targets: 'Ethicon (Prolene, Ethilon)',
    },
    'absorbable-sutures': {
        strategy: '目标通用搜索意图',
        targets: 'Ethicon (Vicryl, Monocryl)',
    },
};

function fixMarketStrategyDescriptions(html, filename) {
    const basename = path.basename(filename, '.html');
    const translations = MARKET_STRATEGY_MAP[basename];
    if (!translations) return html;

    let count = 0;

    // Fix Market Strategy: <h2>...市场策略...</h2><p>English text</p>
    // The <p> after Market Strategy h2 has no data-lang
    const strategyPattern = /(<h2><span data-lang="en">Market Strategy<\/span><span data-lang="zh">市场策略<\/span><\/h2>)<p>([^<]+)<\/p>/;
    if (strategyPattern.test(html)) {
        html = html.replace(strategyPattern, (match, h2, text) => {
            count++;
            return `${h2}<p><span data-lang="en">${text}</span><span data-lang="zh">${translations.strategy}</span></p>`;
        });
    }

    // Fix Target Brands: <h2>...目标品牌...</h2><p>English text</p>
    const brandsPattern = /(<h2><span data-lang="en">Target Brands<\/span><span data-lang="zh">目标品牌<\/span><\/h2>)<p>([^<]+)<\/p>/;
    if (brandsPattern.test(html)) {
        html = html.replace(brandsPattern, (match, h2, text) => {
            count++;
            return `${h2}<p><span data-lang="en">${text}</span><span data-lang="zh">${translations.targets}</span></p>`;
        });
    }

    if (count > 0) {
        console.log(`  [Fix 12] Fixed ${count} market strategy/brand descriptions`);
    }
    return html;
}

// ============ FIX 13: Wrap Technical Specifications list items in data-lang ============

// Translation map for technical spec items
const TECH_SPEC_TRANSLATIONS = {
    // hemoclips
    'Rotatable Hemoclips: 360° bidirectional rotation provides precise lesion targeting. High-clamping force ensures effective immediate hemostasis.':
        '可旋转止血夹：360° 双向旋转提供精确病灶定位。高夹持力确保有效的即时止血。',
    'Polymer Clips: Integrated locking mechanism with tactile "click" feedback. Atraumatic teeth prevent vessel slippage.':
        '高分子结扎夹：集成锁定机构，带触觉「咔嗒」反馈。无创齿防止血管滑脱。',
    'Reference Standard: Equivalent to Teleflex Hem-o-lok and Olympus QuickClip.':
        '参考标准：等同于 Teleflex Hem-o-lok 和 Olympus QuickClip。',
    'Revenue Capture: Targets the highest CPC procurement intent categories.':
        '收入获取：瞄准最高 CPC 采购意图品类。',
    'Free-Applier Strategy: Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital.':
        '免费施夹器策略：提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出。',
    'Market Arbitrage: Capture of premium market share from high-cost incumbents through verified technical parity.':
        '市场套利：通过经验证的技术平价，从高成本现有厂商手中夺取高端市场份额。',
    'Biocompatibility: Medical Grade POM/PC, certified for long-term implantation.':
        '生物相容性：医用级 POM/PC，经认证可用于长期植入。',
    'MRI Safety: Non-metallic, MRI-conditional (verified via ISO 10993).':
        'MRI 安全性：非金属材质，MRI 条件安全（经 ISO 10993 验证）。',
    'Verification ID: V-HC-2025-04 (Closure security test).':
        '验证编号：V-HC-2025-04（闭合安全性测试）。',

    // biopsy-forceps
    'CPC: $49.06 (Extremely high CPC).':
        'CPC：$49.06（极高的 CPC）。',
    'Complexity: Low (Pure consumable, low risk, standard FDA 510(k) path).':
        '复杂度：低（纯耗材，低风险，标准 FDA 510(k) 路径）。',
    'Olympus, ConMed':
        'Olympus, ConMed',

    // snares
    'Loop Shape: Oval, Hexagonal, Crescent.':
        '圈套形状：椭圆形、六边形、新月形。',
    'Wire Diameter: Optimized for sharp-cutting without thermal damage (for cold snares).':
        '钢丝直径：优化为锐利切割，无热损伤（适用于冷圈套器）。',
    'Compatibility: Standard 2.8mm / 3.2mm biopsy channels.':
        '兼容性：标准 2.8mm / 3.2mm 活检通道。',
    'Olympus, Cook Medical':
        'Olympus, Cook Medical',

    // staplers
    'Ethicon, Medtronic':
        'Ethicon, Medtronic',

    // trocars
    'Low-Friction Entry: Verified reduction in insertion force (< 15.0 N) minimizes abdominal wall trauma.':
        '低摩擦进入：经验证可降低插入力（< 15.0 N），最大限度减少腹壁损伤。',
    'Visual Stability: Proprietary dual-seal valve maintains pneumoperitoneum during high-frequency instrument exchange, preventing "scope-fogging" and loss of visualization.':
        '视觉稳定性：专有双密封阀在高频器械交换期间维持气腹，防止「镜头起雾」和视野丢失。',
    'Reference Standard: 1:1 tactile equivalence to Ethicon B5LT and Applied_Medical CFF03.':
        '参考标准：与 Ethicon B5LT 和 Applied_Medical CFF03 的 1:1 触觉等效。',
    '40% Cost Reduction: Direct replacement of OEM SKUs with no loss in clinical performance.':
        '成本降低 40%：直接替代 OEM SKU，临床性能无损失。',
    'Simplified Inventory: Universal compatibility reduces the need for multiple vendor SKU variants.':
        '简化库存：通用兼容性减少了多种供应商 SKU 变体的需求。',
    'ROI Projection: High-frequency consumable. Estimated annual savings for a standard ASC: $12,000 - $18,000.':
        '投资回报预测：高频耗材。标准 ASC 估计年节省：$12,000 - $18,000。',
    'FDA 510(k): Registered via OBL (Relabeler) Protocol VS-TR-21.':
        'FDA 510(k)：通过 OBL（重新标签商）协议 VS-TR-21 注册。',
    'ISO 13485: Manufacturing lot-traceability integrated into NomoFlow_Technology ledger.':
        'ISO 13485：制造批次可追溯性集成到 NomoFlow_Technology 账本中。',
    'Verification ID: V-TR-2025-01 (Air-tightness certification).':
        '验证编号：V-TR-2025-01（气密性认证）。',
    'Ethicon, Applied Medical':
        'Ethicon, Applied Medical',

    // ultrasonic-shears
    'Frequency: 55.5 kHz.':
        '频率：55.5 kHz。',
    'Thermal Spread: < 2.0 mm.':
        '热扩散：< 2.0 mm。',
    'Vessel Sealing: Reliable up to 5mm diameter.':
        '血管封闭：可靠封闭直径达 5mm 的血管。',
    'Handpiece: Reusable or Disposable variants available.':
        '手柄：提供可重复使用或一次性使用变体。',
    'Ethicon (Harmonic Scalpel)':
        'Ethicon (Harmonic Scalpel)',

    // veress-needles
    'Safety Mechanism: Spring-loaded retracting blunt tip.':
        '安全机构：弹簧加载可回缩钝头。',
    'Length: 120mm / 150mm.':
        '长度：120mm / 150mm。',
    'Luer Lock: High-flow stopcock for rapid CO2 insufflation.':
        '鲁尔锁：高流量三通阀，用于快速 CO2 充气。',

    // guidewires
    'Core Material: Nitinol (Shape Memory).':
        '芯材：镍钛合金（形状记忆）。',
    'Coating: Hydrophilic (PVP-based).':
        '涂层：亲水性（PVP 基）。',
    'Tip: Straight, J-tip, Angled.':
        '头端：直头、J 形头、成角头。',
    'Radiopacity: Tungsten-loaded for fluoroscopic visibility.':
        '射线可透性：含钨成分，便于透视观察。',
    'Terumo, Boston Scientific':
        'Terumo, Boston Scientific',

    // hernia-meshes
    'Weight: Ultra-light / Light / Heavyweight options.':
        '重量：超轻 / 轻 / 重量级选项。',
    'Pore Size: Optimized for tissue ingrowth (e.g., Macroporous).':
        '孔径：优化为组织长入（如大孔径）。',
    'Bard (BD), Ethicon':
        'Bard (BD), Ethicon',

    // polymer-clips
    'Security: Integrated "Integrated Boss" locking mechanism for zero-slippage.':
        '安全性：集成「一体式凸台」锁定机构，实现零滑脱。',
    'Compatibility: Compatible with industry-standard appliers.':
        '兼容性：兼容行业标准施夹器。',
    'Sizes: Medium (Purple), Medium-Large (Green), Large (Orange), Extra-Large (Yellow).':
        '尺寸：中号（紫色）、中大号（绿色）、大号（橙色）、特大号（黄色）。',
    'Teleflex (Hem-o-lok)':
        'Teleflex (Hem-o-lok)',

    // non-absorbable-sutures
    'Structure: Monofilament.':
        '结构：单丝。',
    'Radiopacity: Non-radiopaque.':
        '射线可透性：非射线可透。',
    'Ethicon (Prolene, Ethilon)':
        'Ethicon (Prolene, Ethilon)',

    // absorbable-sutures
    'Structure: Braided / Monofilament.':
        '结构：编织 / 单丝。',
    'Coating: Polycaprolactone and Calcium Stearate.':
        '涂层：聚己内酯和硬脂酸钙。',
    'Absorption Time: ~60-90 days (complete).':
        '吸收时间：约 60-90 天（完全吸收）。',
    'Ethicon (Vicryl, Monocryl)':
        'Ethicon (Vicryl, Monocryl)',
};

function fixTechSpecItems(html) {
    // Find <li> items in Technical Specifications section that don't have data-lang
    let count = 0;

    // Match bare <li> items (without data-lang) - use a more permissive pattern
    const liPattern = /<li>(?!<span data-lang)((?:(?!<\/li>).)+)<\/li>/g;

    html = html.replace(liPattern, (match, inner) => {
        // Strip HTML tags to get plain text for lookup
        const plainText = inner.replace(/<[^>]+>/g, '').trim();
        const translated = TECH_SPEC_TRANSLATIONS[plainText];
        if (translated) {
            count++;
            return `<li><span data-lang="en">${plainText}</span><span data-lang="zh">${translated}</span></li>`;
        }
        return match;
    });

    if (count > 0) {
        console.log(`  [Fix 13] Fixed ${count} technical specification items`);
    }
    return html;
}

// ============ FIX 14: Translate competitor page content without data-lang ============

// Map of competitor pages to their Market Position descriptions
const COMPETITOR_MARKET_POSITION = {
    'competitor-ethicon': '主导产品包括 Vicryl（缝合线）、Harmonic Scalpel（超声刀）、Echelon（吻合器）。',
    'competitor-bard': 'Bard（现为 BD 旗下）是疝修补片和血管通路器械的领先供应商。',
    'competitor-boston-scientific': 'Boston Scientific 是内窥镜和心血管介入器械的全球领导者。',
    'competitor-cook-medical': 'Cook Medical 在介入放射学和消化内窥镜领域具有强大影响力。',
    'competitor-medtronic': 'Medtronic 是全球最大的医疗器械公司之一，产品线涵盖多个领域。',
    'competitor-olympus': 'Olympus 是内窥镜市场的绝对领导者，占据约 70% 的市场份额。',
    'competitor-teleflex': 'Teleflex 专注于血管通路和手术器械，旗下拥有 Hem-o-lok 品牌。',
    'competitor-terumo': 'Terumo 在介入心血管和血管外科领域具有技术优势。',
};

function fixCompetitorMarketPosition(html, filename) {
    const basename = path.basename(filename, '.html');
    const translation = COMPETITOR_MARKET_POSITION[basename];
    if (!translation) return html;

    // Find Market Position paragraph without data-lang
    const pattern = /(<h2><span data-lang="en">Market Position<\/span><span data-lang="zh">市场定位<\/span><\/h2>)\s*<p>([^<]+)<\/p>/;
    if (pattern.test(html)) {
        let count = 0;
        html = html.replace(pattern, (match, h2, text) => {
            count++;
            return `${h2}\n                <p><span data-lang="en">${text.trim()}</span><span data-lang="zh">${translation}</span></p>`;
        });
        if (count > 0) {
            console.log(`  [Fix 14] Fixed ${count} competitor market position translations`);
        }
    }
    return html;
}

// ============ FIX 15: Translate entity page content without data-lang ============

const ENTITY_OVERVIEW_MAP = {
    'entity-viasurg': 'ViaSurg 定位为「全球医疗标品流量套利机器」。战略目标是利用已建立的行业标准（Ethicon, Medtronic 等）来获取 B2B 市场份额。',
    'entity-hangzhou-sode': '杭州硕德是 ViaSurg 的制造合作伙伴，专注于高精度医疗器械的生产。',
    'entity-ethicon-b5lt': 'Ethicon B5LT 是 Ethicon 旗下的腹腔镜穿刺器产品，是 ViaSurg Trocars 的直接对标产品。',
    'entity-johnson-cdh29p': 'J&J CDH29P 是强生旗下的管状吻合器，是 ViaSurg Staplers 的直接对标产品。',
    'entity-teleflex-hem-o-lok': 'Teleflex Hem-o-lok 是全球领先的高分子结扎夹产品，以其「一体式凸台」锁定机构闻名。是 ViaSurg Polymer Clips 的直接对标产品。',
    'entity-compliance-framework': 'ViaSurg 合规框架确保所有产品符合 FDA 510(k) 和 CE MDR 认证要求，涵盖质量管理体系、产品追溯和临床验证。',
    'entity-endoscopic-procedures': '内窥镜手术是 ViaSurg 产品线的核心应用领域，涵盖消化内科、呼吸内科等多个科室的诊断和治疗操作。',
    'entity-laparoscopic-surgery': '腹腔镜手术是 ViaSurg 产品线的主要应用场景，涵盖胆囊切除、疝修补、妇科手术等多种微创手术类型。',
};

// Entity h1 translations
const ENTITY_H1_MAP = {
    'Teleflex Hem o lok': 'Teleflex Hem-o-lok',
};

function fixEntityPageContent(html, filename) {
    const basename = path.basename(filename, '.html');

    // Fix bare h1 tags
    const h1Pattern = /<h1>([^<]+)<\/h1>/;
    const h1Match = html.match(h1Pattern);
    if (h1Match) {
        const h1Text = h1Match[1].trim();
        // Check if it needs translation
        const h1Translation = ENTITY_H1_MAP[h1Text];
        if (h1Translation && h1Translation !== h1Text) {
            html = html.replace(h1Pattern, `<h1><span data-lang="en">${h1Text}</span><span data-lang="zh">${h1Translation}</span></h1>`);
            console.log(`  [Fix 15] Fixed entity h1: ${h1Text}`);
        } else if (!/<span data-lang/.test(h1Text)) {
            // Wrap in data-lang even if same text (brand name)
            html = html.replace(h1Pattern, `<h1><span data-lang="en">${h1Text}</span><span data-lang="zh">${h1Text}</span></h1>`);
            console.log(`  [Fix 15] Wrapped entity h1 in data-lang: ${h1Text}`);
        }
    }

    // Fix bare Overview paragraphs
    const translation = ENTITY_OVERVIEW_MAP[basename];
    if (translation) {
        const pattern = /(<h2><span data-lang="en">Overview<\/span><span data-lang="zh">概述<\/span><\/h2>)\s*<p>([^<]+)<\/p>/;
        if (pattern.test(html)) {
            html = html.replace(pattern, (match, h2, text) => {
                console.log(`  [Fix 15] Fixed entity overview: ${basename}`);
                return `${h2}\n            <p><span data-lang="en">${text.trim()}</span><span data-lang="zh">${translation}</span></p>`;
            });
        }
    }

    // Also fix Company Overview pattern
    const companyTranslation = ENTITY_OVERVIEW_MAP[basename];
    if (companyTranslation) {
        const pattern = /(<h2><span data-lang="en">Company Overview<\/span><span data-lang="zh">公司概述<\/span><\/h2>)\s*<p>([^<]+)<\/p>/;
        if (pattern.test(html)) {
            html = html.replace(pattern, (match, h2, text) => {
                console.log(`  [Fix 15] Fixed entity company overview: ${basename}`);
                return `${h2}\n            <p><span data-lang="en">${text.trim()}</span><span data-lang="zh">${companyTranslation}</span></p>`;
            });
        }
    }

    return html;
}

// ============ FIX 16: Translate tech page content without data-lang ============

function fixTechPageContent(html, filename) {
    const basename = path.basename(filename, '.html');

    if (basename === 'tech-nomoflow-technology') {
        // Technology Overview paragraph
        const techPattern = /(<h2><span data-lang="en">Technology Overview<\/span><span data-lang="zh">技术概述<\/span><\/h2>)\s*<p>([^<]+)<\/p>/;
        if (techPattern.test(html)) {
            const translation = 'NomoFlow™ 是一个闭环控制平台，旨在通过高频参数补偿减少批次变异性。1. 感知：150 个节点以 1000Hz 采样变量（热、压、流）。2. 分析：AI 驱动的 PID 循环将实时数据与主参考模型进行比较。';
            html = html.replace(techPattern, (match, h2, text) => {
                console.log(`  [Fix 16] Fixed tech page content`);
                return `${h2}\n            <p><span data-lang="en">${text.trim()}</span><span data-lang="zh">${translation}</span></p>`;
            });
        }

        // Related Categories and Products Using This Technology lists
        // These have links without data-lang - wrap them
        const relatedCatsPattern = /(<h2><span data-lang="en">Related Categories<\/span><span data-lang="zh">相关分类<\/span><\/h2>)<ul><li><a href="([^"]+)">([^<]+)<\/a><\/li><li><a href="([^"]+)">([^<]+)<\/a><\/li><\/ul>/;
        if (relatedCatsPattern.test(html)) {
            html = html.replace(relatedCatsPattern, (match, h2, href1, name1, href2, name2) => {
                console.log(`  [Fix 16] Fixed related categories links`);
                return `${h2}<ul><li><a href="${href1}"><span data-lang="en">${name1}</span><span data-lang="zh">智能</span></a></li><li><a href="${href2}"><span data-lang="en">${name2}</span><span data-lang="zh">伤口闭合</span></a></li></ul>`;
            });
        }

        const productsUsingPattern = /(<h2><span data-lang="en">Products Using This Technology<\/span><span data-lang="zh">使用此技术的产品<\/span><\/h2>)<ul><li><a href="([^"]+)">([^<]+)<\/a><\/li><li><a href="([^"]+)">([^<]+)<\/a><\/li><\/ul>/;
        if (productsUsingPattern.test(html)) {
            html = html.replace(productsUsingPattern, (match, h2, href1, name1, href2, name2) => {
                console.log(`  [Fix 16] Fixed products using technology links`);
                return `${h2}<ul><li><a href="${href1}"><span data-lang="en">${name1}</span><span data-lang="zh">穿刺器</span></a></li><li><a href="${href2}"><span data-lang="en">${name2}</span><span data-lang="zh">超声刀</span></a></li></ul>`;
            });
        }
    }

    return html;
}

// ============ FIX 17: Translate material page table cells without data-lang ============

function fixMaterialPageContent(html, filename) {
    const basename = path.basename(filename, '.html');

    if (basename === 'material-pga-material') {
        // The table has bare text in td cells
        const tableTranslations = {
            'Tensile Strength': '抗拉强度',
            'Absorption Method': '吸收方式',
            'Tensile Strength Retention': '抗拉强度保持率',
            'Complete Absorption': '完全吸收',
            'Hydrolysis.': '水解。',
            'High for the first 14-21 days.': '前 14-21 天保持较高。',
            '60 to 90 days.': '60 至 90 天。',
        };

        // Fix bare product link text
        const productLinkPattern = /(<div style="font-weight:600;font-size:14px;">)Absorbable Sutures(<\/div>)/;
        if (productLinkPattern.test(html)) {
            html = html.replace(productLinkPattern, `$1<span data-lang="en">Absorbable Sutures</span><span data-lang="zh">可吸收缝合线</span>$2`);
            console.log(`  [Fix 17] Fixed material page product link`);
        }

        // Fix table header
        const thPattern = /<th>Property<\/th><th>Value<\/th>/;
        if (thPattern.test(html)) {
            html = html.replace(thPattern, `<th><span data-lang="en">Property</span><span data-lang="zh">属性</span></th><th><span data-lang="en">Value</span><span data-lang="zh">值</span></th>`);
            console.log(`  [Fix 17] Fixed material page table header`);
        }
    }

    if (basename === 'material-polypropylene-material') {
        const productLinkPattern = /(<div style="font-weight:600;font-size:14px;">)Non Absorbable Sutures(<\/div>)/;
        if (productLinkPattern.test(html)) {
            html = html.replace(productLinkPattern, `$1<span data-lang="en">Non Absorbable Sutures</span><span data-lang="zh">非可吸收缝合线</span>$2`);
            console.log(`  [Fix 17] Fixed material page product link`);
        }

        const thPattern = /<th>Property<\/th><th>Value<\/th>/;
        if (thPattern.test(html)) {
            html = html.replace(thPattern, `<th><span data-lang="en">Property</span><span data-lang="zh">属性</span></th><th><span data-lang="en">Value</span><span data-lang="zh">值</span></th>`);
            console.log(`  [Fix 17] Fixed material page table header`);
        }
    }

    return html;
}

// ============ FIX 18: Translate category page overview paragraphs without data-lang ============

function fixCategoryPageContent(html, filename) {
    const basename = path.basename(filename, '.html');

    const categoryOverviews = {
        'category-access': '手术切口建立与维持工具。',
        'category-clips': '用于血管和组织闭合的结扎夹产品。',
        'category-instrumentation': '外科手术器械和内窥镜耗材。',
        'category-intelligence': '智能制造和数据分析平台。',
        'category-minimally-invasive-surgery': '微创外科手术器械和耗材。',
        'category-nomoflow-solutions': 'NomoFlow™ 智能制造解决方案。',
        'category-sutures': '手术缝合线产品，包括可吸收和不可吸收缝合线。',
        'category-wound-closure': '伤口闭合产品和解决方案。',
    };

    const translation = categoryOverviews[basename];
    if (!translation) return html;

    // Find Category Overview paragraph without data-lang
    const pattern = /(<h2><span data-lang="en">Category Overview<\/span><span data-lang="zh">类别概述<\/span><\/h2>)\s*<p>([^<]+)<\/p>/;
    if (pattern.test(html)) {
        html = html.replace(pattern, (match, h2, text) => {
            console.log(`  [Fix 18] Fixed category page overview`);
            return `${h2}\n            <p><span data-lang="en">${text.trim()}</span><span data-lang="zh">${translation}</span></p>`;
        });
    }

    return html;
}

// ============ MAIN PROCESSING ============

function processFile(filePath) {
    const filename = path.basename(filePath);
    console.log(`\nProcessing: ${filename}`);

    let html = readFile(filePath);

    // Apply all fixes
    html = fixNestedDataLangDeep(html);
    html = fixNestedDataLang(html); // One more pass for any remaining

    if (filename === 'index.html') {
        html = fixProductCategory(html);
    }

    // Product detail pages
    html = fixH1Titles(html);
    html = fixBadgeCategory(html);
    html = fixBadgeMaterial(html);
    html = fixOverviewParagraphs(html);
    html = fixFAQEnglishInZh(html);
    html = fixSpecValues(html);
    html = fixSpecValueMaterial(html);
    html = fixDominantProductsNested(html);
    html = fixMarketStrategyDescriptions(html, filename);
    html = fixTechSpecItems(html);
    html = fixCompetitorMarketPosition(html, filename);
    html = fixEntityPageContent(html, filename);
    html = fixTechPageContent(html, filename);
    html = fixMaterialPageContent(html, filename);
    html = fixCategoryPageContent(html, filename);

    writeFile(filePath, html);
}

// Get all HTML files
const indexFile = path.join(OUTPUT_DIR, 'index.html');
const pageFiles = fs.readdirSync(PAGES_DIR)
    .filter(f => f.endsWith('.html'))
    .map(f => path.join(PAGES_DIR, f));

console.log('=== ViaSurg i18n Translation Fix Script ===');
console.log(`Processing ${pageFiles.length + 1} files...\n`);

// Process index.html
processFile(indexFile);

// Process all page files
for (const file of pageFiles) {
    processFile(file);
}

console.log('\n=== Done! ===');
