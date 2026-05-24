# =========================================================
# FILE:
# api/utils/semantic/inference/infer_gaming.py
# =========================================================

def infer_gaming_capability(specs):

    cpu = (
        specs.get("cpu_model", "") or ""
    ).lower()

    gpu = (
        specs.get("gpu_model", "") or ""
    ).lower()

    display = (
        specs.get("display_info", "") or ""
    ).lower()

    refresh = specs.get(
        "refresh_rate",
        0
    ) or 0

    memory = specs.get(
        "memory_gb",
        0
    ) or 0

    score = 0
    labels = []
    reasons = []

    # =====================================================
    # GPU
    # =====================================================

    if "rtx" in gpu:

        score += 50
        labels.append("RTX Gaming")
        reasons.append("RTX GPU detected")

    elif "gtx" in gpu:

        score += 35
        labels.append("GTX Gaming")
        reasons.append("GTX GPU detected")

    if "rx" in gpu:

        score += 40
        labels.append("Radeon Gaming")
        reasons.append("AMD Radeon GPU detected")

    # =====================================================
    # REFRESH RATE
    # =====================================================

    if refresh >= 240:

        score += 30

    elif refresh >= 144:

        score += 20

    elif refresh >= 120:

        score += 10

    # =====================================================
    # MEMORY
    # =====================================================

    if memory >= 32:

        score += 15

    elif memory >= 16:

        score += 10

    # =====================================================
    # CPU
    # =====================================================

    if (

        "hx" in cpu
        or "hs" in cpu
        or "core ultra 9" in cpu
        or "ryzen 9" in cpu

    ):

        score += 15

    # =====================================================
    # OLED
    # =====================================================

    if "oled" in display:

        score += 5

    # =====================================================
    # LIMIT
    # =====================================================

    score = min(score, 100)

    # =====================================================
    # CLASSIFICATION
    # =====================================================

    if score >= 80:

        labels.append(
            "High-End Gaming"
        )

    elif score >= 50:

        labels.append(
            "Gaming Ready"
        )

    elif score >= 25:

        labels.append(
            "Casual Gaming"
        )

    return {

        "score_gaming": score,

        "labels": labels,

        "reasons": reasons,
    }