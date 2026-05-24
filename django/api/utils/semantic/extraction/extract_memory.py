# =========================================================
# FILE:
# api/utils/semantic/extraction/extract_memory.py
# =========================================================

import re


# =========================================================
# MEMORY PATTERNS
# =========================================================

MEMORY_PATTERNS = [

    r"128gb",

    r"96gb",

    r"64gb",

    r"48gb",

    r"32gb",

    r"24gb",

    r"16gb",

    r"8gb",
]


# =========================================================
# EXTRACT MEMORY
# =========================================================

def extract_memory(

    source_text,

    trace_runtime=False,

):

    raw_tokens = []

    # =====================================================
    # MATCH
    # =====================================================

    for pattern in MEMORY_PATTERNS:

        matches = re.findall(

            pattern,

            source_text,

            re.IGNORECASE,

        )

        for match in matches:

            token = str(
                match
            ).strip()

            if token:

                raw_tokens.append(
                    token
                )

    # =====================================================
    # UNIQUE
    # =====================================================

    raw_tokens = list(
        set(raw_tokens)
    )

    return raw_tokens