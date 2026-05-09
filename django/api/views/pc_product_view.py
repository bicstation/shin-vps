from rest_framework.decorators import (
    api_view,
    permission_classes
)

from rest_framework.permissions import (
    AllowAny
)

from rest_framework.response import (
    Response
)

from api.models import (
    PCProduct
)

from api.serializers.pc_product_serializer import (
    PCProductSerializer
)


# =========================================================
# 🥇 Ranking API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_product_ranking(request):

    use = request.GET.get(
        "use",
        "score"
    )

    qs = (

        PCProduct.objects

        .filter(
            is_active=True,
            unified_genre="PC"
        )
    )

    # -----------------------------------------------------
    # Semantic Ranking
    # -----------------------------------------------------
    if use == "gaming":

        qs = qs.order_by(
            "-score_gpu",
            "-spec_score"
        )

    elif use == "creator":

        qs = qs.order_by(
            "-score_cpu",
            "-memory_gb",
            "-spec_score"
        )

    elif use == "business":

        qs = qs.order_by(
            "-score_cost",
            "-score_cpu"
        )

    elif use == "ai":

        qs = qs.order_by(
            "-score_ai",
            "-npu_tops",
            "-spec_score"
        )

    else:

        qs = qs.order_by(
            "-spec_score"
        )

    qs = qs[:20]

    serializer = (
        PCProductSerializer(
            qs,
            many=True
        )
    )

    return Response(
        serializer.data
    )


# =========================================================
# 📄 Product Detail API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def pc_product_detail(
    request,
    unique_id
):

    try:

        product = (

            PCProduct.objects

            .prefetch_related(
                "attributes"
            )

            .get(
                unique_id=unique_id,
                is_active=True
            )
        )

    except PCProduct.DoesNotExist:

        return Response(
            {
                "error": "not found"
            },
            status=404
        )

    serializer = (
        PCProductSerializer(
            product
        )
    )

    return Response(
        serializer.data
    )


# =========================================================
# 🔗 Related Products API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def get_related_pc_products(
    request,
    unique_id
):

    limit = 8

    try:

        base = (

            PCProduct.objects

            .prefetch_related(
                "attributes"
            )

            .get(
                unique_id=unique_id,
                is_active=True
            )
        )

    except PCProduct.DoesNotExist:

        return Response([])

    # -----------------------------------------------------
    # Base Semantic Attributes
    # -----------------------------------------------------
    base_gpu = (

        base.attributes.filter(
            attr_type="gpu"
        ).first()
    )

    base_usage = (

        base.attributes.filter(
            attr_type="usage"
        ).first()
    )

    base_device = (

        base.attributes.filter(
            attr_type="device"
        ).first()
    )

    base_maker = (

        base.attributes.filter(
            attr_type="maker"
        ).first()
    )

    # -----------------------------------------------------
    # GPU Neighbor Mapping
    # -----------------------------------------------------
    def get_neighbor_gpu_slugs(slug):

        mapping = {

            "gpu-rtx-4050": [
                "gpu-rtx-4050",
                "gpu-rtx-4060",
            ],

            "gpu-rtx-4060": [
                "gpu-rtx-4050",
                "gpu-rtx-4060",
                "gpu-rtx-4070",
            ],

            "gpu-rtx-4070": [
                "gpu-rtx-4060",
                "gpu-rtx-4070",
                "gpu-rtx-4080",
            ],

            "gpu-rtx-4080": [
                "gpu-rtx-4070",
                "gpu-rtx-4080",
                "gpu-rtx-4090",
            ],

            "gpu-rtx-4090": [
                "gpu-rtx-4080",
                "gpu-rtx-4090",
            ],
        }

        return mapping.get(
            slug,
            [slug]
        )

    # -----------------------------------------------------
    # Candidate Base Query
    # -----------------------------------------------------
    candidates = (

        PCProduct.objects

        .filter(
            is_active=True,
            unified_genre="PC"
        )

        .exclude(
            id=base.id
        )

        .prefetch_related(
            "attributes"
        )

        .order_by(
            "-spec_score"
        )[:150]
    )

    # -----------------------------------------------------
    # Match Score
    # -----------------------------------------------------
    def calc_score(product):

        score = 0

        matched_attributes = []

        # =================================================
        # Device Semantic
        # =================================================
        if base_device:

            if product.attributes.filter(
                slug=base_device.slug
            ).exists():

                score += 0.25

                matched_attributes.append(
                    base_device.slug
                )

            else:

                # -----------------------------------------
                # Soft semantic fallback
                # -----------------------------------------
                score -= 0.15

        # =================================================
        # Price Similarity
        # =================================================
        if base.price and product.price:

            diff = abs(
                product.price - base.price
            ) / base.price

            if diff <= 0.10:

                score += 0.20

            elif diff <= 0.20:

                score += 0.10

        # =================================================
        # GPU Exact Match
        # =================================================
        if (

            base_gpu

            and product.attributes.filter(
                slug=base_gpu.slug
            ).exists()
        ):

            score += 0.20

            matched_attributes.append(
                base_gpu.slug
            )

        # =================================================
        # GPU Neighbor Match
        # =================================================
        elif (

            base_gpu

            and product.attributes.filter(
                slug__in=get_neighbor_gpu_slugs(
                    base_gpu.slug
                )
            ).exists()
        ):

            score += 0.12

        # =================================================
        # Usage Semantic
        # =================================================
        if (

            base_usage

            and product.attributes.filter(
                slug=base_usage.slug
            ).exists()
        ):

            score += 0.20

            matched_attributes.append(
                base_usage.slug
            )

        # =================================================
        # Maker Semantic
        # =================================================
        if (

            base_maker

            and product.attributes.filter(
                slug=base_maker.slug
            ).exists()
        ):

            score += 0.10

            matched_attributes.append(
                base_maker.slug
            )

        # =================================================
        # Spec Score Similarity
        # =================================================
        if (

            base.spec_score
            and product.spec_score
        ):

            diff = abs(
                product.spec_score
                - base.spec_score
            ) / base.spec_score

            if diff <= 0.10:

                score += 0.10

        return round(
            score,
            2
        ), matched_attributes

    # -----------------------------------------------------
    # Candidate Selection
    # -----------------------------------------------------
    scored = []

    for product in candidates:

        # =================================================
        # Skip invalid price
        # =================================================
        if (
            not product.price
            or not base.price
        ):
            continue

        # =================================================
        # Price Range Filter
        # =================================================
        diff = abs(
            product.price - base.price
        ) / base.price

        if diff > 0.35:
            continue

        # =================================================
        # Semantic Score
        # =================================================
        score, matched_attributes = (
            calc_score(product)
        )

        # =================================================
        # Soft semantic threshold
        # =================================================
        if score < 0.20:
            continue

        product._semantic_score = score

        product._matched_attributes = (
            matched_attributes
        )

        scored.append(product)

    # -----------------------------------------------------
    # Sort
    # -----------------------------------------------------
    results = sorted(

        scored,

        key=lambda x: (
            x._semantic_score,
            x.spec_score or 0
        ),

        reverse=True

    )[:limit]

    # -----------------------------------------------------
    # Serialize
    # -----------------------------------------------------
    serializer = (
        PCProductSerializer(
            results,
            many=True
        )
    )

    data = serializer.data

    # -----------------------------------------------------
    # Recommendation Metadata
    # -----------------------------------------------------
    for i, item in enumerate(data):

        item["similarity_score"] = (
            results[i]._semantic_score
        )

        item["matched_attributes"] = (
            results[i]._matched_attributes
        )

    return Response(data)