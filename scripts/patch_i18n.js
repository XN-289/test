/**
 * Patch all product pages in website_out/pages/ to add data-i18n attributes
 * and language toggle button.
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'website_out', 'pages');

// Page-specific patch definitions
// Each key is the filename, value maps data-i18n keys to the English text to find & replace
const patches = {
  'trocars.html': {
    'trocars_page_title': 'Disposable Trocars | ViaSurg Verified Specs',
    'trocars_label': 'Product / Cluster 01',
    'trocars_h1': 'Disposable Trocars',
    'trocars_sku': 'SKU Group: VS-TR-2025',
    'trocars_overview_label': 'Clinical Overview',
    'trocars_overview': 'ViaSurg Disposable Trocars are high-precision laparoscopic access instruments designed for absolute air-tightness and minimal insertion force. Engineered to meet and exceed global standards for minimally invasive surgery (MIS).',
    'trocars_xref_title': 'Cross-Reference Registry',
    'trocars_th_oem': 'OEM Brand',
    'trocars_th_sku': 'OEM SKU',
    'trocars_th_vs': 'ViaSurg Equivalent',
    'trocars_th_status': 'Status',
    'trocars_specs_label': 'Technical Specifications',
    'trocars_spec_force': 'Insertion Force',
    'trocars_spec_leak': 'Leakage Rate',
    'trocars_spec_material': 'Material',
    'trocars_spec_sterile': 'Sterilization',
    'trocars_aside_label': 'Procurement Information',
    'trocars_aside_title': 'Ready for Global Dispatch',
    'trocars_aside_desc': 'Stock available for immediate OBL registration or bulk OEM supply.',
    'trocars_quote': 'Request Quote',
    'trocars_doc': '[DOC] FDA 510(k) Summary',
    'trocars_dark_label': 'Analytical Breakdown',
    'trocars_dark_title': 'Engineering the Perfect Entry'
  },
  'hemoclips.html': {
    'hemoclips_page_title': 'Hemoclips & Ligating Clips | ViaSurg Verified Specs',
    'hemoclips_label': 'Product / Cluster 02',
    'hemoclips_h1': 'Hemoclips & Ligating Clips',
    'hemoclips_sku': 'SKU Group: VS-HC-2025',
    'hemoclips_overview_label': 'Clinical Overview',
    'hemoclips_xref_title': 'Cross-Reference Registry',
    'hemoclips_th_oem': 'OEM Brand',
    'hemoclips_th_sku': 'OEM SKU',
    'hemoclips_th_vs': 'ViaSurg Equivalent',
    'hemoclips_th_status': 'Status',
    'hemoclips_specs_label': 'Technical Specifications',
    'hemoclips_spec_security': 'Ligation Security',
    'hemoclips_spec_rotation': 'Rotation Precision',
    'hemoclips_spec_mri': 'MRI Compatibility',
    'hemoclips_spec_width': 'Opening Width',
    'hemoclips_aside_label': 'Profit Mining Insight',
    'hemoclips_aside_title': 'Strategic Gold Mine',
    'hemoclips_aside_desc': 'Endoscopic clips represent a high-CPC procurement intent. Target verified comparison pages for maximum ROI.',
    'hemoclips_quote': 'Request Quote',
    'hemoclips_doc': '[DOC] Stability Evidence'
  },
  'biopsy-forceps.html': {
    'biopsy_page_title': 'Disposable Biopsy Forceps | ViaSurg Verified Specs',
    'biopsy_label': 'Product / Cluster 03',
    'biopsy_h1': 'Biopsy Forceps',
    'biopsy_sku': 'SKU Group: VS-BF-2025',
    'biopsy_overview_label': 'Clinical Overview',
    'biopsy_matrix_title': 'Standard Specs Matrix',
    'biopsy_th_type': 'Type',
    'biopsy_th_dia': 'Diameter',
    'biopsy_th_len': 'Working Length',
    'biopsy_th_needle': 'Needle',
    'biopsy_aside_label': 'Market Intelligence',
    'biopsy_aside_title': 'High-Frequency Consumable',
    'biopsy_aside_desc': 'Targeting high CPC intent ($49.06). Dominating the market through verified consistency and stock availability.',
    'biopsy_quote': 'Request Quote',
    'biopsy_doc': '[DOC] Batch Consistency Data'
  },
  'staplers.html': {
    'staplers_page_title': 'Surgical Staplers | ViaSurg Verified Specs',
    'staplers_label': 'Product / Cluster 04',
    'staplers_h1': 'Surgical Staplers',
    'staplers_sku': 'SKU Group: VS-SS-2025',
    'staplers_overview_label': 'Clinical Overview',
    'staplers_snipe_title': 'SKU Snipe Registry',
    'staplers_th_target': 'Target Model',
    'staplers_th_vs': 'ViaSurg Equivalent',
    'staplers_th_tissue': 'Tissue Type',
    'staplers_th_status': 'Status',
    'staplers_aside_label': 'Regulatory Roadmap',
    'staplers_aside_title': 'Phase 3 Deployment',
    'staplers_aside_desc': 'Subject to Class III regulation. Currently undergoing extensive tissue burst pressure and animal trials.',
    'staplers_doc': '[DOC] R&D Progress Report'
  },
  'absorbable-sutures.html': {
    'sutures_page_title': 'Absorbable Sutures | ViaSurg Verified Specs',
    'sutures_label': 'Product / Cluster 05',
    'sutures_h1': 'Absorbable Sutures',
    'sutures_sku': 'SKU Group: VS-AS-2025',
    'sutures_overview_label': 'Clinical Overview',
    'sutures_specs_label': 'Technical Specifications',
    'sutures_spec_material': 'Material',
    'sutures_spec_absorption': 'Absorption Time',
    'sutures_spec_tensile': 'Tensile Retention',
    'sutures_spec_structure': 'Structure',
    'sutures_aside_label': 'Profit Mining Insight',
    'sutures_aside_title': 'Universal Demand',
    'sutures_aside_desc': 'Sutures are the most universal surgical consumable. High volume, predictable demand, and regulatory simplicity.',
    'sutures_quote': 'Request Quote',
    'sutures_doc': '[DOC] Absorption Curve Data'
  },
  'nomoflow.html': {
    'nomoflow_page_title': 'NomoFlow™ Technology | ViaSurg',
    'nomoflow_label': 'Core Technology',
    'nomoflow_h1': 'NomoFlow™ Deterministic Manufacturing',
    'nomoflow_pillar1_title': 'Deterministic Parameters',
    'nomoflow_pillar1_desc': 'Every manufacturing variable is locked to a specific, auditable value. No silent drift.',
    'nomoflow_pillar2_title': 'Evidence Chain',
    'nomoflow_pillar2_desc': 'Each batch generates a verifiable evidence dossier linking raw material to final sterilization.',
    'nomoflow_pillar3_title': 'OBL Registration Ready',
    'nomoflow_pillar3_desc': 'Pre-formatted compliance outputs for FDA 510(k), CE MDR, and NMPA submissions.'
  },
  'compliance.html': {
    'compliance_page_title': 'Compliance Framework | ViaSurg',
    'compliance_label': 'Regulatory',
    'compliance_h1': 'Global Compliance Framework',
    'compliance_iso_title': 'ISO 13485:2016',
    'compliance_iso_desc': 'Full Quality Management System certification for medical device manufacturing.',
    'compliance_fda_title': 'FDA 21 CFR 807',
    'compliance_fda_desc': 'Establishment registration and device listing compliant with US FDA requirements.',
    'compliance_ce_title': 'CE MDR 2017/745',
    'compliance_ce_desc': 'European Medical Device Regulation compliance for Class I and Class IIa devices.'
  },
  'ethicon-b5lt.html': {
    'b5lt_page_title': 'Ethicon B5LT Cross-Reference | ViaSurg',
    'b5lt_label': 'SKU Cross-Reference',
    'b5lt_h1': 'Ethicon B5LT — Verified Equivalent',
    'b5lt_quote': 'Request OEM Quote'
  },
  'cdh29p.html': {
    'cdh29p_page_title': 'J&J CDH29P Cross-Reference | ViaSurg',
    'cdh29p_label': 'SKU Cross-Reference',
    'cdh29p_h1': 'J&J CDH29P — Verified Equivalent',
    'cdh29p_quote': 'Request OEM Quote'
  },
  'hem-o-lok.html': {
    'hemolok_page_title': 'Hem-o-lok Cross-Reference | ViaSurg',
    'hemolok_label': 'SKU Cross-Reference',
    'hemolok_h1': 'Teleflex Hem-o-lok — Verified Equivalent',
    'hemolok_quote': 'Request OEM Quote'
  }
};

// Common nav translations (applied to ALL pages)
const navMap = {
  'Trocars': 'nav_trocars',
  'Hemoclips': 'nav_hemoclips',
  'Biopsy Forceps': 'nav_biopsy',
  'Staplers': 'nav_staplers',
  'Sutures': 'nav_sutures',
  'Technology': 'nav_technology',
  'Compliance': 'nav_compliance'
};

// Common footer translations
const footerMap = {
  'Core Categories': 'footer_core_cat',
  'Resources': 'footer_resources',
  'NomoFlow Tech': 'footer_nomoflow',
  'Home': 'footer_home'
};

// Footer link text translations (inside <a> tags)
const footerLinkMap = {
  '>Trocars<': { find: '>Trocars<', key: 'footer_trocars' },
  '>Hemoclips<': { find: '>Hemoclips<', key: 'footer_hemoclips' },
  '>Biopsy Forceps<': { find: '>Biopsy Forceps<', key: 'footer_biopsy' },
  '>Staplers<': { find: '>Staplers<', key: 'footer_staplers' },
  '>Sutures<': { find: '>Sutures<', key: 'footer_sutures' },
  '>NomoFlow Tech<': { find: '>NomoFlow Tech<', key: 'footer_nomoflow' },
  '>Compliance<': { find: '>Compliance<', key: 'footer_compliance' },
  '>Home<': { find: '>Home<', key: 'footer_home' }
};

const TOGGLE_CSS = `
    <style>
      #lang-toggle {
        background: transparent;
        border: 1.5px solid var(--foundational-blue);
        color: var(--foundational-blue);
        padding: 6px 14px;
        font-family: var(--font-display);
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        border-radius: 2px;
        transition: all 0.15s;
        white-space: nowrap;
      }
      #lang-toggle:hover {
        background: var(--foundational-blue);
        color: white;
      }
      body.lang-zh {
        font-family: 'Noto Sans SC', 'Lato', 'Helvetica', 'Arial', sans-serif;
      }
      body.lang-zh h1, body.lang-zh h2, body.lang-zh h3, body.lang-zh h4,
      body.lang-zh .blueprint-label, body.lang-zh .nav-links a,
      body.lang-zh #lang-toggle {
        font-family: 'Noto Sans SC', 'Montserrat', 'Helvetica Neue', sans-serif;
      }
    </style>`;

const NOTO_FONT_LINK = `\n    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">`;

const SCRIPTS = `\n  <script src="../i18n.js"><\/script>\n  <script src="../i18n-product.js"><\/script>`;

function patchFile(filename) {
  const filePath = path.join(PAGES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.log(`SKIP: ${filename} not found`);
    return;
  }
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Add Noto Sans SC font
  html = html.replace(
    /<link href="https:\/\/fonts\.googleapis\.com\/css2\?family=JetBrains[^"]*" rel="stylesheet">/,
    '<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">'
  );

  // 2. Add toggle CSS before </head>
  html = html.replace('</head>', TOGGLE_CSS + '\n</head>');

  // 3. Patch nav links with data-i18n
  for (const [text, key] of Object.entries(navMap)) {
    // Match nav links like <a href="trocars.html">Trocars</a>
    const navRegex = new RegExp(`(<a href="[^"]*"[^>]*>)${text}(<\/a>)`, 'g');
    html = html.replace(navRegex, `$1<span data-i18n="${key}">${text}</span>$2`);
  }

  // 4. Add toggle button to nav (after the last nav link)
  if (!html.includes('id="lang-toggle"')) {
    html = html.replace(
      /(<\/div>\s*<\/div>\s*<\/nav>)/,
      `\n        <button id="lang-toggle" onclick="i18n.toggleLang()">中文</button>\n      $1`
    );
  }

  // 5. Patch page-specific content
  const pagePatches = patches[filename];
  if (pagePatches) {
    for (const [key, text] of Object.entries(pagePatches)) {
      // For title tag
      if (key.endsWith('_page_title')) {
        html = html.replace(
          new RegExp(`<title>${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</title>`),
          `<title data-i18n="${key}">${text}</title>`
        );
        continue;
      }
      // For blueprint-label spans
      const labelRegex = new RegExp(`(<span class="blueprint-label">)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/span>)`, 'g');
      html = html.replace(labelRegex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For h1 tags
      const h1Regex = new RegExp(`(<h1>)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/h1>)`, 'g');
      html = html.replace(h1Regex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For h2 tags
      const h2Regex = new RegExp(`(<h2>)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/h2>)`, 'g');
      html = html.replace(h2Regex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For h3 tags
      const h3Regex = new RegExp(`(<h3[^>]*>)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/h3>)`, 'g');
      html = html.replace(h3Regex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For h4 tags
      const h4Regex = new RegExp(`(<h4[^>]*>)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/h4>)`, 'g');
      html = html.replace(h4Regex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For p tags (data-mono)
      const pDataMonoRegex = new RegExp(`(<p class="data-mono"[^>]*>)${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(<\/p>)`, 'g');
      html = html.replace(pDataMonoRegex, `$1<span data-i18n="${key}">${text}</span>$2`);
      // For regular p with specific text (overview, desc, etc.)
      if (key.includes('overview') || key.includes('desc') || key.includes('_doc')) {
        // For overview paragraphs
        const pRegex = new RegExp(`(<p>)(${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(<\/p>)`, 'g');
        html = html.replace(pRegex, `$1<span data-i18n="${key}">$2</span>$3`);
      }
    }
  }

  // 6. Patch footer common text
  for (const [text, key] of Object.entries(footerMap)) {
    const regex = new RegExp(`(>\\s*)${text}(\\s*<)`, 'g');
    html = html.replace(regex, `$1<span data-i18n="${key}">${text}</span>$2`);
  }

  // 7. Patch footer links
  for (const [text, key] of Object.entries({
    'Trocars': 'footer_trocars',
    'Hemoclips': 'footer_hemoclips',
    'Biopsy Forceps': 'footer_biopsy',
    'Staplers': 'footer_staplers',
    'Sutures': 'footer_sutures',
    'NomoFlow Tech': 'footer_nomoflow',
    'Compliance': 'footer_compliance',
    'Home': 'footer_home'
  })) {
    // Inside footer links
    const linkRegex = new RegExp(`(color: var\\(--slate-core\\);">)${text}(<\/a>)`, 'g');
    html = html.replace(linkRegex, `$1<span data-i18n="${key}">${text}</span>$2`);
  }

  // 8. Footer description and copy
  html = html.replace(
    /(Clinical Minimalism\. Verified Transparency\. The new standard for surgical consumables\.)/,
    '<span data-i18n="footer_desc">$1</span>'
  );
  html = html.replace(
    /(© 2025 ViaSurg Global\. Clinical Minimalism Applied\.)/,
    '<span data-i18n="footer_copy">$1</span>'
  );

  // 9. Add i18n scripts before </body>
  html = html.replace('</body>', SCRIPTS + '\n</body>');

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`PATCHED: ${filename}`);
}

// Process all HTML files in pages/
const files = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));
files.forEach(f => patchFile(f));

console.log(`\nDone. Patched ${files.length} files.`);
