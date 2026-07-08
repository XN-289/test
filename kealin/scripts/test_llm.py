#!/usr/bin/env python3
"""
Test LLM Integration - Verify API connection and response
Usage: python test_llm.py [--provider deepseek|openai]
"""
import json, sys, os

sys.stdout.reconfigure(encoding='utf-8')

def test_deepseek(api_key, base_url='https://api.deepseek.com', model='deepseek-chat'):
    """Test DeepSeek API connection."""
    try:
        import openai
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say 'LLM integration working' in JSON format: {\"status\": \"...\"}"}],
            temperature=0,
            max_tokens=100
        )
        content = resp.choices[0].message.content
        return {
            'provider': 'deepseek',
            'model': model,
            'status': 'success',
            'response': content,
            'usage': {
                'prompt_tokens': resp.usage.prompt_tokens,
                'completion_tokens': resp.usage.completion_tokens,
                'total_tokens': resp.usage.total_tokens
            }
        }
    except Exception as e:
        return {
            'provider': 'deepseek',
            'model': model,
            'status': 'error',
            'error': str(e)
        }

def test_openai(api_key, base_url='https://api.openai.com/v1', model='gpt-4o-mini'):
    """Test OpenAI API connection."""
    try:
        import openai
        client = openai.OpenAI(api_key=api_key, base_url=base_url)
        resp = client.chat.completions.create(
            model=model,
            messages=[{"role": "user", "content": "Say 'LLM integration working' in JSON format: {\"status\": \"...\"}"}],
            temperature=0,
            max_tokens=100
        )
        content = resp.choices[0].message.content
        return {
            'provider': 'openai',
            'model': model,
            'status': 'success',
            'response': content,
            'usage': {
                'prompt_tokens': resp.usage.prompt_tokens,
                'completion_tokens': resp.usage.completion_tokens,
                'total_tokens': resp.usage.total_tokens
            }
        }
    except Exception as e:
        return {
            'provider': 'openai',
            'model': model,
            'status': 'error',
            'error': str(e)
        }

def load_config():
    """Load LLM config from config file."""
    config_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'config', 'llm_config.json')
    if os.path.exists(config_path):
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def main():
    provider = sys.argv[1] if len(sys.argv) > 1 else None

    # Load config
    config = load_config()
    if not config:
        print(json.dumps({
            'status': 'error',
            'error': 'Config file not found at config/llm_config.json'
        }))
        sys.exit(1)

    # Determine provider
    if not provider:
        provider = config.get('active_provider', 'deepseek')

    # Get provider config
    provider_config = config.get(provider, {})
    api_key = provider_config.get('api_key', '')

    if not api_key:
        # Check environment variables
        if provider == 'openai':
            api_key = os.environ.get('OPENAI_API_KEY', '')
        else:
            api_key = os.environ.get('DEEPSEEK_API_KEY', '')

    if not api_key:
        print(json.dumps({
            'status': 'error',
            'provider': provider,
            'error': f'No API key configured for {provider}',
            'help': f'Set api_key in config/llm_config.json or set {"OPENAI_API_KEY" if provider == "openai" else "DEEPSEEK_API_KEY"} environment variable'
        }))
        sys.exit(1)

    # Test connection
    if provider == 'openai':
        result = test_openai(
            api_key,
            provider_config.get('base_url', 'https://api.openai.com/v1'),
            provider_config.get('model', 'gpt-4o-mini')
        )
    else:
        result = test_deepseek(
            api_key,
            provider_config.get('base_url', 'https://api.deepseek.com'),
            provider_config.get('model', 'deepseek-chat')
        )

    print(json.dumps(result, ensure_ascii=False, indent=2))
    sys.exit(0 if result['status'] == 'success' else 1)

if __name__ == '__main__':
    main()
