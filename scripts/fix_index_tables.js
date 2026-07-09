const fs = require('fs');
const file = 'd:/test/kealin/demo/output/index.html';
let html = fs.readFileSync(file, 'utf8');
let count = 0;

function esc(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

// === Competitor table cells ===
const compData = [
  ['Ventralight (Hernia Mesh), PowerPICC (Catheters).', 'Ventralight（疝修补片）、PowerPICC（导管）。'],
  ['Jagwire (Guidewires), Resolution Clip (Hemoclips), SpyGlass (Endoscopy).', 'Jagwire（导丝）、Resolution Clip（止血夹）、SpyGlass（内窥镜）。'],
  ['Multiple lines', '多产品线'],
  ['Amplatz (Guidewires), Bakri Balloon (OB/GYN), Snares.', 'Amplatz（导丝）、Bakri 球囊（妇产科）、圈套器。'],
  ['Vicryl (Sutures), Harmonic Scalpel (Ultrasonic Shears), Echelon (Staplers).', 'Vicryl（缝合线）、Harmonic Scalpel（超声刀）、Echelon（吻合器）。'],
  ['Endo GIA (Staplers), Sonicision (Ultrasonic Shears), Ligasure (Vessel Sealing).', 'Endo GIA（吻合器）、Sonicision（超声刀）、Ligasure（血管闭合）。'],
  ['QuickClip (Hemoclips), Single-Use Biopsy Forceps, Cold Snares.', 'QuickClip（止血夹）、一次性活检钳、冷圈套器。'],
  ['Hem-o-lok (Polymer Clips), Weck (Surgical Clips), LMA (Airway Management).', 'Hem-o-lok（高分子结扎夹）、Weck（外科夹）、LMA（气道管理）。'],
  ['Pinnacle (Access Sheaths), Zebra (Guidewires), Radifocus (Guidewires).', 'Pinnacle（通路鞘）、Zebra（导丝）、Radifocus（导丝）。'],
  ['Multiple product lines', '多产品线'],
  ['Market inefficiency', '市场低效'],
  ['Transparent manufacturing', '透明制造'],
  ['Opaque', '不透明'],
  ['Verified', '已验证'],
];

for (const [en, zh] of compData) {
  if (en === zh) continue;
  // Match inside td: >EN<
  const re = new RegExp('(>)' + esc(en) + '(<)', 'g');
  const before = html;
  html = html.replace(re, '$1<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>$2');
  if (html !== before) count++;
}

// === Specs table cells ===
const specsData = {
  'Ethicon (Vicryl, Monocryl)': 'Ethicon（Vicryl、Monocryl）',
  'Olympus, ConMed': 'Olympus、ConMed',
  'Terumo, Boston Scientific': 'Terumo、Boston Scientific',
  'OEM Equivalent': 'OEM 等效',
  'Bard (BD), Ethicon': 'Bard（BD）、Ethicon',
  'Ethicon (Prolene, Ethilon)': 'Ethicon（Prolene、Ethilon）',
  'Teleflex (Hem-o-lok)': 'Teleflex（Hem-o-lok）',
  'Olympus, Cook Medical': 'Olympus、Cook Medical',
  'Ethicon, Medtronic': 'Ethicon、Medtronic',
  'Ethicon (Harmonic Scalpel)': 'Ethicon（Harmonic Scalpel）',
};

for (const [en, zh] of Object.entries(specsData)) {
  const re = new RegExp('(<td>)' + esc(en) + '(</td>)', 'g');
  const before = html;
  html = html.replace(re, '$1<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>$2');
  if (html !== before) count++;
}

// Specs table product names and categories in <td> cells
const specProductNames = {
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
  'Veress Needles': '气腹针',
};

for (const [en, zh] of Object.entries(specProductNames)) {
  const re = new RegExp('(<td class="data-cell">)' + esc(en) + '(</td>)', 'g');
  const before = html;
  html = html.replace(re, '$1<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>$2');
  if (html !== before) count++;
}

const specCats = { 'Sutures': '缝合线', 'Instrumentation': '器械', 'Medical Device': '医疗器械', 'Clips': '夹子', 'Access': '通路' };
for (const [en, zh] of Object.entries(specCats)) {
  const re = new RegExp('(<td>)' + esc(en) + '(</td>)', 'g');
  const before = html;
  html = html.replace(re, '$1<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>$2');
  if (html !== before) count++;
}

// === Material cards ===
// PGA Material title
html = html.replace(
  /(font-weight:600;color:var\(--rot-slate-heavy\);margin-bottom:8px;">)PGA Material(<\/div>)/,
  '$1<span data-lang="en">PGA Material</span><span data-lang="zh">PGA 材料</span>$2'
); count++;

html = html.replace(
  /(margin-bottom:12px;">)A biodegradable, thermoplastic polymer and the simplest linear, aliphatic polyester\. Used extensively in synthetic absorbable sutures\.(<\/p>)/,
  '$1<span data-lang="en">A biodegradable, thermoplastic polymer and the simplest linear, aliphatic polyester. Used extensively in synthetic absorbable sutures.</span><span data-lang="zh">一种可生物降解的热塑性聚合物，是最简单的线性脂肪族聚酯。广泛用于合成可吸收缝合线。</span>$2'
); count++;

html = html.replace(
  /(border-top:1px solid var\(--rot-border-light\);">)Absorption Method: Hydrolysis\.(<\/div>)/,
  '$1<span data-lang="en">Absorption Method: Hydrolysis.</span><span data-lang="zh">吸收方式：水解。</span>$2'
); count++;

html = html.replace(
  /(border-top:1px solid var\(--rot-border-light\);">)Tensile Strength Retention: High for the first 14-21 days\.(<\/div>)/,
  '$1<span data-lang="en">Tensile Strength Retention: High for the first 14-21 days.</span><span data-lang="zh">抗拉强度保持率：前 14-21 天较高。</span>$2'
); count++;

// Polypropylene Material
html = html.replace(
  /(font-weight:600;color:var\(--rot-slate-heavy\);margin-bottom:8px;">)Polypropylene Material(<\/div>)/,
  '$1<span data-lang="en">Polypropylene Material</span><span data-lang="zh">聚丙烯材料</span>$2'
); count++;

html = html.replace(
  /(margin-bottom:12px;">)A rugged and unusually resistant thermoplastic polymer\. In surgery, it is used for non-absorbable monofilament sutures and hernia meshes\.(<\/p>)/,
  '$1<span data-lang="en">A rugged and unusually resistant thermoplastic polymer. In surgery, it is used for non-absorbable monofilament sutures and hernia meshes.</span><span data-lang="zh">一种坚固且耐腐蚀的热塑性聚合物。在外科手术中，用于非可吸收单丝缝合线和疝修补片。</span>$2'
); count++;

html = html.replace(
  /(border-top:1px solid var\(--rot-border-light\);">)Durability: Permanent wound support\.(<\/div>)/,
  '$1<span data-lang="en">Durability: Permanent wound support.</span><span data-lang="zh">耐久性：永久性伤口支撑。</span>$2'
); count++;

html = html.replace(
  /(border-top:1px solid var\(--rot-border-light\);">)Reactivity: Extremely low tissue reaction\.(<\/div>)/,
  '$1<span data-lang="en">Reactivity: Extremely low tissue reaction.</span><span data-lang="zh">反应性：极低的组织反应。</span>$2'
); count++;

// NomoFlow Technology
html = html.replace(
  /(font-weight:600;color:var\(--rot-slate-heavy\);margin-bottom:8px;">)NomoFlow Technology /,
  '$1<span data-lang="en">NomoFlow Technology</span><span data-lang="zh">NomoFlow 技术</span> '
); count++;

html = html.replace(
  /(font-family:var\(--rot-font-mono\);font-size:11px;color:var\(--rot-terminal-green\);background:rgba\(74,222,128,0\.1\);padding:2px 6px;border-radius:2px;">)TECHNOLOGY(<\/span>)/,
  '<span data-lang="en">$1TECHNOLOGY$2</span><span data-lang="zh"><span style="font-family:var(--rot-font-mono);font-size:11px;color:var(--rot-terminal-green);background:rgba(74,222,128,0.1);padding:2px 6px;border-radius:2px;">技术</span></span>'
); count++;

html = html.replace(
  /(color:var\(--rot-slate-core\);">)NomoFlow™ is a closed-loop control platform designed to reduce batch variability through high-frequency parameter compensation\. 1\. Sensing: 150 nodes sample variables \(Thermal, Pressure, Flow\) at 1000(<\/p>)/,
  '$1<span data-lang="en">NomoFlow™ is a closed-loop control platform designed to reduce batch variability through high-frequency parameter compensation. 1. Sensing: 150 nodes sample variables (Thermal, Pressure, Flow) at 1000</span><span data-lang="zh">NomoFlow™ 是一个闭环控制平台，通过高频参数补偿减少批次变异性。1. 感知：150 个节点以 1000 Hz 采样变量（温度、压力、流量）</span>$2'
); count++;

// === Category cards on index ===
const catNames = {
  'Access': '通路', 'Clips': '夹子', 'Instrumentation': '器械',
  'Intelligence': '智能', 'Minimally Invasive Surgery': '微创手术',
  'NomoFlow Solutions': 'NomoFlow 解决方案', 'Sutures': '缝合线', 'Wound Closure': '伤口闭合'
};

for (const [en, zh] of Object.entries(catNames)) {
  const re = new RegExp('(font-weight:600;color:var\\(--rot-slate-heavy\\);">)' + esc(en) + '(</div>)', 'g');
  const before = html;
  html = html.replace(re, '$1<span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span>$2');
  if (html !== before) count++;
}

fs.writeFileSync(file, html, 'utf8');
console.log('index.html: Fixed ' + count + ' table/material/category blocks');
