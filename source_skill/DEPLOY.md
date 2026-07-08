# Project Ouroboros: Skill Deployment Guide (Archive)

This folder contains the complete "Double Brain" architecture for a self-evolving AI Content Engine.

## Contents
- `/skills/`: The definition files for the 3 core AI agents (Strategy, Wiki, Site).
- `/configs/`: The UI/UX and Tone of Voice constraints.
- `/scripts/`: QA and verification scripts.
- `PRD_ORIGIN.md`: The original Product Requirement Document.

## Quick Installation for other LLMs
To "install" this system into a new workspace, follow these steps:

1.  **Reconstruct Directory Structure**:
    ```bash
    mkdir -p configs raw_docs strategy_wiki/{signals,insights,strategies,feedbacks} llm_wiki/entities website_out/{pages,schemas} .gemini/skills/ scripts
    ```

2.  **Deploy Skill Files**:
    Copy everything from `source_skill/skills/` to the target's `.gemini/skills/`.
    Copy everything from `source_skill/configs/` to the target's `configs/`.
    Copy everything from `source_skill/scripts/` to the target's `scripts/`.

3.  **Initialize Graphs**:
    ```bash
    echo '{"nodes":[], "edges":[]}' > strategy_wiki/strategy_graph.json
    echo '{"entities":[], "relations":[]}' > llm_wiki/ontology_schema.json
    echo '{"nodes":[], "edges":[]}' > llm_wiki/graph.json
    touch llm_wiki/index.md
    touch website_out/sitemap.xml
    touch website_out/llms.txt
    ```

4.  **Verification**:
    Run `gemini /skills` (or equivalent) to verify that the agents are loaded and ready.
