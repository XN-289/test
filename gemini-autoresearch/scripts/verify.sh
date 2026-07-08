#!/usr/bin/env bash
# verify.sh — template for custom verification scripts
#
# Rules for a good verify script:
#   1. Completes in under 10 seconds (faster = more experiments per hour)
#   2. Outputs exactly one number on a line starting with "SCORE:"
#   3. Exits 0 on success, non-zero on failure
#   4. Is deterministic — same code = same score (or very close)
#   5. Requires no human input or external services (unless using Gemini grounding)
#
# Usage: replace the scoring logic below with your own measurement.
# Then pass this script as the Verify command:
#
#   /autoresearch
#   Verify: bash scripts/verify.sh

set -euo pipefail

# ── your measurement here ──────────────────────────────────────────────────────

# Example 1: test coverage
# SCORE=$(npm test -- --coverage --silent 2>&1 | grep "All files" | awk '{print $10}' | tr -d '%')

# Example 2: bundle size in KB
# SCORE=$(npm run build --silent 2>&1 | grep "First Load JS" | grep -oP '\d+\.?\d*(?= kB)')

# Example 3: TypeScript errors (lower is better)
# SCORE=$(npx tsc --noEmit 2>&1 | grep -c "error TS" || true)

# Example 4: lighthouse performance score (requires local server running)
# SCORE=$(npx lighthouse http://localhost:3000 --output json --quiet 2>/dev/null | jq '.categories.performance.score * 100')

# Example 5: line count (lower is better)
# SCORE=$(find src/ -name "*.ts" | xargs wc -l | tail -1 | awk '{print $1}')

# ── placeholder — replace with one of the above ───────────────────────────────
SCORE=0
echo "ERROR: replace the scoring logic in scripts/verify.sh" >&2
exit 1

# ── output (do not change this line) ──────────────────────────────────────────
echo "SCORE: ${SCORE}"
exit 0
