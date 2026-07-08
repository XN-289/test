# Autoresearch Recipes — `EXAMPLES.md`

This file contains tried-and-tested goal/metric/verify combinations for various domains. Use these as templates for your own runs.

---

## 💻 Software Engineering

### Test Coverage (Jest/Vitest)
```
Goal:   Increase test coverage from 72% to 90%
Scope:  src/**/*.ts, src/**/*.test.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files" | awk '{print $4}'
Guard:  npx tsc --noEmit
```

### Bundle Size (Next.js)
```
Goal:   Reduce production bundle below 200KB
Scope:  src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "First Load JS" | awk '{print $4}'
Guard:  npm run lint
```

### TypeScript Error Elimination
```
Goal:   Eliminate all TypeScript errors
Scope:  src/**/*.ts
Metric: error count (lower is better)
Verify: npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"
```

---

## 📈 Content & SEO (Gemini-Native)

*Requires Gemini's Google Search grounding.*

### Blog Post Optimization
```
Goal:   Maximise SEO score for target keyword "typescript performance"
Scope:  content/blog/typescript-performance.md
Metric: SEO score (higher is better)
Verify: node scripts/seo-score.js content/blog/typescript-performance.md
```

### Flesch Readability Scorer
```
Goal:   Maximise Flesch-Kincaid grade level consistency (aim for Grade 8)
Scope:  content/landing-pages/home.md
Metric: score (higher is better)
Verify: npx alex content/landing-pages/home.md | grep -c "warning" || echo "100"
```

---

## 🛠️ Data & Infrastructure

### SQL Query Speed
```
Goal:   Reduce dashboard query execution time
Scope:  queries/dashboard/*.sql
Metric: execution time in ms (lower is better)
Verify: psql -f scripts/bench-queries.sql | grep "total_ms" | awk '{print $2}'
```

### Docker Image Slimming
```
Goal:   Reduce Docker image size below 200MB
Scope:  Dockerfile, .dockerignore
Metric: image size in MB (lower is better)
Verify: docker build -t bench . && docker images bench --format "{{.Size}}" | sed 's/MB//'
```

---

## 🧪 Experiments

### Flaky Test Hunting
```
Goal:   Zero flaky tests (5 consecutive green runs)
Scope:  src/**/*.test.ts
Metric: failure count across 5 runs (lower is better)
Verify: for i in {1..5}; do npm test 2>&1; done | grep -c "FAIL" || echo "0"
```

### CSS/Cleanup Unused Classes
```
Goal:   Remove all unused Tailwind classes
Scope:  src/components/**/*.tsx, tailwind.config.js
Metric: CSS file size (lower is better)
Verify: npm run build && ls -lh dist/assets/*.css | awk '{print $5}'
```

---

Found a great recipe? Submit a PR and add it here!
