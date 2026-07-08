const fs = require('fs');
const path = require('path');

const ENTITIES_DIR = 'llm_wiki/entities';
const OUTPUT_DIR = 'website_out';
const TEMPLATE_FILE = 'templates/product_layout.html';
const CONTENT_DIR = 'i18n/content';
const UI_EN = JSON.parse(fs.readFileSync('i18n/ui/en.json', 'utf8'));
const UI_ZH = JSON.parse(fs.readFileSync('i18n/ui/zh.json', 'utf8'));

/**
 * Load content translation for a given language and slug.
 * Returns null if no translation file exists.
 */
function loadContentTranslation(lang, slug) {
    const filePath = path.join(CONTENT_DIR, lang, `${slug}.json`);
    if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    return null;
}

/**
 * Extract hierarchy fields from entity markdown.
 * Returns { category, material } strings.
 */
function extractHierarchy(markdown) {
    const hierarchyMatch = markdown.match(/## Hierarchy\n([\s\S]*?)(?=\n## |\n$)/);
    const result = { category: '', material: '' };
    if (!hierarchyMatch) return result;

    const block = hierarchyMatch[1];
    const categoryMatch = block.match(/\*\*Category\*\*:\s*\[\[(.+?)\]\]/);
    const parentMatch = block.match(/\*\*Parent Category\*\*:\s*\[\[(.+?)\]\]/);
    const materialMatch = block.match(/\*\*Material\*\*:\s*\[\[(.+?)\]\]/);

    // Build category breadcrumb: Parent > Category
    const parts = [];
    if (parentMatch) parts.push(parentMatch[1].replace(/_/g, ' '));
    if (categoryMatch) parts.push(categoryMatch[1].replace(/_/g, ' '));
    result.category = parts.join(' > ');

    if (materialMatch) result.material = materialMatch[1].replace(/_/g, ' ');

    return result;
}

/**
 * Generate default English content body from entity markdown overview.
 */
function generateDefaultBody(markdown, title) {
    const overviewMatch = markdown.match(/## Overview\n(.+?)(?=\n\n|\n## )/s);
    if (overviewMatch) {
        return `<p>${overviewMatch[1].trim()}</p>`;
    }
    return `<p>Knowledge extracted from Wiki for ${title}.</p>`;
}

function build() {
    const entities = fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.md'));
    const template = fs.readFileSync(TEMPLATE_FILE, 'utf8');

    let stats = { total: entities.length, translated: 0, fallback: 0 };

    entities.forEach(file => {
        const slug = file.replace('.md', '').toLowerCase().replace(/_/g, '-').replace(/\s+/g, '-');
        const markdown = fs.readFileSync(path.join(ENTITIES_DIR, file), 'utf8');

        // Extract title from first H1
        const titleMatch = markdown.match(/^# (.*)/);
        const enTitle = titleMatch ? titleMatch[1] : slug;

        // Extract hierarchy for default category/material
        const hierarchy = extractHierarchy(markdown);

        // Generate default English body from Overview section
        const enBody = generateDefaultBody(markdown, enTitle);

        ['en', 'zh'].forEach(lang => {
            const ui = lang === 'en' ? UI_EN : UI_ZH;
            const content = loadContentTranslation(lang, slug);

            // Determine final values: prefer content translation, fall back to defaults
            let pageTitle, contentTitle, contentBody, contentCategory, contentMaterial, evidenceLinks;

            if (content) {
                // Use translated content
                pageTitle = content.page_title || `${enTitle} | ViaSurg`;
                contentTitle = content.content_title || enTitle;
                contentBody = content.content_body || enBody;
                contentCategory = content.content_category || hierarchy.category;
                contentMaterial = content.content_material || (hierarchy.material ? `Material: ${hierarchy.material}` : '');
                evidenceLinks = content.evidence_links || '';
                if (lang === 'zh') stats.translated++;
            } else {
                // Fallback to English defaults
                pageTitle = `${enTitle} | ViaSurg`;
                contentTitle = enTitle;
                contentBody = enBody;
                contentCategory = hierarchy.category;
                contentMaterial = hierarchy.material ? `Material: ${hierarchy.material}` : '';
                evidenceLinks = '';
                if (lang === 'zh') stats.fallback++;
            }

            let html = template;

            // Replace all placeholders
            html = html.replace(/\{\{lang\}\}/g, lang)
                       .replace(/\{\{page_title\}\}/g, pageTitle)
                       .replace(/\{\{site_name\}\}/g, 'ViaSurg')
                       .replace(/\{\{ui_nav_home\}\}/g, ui.nav.home)
                       .replace(/\{\{ui_nav_academy\}\}/g, ui.nav.academy)
                       .replace(/\{\{ui_nav_products\}\}/g, ui.nav.products)
                       .replace(/\{\{ui_labels_evidence\}\}/g, ui.labels.evidence)
                       .replace(/\{\{ui_footer_copy\}\}/g, ui.footer.copy)
                       .replace(/\{\{content_title\}\}/g, contentTitle)
                       .replace(/\{\{content_body\}\}/g, contentBody)
                       .replace(/\{\{content_category\}\}/g, contentCategory)
                       .replace(/\{\{content_material\}\}/g, contentMaterial)
                       .replace(/\{\{evidence_links\}\}/g, evidenceLinks)
                       .replace(/\{\{page_url\}\}/g, `${slug}.html`)
                       .replace('<!-- SEO_SCHEMA_INJECTION -->',
                           `<script type="application/ld+json">{"@context":"https://schema.org/","@type":"Product","name":"${pageTitle}"}</script>`);

            const dir = path.join(OUTPUT_DIR, lang, 'pages');
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            fs.writeFileSync(path.join(dir, `${slug}.html`), html);
        });
    });

    console.log(`Build complete: ${stats.total} entities.`);
    console.log(`  ZH: ${stats.translated} translated, ${stats.fallback} using English fallback.`);
    console.log(`  EN: ${stats.total} generated.`);
}

build();
