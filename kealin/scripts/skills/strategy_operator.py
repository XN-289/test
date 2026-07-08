#!/usr/bin/env python3
"""
Strategy Operator Skill - Signal-Insite-Strategy Cross-Reference
Reads signals, insights, strategies from strategy_wiki_data.json.
Outputs JSON to stdout.
"""
import json, sys, os, re

sys.stdout.reconfigure(encoding='utf-8')
DATA_DIR = os.environ.get('DATA_DIR', 'd:/test/kealin/data/parsed')

def extract_json_from_response(content):
    """Extract JSON from LLM response, handling markdown code blocks."""
    # Try direct parse first
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    # Try to extract from ```json ... ``` block
    match = re.search(r'```(?:json)?\s*\n?(.*?)\n?\s*```', content, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    # Try to find any JSON object/array in the content
    match = re.search(r'(\{[\s\S]*\}|\[[\s\S]*\])', content)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError:
            pass
    return None

def load_strategy_data():
    path = os.path.join(DATA_DIR, 'strategy_wiki_data.json')
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def try_llm_analysis(data):
    api_key = os.environ.get('DEEPSEEK_API_KEY') or os.environ.get('OPENAI_API_KEY')
    base_url = os.environ.get('DEEPSEEK_BASE_URL', 'https://api.deepseek.com')
    model = os.environ.get('LLM_MODEL', 'deepseek-chat')
    if not api_key:
        return None
    try:
        import openai
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        signals = data.get('signals', [])[:5]
        insights = data.get('insights', [])[:5]
        resp = client.chat.completions.create(
            model=model,
            messages=[{
                "role": "user",
                "content": f"Analyze the relationship between these market signals and insights. For each signal, identify which insight it supports and recommend a strategic action.\n\nSignals: {json.dumps(signals, ensure_ascii=False)}\nInsights: {json.dumps(insights, ensure_ascii=False)}\n\nReturn JSON: {{\"analysis\": [{{\"signal\": \"...\", \"aligned_insight\": \"...\", \"recommendation\": \"...\", \"priority\": \"high/medium/low\"}}]}}"
            }],
            temperature=0,
            max_tokens=1500
        )
        return extract_json_from_response(resp.choices[0].message.content)
    except Exception as e:
        return {'error': str(e)}

def cross_reference(signals, insights, strategies):
    results = []
    for sig in signals:
        sig_id = sig.get('id', '')
        sig_type = sig.get('type', '')
        aligned = []
        for ins in insights:
            if ins.get('source_signal') == sig_id or sig_type in ins.get('type', ''):
                aligned.append(ins)
        results.append({
            'signal': sig,
            'alignedInsights': aligned,
            'status': 'aligned' if aligned else 'orphan'
        })

    strategy_map = []
    for strat in strategies:
        linked_insights = [i for i in insights if i.get('id') == strat.get('source_insight')]
        linked_signals = []
        for ins in linked_insights:
            linked_signals.extend([s for s in signals if s.get('id') == ins.get('source_signal')])
        strategy_map.append({
            'strategy': strat,
            'linkedInsights': linked_insights,
            'linkedSignals': linked_signals,
            'status': 'executing'
        })

    return results, strategy_map

def main():
    try:
        data = load_strategy_data()
        signals = data.get('signals', [])
        insights = data.get('insights', [])
        strategies = data.get('strategies', [])

        xref, strat_map = cross_reference(signals, insights, strategies)
        aligned = sum(1 for r in xref if r['status'] == 'aligned')
        orphan = sum(1 for r in xref if r['status'] == 'orphan')

        llm_analysis = try_llm_analysis(data)

        result = {
            'skill': 'strategy-operator',
            'status': 'completed',
            'mode': 'llm' if llm_analysis and 'error' not in llm_analysis else 'fallback',
            'llmAnalysis': llm_analysis,
            'results': {
                'signals': len(signals),
                'insights': len(insights),
                'strategies': len(strategies),
                'orient': {'aligned': aligned, 'orphan': orphan, 'details': xref},
                'decide': {'executing': len(strat_map), 'details': strat_map},
                'act': {'actions': len(strategies), 'status': 'pipeline_operational'}
            }
        }
        print(json.dumps(result, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({'skill': 'strategy-operator', 'status': 'error', 'error': str(e)}))
        sys.exit(1)

if __name__ == '__main__':
    main()
