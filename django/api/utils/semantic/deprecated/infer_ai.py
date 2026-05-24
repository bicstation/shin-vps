# =========================================================
# SHIN CORE LINX
# semantic/inference/infer_ai.py
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

def infer_ai_capability(specs):

    cpu_model = (
        specs.get("cpu_model") or ""
    ).lower()

    gpu_model = (
        specs.get("gpu_model") or ""
    ).lower()

    memory_gb = (
        specs.get("memory_gb") or 0
    )

    has_npu = (
        specs.get("has_npu") or False
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
            "RTX 5090 detected"
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
            "RTX 5080 detected"
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
            "RTX 5070 detected"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4090",
            "rtx4090",
        ]
    ):

        score += 50

        reasons.append(
            "RTX 4090 detected"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4080",
            "rtx4080",
        ]
    ):

        score += 45

        reasons.append(
            "RTX 4080 detected"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4070",
            "rtx4070",
        ]
    ):

        score += 40

        reasons.append(
            "RTX 4070 detected"
        )


    elif contains_any(

        gpu_model,

        [

            "rtx 4060",
            "rtx4060",
        ]
    ):

        score += 30

        reasons.append(
            "RTX 4060 detected"
        )


    # =====================================================
    # CUDA / NVIDIA
    # =====================================================

    if "rtx" in gpu_model:

        score += 15

        reasons.append(
            "CUDA capable GPU"
        )


    # =====================================================
    # MEMORY
    # =====================================================

    if memory_gb >= 64:

        score += 25

        reasons.append(
            "64GB+ memory"
        )

    elif memory_gb >= 32:

        score += 18

        reasons.append(
            "32GB+ memory"
        )

    elif memory_gb >= 16:

        score += 10

        reasons.append(
            "16GB+ memory"
        )


    # =====================================================
    # CPU
    # =====================================================

    if contains_any(

        cpu_model,

        [

            "core ultra 9",
            "core ultra 7",
        ]
    ):

        score += 15

        reasons.append(
            "Intel Core Ultra"
        )


    if contains_any(

        cpu_model,

        [

            "ryzen ai",
        ]
    ):

        score += 15

        reasons.append(
            "Ryzen AI"
        )


    # =====================================================
    # NPU
    # =====================================================

    if has_npu:

        score += 15

        reasons.append(
            "Dedicated NPU"
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
            "ai_workstation"
        )

    elif score >= 60:

        labels.append(
            "local_llm_ready"
        )

    elif score >= 40:

        labels.append(
            "ai_capable"
        )


    # =====================================================
    # RETURN
    # =====================================================

    return {

        "score_ai": score,

        "labels": labels,

        "reasons": reasons,
    }