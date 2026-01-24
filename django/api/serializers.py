# -*- coding: utf-8 -*-
from rest_framework import serializers
from django.utils import timezone
from .models import (
    AdultProduct, LinkshareProduct, Maker, Genre, Actress, 
    Label, Director, Series, User, ProductComment
)
from .models.pc_products import PCProduct, PCAttribute, PriceHistory
from .models.pc_stats import ProductDailyStats

# --------------------------------------------------------------------------
# 0. ユーザー & コメント用シリアライザ (新規追加)
# --------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """ユーザー情報の取得・更新用"""
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'profile_image', 'bio')
        read_only_fields = ('id', 'username', 'email')

class ProductCommentSerializer(serializers.ModelSerializer):
    """製品コメント用。投稿時はログインユーザーを自動紐付け"""
    user_details = UserSerializer(source='user', read_only=True)
    created_at = serializers.DateTimeField(format="%Y/%m/%d %H:%M", read_only=True)

    class Meta:
        model = ProductComment
        fields = ('id', 'product', 'user', 'user_details', 'rating', 'content', 'created_at')
        read_only_fields = ('user',) # View側で request.user から設定するため

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
    date = serializers.SerializerMethodField()

    class Meta:
        model = PriceHistory
        fields = ('date', 'price')

    def get_date(self, obj):
        return obj.recorded_at.strftime('%m/%d')

# --- 🚀 注目度・統計推移用シリアライザ ---
class ProductDailyStatsSerializer(serializers.ModelSerializer):
    formatted_date = serializers.DateField(source='date', format="%m/%d")

    class Meta:
        model = ProductDailyStats
        fields = ('formatted_date', 'pv_count', 'ranking_score', 'daily_rank')

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
    comments = ProductCommentSerializer(many=True, read_only=True) # 💬 コメント一覧を追加
    
    # --- カスタムフィールド設定 ---
    price_history = serializers.SerializerMethodField()
    stats_history = serializers.SerializerMethodField()
    radar_chart = serializers.SerializerMethodField()
    maker_name = serializers.CharField(source='maker', read_only=True)

    class Meta:
        model = PCProduct
        fields = (
            'id',
            'unique_id',
            'site_prefix',
            'maker',
            'maker_name',
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
            
            # --- 自作PC提案・相性用データ ---
            'cpu_socket',
            'motherboard_chipset',
            'ram_type',
            'power_recommendation',
            
            # --- ソフトウェア・ライセンス用データ ---
            'os_support',
            'license_term',
            'device_count',
            'edition',
            'is_download',
            
            # --- レーダーチャート・スコアリング ---
            'score_cpu',
            'score_gpu',
            'score_cost',
            'score_portable',
            'score_ai',
            'radar_chart', # メソッド経由
            
            # --- AI判定・メタ情報 ---
            'target_segment',
            'is_ai_pc',
            'spec_score',
            'ai_summary',
            'ai_content',
            
            # --- ステータス・統計・履歴情報 ---
            'attributes',
            'comments',      # 💬 ここで製品詳細にコメントを含める
            'price_history', # メソッド経由 (📈 価格推移)
            'stats_history', # メソッド経由 (📉 注目度推移)
            'affiliate_url',
            'affiliate_updated_at',
            'stock_status',
            'is_posted',
            'is_active',
            'last_spec_parsed_at',
            'created_at',
            'updated_at',
        )
        read_only_fields = fields

    # --- 📈 価格履歴の取得 (直近30日分を日付順で) ---
    def get_price_history(self, obj):
        histories = PriceHistory.objects.filter(product=obj).order_by('-recorded_at')[:30]
        return PriceHistorySerializer(reversed(histories), many=True).data

    # --- 📉 注目度・ランキング履歴の取得 (直近30日分) ---
    def get_stats_history(self, obj):
        stats = ProductDailyStats.objects.filter(product=obj).order_by('-date')[:30]
        return ProductDailyStatsSerializer(reversed(stats), many=True).data

    # --- 📊 レーダーチャート用データの整形 ---
    def get_radar_chart(self, obj):
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]