#!/usr/bin/env python3
"""
Wiki Compiler Skill - Entity Classification & Cross-Reference Graph
Reads entities from llm_wiki_data.json, classifies them, builds link graph.
Outputs JSON to stdout.
"""
import json, sys, re, os

sys.stdout.reconfigure(encoding='utf-8')
DATA_DIR = os.environ.get('DATA_DIR', 'd:/test/kealin/data/parsed')

def extract_json_from_response(content):
    """Extract JSON from LLM response, handling markdown code blocks."""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None

def load_entities():
    path = os.path.join(DATA_DIR, 'llm_wiki_data.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f).get('entities', [])

def extract_links(content):
    return re.findall(r'\[\[([^\]]+)\]\]', content or '')

def classify_entity(content):
    if not content:
        return 'Other'
    checks = [
        ('Product', ['Type**: [[Product]]', 'Market Strategy', 'Technical Specs']),
        ('Category', ['Type**: [[Category]]']),
        ('Technology', ['Type**: [[Technology]]']),
        ('Material', ['Type**: [[Material]]']),
        ('Procedure', ['Type**: [[Surgical Procedure]]']),
        ('Portal', ['Type**: [[Portal]]']),
        ('Competitor', ['Dominant Products', 'Incumbent', 'Market Position']),
        ('Strategy', ['Disruption', 'Arbitrage']),
        ('Compliance', ['Compliance', 'Framework']),
    ]
    for etype, markers in checks:
        if any(m in content for m in markers):
            return etype
    return 'Other'

def build_graph(entities):
    graph = {}
    for ent in entities:
        name = ent.get('name', '')
        content = ent.get('content', '')
        links = extract_links(content)
        etype = classify_entity(content)
        graph[name] = {
            'wordCount': ent.get('word_count', len(content.split())),
            'linkCount': len(links),
            'links': links,
            'type': etype
        }
    return graph

def try_llm_analysis(entities, graph):
    api_key = os.environ.get('DEEPSEEK_API_KEY') or os.environ.get('OPENAI_API_KEY')
    base_url = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
    model = os.environ.get('LLM_MODEL', 'deepseek-chat')
    if not api_key:
        return None
    try:
        import openai
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        entity_names = [e['name'] for e in entities[:20]]
        resp = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": f"Classify these medical device wiki entities into types (Product, Category, Competitor, Material, Technology, Procedure, Portal, Strategy, Compliance). Return JSON: {{\"entity_name\": \"type\", ...}}\n\nEntities: {json.dumps(entity_names)}"
            }],
            temperature=0,
            max_tokens=1000
        )
        return extract_json_from_response(resp.choices[0].message.content)
    except Exception as e:
        return {'error': str(e)}

def main():
    try:
        entities = load_entities()
        graph = build_graph(entities)

        type_counts = {}
        for v in graph.values():
            t = v['type']
            type_counts[t] = type_counts[t] + 1 if t in type_counts else 1

        total_links = sum(v['linkCount'] for v in graph.values())
        total_words = sum(v['wordCount'] for v in graph.values())

        top_linked = sorted(
            [{'entity': k, 'links': v['linkCount'], 'type': v['type']} for k, v in graph.items()],
            key=lambda x: x['links'], reverse=True
        )[:10]

        llm_classification = try_llm_analysis(entities, graph)

        result = {
            'skill': 'wiki-compiler',
            'status': 'completed',
            'mode': 'llm' if llm_classification and 'error' not in llm_classification else 'fallback',
            'llmClassification': llm_classification,
            'results': {
                'totalEntities': len(entities),
                'totalWords': total_words,
                'totalLinks': total_links,
                'typeCounts': type_counts,
                'topLinked': top_linked,
                'products': [k for k, v in graph.items() if v['type'] == 'Product'],
                'categories': [k for k, v in graph.items() if v['type'] == 'Category'],
                'competitors': [k for k, v in graph.items() if v['type'] == 'Competitor'],
                'materials': [k for k, v in graph.items() if v['type'] == 'Material'],
                'technologies': [k for k, v in graph.items() if v['type'] == 'Technology'],
            }
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'skill': 'wiki-compiler', 'status': 'error', 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
