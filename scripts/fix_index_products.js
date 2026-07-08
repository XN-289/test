const fs = require('fs');
const file = 'd:/test/kealin/demo/output/index.html';
let html = fs.readFileSync(file, 'utf8');
let count = 0;

// Product names
const names = [
  ['Absorbable Sutures','可吸收缝合线'],
  ['Biopsy Forceps','活检钳'],
  ['Guidewires','导丝'],
  ['Hemoclips','止血夹'],
  ['Hernia Meshes','疝修补片'],
  ['Non Absorbable Sutures','非可吸收缝合线'],
  ['Polymer Clips','高分子结扎夹'],
  ['Snares','圈套器'],
  ['Staplers','吻合器'],
  ['Trocars','穿刺器'],
  ['Ultrasonic Shears','超声刀'],
  ['Veress Needles','气腹针']
];
for (const [en,zh] of names) {
  const r = new RegExp('(<h3 class="product-name">)' + en + '(</h3>)');
  if (r.test(html)) {
    html = html.replace(r, '$1<span data-lang="en">'+en+'</span><span data-lang="zh">'+zh+'</span>$2');
    count++;
  }
}

// Product descriptions
const descs = [
  ['Target generic search intent','目标通用搜索意图'],
  ['Dominate this category with a "Bottom Price + Ready Stock" (底价+现货) model to displace incumbent suppliers','以「底价+现货」模式主导该品类，替代现有供应商'],
  ['Stable volume-driver','稳定的放量产品'],
  ['Provision of Hemoclips appliers to bind long-term consumable consumption, reducing capital expenditure for the hospital','提供止血夹施夹器，绑定长期耗材消耗，降低医院资本支出'],
  ['Material-first messaging','以材料为核心的信息传递'],
  ['Comprehensive SKU Matrix','全面的 SKU 矩阵'],
  ['Ecosystem capture','生态系统锁定'],
  ['Focus on "Cold Snare" as a safety-first, electricity-free alternative for rapid outpatient procedures','聚焦「冷圈套器」，作为安全优先、无需通电的快速门诊手术替代方案'],
  ['Ultimate SKU Snipe (终极 SKU 狙击战)','终极 SKU 狙击战'],
  ['Clinically validated medical device with transparent manufacturing and evidence-backed performance.','经临床验证的医疗器械，制造透明、性能有循证支持。'],
  ['"Compatibility War" (兼容性战争)','兼容性战争'],
  ['Volume standard','放量标杆产品']
];

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const [en,zh] of descs) {
  const r = new RegExp('(<p class="product-desc">)' + escapeRegex(en) + '(</p>)');
  if (r.test(html)) {
    html = html.replace(r, '$1<span data-lang="en">'+en+'</span><span data-lang="zh">'+zh+'</span>$2');
    count++;
  }
}

fs.writeFileSync(file, html, 'utf8');
console.log('index.html: Fixed ' + count + ' product blocks');
