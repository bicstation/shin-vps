# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/general_serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model

# 💡 モデルの分割構造に合わせてインポート
from api.models.pc_products import (
    PCProduct,
    PriceHistory,
    PCAttribute,
)

from api.models import LinkshareProduct

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


class PriceHistorySerializer(
    serializers.ModelSerializer
):

    # 💡 グラフ描画用に日付フォーマットを固定
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
# 2. 📦 物販・アフィリエイト (Linkshare)
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
# 3. 🏆 PC製品メイン (BicStation)
# --------------------------------------------------------------------------
class PCProductSerializer(
    serializers.ModelSerializer
):

    # ======================================================
    # Semantic Attributes
    # ======================================================
    attributes = PCAttributeSerializer(
        many=True,
        read_only=True
    )

    grouped_attributes = serializers.SerializerMethodField()

    # ======================================================
    # Extra Fields
    # ======================================================
    price_history = serializers.SerializerMethodField()

    radar_chart = serializers.SerializerMethodField()

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

            # ==================================================
            # Semantic Attributes
            # ==================================================
            'attributes',

            'grouped_attributes',

            # ==================================================
            # Extra
            # ==================================================
            'price_history',

            'rank',

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

        # 💡 直近30件を昇順（古い順）に並べ替えてチャートへ渡す
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

        # 💡 Next.js の Recharts 等でそのまま使える配列形式
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
    # Semantic Grouping
    # ======================================================
    def get_grouped_attributes(self, obj):

        grouped = {}

        # semantic priority order
        ordered_types = [

            "usage",

            "gpu",
            "cpu",

            "maker",

            "memory",
            "storage",

            "feature",
        ]

        attrs = obj.attributes.all()

        for attr_type in ordered_types:

            filtered = attrs.filter(
                attr_type=attr_type
            )

            if not filtered.exists():
                continue

            grouped[attr_type] = (
                PCAttributeSerializer(
                    filtered,
                    many=True
                ).data
            )

        return grouped