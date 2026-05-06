from api.models import PCProduct

# =========================================
# Semantic Cache
# =========================================
SEMANTIC_FINDER_CACHE = {}

# =========================================
# Semantic Presets
# =========================================
PRESET_USAGE_MAP = {

    "gaming": [

        {
            "slug": "usage-gaming",
            "weight": 1.0,
        }
    ],

    "creator": [

        {
            "slug": "usage-creator",
            "weight": 1.0,
        }
    ],

    "gaming_creator": [

        {
            "slug": "usage-gaming",
            "weight": 0.7,
        },

        {
            "slug": "usage-creator",
            "weight": 0.3,
        }
    ],
}

# =========================================
# Semantic Weight Config
# =========================================
SEMANTIC_WEIGHT_CONFIG = {

    "creator": {

        "cpu": 0.4,

        "memory": 0.3,

        "gpu": 0.2,

        "creator_bonus": 15,
    },

    "gaming": {

        "gpu": 0.5,

        "cpu": 0.2,

        "gaming_bonus": 20,
    },
}


# =========================================
# Usage Weight Normalize
# =========================================
def normalize_usage_weights(
    request_data,
):

    preset = request_data.get(
        "preset"
    )

    if preset in PRESET_USAGE_MAP:

        usage_items = PRESET_USAGE_MAP[
            preset
        ]

    else:

        usage_items = request_data.get(
            "usage",
            []
        )

    normalized = {}

    # ---------------------------------
    # old format
    # ["usage-gaming"]
    # ---------------------------------
    if usage_items and isinstance(
        usage_items[0],
        str
    ):

        for slug in usage_items:

            normalized[slug] = 1.0

        return normalized

    # ---------------------------------
    # weighted format
    # ---------------------------------
    for item in usage_items:

        slug = item.get("slug")

        # -----------------------------
        # invalid slug
        # -----------------------------
        if not slug:
            continue

        weight = item.get(
            "weight",
            1.0
        )

        # -----------------------------
        # normalize
        # -----------------------------
        try:

            weight = float(weight)

        except Exception:

            weight = 1.0

        # -----------------------------
        # clamp
        # 0.0 ~ 1.0
        # -----------------------------
        weight = max(
            0.0,
            min(weight, 1.0)
        )

        normalized[slug] = weight

    return normalized


# =========================================
# Semantic Score
# =========================================
def calculate_semantic_score(
    product,
    request_data,
):

    score = 0

    usage_weights = (
        normalize_usage_weights(
            request_data
        )
    )

    product_name = (
        product.name or ""
    ).lower()

    # =====================================
    # creator intent
    # =====================================
    creator_weight = usage_weights.get(
        "usage-creator",
        0
    )

    if creator_weight > 0:

        creator_config = (
            SEMANTIC_WEIGHT_CONFIG[
                "creator"
            ]
        )

        # -----------------------------
        # CPU
        # -----------------------------
        cpu_score = (
            product.score_cpu or 0
        )

        score += (
            cpu_score
            * creator_config["cpu"]
        ) * creator_weight

        # -----------------------------
        # MEMORY
        # -----------------------------
        memory_score = min(
            product.memory_gb or 0,
            64
        )

        score += (
            memory_score
            * creator_config["memory"]
        ) * creator_weight

        # -----------------------------
        # GPU
        # -----------------------------
        gpu_score = (
            product.score_gpu or 0
        )

        score += (
            gpu_score
            * creator_config["gpu"]
        ) * creator_weight

        # -----------------------------
        # Negative Semantic
        # -----------------------------
        server_keywords = [

            "poweredge",

            "server",

            "xeon",
        ]

        if any(
            kw in product_name
            for kw in server_keywords
        ):

            score *= 0.2

        # -----------------------------
        # Positive Semantic
        # -----------------------------
        creator_keywords = [

            "proart",

            "creator",

            "daiv",

            "studio",
        ]

        if any(
            kw in product_name
            for kw in creator_keywords
        ):

            score += (
                creator_config[
                    "creator_bonus"
                ] * creator_weight
            )

    # =====================================
    # gaming intent
    # =====================================
    gaming_weight = usage_weights.get(
        "usage-gaming",
        0
    )

    if gaming_weight > 0:

        gaming_config = (
            SEMANTIC_WEIGHT_CONFIG[
                "gaming"
            ]
        )

        # -----------------------------
        # GPU
        # -----------------------------
        gpu_score = (
            product.score_gpu or 0
        )

        score += (
            gpu_score
            * gaming_config["gpu"]
        ) * gaming_weight

        # -----------------------------
        # CPU
        # -----------------------------
        cpu_score = (
            product.score_cpu or 0
        )

        score += (
            cpu_score
            * gaming_config["cpu"]
        ) * gaming_weight

        # -----------------------------
        # gaming affinity
        # -----------------------------
        gaming_keywords = [

            "omen",

            "alienware",

            "rog",

            "gaming",
        ]

        if any(
            kw in product_name
            for kw in gaming_keywords
        ):

            score += (
                gaming_config[
                    "gaming_bonus"
                ] * gaming_weight
            )

    # =====================================
    # freshness bonus
    # =====================================
    try:

        from django.utils import timezone

        days_old = (
            timezone.now() - product.updated_at
        ).days

        # -----------------------------
        # freshness
        # -----------------------------
        if days_old <= 7:

            score += 8

        elif days_old <= 30:

            score += 5

        elif days_old <= 90:

            score += 2

    except Exception:

        pass

    return round(score, 2)


# =========================================
# Semantic Breakdown
# =========================================
def build_semantic_breakdown(
    product,
    request_data,
):

    breakdown = {}

    usage_weights = (
        normalize_usage_weights(
            request_data
        )
    )

    # =====================================
    # creator intent
    # =====================================
    creator_weight = usage_weights.get(
        "usage-creator",
        0
    )

    
    if creator_weight > 0:

        creator_config = (
            SEMANTIC_WEIGHT_CONFIG[
                "creator"
            ]
        )

        breakdown["creator"] = {

            "cpu": round(
                (
                    (product.score_cpu or 0)
                    * creator_config["cpu"]
                ) * creator_weight,
                2
            ),

            "memory": round(
                (
                    min(
                        product.memory_gb or 0,
                        64
                    ) * creator_config["memory"]
                ) * creator_weight,
                2
            ),

            "gpu": round(
                (
                    (product.score_gpu or 0)
                    * creator_config["gpu"]
                ) * creator_weight,
                2
            ),
        }    
    

    # =====================================
    # gaming intent
    # =====================================
    gaming_weight = usage_weights.get(
        "usage-gaming",
        0
    )

    if gaming_weight > 0:
        
        gaming_config = (
            SEMANTIC_WEIGHT_CONFIG[
                "gaming"
            ]
        )

        breakdown["gaming"] = {

            "gpu": round(
                (
                    (product.score_gpu or 0)
                    * gaming_config["gpu"]
                ) * gaming_weight,
                2
            ),

            "cpu": round(
                (
                    (product.score_cpu or 0)
                    * gaming_config["cpu"]
                ) * gaming_weight,
                2
            ),
        }

    return breakdown


# =========================================
# Semantic Explanations
# =========================================
def build_semantic_explanations(
    product,
    request_data,
):

    reasons = []

    usage_weights = (
        normalize_usage_weights(
            request_data
        )
    )

    product_name = (
        product.name or ""
    ).lower()

    # =====================================
    # creator intent
    # =====================================
    creator_weight = usage_weights.get(
        "usage-creator",
        0
    )

    if creator_weight > 0:

        # -----------------------------
        # CPU
        # -----------------------------
        if (product.score_cpu or 0) >= 80:

            reasons.append(
                "高性能CPU"
            )

        # -----------------------------
        # MEMORY
        # -----------------------------
        if (product.memory_gb or 0) >= 32:

            reasons.append(
                "大容量メモリ"
            )

        # -----------------------------
        # GPU
        # -----------------------------
        if (product.score_gpu or 0) >= 70:

            reasons.append(
                "高性能GPU"
            )

        # -----------------------------
        # creator affinity
        # -----------------------------
        creator_keywords = [

            "proart",

            "creator",

            "daiv",

            "studio",
        ]

        if any(
            kw in product_name
            for kw in creator_keywords
        ):

            reasons.append(
                "Creator向けモデル"
            )

    # =====================================
    # gaming intent
    # =====================================
    gaming_weight = usage_weights.get(
        "usage-gaming",
        0
    )

    if gaming_weight > 0:

        # -----------------------------
        # GPU
        # -----------------------------
        if (product.score_gpu or 0) >= 80:

            reasons.append(
                "高性能GPU"
            )

        # -----------------------------
        # CPU
        # -----------------------------
        if (product.score_cpu or 0) >= 70:

            reasons.append(
                "高性能CPU"
            )

        # -----------------------------
        # gaming affinity
        # -----------------------------
        gaming_keywords = [

            "omen",

            "alienware",

            "rog",

            "gaming",
        ]

        if any(
            kw in product_name
            for kw in gaming_keywords
        ):

            reasons.append(
                "ゲーミング向けモデル"
            )

    # =====================================
    # dedupe
    # =====================================
    reasons = list(
        dict.fromkeys(reasons)
    )

    return reasons


# =========================================
# Semantic Confidence
# =========================================
def calculate_semantic_confidence(
    score,
):

    if score >= 80:

        return 0.95

    if score >= 60:

        return 0.85

    if score >= 40:

        return 0.70

    return 0.50

# =========================================
# Semantic Filter
# =========================================
def passes_semantic_filter(
    product,
    request_data,
):

    usage_weights = (
        normalize_usage_weights(
            request_data
        )
    )

    # =====================================
    # creator intent
    # =====================================
    creator_weight = usage_weights.get(
        "usage-creator",
        0
    )

    if creator_weight > 0:

        # -----------------------------
        # minimum memory
        # -----------------------------
        if (product.memory_gb or 0) < 16:

            return False

        # -----------------------------
        # minimum cpu
        # -----------------------------
        if (product.score_cpu or 0) < 40:

            return False

    # =====================================
    # negative keywords
    # =====================================
    exclude_keywords = request_data.get(
        "exclude_keywords",
        []
    )

    product_name = (
        product.name or ""
    ).lower()

    for keyword in exclude_keywords:

        keyword = str(
            keyword
        ).lower()

        if keyword in product_name:

            return False

    return True

# =========================================
# Finder Ranking
# =========================================
def find_semantic_products(
    request_data,
    limit=10,
):

    import json

    cache_key = json.dumps(
        request_data,
        sort_keys=True,
        ensure_ascii=False,
    )

    # =====================================
    # cache hit
    # =====================================
    if cache_key in SEMANTIC_FINDER_CACHE:

        return SEMANTIC_FINDER_CACHE[
            cache_key
        ]

    products = (
        PCProduct.objects
        .filter(is_active=True)
    )

    ranked = []

    for product in products:

        # -----------------------------
        # semantic filter
        # -----------------------------
        if not passes_semantic_filter(
            product,
            request_data,
        ):
            continue

        # -----------------------------
        # score
        # -----------------------------
        score = calculate_semantic_score(
            product,
            request_data,
        )

        # =====================================
        # budget penalty
        # =====================================
        budget_max = request_data.get(
            "budget_max"
        )

        if budget_max:

            try:

                budget_max = int(
                    budget_max
                )

                product_price = (
                    product.price or 0
                )

                # -------------------------
                # over budget
                # -------------------------
                if product_price > budget_max:

                    over_ratio = (
                        product_price / budget_max
                    )

                    # -------------------------
                    # soft penalty
                    # -------------------------
                    score /= over_ratio

            except Exception:

                pass

        # -----------------------------
        # confidence
        # -----------------------------
        confidence = (
            calculate_semantic_confidence(
                score
            )
        )

        # -----------------------------
        # explanations
        # -----------------------------
        reasons = build_semantic_explanations(
            product,
            request_data,
        )

        # -----------------------------
        # breakdown
        # -----------------------------
        breakdown = build_semantic_breakdown(
            product,
            request_data,
        )

        ranked.append({

            "product": product,

            "score": round(score, 2),

            "confidence": confidence,

            "reasons": reasons,

            "breakdown": breakdown,
        })

    # =====================================
    # semantic ranking
    # =====================================
    ranked.sort(

        key=lambda x: (

            x["score"],

            x["confidence"]
        ),

        reverse=True
    )

    # =====================================
    # semantic diversity
    # =====================================
    maker_counts = {}

    final_results = []

    for item in ranked:

        product = item["product"]

        maker = (
            product.maker or "unknown"
        )

        current_count = maker_counts.get(
            maker,
            0
        )

        # -----------------------------
        # same maker limit
        # -----------------------------
        if current_count >= 2:
            continue

        final_results.append(item)

        maker_counts[maker] = (
            current_count + 1
        )

        # -----------------------------
        # limit reached
        # -----------------------------
        if len(final_results) >= limit:
            break

    usage_weights = (
        normalize_usage_weights(
            request_data
        )
    )

    # =====================================
    # fallback
    # =====================================
    fallback_mode = False

    if not final_results:

        fallback_mode = True

        fallback_products = (
            PCProduct.objects
            .filter(is_active=True)
            .order_by(
                "-score_cpu"
            )[:limit]
        )

        for product in fallback_products:

            final_results.append({

                "product": product,

                "score": 0,

                "confidence": 0.30,

                "reasons": [
                    "条件一致候補が少ないため代替表示"
                ],

                "breakdown": {},
            })

    response_payload = {

        "meta": {

            "total_products": products.count(),

            "returned_results": len(
                final_results
            ),

            "usage_weights": usage_weights,

            "budget_max": request_data.get(
                "budget_max"
            ),

            "fallback_mode": fallback_mode,
        },

        "results": final_results,
    }

    # =====================================
    # cache save
    # =====================================
    SEMANTIC_FINDER_CACHE[
        cache_key
    ] = response_payload

    return response_payload