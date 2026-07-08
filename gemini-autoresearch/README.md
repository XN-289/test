<div align="center">
<img src="images/banner.png" width="1200" alt="gemini-autoresearch banner">
</div>

<div align="center">

```
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          gemini-autoresearch                                  ║
║                                                               ║
║     Set a goal. Walk away. Wake up to results.                ║
║                                                               ║
║     Your AI works all night so you don't have to.            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
```

[![Gemini CLI Skill](https://img.shields.io/badge/Gemini_CLI-Skill-4285F4?logo=google&logoColor=white)](https://github.com/google-gemini/gemini-cli)
[![Antigravity IDE](https://img.shields.io/badge/Antigravity-IDE-8B5CF6?logoColor=white)](https://antigravity.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-22C55E.svg)](LICENSE)
[![Hindi](https://img.shields.io/badge/Hindi-README-blue?style=flat-square)](docs/i18n/README_HI.md)
[![Bengali](https://img.shields.io/badge/Bengali-README-green?style=flat-square)](docs/i18n/README_BN.md)
[![Chinese](https://img.shields.io/badge/Chinese-README-red?style=flat-square)](docs/i18n/README_ZH.md)
[![Japanese](https://img.shields.io/badge/Japanese-README-black?style=flat-square)](docs/i18n/README_JA.md)
[![French](https://img.shields.io/badge/French-README-blue?style=flat-square)](docs/i18n/README_FR.md)
[![Spanish](https://img.shields.io/badge/Spanish-README-yellow?style=flat-square)](docs/i18n/README_ES.md)
[![Portuguese](https://img.shields.io/badge/Portuguese-README-green?style=flat-square)](docs/i18n/README_PT.md)
[![Russian](https://img.shields.io/badge/Russian-README-white?style=flat-square)](docs/i18n/README_RU.md)

**[What is this?](#what-is-this)** · **[5-minute install](#5-minute-install)** · **[How it works](#how-it-works)** · **[Commands](#commands)** · **[Examples](#examples)** · **[Why Gemini?](#why-gemini-specifically)** · **[Contributing](CONTRIBUTING.md)**

</div>

---

## What is this?

**gemini-autoresearch** turns [Gemini CLI](https://github.com/google-gemini/gemini-cli) and [Antigravity IDE](https://antigravity.dev) into an autonomous improvement engine — for anything with a measurable outcome.

You describe what you want to improve. Gemini runs hundreds of small experiments overnight. It keeps every improvement and automatically reverses anything that makes things worse. You wake up to a log of exactly what happened.

> **Not a developer?** That's fine. If you use Antigravity IDE to help with your work — writing, marketing, operations, content — this skill works for you too. [See non-technical examples →](#for-non-developers)

---

## The big picture

Think of it like this. Normally when you use an AI assistant:

```
You describe a problem → AI gives you an answer → Done (one shot)
```

With gemini-autoresearch:

```
You set a goal → AI runs 100 experiments overnight → You keep every gain
       ↑                                                        |
       └────────────────── each run smarter than the last ──────┘
```

The difference is that it never stops at one answer. It iterates — trying things, measuring results, keeping what works, throwing out what doesn't — until you tell it to stop or it hits your goal.

---

## How it works

Every iteration follows the same loop, running forever until you interrupt:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. READ        Review current state, git history, past lessons │
│  2. THINK       Form ONE specific hypothesis to test            │
│  3. CHANGE      Make ONE focused change                         │
│  4. SAVE        Git commit before testing (safe rollback point) │
│  5. MEASURE     Run Verify — did the metric improve?            │
│  6. PROTECT     Run Guard  — did anything else break?           │
│  7. DECIDE      Both pass → KEEP  /  Either fails → REVERT      │
│  8. LOG         Record what happened and why                    │
│  9. LEARN       Every 5 wins → write a lesson for future runs   │
│                                                                 │
│  ↑_________________________REPEAT FOREVER____________________↑  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Verify vs Guard — what is the difference?

This dual-gate system makes gemini-autoresearch safer than any other autoresearch skill:

| | Verify | Guard |
|---|---|---|
| **Question** | "Did I make progress?" | "Did I break anything?" |
| **Example** | Did test coverage go up? | Do types still compile? |
| **If it fails** | Revert immediately | Rework (max 2 tries), then revert |
| **Required?** | Yes | Optional but strongly recommended |

**Why this matters:** Without Guard, an AI chasing test coverage could silently introduce TypeScript errors across 50 iterations. With Guard, any change that breaks types gets reverted — even if it improved coverage. You wake up to clean working code, not just higher numbers.

---

## 5-minute install

### For Gemini CLI

```bash
# 1. Clone this repo
git clone https://github.com/supratikpm/gemini-autoresearch.git

# 2a. Install globally — works in ALL your projects
cp -r gemini-autoresearch/skills/autoresearch ~/.gemini/skills/autoresearch

# 2b. Or install for this project only
cp -r gemini-autoresearch/skills/autoresearch .gemini/skills/autoresearch

# 3. Enable in Gemini CLI
# Open Gemini CLI → type /settings → enable Agent Skills
```

### For Antigravity IDE

```bash
cp -r gemini-autoresearch/skills/autoresearch .agents/skills/autoresearch
```

Antigravity auto-discovers skills in `.agents/skills/` — no settings change needed. Just describe your goal and it picks up the skill automatically.

### Verify it is working

```
/skills
```

You should see `autoresearch` in the list.

---

## Commands

### `/autoresearch` — the main loop

```
/autoresearch
Goal:   <what you want to improve>
Scope:  <files or folders the AI may change>
Metric: <what to measure, and whether higher or lower is better>
Verify: <command that outputs the metric>
Guard:  <command that must always pass — optional>
```

### `/autoresearch:plan` — do not know where to start?

Just describe your goal in plain English. Gemini scans your project, detects your tech stack, proposes the full config, runs a dry run, and hands you the ready-to-run command.

```
/autoresearch:plan make my app faster
/autoresearch:plan improve test coverage
/autoresearch:plan reduce my Docker image size
```

### `/autoresearch:ship` — pre-flight before releasing

Runs a full checklist before you ship: tests, types, lint, bundle size, secrets scan, dependency audit. If anything fails, it runs an autoresearch loop to fix it automatically.

```
/autoresearch:ship
/autoresearch:ship --dry-run      ← report only, no fixes
/autoresearch:ship --fast         ← skip slow checks
```

### `/autoresearch:debug` — something is broken

Autonomous root cause analysis. Reproduces the failure, isolates the cause, fixes it, verifies the fix holds.

```
/autoresearch:debug the auth tests are failing
/autoresearch:debug TypeError: Cannot read property 'id' of undefined
/autoresearch:debug CI is failing on the build step
```

### `/autoresearch:security` — find vulnerabilities

Full STRIDE and OWASP security audit. Every finding requires code evidence. Optional auto-fix for confirmed critical and high findings.

```
/autoresearch:security
/autoresearch:security --fix                 ← auto-fix confirmed findings
/autoresearch:security --fail-on critical    ← CI gate mode
```

### Overnight headless mode

```bash
gemini \
  --prompt "Start autoresearch. Goal: reduce bundle size below 200KB. Scope: src/. Metric: KB (lower is better). Verify: npm run build 2>&1 | grep 'First Load JS'. Do not pause." \
  --yolo
```

`--yolo` disables all confirmation prompts. `--prompt` starts immediately. Walk away. You will wake up to `autoresearch-results.tsv` and `autoresearch-lessons.md`.

---

## Examples

### For developers

<details>
<summary><b>Test coverage</b></summary>

```
/autoresearch
Goal:   Increase test coverage from 72% to 90%
Scope:  src/**/*.ts, src/**/*.test.ts
Metric: coverage % (higher is better)
Verify: npm test -- --coverage | grep "All files"
Guard:  npx tsc --noEmit
```
</details>

<details>
<summary><b>Bundle size</b></summary>

```
/autoresearch
Goal:   Reduce production bundle below 200KB
Scope:  src/**/*.tsx, src/**/*.ts
Metric: bundle size in KB (lower is better)
Verify: npm run build 2>&1 | grep "First Load JS"
Guard:  npm test
```
</details>

<details>
<summary><b>TypeScript errors</b></summary>

```
/autoresearch
Goal:   Eliminate all TypeScript errors
Scope:  src/**/*.ts
Metric: error count (lower is better)
Verify: npx tsc --noEmit 2>&1 | grep -c "error TS" || echo "0"
```
</details>

<details>
<summary><b>Lighthouse performance score</b></summary>

```
/autoresearch
Goal:   Lighthouse performance score above 95
Scope:  src/components/**/*.tsx, src/app/**/*.tsx
Metric: Lighthouse score (higher is better)
Verify: npx lighthouse http://localhost:3000 --output json --quiet 2>/dev/null | jq '.categories.performance.score * 100'
Guard:  npm test
```
</details>

<details>
<summary><b>Docker image size</b></summary>

```
/autoresearch
Goal:   Reduce Docker image below 150MB
Scope:  Dockerfile, .dockerignore
Metric: image size in MB (lower is better)
Verify: docker build -t bench . -q && docker images bench --format "{{.Size}}"
```
</details>

<details>
<summary><b>CI pipeline speed</b></summary>

```
/autoresearch
Goal:   CI pipeline under 5 minutes
Scope:  .github/workflows/*.yml
Metric: estimated pipeline duration in seconds (lower is better)
Verify: node scripts/estimate-ci-time.js
```
</details>

<details>
<summary><b>SQL query performance</b></summary>

```
/autoresearch
Goal:   Reduce dashboard query total execution time
Scope:  queries/dashboard/*.sql
Metric: total execution time in ms (lower is better)
Verify: psql -f scripts/bench-queries.sql | grep "total_ms"
```
</details>

---

### For non-developers

You do not need to write code to use this. If your goal is measurable, Gemini can iterate toward it overnight. Here are examples using Antigravity IDE:

<details>
<summary><b>SEO — improve your blog post ranking</b> (uses Google Search grounding — exclusive to Gemini)</summary>

```
/autoresearch
Goal:   Maximise SEO score for keyword "project management tips"
Scope:  content/blog/project-management.md
Metric: SEO score (higher is better)
Verify: node scripts/seo-score.js content/blog/project-management.md
```

What makes this Gemini-native: Gemini also searches Google to check what the top-ranking pages have that yours does not — and uses that as the next hypothesis. No other autoresearch skill can do this.
</details>

<details>
<summary><b>Marketing — optimise email subject lines</b></summary>

```
/autoresearch
Goal:   40 subject lines, each under 50 chars with a power word and CTA
Scope:  content/emails/subject-lines.md
Metric: lines meeting all criteria (higher is better)
Verify: node scripts/validate-subjects.js
```
</details>

<details>
<summary><b>HR — improve job description inclusivity</b></summary>

```
/autoresearch
Goal:   Bias-free, inclusive language across all job descriptions
Scope:  content/job-descriptions/*.md
Metric: inclusivity score (higher is better)
Verify: node scripts/jd-inclusivity-score.js
```
</details>

<details>
<summary><b>Operations — standardise SOPs</b></summary>

```
/autoresearch
Goal:   All SOPs use standard template with under 100 words per step
Scope:  docs/sops/*.md
Metric: template compliance % (higher is better)
Verify: node scripts/sop-score.js
```
</details>

<details>
<summary><b>Content — landing page quality score</b></summary>

```
/autoresearch
Goal:   Maximise CRO score — clear CTA, social proof, urgency, readability
Scope:  content/landing-pages/home.md
Metric: CRO score (higher is better)
Verify: node scripts/cro-score.js content/landing-pages/home.md
```
</details>

---

## The lessons system — gets smarter every night

After every 5 successful iterations, Gemini writes a structured lesson:

```
## Lesson 3 — iterations 11–15
Pattern:       Deferring non-critical third-party scripts
Why it worked: Removes scripts from the critical render path
Conditions:    Analytics, chat widgets, social embeds
Anti-pattern:  Lazy-loading scripts called in the first 500ms caused layout shifts
Metric delta:  +6.8% Lighthouse performance
```

The next run reads these lessons before forming any hypothesis:

```
Night 1 → 100 experiments → lessons written
Night 2 → reads lessons  → avoids known failures → smarter from the start
Night 3 → reads updated  → compound gains
```

Each night builds on the last. No other autoresearch skill compounds learning across runs this way.

---

## Why Gemini specifically?

Every major coding agent now has a generalised autoresearch skill:

| Agent | Skill |
|---|---|
| Claude Code | [uditgoenka/autoresearch](https://github.com/uditgoenka/autoresearch) |
| Codex CLI | [leo-lilinxiao/codex-autoresearch](https://github.com/leo-lilinxiao/codex-autoresearch) |
| **Gemini CLI** | **this repo** |

Gemini has three things the others cannot do:

### Google Search grounding as a verification source

No other autoresearch skill can verify against live Google results natively. Gemini can query Google as part of each iteration — checking what is actually ranking, whether an API is deprecated, whether your approach matches current best practices. This makes SEO and content goals possible in a completely unique way.

### True headless overnight mode

`gemini --prompt "..." --yolo` disables all confirmation prompts and starts immediately. No babysitting. You sleep; Gemini works.

### 1M token context window

The entire codebase, full git history, all reference docs, and the results log fit in a single context. No chunking, no summarisation, no lost context between iterations. Better hypotheses, fewer repeated mistakes.

---

## Repo structure

```
gemini-autoresearch/
│
├── README.md                              ← you are here
├── CONTRIBUTING.md                        ← how to contribute
├── INSTALL.md                             ← detailed install guide
├── LICENSE                                ← MIT
│
├── scripts/
│   ├── verify.sh                          ← template for custom Verify commands
│   └── content-score.js                  ← Gemini-native LLM-as-judge scorer
│
└── skills/
    └── autoresearch/
        ├── SKILL.md                       ← main skill loaded by Gemini CLI
        └── references/
            ├── loop-protocol.md           ← 9-phase loop spec
            ├── google-search-patterns.md  ← Gemini-native verification patterns
            ├── lessons-system.md          ← cross-run memory spec
            ├── results-logging.md         ← TSV format and interpretation
            ├── plan-workflow.md           ← /autoresearch:plan spec
            ├── ship-workflow.md           ← /autoresearch:ship spec
            ├── debug-workflow.md          ← /autoresearch:debug spec
            └── security-workflow.md       ← /autoresearch:security spec
```

---

## Cross-agent compatibility

| Agent | Install path |
|---|---|
| Gemini CLI (global) | `~/.gemini/skills/autoresearch/` |
| Gemini CLI (project) | `.gemini/skills/autoresearch/` |
| Antigravity IDE | `.agents/skills/autoresearch/` |
| Claude Code | `.claude/skills/autoresearch/` |
| Cursor | `.cursor/skills/autoresearch/` |

> Google Search grounding works only in Gemini CLI and Antigravity. Other agents skip those steps automatically.

---

## Contributing

Contributions are welcome and appreciated. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for the full guide.

Quick ways to help:
- Add a new domain example or verification script
- Translate the README into another language
- Report a confusing instruction via [Issues](https://github.com/supratikpm/gemini-autoresearch/issues)
- Star the repo if this is useful to you ⭐

---

## Credits

- **[Andrej Karpathy](https://github.com/karpathy)** — for [autoresearch](https://github.com/karpathy/autoresearch) and the insight that constraint + metric + overnight iteration = compounding gains
- **[Udit Goenka](https://github.com/uditgoenka)** — for [generalising it to Claude Code](https://github.com/uditgoenka/autoresearch) and proving it works beyond ML
- **[Leo Lilinxiao](https://github.com/leo-lilinxiao)** — for [the Codex version](https://github.com/leo-lilinxiao/codex-autoresearch) and the dual-gate Verify + Guard pattern
- **[Google](https://github.com/google-gemini/gemini-cli)** — for Gemini CLI and the skills system

---

## License

MIT — see [LICENSE](LICENSE).

---

<div align="center">

If this is useful, please consider starring the repo ⭐

**[Star on GitHub](https://github.com/supratikpm/gemini-autoresearch)**

</div>
