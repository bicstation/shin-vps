# =========================================================
# SHIN CORE LINX
# semantic/inference/infer_creator.py
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

def infer_creator_capability(specs):

    cpu_model = (
        specs.get("cpu_model") or ""
    ).lower()

    gpu_model = (
        specs.get("gpu_model") or ""
    ).lower()

    memory_gb = (
        specs.get("memory_gb") or 0
    )

    storage_gb = (
        specs.get("storage_gb") or 0
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

        score += 50

        reasons.append(
            "RTX 5090 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 5080",
            "rtx5080",
        ]
    ):

        score += 45

        reasons.append(
            "RTX 5080 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 5070",
            "rtx5070",
        ]
    ):

        score += 40

        reasons.append(
            "RTX 5070 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4090",
            "rtx4090",
        ]
    ):

        score += 45

        reasons.append(
            "RTX 4090 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4080",
            "rtx4080",
        ]
    ):

        score += 40

        reasons.append(
            "RTX 4080 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4070",
            "rtx4070",
        ]
    ):

        score += 35

        reasons.append(
            "RTX 4070 creator performance"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4060",
            "rtx4060",
        ]
    ):

        score += 25

        reasons.append(
            "RTX 4060 creator performance"
        )


    # =====================================================
    # MEMORY
    # =====================================================

    if memory_gb >= 64:

        score += 25

        reasons.append(
            "64GB+ memory for creator workflow"
        )

    elif memory_gb >= 32:

        score += 18

        reasons.append(
            "32GB+ memory for creator workflow"
        )

    elif memory_gb >= 16:

        score += 10

        reasons.append(
            "16GB+ memory"
        )


    # =====================================================
    # STORAGE
    # =====================================================

    if storage_gb >= 2000:

        score += 12

        reasons.append(
            "Large SSD storage"
        )

    elif storage_gb >= 1000:

        score += 8

        reasons.append(
            "1TB+ SSD storage"
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
            "ryzen 9",
        ]
    ):

        score += 15

        reasons.append(
            "High-end creator CPU"
        )


    # =====================================================
    # LIMIT
    # =====================================================

    score = min(score, 100)


    # =====================================================
    # LABELS
    # =====================================================

    labels = []

    if score >= 80:

        labels.append(
            "creator_workstation"
        )

    elif score >= 60:

        labels.append(
            "video_editing_ready"
        )

    elif score >= 40:

        labels.append(
            "creator_capable"
        )


    # =====================================================
    # RETURN
    # =====================================================

    return {

        "score_creator": score,

        "labels": labels,

        "reasons": reasons,
    }