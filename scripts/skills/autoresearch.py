#!/usr/bin/env python3
"""
Autoresearch - Agent SDK Skill Script

Autonomous goal-directed iteration for quality improvement.
Performs competitive intelligence, market gap analysis, and SERP opportunity scoring.

Accepts --data-dir pointing to the data/parsed directory.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Autoresearch - Quality Verification & Intelligence")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    return parser.parse_args()


def load_data_files(data_dir):
    """Load all relevant data files from the parsed directory."""
    data = {}
    files_to_load = [
        "llm_wiki_data.json",
        "high_value_keywords.json",
        "high_volume_keywords.json",
        "google_keywords_parsed.json",
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
    """Use OpenAI API to perform autoresearch analysis."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        wiki_data = data.get("llm_wiki_data.json", {})
        entities = wiki_data.get("entities", [])
        keywords = data.get("high_value_keywords.json", {}).get("keywords", [])
        high_volume = data.get("high_volume_keywords.json", {}).get("keywords", [])
        strategy_data = data.get("strategy_wiki_data.json", {})
        strategies = strategy_data.get("strategies", [])

        entity_names = [e.get("name", "") for e in entities[:20]]
        keyword_sample = [kw.get("keyword", "") for kw in keywords[:15]]

        prompt = f"""You are the Autoresearch agent for ViaSurg, a medical device company.
Perform quality verification and competitive intelligence analysis.

Wiki Entities ({len(entities)}): {json.dumps(entity_names)}
High-Value Keywords ({len(keywords)}): {json.dumps(keyword_sample)}
High-Volume Keywords: {len(high_volume)}
Active Strategies: {len(strategies)}

Perform autoresearch analysis:
1. Competitive Intelligence - analyze market positioning
2. Market Gap Analysis - identify content/keyword gaps
3. SERP Opportunity Scoring - rank high-value opportunities
4. Quality Verification - assess current content quality

Respond in JSON format with keys:
- competitive_intel (array of {competitor, strengths, weaknesses})
- market_gaps (array of {keyword, opportunity, priority})
- serp_opportunities (array of {keyword, score, difficulty, recommendation})
- quality_score (0-100)
- quality_checks (array of {name, passed: bool, detail})
- recommendations (array of strings)"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a competitive intelligence AI. Respond only with valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        result = json.loads(response.choices[0].message.content)
        return {
            "status": "success",
            "mode": "ai",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "autoresearch",
            "results": result
        }

    except Exception as e:
        return {
            "status": "error",
            "mode": "ai_error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "autoresearch",
            "error": str(e),
            "fallback_reason": "api_call_failed"
        }


def generate_fallback(data_dir, reason="no_api_key"):
    """Generate a structured fallback response without API calls."""
    data = load_data_files(data_dir)

    wiki_data = data.get("llm_wiki_data.json", {})
    entities = wiki_data.get("entities", [])
    keywords = data.get("high_value_keywords.json", {}).get("keywords", [])
    high_volume = data.get("high_volume_keywords.json", {}).get("keywords", [])
    all_keywords = data.get("google_keywords_parsed.json", {}).get("keywords", [])
    strategy_data = data.get("strategy_wiki_data.json", {})
    strategies = strategy_data.get("strategies", [])

    # Basic entity classification
    product_entities = []
    competitor_entities = []
    for e in entities:
        content = e.get("content", "")
        if "Type**: [[Product]]" in content or "Market Strategy" in content:
            product_entities.append(e.get("name", ""))
        if "Dominant Products" in content or "Incumbent" in content:
            competitor_entities.append(e.get("name", ""))

    # Basic keyword gap analysis
    entity_names_lower = [e.get("name", "").lower().replace("_", " ") for e in entities]
    keyword_gaps = []
    for kw in keywords[:20]:
        kw_lower = kw.get("keyword", "").lower()
        has_entity = any(kw_lower in name or name in kw_lower for name in entity_names_lower)
        if not has_entity and kw.get("top_of_page_bid_high", 0) > 5:
            keyword_gaps.append({
                "keyword": kw.get("keyword", ""),
                "cpc": kw.get("top_of_page_bid_high", 0),
                "opportunity": "No entity page exists"
            })

    # Basic SERP opportunities
    serp_opps = []
    for kw in high_volume[:10]:
        if kw.get("avg_monthly_searches", 0) > 50000:
            serp_opps.append({
                "keyword": kw.get("keyword", ""),
                "searches": kw.get("avg_monthly_searches", 0),
                "cpc": kw.get("top_of_page_bid_high", 0),
                "score": round(kw.get("avg_monthly_searches", 0) / 10000 * kw.get("top_of_page_bid_high", 1))
            })

    # Quality checks
    checks = [
        {
            "name": "Product Entity Coverage",
            "pass": len(product_entities) > 0,
            "detail": f"{len(product_entities)} product entities found"
        },
        {
            "name": "Keyword Coverage",
            "pass": len(keywords) > 0,
            "detail": f"{len(keywords)} high-value keywords loaded"
        },
        {
            "name": "High-Volume Keywords",
            "pass": len(high_volume) > 0,
            "detail": f"{len(high_volume)} high-volume keywords loaded"
        },
        {
            "name": "Strategy Data",
            "pass": len(strategies) > 0,
            "detail": f"{len(strategies)} strategies in wiki"
        },
        {
            "name": "Entity Cross-References",
            "pass": len(entities) > 10,
            "detail": f"{len(entities)} total entities"
        }
    ]

    passed = sum(1 for c in checks if c["pass"])
    score = round((passed / len(checks)) * 100) if checks else 0

    return {
        "status": "success",
        "mode": "fallback",
        "fallback": True,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stage": "autoresearch",
        "results": {
            "competitive_intel": [
                {"competitor": c, "strengths": ["AI analysis required"], "weaknesses": ["AI analysis required"]}
                for c in competitor_entities[:5]
            ],
            "market_gaps": keyword_gaps[:10],
            "serp_opportunities": sorted(serp_opps, key=lambda x: x.get("score", 0), reverse=True)[:10],
            "quality_score": score,
            "quality_checks": checks,
            "entity_stats": {
                "total": len(entities),
                "products": len(product_entities),
                "competitors": len(competitor_entities)
            },
            "keyword_stats": {
                "high_value": len(keywords),
                "high_volume": len(high_volume),
                "total": len(all_keywords)
            },
            "recommendations": [
                "Configure API key for AI-powered autoresearch",
                f"Review {len(keyword_gaps)} keyword gaps manually",
                f"Analyze {len(competitor_entities)} competitor entities"
            ]
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
            "stage": "autoresearch",
            "error": f"Data directory not found: {data_dir}"
        }
        print(json.dumps(output, indent=2))
        sys.exit(1)

    api_key = os.environ.get("OPENAI_API_KEY")

    if api_key:
        data = load_data_files(data_dir)
        result = analyze_with_openai(data, api_key)
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
