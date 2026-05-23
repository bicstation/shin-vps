# =========================================================
# SHIN CORE LINX
# semantic/extraction/extract_pc_specs.py
# =========================================================

import json
import re
import requests
from typing import Dict, Any

# =========================================================
# CONFIG
# =========================================================

from api.utils.config.ai_models import (

    GEMINI_EXTRACTION_MODEL,

    get_random_gemini_api_key,
)

# =========================================================
# GEMINI REQUEST
# =========================================================

def call_gemini(prompt):

    api_key = get_random_gemini_api_key()

    url = (
        "https://generativelanguage.googleapis.com"
        f"/v1beta/models/"
        f"{GEMINI_EXTRACTION_MODEL}:generateContent"
    )

    response = requests.post(

        f"{url}?key={api_key}",

        headers={
            "Content-Type": "application/json"
        },

        json={

            "contents": [

                {
                    "parts": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        },

        timeout=60,
    )

    response.raise_for_status()

    return response.json()



# =========================================================
# HELPERS
# =========================================================

def safe_int(value, default=0):

    try:
        return int(value)

    except Exception:
        return default


def safe_float(value, default=0.0):

    try:
        return float(value)

    except Exception:
        return default


def normalize_text(value):

    if not value:
        return ""

    return str(value).strip()


# =========================================================
# BUILD RAW TEXT
# =========================================================

def build_product_text(product):

    return "\n".join([

        normalize_text(
            getattr(product, "name", "")
        ),

        normalize_text(
            getattr(product, "description", "")
        ),

        normalize_text(
            getattr(product, "spec_text", "")
        ),

    ])


# =========================================================
# PROMPT
# =========================================================

def build_prompt(raw_text):

    return f"""
You are a PC hardware specification extractor.

Your task is ONLY:

extract structured PC specs.

DO NOT:

- write articles
- write explanations
- write markdown
- write SEO text
- write summaries

Return ONLY valid JSON.

Required schema:

{{
  "cpu_model": "",
  "gpu_model": "",
  "memory_gb": 0,
  "storage_gb": 0,
  "display_size": 0,
  "refresh_rate": 0,
  "has_npu": false,
  "score_cpu": 0,
  "score_gpu": 0,
  "score_ai": 0
}}

Scoring rules:

- score_cpu:
  estimate overall CPU capability (0-100)

- score_gpu:
  estimate GPU capability (0-100)

- score_ai:
  estimate AI / local LLM / Stable Diffusion suitability (0-100)

TEXT:

{raw_text}
"""

# =========================================================
# PARSE RESPONSE
# =========================================================

def extract_response_text(response_json):

    try:

        return (
            response_json["candidates"][0]
            ["content"]["parts"][0]["text"]
        )

    except Exception:

        return ""


def extract_json_block(text):

    if not text:
        return {}

    text = text.strip()

    # =========================================
    # remove markdown fences
    # =========================================

    text = re.sub(

        r"```json",

        "",

        text,

        flags=re.IGNORECASE
    )

    text = re.sub(

        r"```",

        "",

        text
    )

    text = text.strip()

    # =========================================
    # direct parse
    # =========================================

    try:

        parsed = json.loads(text)

        if isinstance(parsed, dict):

            return parsed

    except Exception:
        pass

    # =========================================
    # find all json objects
    # =========================================

    matches = re.findall(

        r"\{[\s\S]*?\}",

        text
    )

    for candidate in matches:

        try:

            parsed = json.loads(
                candidate
            )

            if isinstance(parsed, dict):

                return parsed

        except Exception:

            continue

    # =========================================
    # failed
    # =========================================

    print(
        "\n"
        "❌ JSON PARSE FAILED"
    )

    return {}



# =========================================================
# NORMALIZE
# =========================================================

def normalize_specs(data):

    return {

        "cpu_model": normalize_text(
            data.get("cpu_model")
        ),

        "gpu_model": normalize_text(
            data.get("gpu_model")
        ),

        "memory_gb": safe_int(
            data.get("memory_gb")
        ),

        "storage_gb": safe_int(
            data.get("storage_gb")
        ),

        "display_size": safe_float(
            data.get("display_size")
        ),

        "refresh_rate": safe_int(
            data.get("refresh_rate")
        ),

        "has_npu": bool(
            data.get("has_npu")
        ),

        "score_cpu": safe_int(
            data.get("score_cpu")
        ),

        "score_gpu": safe_int(
            data.get("score_gpu")
        ),

        "score_ai": safe_int(
            data.get("score_ai")
        ),
    }


# =========================================================
# MAIN
# =========================================================

def extract_pc_specs(product) -> Dict[str, Any]:

    raw_text = build_product_text(
        product
    )

    prompt = build_prompt(
        raw_text
    )

    response_json = call_gemini(
        prompt
    )

    full_text = extract_response_text(
        response_json
    )

    spec_data = extract_json_block(
        full_text
    )

    normalized = normalize_specs(
        spec_data
    )
    
    # ###################
    #  DEBUG DISPLAY
    # ###################
    
    print(
        "\n"
        "================ RAW RESPONSE ================"
    )

    print(full_text)

    print(
        "\n"
        "================ PARSED JSON ================"
    )

    print(spec_data)
    
    return normalized