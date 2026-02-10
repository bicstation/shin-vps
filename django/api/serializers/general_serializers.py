# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models.pc_products import PCProduct, PriceHistory
from api.models import LinkshareProduct  # 💡 引っ越し先として追加
from .adult_serializers import PCAttributeSerializer

# --------------------------------------------------------------------------
# 1. 価格履歴用サブ・シリアライザー
# --------------------------------------------------------------------------
class PriceHistorySerializer(serializers.ModelSerializer):
    """
    価格推移チャート用のデータを整形。
    recorded_at を 'date' という名前でフロントエンドに返します。
    """
    date = serializers.DateTimeField(source='recorded_at', format="%Y/%m/%d")

    class Meta:
        model = PriceHistory
        fields = ('date', 'price')

# --------------------------------------------------------------------------
# 2. 物販・アフィリエイト用シリアライザー (adultから移動)
# --------------------------------------------------------------------------
class LinkshareProductSerializer(serializers.ModelSerializer):
    """
    PCパーツ、周辺機器等のアフィリエイト商品用シリアライザー。
    """
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = ('id', 'updated_at')

# --------------------------------------------------------------------------
# 3. PC製品メイン・シリアライザー
# --------------------------------------------------------------------------
class PCProductSerializer(serializers.ModelSerializer):
    """
    PC・ソフトウェア製品の詳細スペック、スコア、チャートデータを含むメインシリアライザー。
    """
    # 属性（メーカー、用途タグなど）を詳細展開
    attributes = PCAttributeSerializer(many=True, read_only=True)
    
    # グラフ・履歴用動的フィールド
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
        # 参照専用のため、すべて読み取り専用に設定
        read_only_fields = fields

    def get_price_history(self, obj):
        """
        Next.jsのチャートコンポーネント用に直近30件の履歴を返す
        """
        # queryset を制限してパフォーマンスを維持
        histories = PriceHistory.objects.filter(product=obj).order_by('recorded_at')[:30]
        return PriceHistorySerializer(histories, many=True).data

    def get_radar_chart(self, obj):
        """
        Next.jsのレーダーチャート（SpecRadarChart）が解釈可能なデータ構造に変換
        """
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]