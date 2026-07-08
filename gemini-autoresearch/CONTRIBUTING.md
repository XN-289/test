# Contributing to gemini-autoresearch

Thank you for considering a contribution. This project is small by design —
contributions that keep it focused and useful are more valuable than ones
that make it bigger.

---

## What we are looking for

### High value contributions

- **New domain examples** — a new real-world use case with a working Verify command
  (DevOps, data science, content, legal, finance, healthcare — any domain where
  you have a measurable goal)
- **New verification scripts** — a `scripts/` file for a common tool that does not
  have one yet (e.g. Playwright, k6, ESLint, Semgrep, Trivy)
- **README translations** — the README in another language (especially Indian
  languages, Chinese, Japanese, Spanish, Portuguese)
- **Bug reports** — a clear description of something that does not work as
  documented, with steps to reproduce
- **Improved instructions** — anywhere the wording is confusing or incomplete

### Lower priority (we will review but may decline)

- Adding new subcommands without a concrete use case from real experience
- Changing the core loop logic without evidence it produces better results
- Cosmetic changes to formatting or style

---

## How to contribute

### For small changes (fixing a typo, improving a description)

1. Fork the repo
2. Make your change directly on GitHub's web editor
3. Open a pull request with a one-line description

### For larger changes (new examples, new scripts, translations)

1. Fork the repo
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/gemini-autoresearch.git`
3. Create a branch: `git checkout -b add-playwright-verify-script`
4. Make your changes
5. Test them if applicable (run the verify script against a real project)
6. Commit with a clear message: `git commit -m "add: Playwright e2e verify script"`
7. Push: `git push origin add-playwright-verify-script`
8. Open a pull request

---

## Pull request guidelines

**Title format:**
```
add: <what you added>
fix: <what you fixed>
docs: <what you documented>
translate: README into <language>
```

**Description should include:**
- What the change does
- Why it is useful
- If it is a new example — what domain, what metric, what verify command

**We will merge quickly if:**
- The change is focused (does one thing)
- The verify command is real and tested
- The description is complete

**We will ask for changes if:**
- The scope is too broad
- The verify command is untested or theoretical
- The change breaks the existing structure

---

## Adding a new domain example

The best contributions are concrete examples from domains that are not yet covered.

### Template

```
/autoresearch
Goal:   <specific, measurable goal>
Scope:  <files or directories to modify>
Metric: <metric name> (higher/lower is better)
Verify: <shell command that outputs a number>
Guard:  <optional — command that must always pass>
```

### Rules for a good verify command

- Completes in under 10 seconds
- Outputs exactly one number
- Exits 0 on success, non-zero on failure
- Is deterministic — same input produces same output
- Requires no human interaction

### Where to add it

Add the example to the relevant section in `README.md`. If the domain is large
enough to warrant its own section (more than 3 examples), add it as a new
collapsible `<details>` block.

---

## Adding a verification script

Add scripts to the `scripts/` directory. Name them descriptively:

```
scripts/lighthouse-score.js
scripts/seo-score.js
scripts/validate-subjects.js
scripts/spam-score.js
```

Every script must:
- Accept the target file or endpoint as a command-line argument
- Output `SCORE: <number>` on a single line
- Exit 0 on success, non-zero on failure
- Include a usage comment at the top

See `scripts/verify.sh` and `scripts/content-score.js` for examples.

---

## Translating the README

Translations live in `docs/i18n/README_<LANG>.md`.

File naming:
```
docs/i18n/README_ZH.md    ← Chinese
docs/i18n/README_HI.md    ← Hindi
docs/i18n/README_BN.md    ← Bengali
docs/i18n/README_JA.md    ← Japanese
docs/i18n/README_KO.md    ← Korean
docs/i18n/README_ES.md    ← Spanish
docs/i18n/README_FR.md    ← French
docs/i18n/README_DE.md    ← German
docs/i18n/README_PT.md    ← Portuguese
docs/i18n/README_RU.md    ← Russian
```

Once merged, add a language link badge at the top of the main README.

---

## Reporting a bug

Open an issue at `https://github.com/supratikpm/gemini-autoresearch/issues`

Include:
- What you were trying to do
- What command you ran
- What happened vs what you expected
- Your Gemini CLI version (`gemini --version`)
- Your OS

---

## Questions

Open a discussion at `https://github.com/supratikpm/gemini-autoresearch/discussions`

---

## Code of conduct

Be direct and constructive. Treat contributors as capable adults. Focus on
the work, not the person. That is all.
