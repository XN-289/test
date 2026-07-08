# Installation guide

## Requirements

- [Gemini CLI](https://github.com/google-gemini/gemini-cli) installed
- Gemini CLI v0.23.0 or later (for skills support)
- A project with git initialised (`git init`)
- A verification command that outputs a number in under 10 seconds

## Step 1 — Get the skill

```bash
git clone https://github.com/YOUR_USERNAME/gemini-autoresearch.git
```

## Step 2 — Install

### Global install (works in all projects)

```bash
mkdir -p ~/.gemini/skills
cp -r gemini-autoresearch/skills/autoresearch ~/.gemini/skills/autoresearch
```

### Per-project install

```bash
mkdir -p .gemini/skills
cp -r gemini-autoresearch/skills/autoresearch .gemini/skills/autoresearch
```

### Cross-agent install (works with Claude Code, Cursor, etc.)

```bash
mkdir -p .agents/skills
cp -r gemini-autoresearch/skills/autoresearch .agents/skills/autoresearch
```

## Step 3 — Enable skills in Gemini CLI

Open Gemini CLI in your project and run:

```
/settings
```

Navigate to **Agent Skills** and enable the toggle.

Confirm the skill is loaded:

```
/skills
```

You should see `autoresearch` in the list.

## Step 4 — Add generated files to .gitignore

```bash
echo "autoresearch-results.tsv" >> .gitignore
echo "autoresearch-lessons.md" >> .gitignore
```

These are working files for the agent — not source code.

## Step 5 — Run your first autoresearch

```
/autoresearch
Goal:   <your goal>
Scope:  <files or directories to modify>
Metric: <the number you are optimising, higher or lower is better>
Verify: <shell command that outputs the metric>
```

## Running headless overnight

```bash
gemini \
  --prompt "Read the autoresearch skill and start immediately. Goal: <goal>. Scope: <scope>. Metric: <metric — higher/lower is better>. Verify: <command>. Do not pause." \
  --yolo
```

## Upgrading

To get the latest version of the skill:

```bash
cd gemini-autoresearch && git pull
cp -r skills/autoresearch ~/.gemini/skills/autoresearch  # or your install path
```

## Troubleshooting

**Skill not found**

Check the skills directory path:
```bash
ls ~/.gemini/skills/          # global
ls .gemini/skills/            # per-project
```

The skill directory must contain `SKILL.md` at its root:
```bash
ls ~/.gemini/skills/autoresearch/SKILL.md
```

**Gemini CLI version too old**

```bash
npm install -g @google/gemini-cli@latest
gemini --version
```

Version must be 0.23.0 or later.

**Verify command takes too long**

The Verify command should complete in under 10 seconds. If it takes longer:
- Find a faster proxy metric (e.g. use `--testPathPattern` to run a subset)
- Run the slow check manually every 10 iterations and use a fast check in the loop

**Git not initialised**

```bash
git init
git add -A && git commit -m "initial commit before autoresearch"
```

The loop uses git for rollback. It will not work without a git repository.
