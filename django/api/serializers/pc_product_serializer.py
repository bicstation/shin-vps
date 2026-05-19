from rest_framework import serializers

from api.models import (
    PCProduct,
    PCAttribute,
)

from api.services.semantic.semantic_api_service import (
    build_semantic_product_payload,
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
    grouped_attributes = (
        serializers.SerializerMethodField()
    )

    # =====================================
    # Semantic Schema Version
    # =====================================
    semantic_schema_version = (
        serializers.SerializerMethodField()
    )

    # =====================================
    # Semantic Runtime
    # =====================================
    semantic_runtime = (
        serializers.SerializerMethodField()
    )

    semantic_labels = (
        serializers.SerializerMethodField()
    )

    workflows = (
        serializers.SerializerMethodField()
    )

    adaptive_runtime = (
        serializers.SerializerMethodField()
    )

    runtime_profile = (
        serializers.SerializerMethodField()
    )

    product_type = (
        serializers.SerializerMethodField()
    )

    semantic_score = (
        serializers.SerializerMethodField()
    )

    # =====================================
    # Semantic Related
    # =====================================
    semantic_related = (
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
            # Product Runtime
            # =================================
            "product_type",

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

            # =================================
            # Semantic Runtime Score
            # =================================
            "semantic_score",

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
            # Semantic Runtime
            # =================================
            "semantic_runtime",
            "semantic_labels",
            "workflows",
            "adaptive_runtime",
            "runtime_profile",

            # =================================
            # Semantic Related Runtime
            # =================================
            "semantic_related",

            # =================================
            # Semantic Metadata
            # =================================
            "semantic_schema_version",
        ]

    # =====================================
    # Semantic Schema Version
    # =====================================
    def get_semantic_schema_version(
        self,
        obj
    ):

        return 2

    # =====================================
    # Semantic Payload
    # =====================================
    def get_semantic_payload(
        self,
        obj
    ):

        try:

            return build_semantic_product_payload(
                obj
            )

        except Exception:

            return {}

    # =====================================
    # Semantic Runtime
    # =====================================
    def get_semantic_runtime(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "semantic_runtime",
            {}
        )

    # =====================================
    # Semantic Labels
    # =====================================
    def get_semantic_labels(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "semantic_labels",
            []
        )

    # =====================================
    # Workflows
    # =====================================
    def get_workflows(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "workflows",
            []
        )

    # =====================================
    # Adaptive Runtime
    # =====================================
    def get_adaptive_runtime(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "adaptive_runtime",
            {}
        )

    # =====================================
    # Runtime Profile
    # =====================================
    def get_runtime_profile(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "runtime_profile",
            {}
        )

    # =====================================
    # Product Type
    # =====================================
    def get_product_type(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "product_type"
        )

    # =====================================
    # Semantic Score
    # =====================================
    def get_semantic_score(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "semantic_score",
            0
        )

    # =====================================
    # Semantic Related
    # =====================================
    def get_semantic_related(
        self,
        obj
    ):

        payload = self.get_semantic_payload(
            obj
        )

        return payload.get(
            "semantic_related",
            []
        )

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