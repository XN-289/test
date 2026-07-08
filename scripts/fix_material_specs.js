const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '..', 'kealin', 'demo', 'output', 'pages');

const specMap = {
  'Absorption Method': '吸收方式',
  'Tensile Strength Retention': '抗拉强度保持率',
  'Complete Absorption': '完全吸收时间',
  'Durability': '耐久性',
  'Reactivity': '反应性',
};

const valMap = {
  'Permanent wound support': '永久性伤口支撑',
  'Extremely low tissue reaction': '极低的组织反应',
  'Hydrolysis.': '水解。',
  'High for the first 14-21 days.': '前 14-21 天保持较高水平。',
  '60 to 90 days.': '60 至 90 天。',
};

const files = fs.readdirSync(dir).filter(f => f.startsWith('material-') || f.startsWith('tech-'));
for (const file of files) {
  let html = fs.readFileSync(path.join(dir, file), 'utf-8');
  let changed = false;

  // Fix table cells with spec labels
  for (const [en, zh] of Object.entries(specMap)) {
    const regex = new RegExp('<td>' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</td>', 'g');
    if (regex.test(html)) {
      html = html.replace(regex, '<td><span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span></td>');
      changed = true;
    }
  }

  // Fix table cells with spec values
  for (const [en, zh] of Object.entries(valMap)) {
    const regex = new RegExp('<td>' + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '</td>', 'g');
    if (regex.test(html)) {
      html = html.replace(regex, '<td><span data-lang="en">' + en + '</span><span data-lang="zh">' + zh + '</span></td>');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(path.join(dir, file), html, 'utf-8');
    console.log('Fixed: ' + file);
  }
}
