
# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/review_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Collector

============================================================

Observation

        ↓

Review Object

============================================================
"""

# --------------------------------------------------
# Build Summary
# --------------------------------------------------

def build_summary(

    sources,

):

    evidence = sources["evidence"]

    runtime = sources["runtime"]

    observatory = sources["observatory"]

    return {

        "evidence_ready": bool(
            evidence.strip()
        ),

        "runtime_ready": bool(
            runtime.strip()
        ),

        "observatory_ready": bool(
            observatory.strip()
        ),

    }

# --------------------------------------------------
# Build Score
# --------------------------------------------------

def build_score(

    summary,

):

    score = 0

    if summary["evidence_ready"]:
        score += 1

    if summary["runtime_ready"]:
        score += 1

    if summary["observatory_ready"]:
        score += 1

    return {

        "score": score,

        "max_score": 3,

    }

# --------------------------------------------------
# Collect Review
# --------------------------------------------------

def collect_review(

    universe,
    entity,
    sources,

):

    summary = build_summary(

        sources,

    )

    score = build_score(

        summary,

    )

    return {

        "universe": universe,

        "entity": entity,

        "sources": sources,

        "summary": summary,

        "score": score,

    }