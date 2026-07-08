#!/usr/bin/env python3
"""
Agent Brain - Central Orchestrator for ViaSurg AI Pipeline

Coordinates all skill scripts (strategy_operator, wiki_compiler, site_generator, autoresearch).
Executes the full OODA pipeline or individual stages.
Outputs valid JSON to stdout for server.js consumption.
"""

import json
import sys
import os
import argparse
import subprocess
from datetime import datetime, timezone


def parse_args():
    parser = argparse.ArgumentParser(description="Agent Brain - Pipeline Orchestrator")
    parser.add_argument("--data-dir", required=True, help="Path to data/parsed directory")
    parser.add_argument("--stage", type=int, choices=[1, 2, 3, 4, 5], help="Run specific pipeline stage (1-5)")
    parser.add_argument("--all", action="store_true", help="Run all pipeline stages")
    return parser.parse_args()


def get_skill_script(script_name):
    """Get the path to a skill script."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    skills_dir = os.path.join(script_dir, "skills")
    return os.path.join(skills_dir, script_name)


def run_skill(script_path, data_dir):
    """Run a skill script and return its JSON output."""
    try:
        result = subprocess.run(
            [sys.executable, script_path, "--data-dir", data_dir],
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode != 0:
            return {
                "status": "error",
                "mode": "error",
                "error": f"Script exited with code {result.returncode}",
                "stderr": result.stderr[:500] if result.stderr else ""
            }

        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError:
            return {
                "status": "error",
                "mode": "error",
                "error": "Invalid JSON output from skill script",
                "raw_output": result.stdout[:500]
            }

    except subprocess.TimeoutExpired:
        return {
            "status": "error",
            "mode": "error",
            "error": "Skill script timed out after 60 seconds"
        }
    except Exception as e:
        return {
            "status": "error",
            "mode": "error",
            "error": str(e)
        }


def run_pipeline_stage(stage_num, data_dir):
    """Run a specific pipeline stage."""
    stage_map = {
        1: ("strategy_operator.py", "Strategy Operator (OODA Loop)"),
        2: ("wiki_compiler.py", "Wiki Compiler"),
        3: ("site_generator.py", "Site Generator"),
        4: ("autoresearch.py", "Autoresearch - Quality Verification"),
        5: ("autoresearch.py", "Autoresearch - Full Analysis"),
    }

    script_name, stage_name = stage_map.get(stage_num, (None, None))
    if not script_name:
        return {
            "status": "error",
            "mode": "error",
            "stage": stage_num,
            "error": f"Invalid stage number: {stage_num}"
        }

    script_path = get_skill_script(script_name)
    if not os.path.exists(script_path):
        return {
            "status": "error",
            "mode": "error",
            "stage": stage_num,
            "error": f"Skill script not found: {script_path}"
        }

    result = run_skill(script_path, data_dir)
    result["pipeline_stage"] = stage_num
    result["stage_name"] = stage_name
    return result


def run_full_pipeline(data_dir):
    """Run all pipeline stages in sequence."""
    results = []
    stage_names = [
        "Strategy Operator (OODA Loop)",
        "Wiki Compiler",
        "Site Generator",
        "Autoresearch - Quality Verification",
    ]

    start_time = datetime.now(timezone.utc)

    for stage_num in range(1, 5):
        stage_start = datetime.now(timezone.utc)
        result = run_pipeline_stage(stage_num, data_dir)
        stage_end = datetime.now(timezone.utc)

        result["stage_number"] = stage_num
        result["stage_name"] = stage_names[stage_num - 1]
        result["duration_ms"] = int((stage_end - stage_start).total_seconds() * 1000)
        results.append(result)

    end_time = datetime.now(timezone.utc)

    # Calculate overall metrics
    stages_completed = sum(1 for r in results if r.get("status") == "success")
    stages_with_ai = sum(1 for r in results if r.get("mode") == "ai")
    stages_fallback = sum(1 for r in results if r.get("mode") == "fallback")

    # Extract quality score from autoresearch (stage 4)
    quality_score = None
    for r in results:
        if r.get("pipeline_stage") == 4:
            quality_score = r.get("results", {}).get("quality_score")

    return {
        "status": "success",
        "mode": "pipeline",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "pipeline_summary": {
            "stages_completed": stages_completed,
            "stages_with_ai": stages_with_ai,
            "stages_fallback": stages_fallback,
            "quality_score": quality_score,
            "total_duration_ms": int((end_time - start_time).total_seconds() * 1000),
            "api_key_configured": os.environ.get("OPENAI_API_KEY") is not None
        },
        "stages": results
    }


def main():
    args = parse_args()
    data_dir = args.data_dir

    if not os.path.isdir(data_dir):
        output = {
            "status": "error",
            "mode": "error",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "error": f"Data directory not found: {data_dir}"
        }
        print(json.dumps(output, indent=2))
        sys.exit(1)

    if args.stage:
        result = run_pipeline_stage(args.stage, data_dir)
        print(json.dumps(result, indent=2))
    elif args.all:
        result = run_full_pipeline(data_dir)
        print(json.dumps(result, indent=2))
    else:
        # Default: run full pipeline
        result = run_full_pipeline(data_dir)
        print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
