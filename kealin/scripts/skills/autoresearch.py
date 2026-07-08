#!/usr/bin/env python3
"""
Autoresearch Skill - Competitive Intelligence & Market Gap Analysis
Reads keyword data and wiki entities, produces actionable intelligence.
Outputs JSON to stdout.
"""
import json, sys, re, os
from collections import Counter

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

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def competitive_intelligence(entities):
    competitors = []
    for ent in entities:
        content = ent.get('content', '')
        if not any(m in content for m in ['Dominant Products', 'Incumbent', 'Market Position']):
            continue
        pain_points = re.findall(r'Pain Point[s]?\*\*:\s*([^\n]+)', content)
        advantages = re.findall(r'Advantage[s]?\*\*:\s*([^\n]+)', content)
        competitors.append({
            'name': ent['name'].replace('_', ' '),
            'painPoints': [p.strip() for p in pain_points],
            'advantages': [a.strip() for a in advantages],
            'wordCount': len(content.split())
        })
    return competitors

def keyword_gap_analysis(keywords, entities):
    entity_names = {e.get('name', '').lower().replace('_', ' ') for e in entities}
    high_cpc = []
    for kw in keywords:
        bid = kw.get('top_of_page_bid_high', 0)
        if bid and float(bid) > 5:
            kw_text = kw.get('keyword', '').lower()
            has_entity = any(kw_text in name or name in kw_text for name in entity_names)
            if not has_entity:
                high_cpc.append({
                    'keyword': kw.get('keyword', ''),
                    'cpc': float(bid),
                    'searches': kw.get('avg_monthly_searches', 0)
                })
    return sorted(high_cpc, key=lambda x: x['cpc'], reverse=True)[:15]

def content_depth_analysis(entities):
    thin = []
    for ent in entities:
        wc = ent.get('word_count', len(ent.get('content', '').split()))
        if wc < 100:
            thin.append({
                'name': ent['name'].replace('_', ' '),
                'words': wc,
                'type': 'unknown'
            })
    return sorted(thin, key=lambda x: x['words'])

def try_llm_competitive_analysis(competitors):
    api_key = os.environ.get('DEEPSEEK_API_KEY') or os.environ.get('OPENAI_API_KEY')
    base_url = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
    model = os.environ.get('LLM_MODEL', 'deepseek-chat')
    if not api_key:
        return None
    try:
        import openai
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        resp = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": f"Analyze these medical device competitors. Identify market positioning gaps and opportunities for a new entrant.\n\nCompetitors: {json.dumps(competitors[:5], ensure_ascii=False)}\n\nReturn JSON: {{\"gaps\": [\"...\"], \"opportunities\": [\"...\"], \"threat_level\": \"high/medium/low\"}}"
            }],
            temperature=0,
            max_tokens=1000
        )
        return extract_json_from_response(resp.choices[0].message.content)
    except Exception as e:
        return {'error': str(e)}

def main():
    try:
        entities = load_json('llm_wiki_data.json').get('entities', [])
        hv_kw = load_json('high_value_keywords.json').get('keywords', [])

        competitors = competitive_intelligence(entities)
        keyword_gaps = keyword_gap_analysis(hv_kw, entities)
        thin_content = content_depth_analysis(entities)

        total_pain = sum(len(c['painPoints']) for c in competitors)
        total_advantage = sum(len(c['advantages']) for c in competitors)

        llm_insights = try_llm_competitive_analysis(competitors)

        # SERP opportunities
        hv_data = load_json('high_value_keywords.json')
        serp_opps = []
        for kw in hv_data.get('keywords', [])[:50]:
            vol = kw.get('avg_monthly_searches', 0)
            if vol and int(vol) > 100000:
                serp_opps.append({
                    'keyword': kw.get('keyword', ''),
                    'volume': int(vol),
                    'cpc': kw.get('top_of_page_bid_high', 0),
                    'opportunity_score': round(int(vol) / 10000 + float(kw.get('top_of_page_bid_high', 0) or 0), 1)
                })
        serp_opps.sort(key=lambda x: x['opportunity_score'], reverse=True)

        result = {
            'skill': 'autoresearch',
            'status': 'completed',
            'mode': 'llm' if llm_insights and 'error' not in llm_insights else 'fallback',
            'llmInsights': llm_insights,
            'results': {
                'competitiveIntelligence': {
                    'competitorsAnalyzed': len(competitors),
                    'totalPainPoints': total_pain,
                    'totalAdvantages': total_advantage,
                    'details': competitors
                },
                'keywordGaps': {
                    'gapsFound': len(keyword_gaps),
                    'topGaps': keyword_gaps
                },
                'contentDepth': {
                    'thinEntities': len(thin_content),
                    'details': thin_content
                },
                'serpOpportunities': {
                    'opportunitiesFound': len(serp_opps),
                    'topOpportunities': serp_opps[:5]
                }
            }
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'skill': 'autoresearch', 'status': 'error', 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
