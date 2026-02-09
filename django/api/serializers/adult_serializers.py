# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import (
    # 基本モデル
    Maker, Label, Director, Series, Genre, Actress, Author,
    # 商品・属性モデル
    AdultProduct, LinkshareProduct, AdultAttribute, FanzaProduct
)

# PCAttribute は存在しない環境でも動くように try-except
try:
    from api.models.pc_products import PCAttribute
except ImportError:
    PCAttribute = None

# --------------------------------------------------------------------------
# 1. マスターデータ用ベースシリアライザー
# --------------------------------------------------------------------------

class BaseMasterSerializer(serializers.ModelSerializer):
    """
    全てのマスターモデル（女優、ジャンル等）の共通定義。
    モデルの save() で生成された slug と ruby を確実に含めます。
    """
    # 修正ポイント: フィールド型を明示的に指定して、モデル側の SlugField のお節介を完全に無視させる
    slug = serializers.CharField(read_only=True)
    ruby = serializers.CharField(read_only=True)
    
    class Meta:
        fields = ('id', 'name', 'slug', 'ruby', 'api_source', 'product_count')
        read_only_fields = ('id', 'slug', 'ruby', 'product_count')

# --------------------------------------------------------------------------
# 2. 各マスターモデルのシリアライザー (BaseMasterを継承)
# --------------------------------------------------------------------------

class MakerSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Maker

class LabelSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Label

class DirectorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Director

class SeriesSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Series

class GenreSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Genre

class ActressSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Actress

class AuthorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta):
        model = Author

# --------------------------------------------------------------------------
# 3. 属性・タグ用シリアライザー (Adult / PC)
# --------------------------------------------------------------------------

class AdultAttributeSerializer(serializers.ModelSerializer):
    """作品の身体的特徴やシチュエーションタグ用"""
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)

    class Meta:
        model = AdultAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')
        read_only_fields = fields

if PCAttribute:
    class PCAttributeSerializer(serializers.ModelSerializer):
        attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
        class Meta:
            model = PCAttribute
            fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')
            read_only_fields = fields

# --------------------------------------------------------------------------
# 4. 商品データ用シリアライザー (マスターをネスト)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    """DUGA、旧FANZAデータ、AIレビュー投稿用の汎用シリアライザー"""
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)

    image_url_list = serializers.JSONField(required=False, allow_null=True)
    sample_movie_url = serializers.JSONField(required=False, allow_null=True)
    
    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'product_description',
            'release_date', 'affiliate_url', 'price', 
            'image_url_list', 'sample_movie_url',
            'api_source', 'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'attributes', 'ai_content', 'ai_summary', 'target_segment',
            'score_visual', 'score_story', 'score_cost', 
            'score_erotic', 'score_rarity', 'spec_score',
            'is_active', 'is_posted', 'last_spec_parsed_at', 'updated_at',
        )
        read_only_fields = ('id', 'product_id_unique', 'updated_at')

class FanzaProductSerializer(serializers.ModelSerializer):
    """FANZA APIの全フロア、複雑な価格、高画質動画に対応したシリアライザー"""
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)

    price_info = serializers.JSONField(required=False, allow_null=True)
    image_urls = serializers.JSONField(required=False, allow_null=True)
    sample_images = serializers.JSONField(required=False, allow_null=True)
    sample_movie = serializers.JSONField(required=False, allow_null=True)
    radar_chart_data = serializers.JSONField(required=False, allow_null=True)

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
        read_only_fields = ('id', 'unique_id', 'content_id', 'created_at', 'updated_at')

# --------------------------------------------------------------------------
# 5. その他
# --------------------------------------------------------------------------

class LinkshareProductSerializer(serializers.ModelSerializer):
    """アフィリエイト（物販系等）用"""
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = ('id', 'updated_at')