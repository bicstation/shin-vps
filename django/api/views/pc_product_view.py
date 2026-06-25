from rest_framework.decorators import (  api_view,  permission_classes )
from rest_framework.permissions import (  AllowAny  )
from rest_framework.response import ( Response  )
from api.models import (  PCProduct  )
from api.serializers.pc_product_serializer import (  PCProductSerializer  )
from api.services.semantic.semantic_api_service import ( 
    build_semantic_related_products,
    build_semantic_shelf_payload,
    build_semantic_workflow_payload,
)
# from api.services.semantic.v2.discovery_runtime_v2 import ( build_discovery_runtime_v2 )
from api.services.semantic.v2.discover.discover_runtime import (build_discover_runtime,)

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

    products = list(

        PCProduct.objects

        .filter(
            is_active=True
        )
    )

    # =====================================
    # SCORE RESOLVER
    # =====================================
    
    def get_runtime_score(product):

        runtime = (
            product.semantic_runtime
            or {}
        )

        scores = (
            runtime.get(
                "scores",
                {}
            )
        )

        if use == "gaming":
            return scores.get("gaming", 0)

        elif use == "creator":
            return scores.get("creator", 0)

        elif use == "business":
            return scores.get("business", 0)

        elif use == "ai":
            return scores.get("ai", 0)

        return max(
            scores.values(),
            default=0
        )

    # =====================================
    # SORT
    # =====================================

    products.sort(
        key=get_runtime_score,
        reverse=True
    )

    products = products[:20]

    serializer = (
        PCProductSerializer(
            products,
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

    data = serializer.data

    runtime = (
        product.semantic_runtime
        or {}
    )

    data.update({

        # =================================================
        # AUTHORITY RUNTIME
        # =================================================

        "semantic_runtime":
            runtime,

        # =================================================
        # EXPLICIT CONTRACT
        # =================================================

        "semantic_attributes":
            runtime.get(
                "semantic_attributes",
                []
            ),

        "semantic_groups":
            runtime.get(
                "semantic_groups",
                []
            ),

        "workflow_tags":
            runtime.get(
                "workflow_tags",
                []
            ),

        "semantic_labels":
            runtime.get(
                "semantic_labels",
                []
            ),

        "scores":
            runtime.get(
                "scores",
                {}
            ),

        "runtime_status":
            runtime.get(
                "runtime_status",
                {}
            ),
    })

    return Response(
        data
    )

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
        build_discover_runtime()
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
# 🌌 Workflow Runtime API
# =========================================================
@api_view(["GET"])
@permission_classes([AllowAny])
def semantic_workflow_runtime(
    request,
    workflow_slug
):

    payload = (
        build_semantic_workflow_payload(
            workflow_slug
        )
    )

    return Response(
        payload
    )