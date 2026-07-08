#!/usr/bin/env python3
"""
Site Generator - Agent SDK Skill Script

Transforms the LLM Wiki into a public-facing, SEO-optimized website.
Generates page structures, schemas, and sitemaps.

Accepts --data-dir pointing to the data/parsed directory.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Site Generator - SEO Website Builder")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    return parser.parse_args()


def load_data_files(data_dir):
    """Load all relevant data files from the parsed directory."""
    data = {}
    files_to_load = [
        "llm_wiki_data.json",
        "i18n_data.json",
        "templates_data.json",
        "high_value_keywords.json",
        "google_keywords_parsed.json",
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
    """Use OpenAI API to perform site generation analysis."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        wiki_data = data.get("llm_wiki_data.json", {})
        entities = wiki_data.get("entities", [])
        i18n = data.get("i18n_data.json", {})
        templates = data.get("templates_data.json", {})
        keywords = data.get("high_value_keywords.json", {}).get("keywords", [])

        product_entities = [
            e for e in entities
            if "Type**: [[Product]]" in e.get("content", "") or "Market Strategy" in e.get("content", "")
        ]

        prompt = f"""You are the Site Generator for ViaSurg, a medical device company.
Analyze the following data to plan website generation.

Product Entities ({len(product_entities)}): {[e.get("name", "") for e in product_entities[:15]]}
Total Entities: {len(entities)}
i18n Languages: {list(i18n.get("ui", {}).keys()) if isinstance(i18n.get("ui"), dict) else "N/A"}
Templates Available: {list(templates.keys()) if templates else "None"}
High-Value Keywords ({len(keywords)}): {[kw.get("keyword", "") for kw in keywords[:10]]}

Generate site structure recommendations:
1. Page hierarchy and navigation
2. SEO optimization strategy
3. Schema.org markup recommendations
4. Content prioritization

Respond in JSON format with keys:
- pages (array of {name, url, type, priority})
- navigation (object with menu structure)
- seo_strategy (object with meta recommendations)
- schema_markup (array of schema.org types to generate)
- generation_score (0-100)
- recommendations (array of strings)"""

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a website architecture AI. Respond only with valid JSON."},
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
            "stage": "site_generator",
            "results": result
        }

    except Exception as e:
        return {
            "status": "error",
            "mode": "ai_error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "stage": "site_generator",
            "error": str(e),
            "fallback_reason": "api_call_failed"
        }


def generate_fallback(data_dir, reason="no_api_key"):
    """Generate a structured fallback response without API calls."""
    data = load_data_files(data_dir)

    wiki_data = data.get("llm_wiki_data.json", {})
    entities = wiki_data.get("entities", [])
    i18n = data.get("i18n_data.json", {})
    templates = data.get("templates_data.json", {})
    keywords = data.get("high_value_keywords.json", {}).get("keywords", [])

    # Basic entity classification for page generation
    product_entities = []
    category_entities = []
    for e in entities:
        content = e.get("content", "")
        if "Type**: [[Product]]" in content or "Market Strategy" in content:
            product_entities.append(e.get("name", ""))
        elif "Type**: [[Category]]" in content:
            category_entities.append(e.get("name", ""))

    # Generate basic page list
    pages = []
    for name in product_entities[:12]:
        slug = name.lower().replace(" ", "-").replace("_", "-")
        pages.append({
            "name": name.replace("_", " "),
            "url": f"/output/{slug}.html",
            "type": "product",
            "priority": "high"
        })

    return {
        "status": "success",
        "mode": "fallback",
        "fallback": True,
        "reason": reason,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "stage": "site_generator",
        "results": {
            "pages": pages,
            "total_entities": len(entities),
            "product_count": len(product_entities),
            "category_count": len(category_entities),
            "i18n_available": list(i18n.get("ui", {}).keys()) if isinstance(i18n.get("ui"), dict) else [],
            "templates_available": list(templates.keys()) if templates else [],
            "navigation": {
                "main": ["Products", "Specifications", "Evidence", "Contact"],
                "footer": ["Products", "Evidence", "Company", "Compliance"]
            },
            "seo_strategy": {
                "title_template": "{product_name} - ViaSurg Clinical Intelligence",
                "meta_description_template": "Explore {product_name} from ViaSurg. FDA 510(k) certified medical devices with transparent manufacturing.",
                "schema_types": ["Product", "Organization", "BreadcrumbList"]
            },
            "generation_score": 50,
            "recommendations": [
                "Configure API key for AI-powered site generation",
                f"Review {len(product_entities)} product entities for page generation",
                "Templates and i18n data available for manual site building"
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
            "stage": "site_generator",
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
