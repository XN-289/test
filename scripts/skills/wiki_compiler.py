#!/usr/bin/env python3
"""
Wiki Compiler - Agent SDK Skill Script

Compiles raw documents and strategic intentions into a rigorous ontology.
Builds and maintains the "LLM Wiki" knowledge graph.

Accepts --data-dir pointing to the data/parsed directory.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Wiki Compiler - Knowledge Ontology Builder")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    return parser.parse_args()


def load_data_files(data_dir):
    """Load all relevant data files from the parsed directory."""
    data = {}
    files_to_load = [
        "llm_wiki_data.json",
        "llm_wiki_summary.json",
        "strategy_wiki_data.json",
        "i18n_data.json",
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
    """Use OpenAI API to perform wiki compilation analysis."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        wiki_data = data.get("llm_wiki_data.json", {})
        entities = wiki_data.get("entities", [])
        strategy_data = data.get("strategy_wiki_data.json", {})

        entity_names = [e.get("name", "") for e in entities[:30]]
        entity_types = {}
        for e in entities:
            content = e.get("content", "")
            if "Type**: [[Product]]" in content:
                entity_types[e.get("name", "")] = "Product"
            elif "Type**: [[Category]]" in content:
                entity_types[e.get("name", "")] = "Category"
            elif "Type**: [[Technology]]" in content:
                entity_types[e.get("name", "")] = "Technology"
            elif "Type**: [[Material]]" in content:
                entity_types[e.get("name", "")] = "Material"
            else:
                entity_types[e.get("name", "")] = "Other"

        strategies = strategy_data.get("strategies", [])

        prompt = f"""You are the Wiki Compiler for ViaSurg, a medical device company.
Analyze the following wiki entities and strategic data.

Entities ({len(entities)} total): {json.dumps(entity_names[:20])}
Entity Types: {json.dumps(dict(list(entity_types.items())[:20]))}
Active Strategies: {json.dumps(strategies[:5]) if strategies else "None"}

Perform knowledge compilation analysis:
1. Entity classification and relationship mapping
2. Cross-reference density analysis
3. Strategic alignment assessment
4. Knowledge gap identification

Respond in JSON format with keys:
- entity_summary (object with type counts)
- relationships (array of {source, target, rel_type} objects)
- knowledge_gaps (array of strings)
- compilation_score (0-100)
- recommendations (array of strings)"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a knowledge graph analysis AI. Respond only with valid JSON."},
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
            "stage": "wiki_compiler",
            "results": result
        }

    except Exception as e:
        return {
            "status": "error",
            "mode": "ai_error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "wiki_compiler",
            "error": str(e),
            "fallback_reason": "api_call_failed"
        }


def generate_fallback(data_dir, reason="no_api_key"):
    """Generate a structured fallback response without API calls."""
    data = load_data_files(data_dir)

    wiki_data = data.get("llm_wiki_data.json", {})
    entities = wiki_data.get("entities", [])
    strategy_data = data.get("strategy_wiki_data.json", {})
    strategies = strategy_data.get("strategies", [])

    # Basic entity classification without AI
    type_counts = {"Product": 0, "Category": 0, "Technology": 0, "Material": 0, "Other": 0}
    for e in entities:
        content = e.get("content", "")
        if "Type**: [[Product]]" in content or "Market Strategy" in content:
            type_counts["Product"] += 1
        elif "Type**: [[Category]]" in content:
            type_counts["Category"] += 1
        elif "Type**: [[Technology]]" in content:
            type_counts["Technology"] += 1
        elif "Type**: [[Material]]" in content:
            type_counts["Material"] += 1
        else:
            type_counts["Other"] += 1

    # Count cross-references
    total_links = 0
    for e in entities:
        content = e.get("content", "")
        links = content.count("[[")
        total_links += links

    return {
        "status": "success",
        "mode": "fallback",
        "fallback": True,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stage": "wiki_compiler",
        "results": {
            "entity_summary": type_counts,
            "total_entities": len(entities),
            "total_cross_references": total_links,
            "active_strategies": len(strategies),
            "relationships": [],
            "knowledge_gaps": [
                "AI analysis required for gap detection",
                "Set OPENAI_API_KEY for full compilation analysis"
            ],
            "compilation_score": 50,
            "recommendations": [
                "Configure API key for AI-powered knowledge compilation",
                "Review entity cross-references manually"
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
            "stage": "wiki_compiler",
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
