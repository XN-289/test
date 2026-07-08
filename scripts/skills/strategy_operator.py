#!/usr/bin/env python3
"""
Strategy Operator (OODA Loop) - Agent SDK Skill Script

Performs strategic analysis through an OODA loop:
Observe -> Orient -> Decide -> Act

Accepts --data-dir pointing to the data/parsed directory.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Strategy Operator - OODA Loop Analysis")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    return parser.parse_args()


def load_data_files(data_dir):
    """Load all relevant data files from the parsed directory."""
    data = {}
    files_to_load = [
        "google_keywords_parsed.json",
        "high_value_keywords.json",
        "high_volume_keywords.json",
        "strategy_wiki_data.json",
    ]
    for filename in files_to_load:
        filepath = os.path.join(data_dir, filename)
        if os.path.exists(filepath):
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    data[filename] = json.load(f)
            except Exception:
                data[filename] = None
    return data


def analyze_with_openai(data, api_key):
    """Use OpenAI API to perform strategic OODA analysis."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        # Build a summary of the data for the prompt
        keywords = data.get("high_value_keywords.json", {}).get("keywords", [])
        high_volume = data.get("high_volume_keywords.json", {}).get("keywords", [])
        strategy_data = data.get("strategy_wiki_data.json", {})

        keyword_summary = ", ".join([kw.get("keyword", "") for kw in keywords[:20]])
        volume_summary = ", ".join([kw.get("keyword", "") for kw in high_volume[:20]])
        signals = strategy_data.get("signals", [])
        strategies = strategy_data.get("strategies", [])

        prompt = f"""You are the Strategy Operator for ViaSurg, a medical device company.
Analyze the following market data through an OODA loop framework.

High-Value Keywords (top 20): {keyword_summary}
High-Volume Keywords (top 20): {volume_summary}
Existing Signals: {json.dumps(signals[:5]) if signals else "None"}
Existing Strategies: {json.dumps(strategies[:5]) if strategies else "None"}

Perform an OODA analysis:
1. OBSERVE: What are the key market signals?
2. ORIENT: How do these signals align with ViaSurg's positioning?
3. DECIDE: What strategic actions should be prioritized?
4. ACT: What immediate next steps are recommended?

Respond in JSON format with keys: observe, orient, decide, act (each an array of strings).
Also include: priority_score (0-100), risk_level (low/medium/high), recommended_actions (array)."""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a strategic analysis AI. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "status": "success",
            "mode": "ai",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "strategy_operator",
            "results": result
        }

    except Exception as e:
        return {
            "status": "error",
            "mode": "ai_error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "strategy_operator",
            "error": str(e),
            "fallback_reason": "api_call_failed"
        }


def generate_fallback(data_dir, reason="no_api_key"):
    """Generate a structured fallback response without API calls."""
    data = load_data_files(data_dir)

    keywords = data.get("high_value_keywords.json", {}).get("keywords", [])
    high_volume = data.get("high_volume_keywords.json", {}).get("keywords", [])
    strategy_data = data.get("strategy_wiki_data.json", {})
    signals = strategy_data.get("signals", [])
    strategies = strategy_data.get("strategies", [])

    # Basic keyword clustering without AI
    keyword_texts = [kw.get("keyword", "") for kw in keywords[:30]]
    volume_texts = [kw.get("keyword", "") for kw in high_volume[:30]]

    return {
        "status": "success",
        "mode": "fallback",
        "fallback": True,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stage": "strategy_operator",
        "results": {
            "observe": [
                f"Loaded {len(keywords)} high-value keywords",
                f"Loaded {len(high_volume)} high-volume keywords",
                f"Found {len(signals)} existing signals",
                f"Found {len(strategies)} existing strategies"
            ],
            "orient": [
                "Keyword data available for analysis",
                "Strategy wiki data loaded successfully",
                "Cross-reference with existing signals pending AI analysis"
            ],
            "decide": [
                "Requires OpenAI API key for full strategic analysis",
                "Basic keyword metrics available for manual review"
            ],
            "act": [
                "Set OPENAI_API_KEY environment variable for AI-powered analysis",
                "Review keyword data manually using data/parsed directory"
            ],
            "priority_score": 50,
            "risk_level": "medium",
            "recommended_actions": [
                "Configure API key for AI analysis",
                "Review high-value keywords manually"
            ],
            "keyword_sample": keyword_texts[:10],
            "volume_sample": volume_texts[:10]
        }
    }


def main():
    args = parse_args()
    data_dir = args.data_dir

    if not os.path.isdir(data_dir):
        output = {
            "status": "error",
            "mode": "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "strategy_operator",
            "error": f"Data directory not found: {data_dir}"
        }
        print(json.dumps(output, indent=2))
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")

    if api_key:
        data = load_data_files(data_dir)
        result = analyze_with_openai(data, api_key)
        # If API call failed, fall back
        if result.get("status") == "error":
            fallback = generate_fallback(data_dir, reason=result.get("fallback_reason", "api_error"))
            fallback["api_error"] = result.get("error")
            print(json.dumps(fallback, indent=2))
        else:
            print(json.dumps(result, indent=2))
    else:
        result = generate_fallback(data_dir, reason="no_api_key")
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
