# =========================================================
# SHIN CORE LINX
# semantic/extraction/extract_pc_specs.py
# recurring semantic extraction runtime
# centralized observability integrated
# =========================================================

import json
import random
import re
import time

import requests

from api.utils.config import (

    GEMINI_API_KEYS,

    GEMINI_EXTRACTION_MODEL,
)

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)


# =========================================================
# SETTINGS
# =========================================================

GEMINI_ENDPOINT = (
    "https://generativelanguage.googleapis.com"
    "/v1beta/models"
)

REQUEST_TIMEOUT = 90

MAX_RETRIES = 3


# =========================================================
# HELPERS
# =========================================================

def build_headers():

    return {

        "Content-Type":
            "application/json"
    }


# =========================================================
# HELPERS
# =========================================================

def build_generation_config():

    return {

        "temperature":
            0.1,

        "topP":
            0.8,

        "topK":
            20,

        "maxOutputTokens":
            2048,

        "responseMimeType":
            "application/json",
    }


# =========================================================
# HELPERS
# =========================================================

def extract_first_json_object(
    text,
):

    if not text:

        return "{}"

    text = text.replace(
        "```json",
        ""
    )

    text = text.replace(
        "```",
        ""
    )

    match = re.search(

        r"\{.*\}",

        text,

        re.DOTALL
    )

    if not match:

        return "{}"

    return match.group(0)


# =========================================================
# HELPERS
# =========================================================

def safe_json_loads(
    text,
):

    try:

        return json.loads(text)

    except Exception:

        return {}


# =========================================================
# HELPERS
# =========================================================

def build_prompt(
    product,
):

    return f"""
You are SHIN CORE LINX semantic extraction AI.

Analyze the following PC product.

# PRODUCT NAME
{product.name}

# DESCRIPTION
{product.description}

# RULES

- Output JSON only
- No explanation
- No markdown
- No reasoning
- No self correction
- No extra text
- If output is not valid JSON, response is invalid
- JSON values may contain English or Japanese

# OUTPUT FORMAT

{{
  "cpu_model": "",
  "gpu_model": "",
  "memory_gb": 0,
  "storage_gb": 0,
  "display_size": 0,
  "refresh_rate": 0,
  "has_npu": false,
  "display_info": ""
}}
""".strip()


# =========================================================
# HELPERS
# =========================================================

def call_gemini_api(

    api_key,

    prompt,
):

    url = (
        f"{GEMINI_ENDPOINT}/"
        f"{GEMINI_EXTRACTION_MODEL}:generateContent"
        f"?key={api_key}"
    )

    payload = {

        "contents": [

            {

                "parts": [

                    {

                        "text":
                            prompt
                    }
                ]
            }
        ],

        "generationConfig":
            build_generation_config(),
    }

    response = requests.post(

        url,

        headers=build_headers(),

        json=payload,

        timeout=REQUEST_TIMEOUT,
    )

    response.raise_for_status()

    return response.json()


# =========================================================
# HELPERS
# =========================================================

def extract_text_from_response(
    response_data,
):

    try:

        return (

            response_data
            ["candidates"][0]
            ["content"]
            ["parts"][0]
            ["text"]
        )

    except Exception:

        return ""


# =========================================================
# HELPERS
# =========================================================

def normalize_specs(
    parsed,
):

    return {

        "cpu_model":
            parsed.get(
                "cpu_model",
                ""
            ),

        "gpu_model":
            parsed.get(
                "gpu_model",
                ""
            ),

        "memory_gb":
            int(parsed.get(
                "memory_gb",
                0
            ) or 0),

        "storage_gb":
            int(parsed.get(
                "storage_gb",
                0
            ) or 0),

        "display_size":
            float(parsed.get(
                "display_size",
                0
            ) or 0),

        "refresh_rate":
            int(parsed.get(
                "refresh_rate",
                0
            ) or 0),

        "has_npu":
            bool(parsed.get(
                "has_npu",
                False
            )),

        "display_info":
            parsed.get(
                "display_info",
                ""
            ),
    }


# =========================================================
# MAIN
# =========================================================

def extract_pc_specs(

    product,

    trace_runtime=False,
):

    # =====================================================
    # PROMPT
    # =====================================================

    prompt = build_prompt(
        product
    )

    runtime_log(

        trace_runtime,

        "PROMPT",

        prompt,
    )

    # =====================================================
    # API KEYS
    # =====================================================

    api_keys = list(
        GEMINI_API_KEYS
    )

    random.shuffle(
        api_keys
    )

    # =====================================================
    # RETRIES
    # =====================================================

    for retry in range(
        MAX_RETRIES
    ):

        for api_key in api_keys:

            try:

                runtime_log(

                    trace_runtime,

                    "GEMINI REQUEST",

                    f"retry={retry + 1}",
                )

                # =========================================
                # API CALL
                # =========================================

                response_data = (
                    call_gemini_api(

                        api_key,

                        prompt,
                    )
                )

                # =========================================
                # RAW RESPONSE
                # =========================================

                raw_text = (
                    extract_text_from_response(
                        response_data
                    )
                )

                runtime_log(

                    trace_runtime,

                    "RAW RESPONSE",

                    raw_text,
                )

                # =========================================
                # CLEAN JSON
                # =========================================

                cleaned_json = (
                    extract_first_json_object(
                        raw_text
                    )
                )

                runtime_log(

                    trace_runtime,

                    "CLEANED JSON",

                    cleaned_json,
                )

                # =========================================
                # PARSED JSON
                # =========================================

                parsed = (
                    safe_json_loads(
                        cleaned_json
                    )
                )

                runtime_log(

                    trace_runtime,

                    "PARSED JSON",

                    parsed,
                )

                # =========================================
                # EMPTY SAFETY
                # =========================================

                if not parsed:

                    raise Exception(
                        "JSON parse failed"
                    )

                # =========================================
                # NORMALIZE
                # =========================================

                specs = normalize_specs(
                    parsed
                )

                runtime_log(

                    trace_runtime,

                    "NORMALIZED SPECS",

                    specs,
                )

                # =========================================
                # SUCCESS
                # =========================================

                return specs

            except Exception as e:

                runtime_log(

                    trace_runtime,

                    "EXTRACTION ERROR",

                    str(e),
                )

                time.sleep(1)

                continue

    # =====================================================
    # FALLBACK
    # =====================================================

    runtime_log(

        trace_runtime,

        "FALLBACK SPECS",
    )

    return {

        "cpu_model": "",

        "gpu_model": "",

        "memory_gb": 0,

        "storage_gb": 0,

        "display_size": 0,

        "refresh_rate": 0,

        "has_npu": False,

        "display_info": "",
    }