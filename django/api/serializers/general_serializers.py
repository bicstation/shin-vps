# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models.pc_products import PCProduct, PriceHistory
from .master_serializers import PCAttributeSerializer

# 📈 価格履歴を整形するためのサブ・シリアライザー
class PriceHistorySerializer(serializers.ModelSerializer):
    # recorded_at フィールドを 'date' という名前で "2024/05/20" 形式に変換
    date = serializers.DateTimeField(source='recorded_at', format="%Y/%m/%d")

    class Meta:
        model = PriceHistory
        fields = ('date', 'price')

# 💻 PC製品のメイン・シリアライザー
class PCProductSerializer(serializers.ModelSerializer):
    # 関連する属性（メーカー、用途など）を詳細に展開
    attributes = PCAttributeSerializer(many=True, read_only=True)
    
    # データベースにない計算項目を定義
    price_history = serializers.SerializerMethodField()
    radar_chart = serializers.SerializerMethodField()
    rank = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = PCProduct
        # Next.js 側で使用するすべてのフィールドを定義
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
        # API経由で勝手に書き換えられないようすべて読み取り専用に設定
        read_only_fields = fields

    def get_price_history(self, obj):
        """
        Next.jsのチャート用に、直近30件の価格データを取得
        """
        histories = PriceHistory.objects.filter(product=obj).order_by('recorded_at')[:30]
        return PriceHistorySerializer(histories, many=True).data

    def get_radar_chart(self, obj):
        """
        Next.jsのレーダーチャート（SpecRadarChart）が期待するデータ構造に変換
        """
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]