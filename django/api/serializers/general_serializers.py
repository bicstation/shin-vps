# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/general_serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

# 💡 モデル
from api.models.pc_products import (
    PCProduct,
    PriceHistory,
    PCAttribute,
)

from api.models import LinkshareProduct

# 💡 Semantic Payload Layer
from api.utils.semantic_payload import (
    build_semantic_payload
)

import logging

logger = logging.getLogger(__name__)


# --------------------------------------------------------------------------
# 1. 💻 PC属性・価格履歴
# --------------------------------------------------------------------------
class PCAttributeSerializer(
    serializers.ModelSerializer
):

    attr_type_display = serializers.CharField(
        source='get_attr_type_display',
        read_only=True
    )

    class Meta:

        model = PCAttribute

        fields = (

            # ==================================================
            # Base
            # ==================================================
            'id',

            'attr_type',
            'attr_type_display',

            'name',
            'slug',

            'order',

            # ==================================================
            # Semantic Metadata
            # ==================================================
            'semantic_role',
            'semantic_weight',

            'icon',
            'color',
        )


# --------------------------------------------------------------------------
# 価格履歴
# --------------------------------------------------------------------------
class PriceHistorySerializer(
    serializers.ModelSerializer
):

    date = serializers.DateTimeField(
        source='recorded_at',
        format="%Y/%m/%d"
    )

    class Meta:

        model = PriceHistory

        fields = (
            'date',
            'price'
        )


# --------------------------------------------------------------------------
# 2. 📦 Linkshare
# --------------------------------------------------------------------------
class LinkshareProductSerializer(
    serializers.ModelSerializer
):

    class Meta:

        model = LinkshareProduct

        fields = (
            'id',
            'sku',
            'product_name',
            'availability',
            'affiliate_url',
            'image_url',
            'merchant_id',
            'updated_at',
        )

        read_only_fields = (
            'id',
            'updated_at'
        )


# --------------------------------------------------------------------------
# 3. 🏆 PCProduct Main Serializer
# --------------------------------------------------------------------------
class PCProductSerializer(
    serializers.ModelSerializer
):

    # ======================================================
    # Extra Fields
    # ======================================================
    price_history = serializers.SerializerMethodField()
    
    # image_url = serializers.SerializerMethodField()

    radar_chart = serializers.SerializerMethodField()
    
    semantic_schema_version = serializers.SerializerMethodField()
    
    recommendation_reason = serializers.SerializerMethodField()

    rank = serializers.IntegerField(
        required=False,
        read_only=True
    )

    class Meta:

        model = PCProduct

        fields = (

            # ==================================================
            # Base
            # ==================================================
            'id',
            'unique_id',

            'site_prefix',

            'maker',

            'raw_genre',
            'unified_genre',

            'name',
            'price',

            'url',
            'image_url',

            'description',

            # ==================================================
            # Specs
            # ==================================================
            'cpu_model',
            'gpu_model',

            'memory_gb',
            'storage_gb',

            'display_info',

            'npu_tops',

            'cpu_socket',
            'motherboard_chipset',

            'ram_type',

            'power_recommendation',

            'os_support',

            'license_term',

            'device_count',

            'edition',

            'is_download',

            # ==================================================
            # Scores
            # ==================================================
            'score_cpu',
            'score_gpu',

            'score_cost',
            'score_portable',
            'score_ai',

            'radar_chart',

            'target_segment',

            'is_ai_pc',

            'spec_score',

            # ==================================================
            # AI
            # ==================================================
            'ai_summary',
            'ai_content',
            'recommendation_reason',

            # ==================================================
            # Extra
            # ==================================================
            'price_history',

            'rank',
            
            'semantic_schema_version',

            # ==================================================
            # Affiliate
            # ==================================================
            'affiliate_url',
            'affiliate_updated_at',

            # ==================================================
            # Status
            # ==================================================
            'stock_status',

            'is_posted',
            'is_active',

            'last_spec_parsed_at',

            'created_at',
            'updated_at',
        )

        read_only_fields = fields

    # ======================================================
    # Price History
    # ======================================================
    def get_price_history(self, obj):

        histories = (
            PriceHistory.objects
            .filter(product=obj)
            .order_by('-recorded_at')[:30]
        )

        return PriceHistorySerializer(
            reversed(histories),
            many=True
        ).data

    # ======================================================
    # Radar Chart
    # ======================================================
    def get_radar_chart(self, obj):

        return [

            {
                "subject": "CPU性能",
                "value": obj.score_cpu or 0,
                "fullMark": 100
            },

            {
                "subject": "GPU性能",
                "value": obj.score_gpu or 0,
                "fullMark": 100
            },

            {
                "subject": "コスパ",
                "value": obj.score_cost or 0,
                "fullMark": 100
            },

            {
                "subject": "携帯性",
                "value": obj.score_portable or 0,
                "fullMark": 100
            },

            {
                "subject": "AI性能",
                "value": obj.score_ai or 0,
                "fullMark": 100
            },
        ]

    # ======================================================
    # Semantic Payload Integration
    # ======================================================
    def to_representation(self, instance):

        # -----------------------------------------
        # Base Serializer
        # -----------------------------------------
        data = super().to_representation(
            instance
        )

        # -----------------------------------------
        # Semantic Payload
        # -----------------------------------------
        semantic_payload = (
            build_semantic_payload(
                instance
            )
        )

        # -----------------------------------------
        # Inject Semantic Layer
        # -----------------------------------------
        data.update(
            semantic_payload
        )

        return data
    
    # ======================================================
    # Semantic Schema Version
    # ======================================================
    def get_semantic_schema_version(
        self,
        obj
    ):

        return "v1"
    
    # ======================================================
    # Recommendation Reason
    # ======================================================
    def get_recommendation_reason(
        self,
        obj
    ):

        reasons = []

        # --------------------------------------------------
        # GPU
        # --------------------------------------------------
        if obj.score_gpu and obj.score_gpu >= 90:

            reasons.append(
                "高性能GPU搭載"
            )

        # --------------------------------------------------
        # AI
        # --------------------------------------------------
        if obj.score_ai and obj.score_ai >= 80:

            reasons.append(
                "AI用途に最適"
            )

        # --------------------------------------------------
        # Portable
        # --------------------------------------------------
        if (
            obj.score_portable
            and obj.score_portable >= 80
        ):

            reasons.append(
                "持ち運びしやすい"
            )

        # --------------------------------------------------
        # Cost Performance
        # --------------------------------------------------
        if (
            obj.score_cost
            and obj.score_cost >= 80
        ):

            reasons.append(
                "コスパが高い"
            )

        # --------------------------------------------------
        # Fallback
        # --------------------------------------------------
        if not reasons:

            return "バランスの良い構成"

        return "・".join(reasons)
    # ======================================================
    # Cached Image
    # ======================================================
    # def get_image_url(self, obj):

    #     # -----------------------------------------
    #     # Cached Local Image
    #     # -----------------------------------------
    #     if obj.image_local:

    #         try:

    #             request = self.context.get(
    #                 "request"
    #             )

    #             if request:

    #                 return request.build_absolute_uri(
    #                     obj.image_local.url
    #                 )

    #             return obj.image_local.url

    #         except Exception:
    #             pass

    #     # -----------------------------------------
    #     # Fallback External URL
    #     # -----------------------------------------
    #     return obj.image_url