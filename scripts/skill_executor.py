#!/usr/bin/env python3
"""
Skill Executor - Agent SDK Script

Executes individual skill scripts with proper error handling and output formatting.
Provides a unified interface for server.js to invoke any skill.

Accepts --skill (skill name) and --data-dir arguments.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
import subprocess
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Skill Executor - Unified Skill Interface")
    parser.add_argument("--skill", required=True, choices=[
        "strategy_operator", "wiki_compiler", "site_generator", "autoresearch"
    ], help="Skill to execute")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    parser.add_argument("--timeout", type=int, default=60, help="Timeout in seconds (default: 60)")
    return parser.parse_args()


def get_skill_script(skill_name):
    """Get the path to a skill script."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    skills_dir = os.path.join(script_dir, "skills")
    script_map = {
        "strategy_operator": "strategy_operator.py",
        "wiki_compiler": "wiki_compiler.py",
        "site_generator": "site_generator.py",
        "autoresearch": "autoresearch.py",
    }
    script_filename = script_map.get(skill_name)
    if not script_filename:
        return None
    return os.path.join(skills_dir, script_filename)


def execute_skill(skill_name, data_dir, timeout=60):
    """Execute a skill script and return structured result."""
    script_path = get_skill_script(skill_name)

    if not script_path:
        return {
            "status": "error",
            "mode": "error",
            "skill": skill_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": f"Unknown skill: {skill_name}"
        }

    if not os.path.exists(script_path):
        return {
            "status": "error",
            "mode": "error",
            "skill": skill_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": f"Skill script not found: {script_path}"
        }

    if not os.path.isdir(data_dir):
        return {
            "status": "error",
            "mode": "error",
            "skill": skill_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": f"Data directory not found: {data_dir}"
        }

    start_time = datetime.now(timezone.utc)

    try:
        result = subprocess.run(
            [sys.executable, script_path, "--data-dir", data_dir],
            capture_output=True,
            text=True,
            timeout=timeout
        )

        end_time = datetime.now(timezone.utc)
        duration_ms = int((end_time - start_time).total_seconds() * 1000)

        if result.returncode != 0:
            return {
                "status": "error",
                "mode": "error",
                "skill": skill_name,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "duration_ms": duration_ms,
                "error": f"Skill script exited with code {result.returncode}",
                "stderr": result.stderr[:1000] if result.stderr else ""
            }

        try:
            skill_result = json.loads(result.stdout)
            skill_result["executor"] = {
                "skill": skill_name,
                "duration_ms": duration_ms,
                "exit_code": result.returncode
            }
            return skill_result
        except json.JSONDecodeError as e:
            return {
                "status": "error",
                "mode": "error",
                "skill": skill_name,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "duration_ms": duration_ms,
                "error": f"Invalid JSON output from skill script: {str(e)}",
                "raw_output": result.stdout[:1000]
            }

    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "mode": "error",
            "skill": skill_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": f"Skill script timed out after {timeout} seconds"
        }
    except Exception as e:
        return {
            "status": "error",
            "mode": "error",
            "skill": skill_name,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": str(e)
        }


def main():
    args = parse_args()

    result = execute_skill(
        skill_name=args.skill,
        data_dir=args.data_dir,
        timeout=args.timeout
    )

    print(json.dumps(result, indent=2))

    # Exit with appropriate code
    if result.get("status") == "error":
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
