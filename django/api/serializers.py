# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers.py

from rest_framework import serializers
from django.utils import timezone
from .models import (
    AdultProduct, LinkshareProduct, Maker, Genre, Actress, 
    Label, Director, Series, User, ProductComment
)
from .models.pc_products import PCProduct, PCAttribute, PriceHistory
from .models.pc_stats import ProductDailyStats

# --------------------------------------------------------------------------
# 0. ユーザー & コメント用シリアライザ
# --------------------------------------------------------------------------

class UserSerializer(serializers.ModelSerializer):
    """🚀 ユーザー情報の取得・更新・および新規登録用"""
    
    # 新規登録時のみパスワードを受け取る（出力には含まない write_only）
    password = serializers.CharField(write_only=True, required=False, style={'input_type': 'password'})

    class Meta:
        model = User
        # 🚀 site_group と origin_domain を含め、フロントエンドの siteConfig と同期可能にします
        fields = (
            'id', 'username', 'email', 'password', 'profile_image', 
            'bio', 'site_group', 'origin_domain'
        )
        # IDやユーザー名などは基本変更不可。site_groupなどはシステム更新のため除外
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
    date = serializers.DateTimeField(source='recorded_at', format="%Y-%m-%d")

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
            'id', 'unique_id', 'site_prefix', 'maker', 'maker_name',
            'raw_genre', 'unified_genre', 'name', 'price', 'url',
            'image_url', 'description', 'cpu_model', 'gpu_model',
            'memory_gb', 'storage_gb', 'display_info', 'npu_tops',
            'cpu_socket', 'motherboard_chipset', 'ram_type',
            'power_recommendation', 'os_support', 'license_term',
            'device_count', 'edition', 'is_download', 'score_cpu',
            'score_gpu', 'score_cost', 'score_portable', 'score_ai',
            'radar_chart', 'target_segment', 'is_ai_pc', 'spec_score',
            'ai_summary', 'ai_content', 'attributes', 'comments',
            'price_history', 'stats_history', 'affiliate_url',
            'affiliate_updated_at', 'stock_status', 'is_posted',
            'is_active', 'last_spec_parsed_at', 'created_at', 'updated_at',
        )
        read_only_fields = fields

    # --- 📈 価格履歴の取得 ---
    def get_price_history(self, obj):
        histories = PriceHistory.objects.filter(product=obj).order_by('-recorded_at')[:30]
        # reversedしたものをリストにして返す
        return PriceHistorySerializer(list(reversed(histories)), many=True).data

    # --- 📉 注目度推移の取得 ---
    def get_stats_history(self, obj):
        stats = ProductDailyStats.objects.filter(product=obj).order_by('-date')[:30]
        # reversedしたものをリストにして返す
        return ProductDailyStatsSerializer(list(reversed(stats)), many=True).data

    # --- 📊 レーダーチャート用データの整形 ---
    def get_radar_chart(self, obj):
        return [
            {"subject": "CPU性能", "value": obj.score_cpu or 0, "fullMark": 100},
            {"subject": "GPU性能", "value": obj.score_gpu or 0, "fullMark": 100},
            {"subject": "コスパ", "value": obj.score_cost or 0, "fullMark": 100},
            {"subject": "携帯性", "value": obj.score_portable or 0, "fullMark": 100},
            {"subject": "AI性能", "value": obj.score_ai or 0, "fullMark": 100},
        ]