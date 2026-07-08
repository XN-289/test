const fs = require('fs');
const path = require('path');

function check() {
    let score = 0;
    const checks = {
        'Templates & Layout': fs.existsSync('templates/product_layout.html'),
        'I18n Dictionary (EN)': fs.existsSync('i18n/ui/en.json'),
        'I18n Dictionary (ZH)': fs.existsSync('i18n/ui/zh.json'),
        'SEO Optimizer Skill': fs.existsSync('source_skill/skills/seo-optimizer/SKILL.md'),
        'Wiki Hierarchy': fs.existsSync('llm_wiki/entities/Wound_Closure.md'),
        'Navigation Map': fs.existsSync('raw_references/structure/viasurg_nav_map.md'),
        'Generated SEO Page': fs.existsSync('website_out/zh/pages/absorbable-sutures.html')
    };

    // 基础分：存在性检查 (每个 10 分)
    Object.values(checks).forEach(pass => { if (pass) score += 10; });

    // 进阶分：内容深度检查
    if (checks['Generated SEO Page']) {
        const content = fs.readFileSync('website_out/zh/pages/absorbable-sutures.html', 'utf8');
        if (content.includes('application/ld+json')) score += 10; // SEO 嵌入
        if (content.includes('lang="zh"')) score += 10; // 多语言标识
        if (content.includes('mega-menu')) score += 10; // 组件注入
    }

    console.log(score);
    process.exit(0);
}

check();
