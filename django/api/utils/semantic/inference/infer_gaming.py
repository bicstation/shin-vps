# =========================================================
# SHIN CORE LINX
# semantic/inference/infer_gaming.py
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def contains_any(text, keywords):

    if not text:
        return False

    text = text.lower()

    return any(
        keyword.lower() in text
        for keyword in keywords
    )


# =========================================================
# MAIN
# =========================================================

def infer_gaming_capability(specs):

    cpu_model = (
        specs.get("cpu_model") or ""
    ).lower()

    gpu_model = (
        specs.get("gpu_model") or ""
    ).lower()

    memory_gb = (
        specs.get("memory_gb") or 0
    )

    refresh_rate = (
        specs.get("refresh_rate") or 0
    )

    score = 0

    reasons = []


    # =====================================================
    # GPU
    # =====================================================

    if contains_any(

        gpu_model,

        [

            "rtx 5090",
            "rtx5090",
        ]
    ):

        score += 60

        reasons.append(
            "RTX 5090 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 5080",
            "rtx5080",
        ]
    ):

        score += 55

        reasons.append(
            "RTX 5080 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 5070",
            "rtx5070",
        ]
    ):

        score += 50

        reasons.append(
            "RTX 5070 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4090",
            "rtx4090",
        ]
    ):

        score += 55

        reasons.append(
            "RTX 4090 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4080",
            "rtx4080",
        ]
    ):

        score += 50

        reasons.append(
            "RTX 4080 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4070",
            "rtx4070",
        ]
    ):

        score += 42

        reasons.append(
            "RTX 4070 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4060",
            "rtx4060",
        ]
    ):

        score += 32

        reasons.append(
            "RTX 4060 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rx 7900",
            "rx7900",
        ]
    ):

        score += 48

        reasons.append(
            "RX 7900 gaming performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rx 7800",
            "rx7800",
        ]
    ):

        score += 40

        reasons.append(
            "RX 7800 gaming performance"
        )


    # =====================================================
    # MEMORY
    # =====================================================

    if memory_gb >= 64:

        score += 15

        reasons.append(
            "64GB+ gaming memory"
        )

    elif memory_gb >= 32:

        score += 12

        reasons.append(
            "32GB+ gaming memory"
        )

    elif memory_gb >= 16:

        score += 8

        reasons.append(
            "16GB+ gaming memory"
        )


    # =====================================================
    # REFRESH RATE
    # =====================================================

    if refresh_rate >= 240:

        score += 15

        reasons.append(
            "240Hz gaming display"
        )

    elif refresh_rate >= 165:

        score += 10

        reasons.append(
            "165Hz gaming display"
        )

    elif refresh_rate >= 144:

        score += 8

        reasons.append(
            "144Hz gaming display"
        )


    # =====================================================
    # CPU
    # =====================================================

    if contains_any(

        cpu_model,

        [

            "core ultra 9",
            "core ultra 7",
            "i9",
            "i7",
            "ryzen 9",
            "ryzen 7",
        ]
    ):

        score += 15

        reasons.append(
            "High-end gaming CPU"
        )


    # =====================================================
    # GAMING SERIES DETECTION
    # =====================================================

    gaming_keywords = [

        "rog",
        "tuf gaming",
        "alienware",
        "legion",
        "predator",
        "omen",
        "aorus",
        "gaming",
    ]

    if contains_any(
        gpu_model,
        gaming_keywords
    ):

        score += 5

        reasons.append(
            "Gaming-oriented hardware"
        )


    # =====================================================
    # LIMIT
    # =====================================================

    score = min(score, 100)


    # =====================================================
    # LABELS
    # =====================================================

    labels = []

    if score >= 85:

        labels.append(
            "enthusiast_gaming"
        )

    elif score >= 65:

        labels.append(
            "high_end_gaming"
        )

    elif score >= 45:

        labels.append(
            "gaming_ready"
        )


    # =====================================================
    # RETURN
    # =====================================================

    return {

        "score_gaming": score,

        "labels": labels,

        "reasons": reasons,
    }