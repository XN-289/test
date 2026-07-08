const fs = require('fs');
const file = 'd:/test/kealin/demo/server.js';
let code = fs.readFileSync(file, 'utf8');
const before = code;

// 1. Replace href="/output/" with href="/"
code = code.replace(/href="\/output\/"/g, 'href="/"');

// 2. Replace href="/output/anything" with href="/anything"
code = code.replace(/href="\/output\//g, 'href="/');

// 3. Replace URL template strings: `/output/...` -> `/...`
code = code.replace(/url: `\/output\//g, 'url: `/');

// 4. Replace URL string literals: '/output/...' -> '/...'
code = code.replace(/outputUrl: '\/output\//g, "outputUrl: '/");

// 5. Replace url: '/output/...' pattern
code = code.replace(/url: '\/output\//g, "url: '/");

// 6. Fix sitemap URLs
code = code.replace(/https:\/\/viasurg\.com\/output\//g, 'https://viasurg.com/');

// Count changes
const beforeCount = (before.match(/\/output\//g) || []).length;
const afterCount = (code.match(/\/output\//g) || []).length;
console.log('Before:', beforeCount, '-> After:', afterCount, '(replaced', beforeCount - afterCount, ')');

// Show remaining /output/ occurrences (should be file system paths only)
const lines = code.split('\n');
lines.forEach((line, i) => {
  if (line.includes('/output/')) {
    console.log('  Remaining line', i+1, ':', line.trim().substring(0, 140));
  }
});

fs.writeFileSync(file, code, 'utf8');
console.log('Done. File saved.');
