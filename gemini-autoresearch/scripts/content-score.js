#!/usr/bin/env node
/**
 * content-score.js — use Gemini as a judge to score content quality
 *
 * This is a Gemini-native verification script. It uses the Gemini API
 * (via the @google/generative-ai SDK) to score content on a 0-100 scale.
 *
 * Use this when your goal is content quality that cannot be measured by
 * local heuristics alone (readability alone is not enough).
 *
 * Usage:
 *   node scripts/content-score.js <path/to/content.md>
 *
 * /autoresearch
 * Verify: node scripts/content-score.js content/blog/latest.md
 *
 * Requirements:
 *   npm install @google/generative-ai
 *   export GEMINI_API_KEY=your_key_here
 *
 * Note: use a fast, cheap model (gemini-1.5-flash) for verification.
 * Using the same model that is making changes creates a feedback loop —
 * consider this a known limitation and cross-check with local metrics too.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/content-score.js <path/to/file>');
  process.exit(1);
}

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf-8');
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('GEMINI_API_KEY environment variable not set');
  process.exit(1);
}

async function score() {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `Score the following content on a scale of 0 to 100.

Scoring criteria (equal weight):
- Clarity: is the writing clear and easy to follow?
- Structure: does it have logical flow and good organisation?
- Specificity: does it use concrete examples rather than vague claims?
- Value: would a reader finish this feeling they learned something useful?

Return ONLY a single integer between 0 and 100. No explanation, no prose.
Just the number.

Content to score:
---
${content.slice(0, 8000)}
---`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const score = parseInt(text, 10);

  if (isNaN(score) || score < 0 || score > 100) {
    console.error(`Unexpected model response: "${text}"`);
    process.exit(1);
  }

  console.log(`SCORE: ${score}`);
  process.exit(0);
}

score().catch(err => {
  console.error('Gemini API error:', err.message);
  process.exit(1);
});
