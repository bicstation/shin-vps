# /home/maya/shin-dev/shin-vps/django/visualization/generators/runtime/runtime_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Runtime Collector

============================================================

Runtime

↓

Observation

============================================================
"""

# --------------------------------------------------
# Collect Runtime Observation
# --------------------------------------------------

def collect_runtime_observation(

    group,

    runtime,

):

    observation = {

        "entity": group["group_slug"],

        "universe": group["parent_group"],

        "ready": runtime.get(
            "ready",
            False,
        ),

        "semantic_authority": runtime.get(
            "semantic_authority",
            False,
        ),

        "semantic_schema_version": runtime.get(
            "semantic_schema_version",
            "-",
        ),

        "authority_version": runtime.get(
            "authority_version",
            "-",
        ),

        "product_count": runtime.get(
            "product_count",
            0,
        ),

        "intent_count": len(
            runtime.get(
                "intents",
                [],
            )
        ),

    }

    return observation