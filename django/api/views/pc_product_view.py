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

from api.services.semantic.semantic_api_service import (

    build_semantic_product_payload,

    build_semantic_related_products,

    build_semantic_shelf_payload,

    build_semantic_discovery_payload,
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
            is_active=True
        )

        .prefetch_related(
            "attributes"
        )
    )

    # -----------------------------------------------------
    # Semantic Ranking
    # -----------------------------------------------------
    if use == "gaming":

        qs = qs.order_by(
            "-score_gpu",
            "-semantic_score",
            "-spec_score"
        )

    elif use == "creator":

        qs = qs.order_by(
            "-score_cpu",
            "-memory_gb",
            "-semantic_score",
            "-spec_score"
        )

    elif use == "business":

        qs = qs.order_by(
            "-score_cost",
            "-score_cpu",
            "-semantic_score"
        )

    elif use == "ai":

        qs = qs.order_by(
            "-score_ai",
            "-semantic_score",
            "-spec_score"
        )

    else:

        qs = qs.order_by(
            "-semantic_score",
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

    # -----------------------------------------------------
    # Semantic Payload
    # -----------------------------------------------------
    semantic_payload = (
        build_semantic_product_payload(
            product
        )
    )

    serializer = (
        PCProductSerializer(
            product
        )
    )

    data = serializer.data

    # -----------------------------------------------------
    # Merge Semantic Payload
    # -----------------------------------------------------
    data.update({

        "semantic_runtime":
            semantic_payload.get(
                "semantic_runtime",
                {}
            ),

        "semantic_labels":
            semantic_payload.get(
                "semantic_labels",
                []
            ),

        "workflows":
            semantic_payload.get(
                "workflows",
                []
            ),

        "adaptive_runtime":
            semantic_payload.get(
                "adaptive_runtime",
                {}
            ),

        "runtime_profile":
            semantic_payload.get(
                "runtime_profile",
                {}
            ),

        "semantic_related":
            semantic_payload.get(
                "semantic_related",
                []
            ),

        "semantic_score":
            semantic_payload.get(
                "semantic_score",
                0
            ),

        "product_type":
            semantic_payload.get(
                "product_type"
            ),
    })

    return Response(data)


# =========================================================
# 🔗 Semantic Related Products API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def get_related_pc_products(
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

        return Response([])

    related_products = (
        build_semantic_related_products(
            product
        )
    )

    return Response(
        related_products
    )


# =========================================================
# 🎬 Semantic Discovery Runtime API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_discovery_runtime(
    request
):

    payload = (
        build_semantic_discovery_payload()
    )

    return Response(
        payload
    )


# =========================================================
# 🧠 Semantic Shelves API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_shelves(
    request
):

    payload = (
        build_semantic_shelf_payload()
    )

    return Response(
        payload
    )


# =========================================================
# 🚀 Semantic Discovery Runtime API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_discovery_runtime(
    request
):

    payload = (
        build_semantic_discovery_payload()
    )

    return Response(
        payload
    )


# =========================================================
# 🎬 Semantic Shelves API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_shelves(
    request
):

    payload = (
        build_semantic_shelf_payload()
    )

    return Response(
        payload
    )