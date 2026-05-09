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

            # =================================
            # Base
            # =================================
            "id",
            "slug",
            "name",
            "attr_type",

            # =================================
            # Semantic Metadata
            # =================================
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

    # =====================================
    # Semantic Contract Normalization
    # IMPORTANT:
    # Frontend semantic authority field
    # =====================================
    ranking_score = serializers.FloatField(
        source="spec_score",
        read_only=True
    )

    # =====================================
    # Grouped Semantic Attributes
    # =====================================
    grouped_attributes = serializers.SerializerMethodField()

    # =====================================
    # Semantic Schema Version
    # =====================================
    semantic_schema_version = (
        serializers.SerializerMethodField()
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

            # ---------------------------------
            # Internal DB Authority
            # ---------------------------------
            "spec_score",

            # ---------------------------------
            # Semantic API Contract
            # ---------------------------------
            "ranking_score",

            # =================================
            # AI
            # =================================
            "ai_summary",
            "ai_content",

            # =================================
            # Semantic Attributes
            # =================================
            "attributes",
            "grouped_attributes",

            # =================================
            # Semantic Metadata
            # =================================
            "semantic_schema_version",

            # =================================
            # Radar
            # =================================
            # "radar_chart",
        ]

    # =====================================
    # Semantic Schema Version
    # =====================================
    def get_semantic_schema_version(
        self,
        obj
    ):

        return 1

    # =====================================
    # Grouped Semantic Attributes
    # =====================================
    def get_grouped_attributes(
        self,
        obj
    ):

        grouped = {}

        for attr in obj.attributes.all():

            key = attr.attr_type

            grouped.setdefault(
                key,
                []
            )

            grouped[key].append({

                "id":
                    attr.id,

                "slug":
                    attr.slug,

                "name":
                    attr.name,

                "type":
                    attr.attr_type,

                "semantic_role":
                    attr.semantic_role,

                "semantic_weight":
                    attr.semantic_weight,

                "icon":
                    attr.icon,

                "color":
                    attr.color,
            })

        return grouped