# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/general_serializers.py

from rest_framework import serializers
from django.contrib.auth import get_user_model
# 💡 モデルの分割構造に合わせてインポート
from api.models.pc_products import PCProduct, PriceHistory, PCAttribute
from api.models import LinkshareProduct
import logging

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 1. 💻 PC属性・価格履歴
# --------------------------------------------------------------------------
class PCAttributeSerializer(serializers.ModelSerializer):
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
    class Meta:
        model = PCAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')

class PriceHistorySerializer(serializers.ModelSerializer):
    # 💡 グラフ描画用に日付フォーマットを固定
    date = serializers.DateTimeField(source='recorded_at', format="%Y/%m/%d")
    class Meta:
        model = PriceHistory
        fields = ('date', 'price')

# --------------------------------------------------------------------------
# 2. 📦 物販・アフィリエイト (Linkshare)
# --------------------------------------------------------------------------
class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = ('id', 'updated_at')

# --------------------------------------------------------------------------
# 3. 🏆 PC製品メイン (Bic-Saving)
# --------------------------------------------------------------------------
class PCProductSerializer(serializers.ModelSerializer):
    attributes = PCAttributeSerializer(many=True, read_only=True)
    price_history = serializers.SerializerMethodField()
    radar_chart = serializers.SerializerMethodField()
    rank = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = PCProduct
        fields = (
            'id', 'unique_id', 'site_prefix', 'maker', 'raw_genre', 'unified_genre',
            'name', 'price', 'url', 'image_url', 'description',
            'cpu_model', 'gpu_model', 'memory_gb', 'storage_gb', 'display_info', 'npu_tops',
            'cpu_socket', 'motherboard_chipset', 'ram_type', 'power_recommendation',
            'os_support', 'license_term', 'device_count', 'edition', 'is_download',
            'score_cpu', 'score_gpu', 'score_cost', 'score_portable', 'score_ai', 'radar_chart',
            'target_segment', 'is_ai_pc', 'spec_score', 'ai_summary', 'ai_content',
            'attributes', 'price_history', 'rank', 'affiliate_url', 'affiliate_updated_at',
            'stock_status', 'is_posted', 'is_active', 'last_spec_parsed_at', 'created_at', 'updated_at',
        )
        read_only_fields = fields

    def get_price_history(self, obj):
        # 💡 直近30件を昇順（古い順）に並べ替えてチャートへ渡す
        histories = PriceHistory.objects.filter(product=obj).order_by('-recorded_at')[:30]
        return PriceHistorySerializer(reversed(histories), many=True).data

    def get_radar_chart(self, obj):
        # 💡 Next.js の Recharts 等でそのまま使える配列形式
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]