# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import (
    AdultProduct, LinkshareProduct, AdultAttribute, 
    FanzaProduct, Author
)
from .master_serializers import (
    MakerSerializer, LabelSerializer, DirectorSerializer,
    SeriesSerializer, GenreSerializer, ActressSerializer, AuthorSerializer
)

# --------------------------------------------------------------------------
# 1. 🆕 FANZA 最適化商品 (FanzaProduct) シリアライザー
# --------------------------------------------------------------------------

class FanzaProductSerializer(serializers.ModelSerializer):
    """
    FANZA APIの全フロア、複雑な価格、高画質動画に対応したシリアライザー。
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    authors = AuthorSerializer(many=True, read_only=True) # 🆕 著者対応

    # JSONField の明示的な展開
    # 💡 フロント側で get_sample_movie_url 等を呼び出さずとも直接アクセス可能にします
    price_info = serializers.JSONField()
    image_urls = serializers.JSONField()
    sample_images = serializers.JSONField()
    sample_movie = serializers.JSONField()
    radar_chart_data = serializers.JSONField()

    class Meta:
        model = FanzaProduct
        fields = (
            'id', 'unique_id', 'content_id', 'product_id',
            'site_code', 'service_code', 'floor_code', 'floor_name',
            'title', 'url', 'affiliate_url', 'release_date', 'volume',
            'price_info', 'review_count', 'review_average',
            'image_urls', 'sample_images', 'sample_movie',
            'maker', 'label', 'series', 'director', 'genres', 'actresses', 'authors',
            'product_description', 'ai_summary',
            'score_visual', 'score_story', 'score_cost', 'score_erotic', 'score_rarity',
            'radar_chart_data', 'is_active', 'is_recommend', 'created_at', 'updated_at'
        )
        # AI解析による更新を許可するため、書き込み可能フィールドを指定
        read_only_fields = ('id', 'unique_id', 'content_id', 'created_at', 'updated_at')


# --------------------------------------------------------------------------
# 2. アダルト商品 (AdultProduct - 既存) シリアライザー
# --------------------------------------------------------------------------

class AdultAttributeSerializer(serializers.ModelSerializer):
    """属性タグ用のシリアライザー"""
    class Meta:
        model = AdultAttribute
        fields = ('id', 'attr_type', 'name', 'slug')
        read_only_fields = fields

class AdultProductSerializer(serializers.ModelSerializer): 
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)

    image_url_list = serializers.JSONField(required=False, allow_null=True)
    sample_movie_url = serializers.JSONField(required=False, allow_null=True)
    
    ai_content = serializers.CharField(required=False, allow_null=True)
    product_description = serializers.CharField(required=False, allow_null=True)
    
    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'product_description',
            'release_date', 'affiliate_url', 'price', 
            'image_url_list', 'sample_movie_url',
            'api_source',
            'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'attributes',
            'ai_content', 'ai_summary', 'target_segment',
            'score_visual', 'score_story', 'score_cost', 
            'score_erotic', 'score_rarity', 'spec_score',
            'is_active', 'is_posted', 'last_spec_parsed_at', 'updated_at',
        )
        read_only_fields = fields 


# --------------------------------------------------------------------------
# 3. Linkshare商品 シリアライザー
# --------------------------------------------------------------------------

class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = fields