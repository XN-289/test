/**
 * Fix i18n pass 3 — remaining h1 titles and final cleanup
 */
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '..', 'kealin', 'demo', 'output');

function fixAll() {
  const pagesDir = path.join(OUTPUT_DIR, 'pages');
  const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

  const h1Translations = {
    // Competitors
    'Bard': 'Bard',
    'Boston Scientific': 'Boston Scientific',
    'Competitor Disruption': '竞争格局颠覆',
    'Cook Medical': 'Cook Medical',
    'Ethicon': 'Ethicon',
    'Medtronic': 'Medtronic',
    'Olympus': 'Olympus',
    'Teleflex': 'Teleflex',
    'Terumo': 'Terumo',
    'ViaSurg Academy': 'ViaSurg 学院',
    // Entities
    'Compliance Framework': '合规框架',
    'Endoscopic Procedures': '内镜手术',
    'Ethicon B5LT': 'Ethicon B5LT',
    'Hangzhou Sode': '杭州苏迪',
    'Johnson CDH29P': 'J&J CDH29P',
    'Laparoscopic Surgery': '腹腔镜手术',
    'Teleflex Hem-o-lok': 'Teleflex Hem-o-lok',
    'ViaSurg': 'ViaSurg',
    // Materials
    'PGA Material': 'PGA 材料',
    'Polypropylene Material': '聚丙烯材料',
    // Tech
    'NomoFlow Technology': 'NomoFlow 技术'
  };

  for (const file of files) {
    const filePath = path.join(pagesDir, file);
    let html = fs.readFileSync(filePath, 'utf8');
    let count = 0;

    // Fix bare h1 titles
    for (const [en, zh] of Object.entries(h1Translations)) {
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(<h1>)\\s*${escaped}\\s*(</h1>)`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
        count++;
      }
    }

    // Fix "Sitemap" in footer
    html = html.replace(
      /(<a href="\/output\/sitemap\.xml">)Sitemap(<\/a>)/g,
      '$1<span data-lang="en">Sitemap</span><span data-lang="zh">网站地图</span>$2'
    );

    // Fix remaining bare category/product names in competitor page tables
    // Competitor page dominant product tags
    const compProductNames = {
      'Vicryl (Sutures)': 'Vicryl（缝合线）',
      'Harmonic Scalpel (Ultrasonic Shears)': 'Harmonic Scalpel（超声刀）',
      'Echelon (Staplers)': 'Echelon（吻合器）',
      'Endo GIA (Staplers)': 'Endo GIA（吻合器）',
      'Sonicision (Ultrasonic Shears)': 'Sonicision（超声刀）',
      'Ligasure (Vessel Sealing)': 'Ligasure（血管闭合）',
      'QuickClip (Hemoclips)': 'QuickClip（止血夹）',
      'Single-Use Biopsy Forceps': '一次性活检钳',
      'Cold Snares': '冷圈套器',
      'Hem-o-lok (Polymer Clips)': 'Hem-o-lok（高分子结扎夹）',
      'Weck (Surgical Clips)': 'Weck（外科夹）',
      'LMA (Airway Management)': 'LMA（气道管理）',
      'Pinnacle (Access Sheaths)': 'Pinnacle（通路鞘）',
      'Zebra (Guidewires)': 'Zebra（导丝）',
      'Radifocus (Guidewires)': 'Radifocus（导丝）',
      'Jagwire (Guidewires)': 'Jagwire（导丝）',
      'Resolution Clip (Hemoclips)': 'Resolution Clip（止血夹）',
      'SpyGlass (Endoscopy)': 'SpyGlass（内窥镜）',
      'Amplatz (Guidewires)': 'Amplatz（导丝）',
      'Bakri Balloon (OB/GYN)': 'Bakri 球囊（妇产科）',
      'Ventralight (Hernia Mesh)': 'Ventralight（疝修补片）',
      'PowerPICC (Catheters)': 'PowerPICC（导管）'
    };

    for (const [en, zh] of Object.entries(compProductNames)) {
      if (en === zh) continue;
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match in div/tag content
      const re = new RegExp(`(>)\\s*${escaped}\\s*(<)`, 'g');
      if (re.test(html)) {
        html = html.replace(re, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
        count++;
      }
    }

    // Fix "Multiple lines" / "Multiple product lines" in competitor pages
    const miscTexts = {
      'Multiple lines': '多产品线',
      'Market inefficiency': '市场低效',
      'Transparent manufacturing': '透明制造',
      'Opaque': '不透明',
      'Verified': '已验证'
    };

    for (const [en, zh] of Object.entries(miscTexts)) {
      if (en === zh) continue;
      const escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const re = new RegExp(`(>)\\s*${escaped}\\s*(<)`, 'g');
      // Only match if not already wrapped
      const matches = html.match(re);
      if (matches) {
        for (const m of matches) {
          if (!m.includes('data-lang')) {
            html = html.replace(m, `$1<span data-lang="en">${en}</span><span data-lang="zh">${zh}</span>$2`);
            count++;
          }
        }
      }
    }

    if (count > 0) {
      fs.writeFileSync(filePath, html, 'utf8');
      console.log(`✅ ${file}: ${count} fixes`);
    }
  }
}

console.log('🔧 Pass 3: Final cleanup...\n');
fixAll();
console.log('\n✅ Pass 3 complete.');
