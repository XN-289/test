/**
 * Pass 2: Fix remaining elements that pass 1 missed.
 */
const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, '..', 'website_out', 'pages');

// Per-page remaining patches: [find_html_regex, replacement]
function patchPage(filename, replacements) {
  const filePath = path.join(PAGES_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  for (const [find, replace] of replacements) {
    html = html.replace(find, replace);
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`PASS2: ${filename}`);
}

// trocars.html - fix remaining elements
patchPage('trocars.html', [
  // Spec labels with style
  ['<span class="blueprint-label" style="font-size: 10px;">Insertion Force</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="trocars_spec_force">Insertion Force</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Leakage Rate</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="trocars_spec_leak">Leakage Rate</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Material</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="trocars_spec_material">Material</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Sterilization</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="trocars_spec_sterile">Sterilization</span></span>'],
  // Aside desc
  ['<p style="font-size: 14px;">Stock available for immediate OBL registration or bulk OEM supply.</p>',
   '<p style="font-size: 14px;" data-i18n="trocars_aside_desc">Stock available for immediate OBL registration or bulk OEM supply.</p>'],
  // Quote button
  ['>Request Quote</a>',
   '><span data-i18n="trocars_quote">Request Quote</span></a>'],
  // Doc link
  ['[DOC] FDA 510(k) Summary',
   '<span data-i18n="trocars_doc">[DOC] FDA 510(k) Summary</span>'],
  // Dark section label
  ['>Analytical Breakdown</span>',
   '><span data-i18n="trocars_dark_label">Analytical Breakdown</span></span>'],
  // Dark section description - this one is complex, handle it differently
  ['Our internal stress tests show a',
   '<span data-i18n="trocars_dark_desc_prefix">Our internal stress tests show a</span>'],
]);

// hemoclips.html
patchPage('hemoclips.html', [
  ['<span class="blueprint-label" style="font-size: 10px;">Ligation Security</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="hemoclips_spec_security">Ligation Security</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Rotation Precision</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="hemoclips_spec_rotation">Rotation Precision</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">MRI Compatibility</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="hemoclips_spec_mri">MRI Compatibility</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Opening Width</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="hemoclips_spec_width">Opening Width</span></span>'],
  ['<p style="font-size: 14px;">Endoscopic clips represent a high-CPC procurement intent. Target verified comparison pages for maximum ROI.</p>',
   '<p style="font-size: 14px;" data-i18n="hemoclips_aside_desc">Endoscopic clips represent a high-CPC procurement intent. Target verified comparison pages for maximum ROI.</p>'],
  ['>Request Quote</a>',
   '><span data-i18n="hemoclips_quote">Request Quote</span></a>'],
  ['[DOC] Stability Evidence',
   '<span data-i18n="hemoclips_doc">[DOC] Stability Evidence</span>'],
]);

// biopsy-forceps.html
patchPage('biopsy-forceps.html', [
  ['<p style="font-size: 14px;">Targeting high CPC intent ($49.06). Dominating the market through verified consistency and stock availability.</p>',
   '<p style="font-size: 14px;" data-i18n="biopsy_aside_desc">Targeting high CPC intent ($49.06). Dominating the market through verified consistency and stock availability.</p>'],
  ['>Request Quote</a>',
   '><span data-i18n="biopsy_quote">Request Quote</span></a>'],
  ['[DOC] Batch Consistency Data',
   '<span data-i18n="biopsy_doc">[DOC] Batch Consistency Data</span>'],
]);

// staplers.html
patchPage('staplers.html', [
  ['<p style="font-size: 14px;">Subject to Class III regulation. Currently undergoing extensive tissue burst pressure and animal trials.</p>',
   '<p style="font-size: 14px;" data-i18n="staplers_aside_desc">Subject to Class III regulation. Currently undergoing extensive tissue burst pressure and animal trials.</p>'],
  ['[DOC] R&D Progress Report',
   '<span data-i18n="staplers_doc">[DOC] R&D Progress Report</span>'],
]);

// absorbable-sutures.html
patchPage('absorbable-sutures.html', [
  ['<span class="blueprint-label" style="font-size: 10px;">Material</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="sutures_spec_material">Material</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Absorption Time</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="sutures_spec_absorption">Absorption Time</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Tensile Retention</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="sutures_spec_tensile">Tensile Retention</span></span>'],
  ['<span class="blueprint-label" style="font-size: 10px;">Structure</span>',
   '<span class="blueprint-label" style="font-size: 10px;"><span data-i18n="sutures_spec_structure">Structure</span></span>'],
  ['<p style="font-size: 14px;">Sutures are the most universal surgical consumable. High volume, predictable demand, and regulatory simplicity.</p>',
   '<p style="font-size: 14px;" data-i18n="sutures_aside_desc">Sutures are the most universal surgical consumable. High volume, predictable demand, and regulatory simplicity.</p>'],
  ['>Request Quote</a>',
   '><span data-i18n="sutures_quote">Request Quote</span></a>'],
  ['[DOC] Absorption Curve Data',
   '<span data-i18n="sutures_doc">[DOC] Absorption Curve Data</span>'],
]);

// compliance.html
patchPage('compliance.html', [
  ['>Request Quote</a>',
   '><span data-i18n="compliance_quote">Request Quote</span></a>'],
]);

// ethicon-b5lt.html
patchPage('ethicon-b5lt.html', [
  ['>Request Quote</a>',
   '><span data-i18n="b5lt_quote">Request Quote</span></a>'],
  ['>Request OEM Quote</a>',
   '><span data-i18n="b5lt_quote">Request OEM Quote</span></a>'],
]);

// cdh29p.html
patchPage('cdh29p.html', [
  ['>Request Quote</a>',
   '><span data-i18n="cdh29p_quote">Request Quote</span></a>'],
  ['>Request OEM Quote</a>',
   '><span data-i18n="cdh29p_quote">Request OEM Quote</span></a>'],
]);

// hem-o-lok.html
patchPage('hem-o-lok.html', [
  ['>Request Quote</a>',
   '><span data-i18n="hemolok_quote">Request Quote</span></a>'],
  ['>Request OEM Quote</a>',
   '><span data-i18n="hemolok_quote">Request OEM Quote</span></a>'],
]);

console.log('Pass 2 complete.');
