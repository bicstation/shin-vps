# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_collector.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_collector.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

API Collector

============================================================

API Runtime

        ↓

API Observation

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import json

# --------------------------------------------------
# Build Payload
# --------------------------------------------------

def build_payload(

    payload,

):

    payload_type = type(payload).__name__

    if isinstance(payload, dict):

        payload_count = len(payload)

    elif isinstance(payload, list):

        payload_count = len(payload)

    else:

        payload_count = 1

    return {

        "payload": payload,

        "payload_type": payload_type,

        "payload_count": payload_count,

    }

# --------------------------------------------------
# Collect API
# --------------------------------------------------

def collect_api(

    endpoint,
    payload,
    status=200,
    elapsed=0,

):

    payload_info = build_payload(

        payload,

    )

    return {

        "endpoint": endpoint,

        "status": status,

        "elapsed": elapsed,

        "payload": payload_info["payload"],

        "payload_type": payload_info["payload_type"],

        "payload_count": payload_info["payload_count"],

    }

# --------------------------------------------------
# Collect Summary
# --------------------------------------------------

def collect_summary(

    observations,

):

    healthy = sum(

        1

        for observation in observations

        if observation["status"] == 200

    )

    return {

        "endpoint_count": len(observations),

        "healthy_count": healthy,

        "error_count": len(observations) - healthy,

    }

# --------------------------------------------------
# Collect Health
# --------------------------------------------------

def collect_health(

    observations,

):

    summary = collect_summary(

        observations,

    )

    return {

        "healthy": (

            summary["error_count"] == 0

        ),

        "summary": summary,

    }