#!/usr/bin/env python3
"""
Skill Executor - Routes skill execution to the correct handler.
Usage: python skill_executor.py <skill_name> [--data-dir <path>]
Skills: strategy-operator, wiki-compiler, site-generator, autoresearch
"""
import json, sys, os, subprocess

sys.stdout.reconfigure(encoding='utf-8')
SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
SKILLS_DIR = os.path.join(SCRIPTS_DIR, 'skills')

SKILL_MAP = {
    'strategy-operator': 'strategy_operator.py',
    'wiki-compiler': 'wiki_compiler.py',
    'site-generator': 'site_generator.py',
    'autoresearch': 'autoresearch.py',
}

def main():
    if len(sys.argv) < 2:
        print(json.dumps({
            'error': 'Usage: python skill_executor.py <skill_name> [--data-dir <path>]',
            'availableSkills': list(SKILL_MAP.keys())
        }))
        sys.exit(1)

    skill_name = sys.argv[1]
    if skill_name not in SKILL_MAP:
        print(json.dumps({
            'error': f'Unknown skill: {skill_name}',
            'availableSkills': list(SKILL_MAP.keys())
        }))
        sys.exit(1)

    # Parse --data-dir
    data_dir = os.environ.get('DATA_DIR', 'd:/test/kealin/data/parsed')
    for i, arg in enumerate(sys.argv):
        if arg == '--data-dir' and i + 1 < len(sys.argv):
            data_dir = sys.argv[i + 1]

    script_path = os.path.join(SKILLS_DIR, SKILL_MAP[skill_name])

    env = os.environ.copy()
    env['DATA_DIR'] = data_dir

    try:
        result = subprocess.run(
            [sys.executable, script_path],
            capture_output=True, text=True, encoding='utf-8', timeout=60, env=env
        )
        if result.returncode == 0:
            print(result.stdout)
        else:
            print(json.dumps({
                'skill': skill_name,
                'status': 'error',
                'error': result.stderr or 'Script failed',
                'fallback': True
            }))
            sys.exit(1)
    except subprocess.TimeoutExpired:
        print(json.dumps({
            'skill': skill_name,
            'status': 'error',
            'error': 'Script timed out after 60s',
            'fallback': True
        }))
        sys.exit(1)
    except Exception as e:
        print(json.dumps({
            'skill': skill_name,
            'status': 'error',
            'error': str(e),
            'fallback': True
        }))
        sys.exit(1)

if __name__ == '__main__':
    main()
