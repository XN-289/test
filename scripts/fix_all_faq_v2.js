const fs = require('fs');
const path = require('path');
const pagesDir = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

const products = {
  'Hernia Meshes': '疝修补片', 'Absorbable Sutures': '可吸收缝合线', 'Non Absorbable Sutures': '非可吸收缝合线',
  'Biopsy Forceps': '活检钳', 'Guidewires': '导丝', 'Hemoclips': '止血夹', 'Polymer Clips': '高分子结扎夹',
  'Snares': '圈套器', 'Staplers': '吻合器', 'Trocars': '穿刺器', 'Ultrasonic Shears': '超声刀',
  'Veress Needles': '气腹针', 'Access': '通路', 'Clips': '夹子', 'Instrumentation': '器械',
  'Intelligence': '智能分析', 'Minimally Invasive Surgery': '微创手术', 'Sutures': '缝合线',
  'Wound Closure': '伤口闭合', 'NomoFlow Solutions': 'NomoFlow 解决方案', 'NomoFlow Technology': 'NomoFlow 技术',
  'PGA Material': 'PGA 材质', 'Polypropylene Material': '聚丙烯材质', 'Compliance Framework': '合规框架',
  'Endoscopic Procedures': '内窥镜手术', 'Laparoscopic Surgery': '腹腔镜手术',
  'ViaSurg Academy': 'ViaSurg 学院', 'Competitor Disruption': '竞品颠覆分析',
  'Ethicon B5LT': 'Ethicon B5LT', 'Johnson CDH29P': 'Johnson CDH29P', 'Teleflex Hem o lok': 'Teleflex Hem-o-lok',
  'Hangzhou Sode': '杭州 Sode',
};

const seoKeywords = {
  'polypropylene mesh': '聚丙烯网片', 'polypropylene surgical mesh': '聚丙烯外科网片',
  'macroporous polypropylene mesh': '大孔聚丙烯网片', 'surgical mesh': '外科网片',
  'bard soft mesh': 'Bard 软网片', 'mesh in the stomach': '腹腔内网片',
  'ethicon prolene mesh': 'Ethicon Prolene 网片', 'ligating clips': '结扎夹',
  'otsc clips': 'OTSC 夹', 'surgical clips': '外科夹', 'cholecystectomy clips': '胆囊切除夹',
  'endoscopic clip': '内窥镜夹', 'endoscopic biopsy forceps': '内窥镜活检钳',
  'disposable biopsy forceps': '一次性活检钳', 'types of staplers in surgery': '外科吻合器类型',
  'endo staplers': '腔内吻合器', 'harmonic scalpel ethicon': 'Ethicon 超声刀',
  'harmonic scalpel': '超声刀', 'ethicon harmonic': 'Ethicon 超声刀',
  'ethicon ultrasonic scalpel': 'Ethicon 超声刀', 'ultrasonic scalpel': '超声刀',
  'ethicon b5lt': 'Ethicon B5LT', 'ethicon vicryl suture': 'Ethicon Vicryl 缝合线',
  'ethicon surgical staplers': 'Ethicon 外科吻合器', 'medtronic skin staplers': '美敦力皮肤吻合器',
  'medtronic stapling': '美敦力吻合', 'medtronic circular stapler': '美敦力圆形吻合器',
  'medtronic eea stapler': '美敦力 EEA 吻合器', 'hemoclip olympus': 'Olympus 止血夹',
  'olympus laparoscopic instruments': 'Olympus 腹腔镜器械', 'teleflex hemolock': 'Teleflex Hem-o-lok',
  'teleflex skin stapler': 'Teleflex 皮肤吻合器', 'hem o lok clip applier': 'Hem-o-lok 施夹器',
  'terumo pinnacle sheath': 'Terumo Pinnacle 鞘', 'terumo guide wire': 'Terumo 导丝',
  'terumo guide wire 0.035': 'Terumo 0.035 导丝', 'terumo guide wire 0.035 price': 'Terumo 0.035 导丝价格',
  'medical guidewire': '医用导丝', 'medical guidewire manufacturers': '医用导丝制造商',
  'medical stapler': '医用吻合器', 'guidewires and catheters': '导丝和导管', 'guide wire': '导丝',
  'access sheath urology': '泌尿通路鞘', 'ureteral access sheath': '输尿管通路鞘',
  'clearpetra ureteral access sheath': 'ClearPetra 输尿管通路鞘', 'clearpetra access sheath': 'ClearPetra 通路鞘',
  'laparoscopic surgery trocar': '腹腔镜手术穿刺器', 'trocars in laparoscopic surgery': '腹腔镜手术中的穿刺器',
  'laparoscopic surgery instruments': '腹腔镜手术器械', 'laparoscopic surgery tools': '腹腔镜手术工具',
  'hasson trocar': 'Hasson 穿刺器', 'eea circular stapler with tri staple technology': 'EEA Tri-Staple 圆形吻合器',
  'circular stapler with dst series technology': 'DST 系列圆形吻合器', 'circular stapler': '圆形吻合器',
  'surgery stapler': '外科吻合器', 'skin stapler and remover': '皮肤吻合器及拆除器',
  'non absorbable sutures': '非可吸收缝合线', 'absorbable sutures': '可吸收缝合线',
  'absorbable and non absorbable sutures': '可吸收和非可吸收缝合线',
  'absorbable and nonabsorbable sutures': '可吸收和非可吸收缝合线',
  'absorbable non absorbable sutures': '可吸收非可吸收缝合线', 'non absorbable suture': '非可吸收缝合线',
  'absorbable and non absorbable suture': '可吸收和非可吸收缝合线', 'sutures are absorbable': '可吸收缝合线',
  'polyglycolic acid suture': '聚乙醇酸缝合线', 'polyglycolic suture': '聚乙醇酸缝合线',
  'polyglactin suture': '聚乙交酯缝合线', 'vicryl suture': 'Vicryl 缝合线',
  'chromic cat gut': '铬制肠线', 'staples for skin closure': '皮肤闭合用吻合钉',
  'endoscopy kit': '内窥镜套件', 'cdh29p': 'CDH29P', 'weck hemolock': 'Weck Hem-o-lok',
};

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));
let totalFixed = 0;

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Sort by length (longest first) to avoid partial matches
  const allTranslations = { ...products, ...seoKeywords };
  const sorted = Object.entries(allTranslations).sort((a, b) => b[0].length - a[0].length);

  for (const [en, zh] of sorted) {
    if (en === zh) continue;
    const escaped = escapeRegex(en);
    // Replace in zh spans
    const regex = new RegExp('(data-lang="zh">[^<]*?)' + escaped, 'gi');
    content = content.replace(regex, '$1' + zh);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content);
    totalFixed++;
    console.log('Fixed: ' + file);
  }
}
console.log('Total: ' + totalFixed);
