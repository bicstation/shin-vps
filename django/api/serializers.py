# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import AdultProduct, LinkshareProduct, Maker, Genre, Actress, Label, Director, Series 
from .models.pc_products import PCProduct, PCAttribute, PriceHistory

# --------------------------------------------------------------------------
# 1. エンティティ（マスターデータ）のシリアライザ
# --------------------------------------------------------------------------

class MakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maker
        fields = ('id', 'name', 'api_source', 'product_count')

class GenreSerializer(serializers.ModelSerializer):
    class Meta:
        model = Genre
        fields = ('id', 'name', 'api_source', 'product_count')

class ActressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Actress
        fields = ('id', 'name', 'api_source', 'product_count')

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ('id', 'name', 'api_source', 'product_count')

class DirectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Director
        fields = ('id', 'name', 'api_source', 'product_count')

class SeriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Series
        fields = ('id', 'name', 'api_source', 'product_count')

class PCAttributeSerializer(serializers.ModelSerializer):
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)

    class Meta:
        model = PCAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')

# --- 🚀 価格履歴用シリアライザ ---
class PriceHistorySerializer(serializers.ModelSerializer):
    date = serializers.DateTimeField(source='recorded_at', format="%Y/%m/%d")

    class Meta:
        model = PriceHistory
        fields = ('date', 'price')

# --------------------------------------------------------------------------
# 2. アダルト商品モデル (AdultProductSerializer)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'release_date',
            'affiliate_url', 'price', 'image_url_list', 'api_source',
            'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'is_active', 'updated_at',
        )
        read_only_fields = fields 

# --------------------------------------------------------------------------
# 3. Linkshare商品モデル (LinkshareProductSerializer)
# --------------------------------------------------------------------------

class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = fields

# --------------------------------------------------------------------------
# 4. PC・ソフトウェア製品モデル (PCProductSerializer)
# --------------------------------------------------------------------------

class PCProductSerializer(serializers.ModelSerializer):
    attributes = PCAttributeSerializer(many=True, read_only=True)
    # --- 🚀 価格履歴をシリアライザに統合 ---
    price_history = serializers.SerializerMethodField()
    # --- 🚀 レーダーチャート用データをフロントエンドで使いやすく統合 ---
    radar_chart = serializers.SerializerMethodField()
    # --- 🚀 ランキング表示用の順位 (オプション) ---
    rank = serializers.IntegerField(required=False, read_only=True)

    class Meta:
        model = PCProduct
        fields = (
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
            
            # --- AI解析抽出スペック (ハードウェア) ---
            'cpu_model',
            'gpu_model',
            'memory_gb',
            'storage_gb',
            'display_info',
            'npu_tops',
            
            # --- 🚀 自作PC提案・相性用データ ---
            'cpu_socket',           # CPUソケット (LGA1700等)
            'motherboard_chipset',  # 推奨チップセット
            'ram_type',             # メモリ規格 (DDR5等)
            'power_recommendation', # 推奨電源容量
            
            # --- ✨ ソフトウェア・ライセンス用データ ---
            'os_support',           # 対応OS (Windows, macOS等)
            'license_term',         # ライセンス期間 (1年, 3年等)
            'device_count',         # 利用可能台数
            'edition',              # エディション (Standard, Pro等)
            'is_download',          # ダウンロード版フラグ
            
            # --- 🚀 レーダーチャート・スコアリング ---
            'score_cpu',            # CPU点数 (1-100)
            'score_gpu',            # GPU点数 (1-100)
            'score_cost',           # コスパ点数 (1-100)
            'score_portable',       # 携帯性点数 (1-100)
            'score_ai',             # AI性能点数 (1-100)
            'radar_chart',          # Recharts等でそのまま使える形式
            
            # --- AI判定・メタ情報 ---
            'target_segment',
            'is_ai_pc',
            'spec_score',           # 総合点
            'ai_summary',           # 記事要約
            'ai_content',           # 記事本文
            
            # --- ステータス・メタ情報 ---
            'attributes',
            'price_history',        # 📈 価格履歴フィールド
            'rank',                 # 🏆 ランキング順位
            'affiliate_url',
            'affiliate_updated_at',
            'stock_status',
            'is_posted',
            'is_active',
            'last_spec_parsed_at',  # スペック解析実行日
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    # --- 📈 直近30件の価格履歴を取得するメソッド ---
    def get_price_history(self, obj):
        # 古い順に取得（グラフ描画用）
        histories = PriceHistory.objects.filter(product=obj).order_by('recorded_at')[:30]
        return PriceHistorySerializer(histories, many=True).data

    # --- 📊 レーダーチャート用データをフロントエンドで扱いやすく整形 ---
    def get_radar_chart(self, obj):
        """
        Next.js側のRecharts等でそのまま流し込める形式の配列を返します。
        """
        # 値がNoneの場合は0を返すようにガード
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]