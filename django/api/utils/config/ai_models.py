# ======================================================
# SHIN CORE LINX
# AI MODELS CONFIG
# ======================================================

import os
import random


# ======================================================
# GEMINI API KEYS
# ======================================================

GEMINI_API_KEYS = [

    os.getenv("GEMINI_API_KEY_1"),
    os.getenv("GEMINI_API_KEY_2"),
    os.getenv("GEMINI_API_KEY_3"),
    os.getenv("GEMINI_API_KEY_4"),
    os.getenv("GEMINI_API_KEY_5"),
    os.getenv("GEMINI_API_KEY_6"),
    os.getenv("GEMINI_API_KEY_7"),
    os.getenv("GEMINI_API_KEY_8"),
    os.getenv("GEMINI_API_KEY_9"),
    os.getenv("GEMINI_API_KEY_10"),
]

# remove empty
GEMINI_API_KEYS = [

    key
    for key in GEMINI_API_KEYS
    if key
]


# ======================================================
# EXTRACTION
# ======================================================

GEMINI_EXTRACTION_MODEL = os.getenv(
    "GEMINI_EXTRACTION_MODEL",
    "gemma-4-26b-a4b-it"
)

# ======================================================
# SEMANTIC INFERENCE
# ======================================================

GEMINI_INFERENCE_MODEL = os.getenv(
    "GEMINI_INFERENCE_MODEL",
    "gemma-4-31b-it"
)

# ======================================================
# CONTENT GENERATION
# ======================================================

GEMINI_CONTENT_MODEL = os.getenv(
    "GEMINI_CONTENT_MODEL",
    "gemini-2.5-pro"
)

# ======================================================
# FALLBACK
# ======================================================

GEMINI_FALLBACK_MODEL = os.getenv(
    "GEMINI_FALLBACK_MODEL",
    "gemini-2.0-flash"
)

# ======================================================
# API KEY ROTATION
# ======================================================

def get_random_gemini_api_key():

    if not GEMINI_API_KEYS:

        raise Exception(
            "No Gemini API Keys configured"
        )

    return random.choice(
        GEMINI_API_KEYS
    )