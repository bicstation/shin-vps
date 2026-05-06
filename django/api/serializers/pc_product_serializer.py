from rest_framework import serializers

from api.models import (
    PCProduct,
    PCAttribute,
)


# =========================================
# Semantic Attribute Serializer
# =========================================
class PCAttributeSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = PCAttribute

        fields = [

            # Base
            "id",
            "slug",
            "name",
            "attr_type",

            # Semantic Metadata
            "semantic_role",
            "semantic_weight",

            "icon",
            "color",
        ]


# =========================================
# PC Product Serializer
# =========================================
class PCProductSerializer(
    serializers.ModelSerializer
):

    # =====================================
    # Semantic Attributes
    # =====================================
    attributes = PCAttributeSerializer(
        many=True,
        read_only=True
    )

    class Meta:

        model = PCProduct

        fields = [

            # =================================
            # Base
            # =================================
            "id",
            "unique_id",
            "name",
            "price",
            "url",
            "image_url",

            # =================================
            # Specs
            # =================================
            "cpu_model",
            "gpu_model",
            "memory_gb",
            "storage_gb",

            # =================================
            # Scores
            # =================================
            "score_cpu",
            "score_gpu",
            "score_cost",
            "score_portable",
            "score_ai",
            "spec_score",

            # =================================
            # AI
            # =================================
            "ai_summary",
            "ai_content",

            # =================================
            # Semantic Attributes
            # =================================
            "attributes",

            # =================================
            # Radar
            # =================================
            # "radar_chart",
        ]