# Gemini Autoresearch — Operator's Manual

This guide provides a deep dive into the `autoresearch` skill, explaining every field, phase, and rule.

## Why Autoresearch?
The core philosophy is: **Constraint + Metric + Iteration = Compounding Gains.**
By setting a measurable goal and letting an agent iterate on it autonomously, you remove human bias and fatigue from the optimization process.

## Command Fields

### `Goal`
Be specific. Instead of "Fix the CSS", use "Fix the accessibility contrast ratio on the landing page to be above 4.5:1".
*   **Good**: "Reduce total First Load JS bundle size below 200KB."
*   **Bad**: "Make it faster."

### `Scope`
Comma-separated list of files or directories the agent is allowed to modify.
*   **Important**: The agent can *read* the whole repo (1M token context), but *modified* only what's in Scope.

### `Metric`
The single number you are optimizing. State if **higher** or **lower** is better.
*   **Example**: "Test coverage % (higher is better)", "Bundle size in KB (lower is better)".

### `Verify`
A shell command that outputs the metric.
*   **Constraint**: Must complete in under 10 seconds.
*   **Output**: Must eventually output a number.
*   **Template**: `npm test -- --coverage | grep "All files" | awk '{print $NF}'`

### `Guard` (Optional but Recommended)
A shell command that must *always* pass (exit 0).
*   **Purpose**: Safety. It prevents the agent from breaking things while chasing the metric.
*   **Example**: `npx tsc --noEmit` (ensures types always pass).

---

## The Loop Phases

1.  **Review**: Gemini looks at the current code, git history, and previous results.
2.  **Ideate**: Picks *one* hypothesis to test.
3.  **Modify**: Makes exactly *one* atomic change.
4.  **Commit**: Saves the change to Git *before* verifying. This is your safety net.
5.  **Verify + Guard**:
    *   Runs `Verify` to check progress.
    *   If improved, runs `Guard` to check safety.
6.  **Decide**:
    *   `KEEP` if both pass.
    *   `REWORK` if Verify passes but Guard fails (agent tries to fix the regression).
    *   `REVERT` if Verify fails or crashes.
7.  **Log**: Records everything in `autoresearch-results.tsv`.
8.  **Repeat**: Never stops.

---

## Best Practices
*   **Fast Verification**: The faster the verification, the more experiments per hour. Target < 2s.
*   **Atomic Changes**: If a change takes more than one sentence to explain, it's too big.
*   **Lessons**: The agent builds a `autoresearch-lessons.md` file every 5 keeps. This is how it gets smarter over time.

---

## Troubleshooting
*   **Stuck?**: If the agent fails 5 times in a row, it enters "Stuck Recovery" mode, where it re-reads context and tries a "literal opposite" approach or searches Google.
*   **Crashing?**: If the Verify command crashes, the agent has 3 tries to fix the command itself before reverting.
