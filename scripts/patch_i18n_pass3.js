const fs = require('fs');
const path = require('path');
const PAGES_DIR = path.join(__dirname, '..', 'website_out', 'pages');

function patch(filename, replacements) {
  const filePath = path.join(PAGES_DIR, filename);
  let html = fs.readFileSync(filePath, 'utf8');
  for (const [find, replace] of replacements) {
    html = html.replace(find, replace);
  }
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`PASS3: ${filename}`);
}

// nomoflow.html
patch('nomoflow.html', [
  ['<title>NomoFlow™ Control Protocol | Technical Specification | ViaSurg</title>',
   '<title data-i18n="nomoflow_page_title">NomoFlow™ Control Protocol | Technical Specification | ViaSurg</title>'],
  ['>Document ID: NF-TECH-2025-V4.3</span>',
   '><span data-i18n="nomoflow_doc_id">Document ID: NF-TECH-2025-V4.3</span></span>'],
  ['<h1 style="color: white; margin-top: 10px;">NomoFlow™ Control Logic</h1>',
   '<h1 style="color: white; margin-top: 10px;"><span data-i18n="nomoflow_control_title">NomoFlow™ Control Logic</span></h1>'],
  ['>Sampling Rate</span>',
   '><span data-i18n="nomoflow_sampling">Sampling Rate</span></span>'],
  ['>Batch CV Limit</span>',
   '><span data-i18n="nomoflow_cv_limit">Batch CV Limit</span></span>'],
  ['>Thermal Stability</span>',
   '><span data-i18n="nomoflow_thermal">Thermal Stability</span></span>'],
  ['<h3>Determinism vs. Variability</h3>',
   '<h3><span data-i18n="nomoflow_determinism_title">Determinism vs. Variability</span></h3>'],
  ['>Risk-First Disclosure</span>',
   '><span data-i18n="nomoflow_risk_label">Risk-First Disclosure</span></span>'],
  ['>Verification Anchor</span>',
   '><span data-i18n="nomoflow_verify_label">Verification Anchor</span></span>'],
  ['[DOC] Protocol NF-4.3',
   '<span data-i18n="nomoflow_doc_link">[DOC] Protocol NF-4.3</span>'],
]);

// compliance.html
patch('compliance.html', [
  ['<title>Regulatory Compliance | ViaSurg Verified Specs</title>',
   '<title data-i18n="compliance_page_title">Regulatory Compliance | ViaSurg Verified Specs</title>'],
  ['>Regulatory / Framework 01</span>',
   '><span data-i18n="compliance_reg_label">Regulatory / Framework 01</span></span>'],
  ['<h1>Compliance Framework</h1>',
   '<h1><span data-i18n="compliance_h1_text">Compliance Framework</span></h1>'],
  ['>Regulatory Overview</span>',
   '><span data-i18n="compliance_overview_label">Regulatory Overview</span></span>'],
  ['>The OBL / Private Label Hack</h3>',
   '><span data-i18n="compliance_obl_title">The OBL / Private Label Hack</span></h3>'],
  ['>Verification Standards</h3>',
   '><span data-i18n="compliance_verif_title">Verification Standards</span></h3>'],
  ['>Legal Status</span>',
   '><span data-i18n="compliance_legal_label">Legal Status</span></span>'],
  ['>Registered Entity</h4>',
   '><span data-i18n="compliance_legal_title">Registered Entity</span></h4>'],
  ['>View Certificates</a>',
   '><span data-i18n="compliance_view_cert">View Certificates</span></a>'],
  ['[DOC] Compliance Audit 2025',
   '<span data-i18n="compliance_doc">[DOC] Compliance Audit 2025</span>'],
]);

console.log('Pass 3 complete.');
