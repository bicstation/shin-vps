# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import (
    # 基本マスターモデル
    Maker, Label, Director, Series, Genre, Actress, Author,
    # 商品・属性モデル
    AdultProduct, AdultAttribute, FanzaProduct,
    # LinkshareProduct
    LinkshareProduct
)

# 💡 PCAttribute 相互参照回避の try-except 処理
try:
    from api.models.pc_products import PCAttribute
except ImportError:
    PCAttribute = None

# --------------------------------------------------------------------------
# 1. マスターデータ用ベースシリアライザー (共通基盤)
# --------------------------------------------------------------------------

class BaseMasterSerializer(serializers.ModelSerializer):
    """
    全てのマスターモデル（女優、ジャンル等）の共通定義。
    辞書型データ（values()）とモデルオブジェクトの両方を安全に処理。
    """
    slug = serializers.CharField(read_only=True)
    ruby = serializers.CharField(read_only=True)
    api_source = serializers.SerializerMethodField() 
    # 集計時に渡される product_count を確実に受け取る
    product_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        fields = ('id', 'name', 'slug', 'ruby', 'api_source', 'product_count')
        read_only_fields = fields

    def get_api_source(self, obj):
        """
        オブジェクト属性、または辞書キーから api_source を取得
        """
        if isinstance(obj, dict):
            return obj.get('api_source', 'COMMON').upper()
        
        source = getattr(obj, 'api_source', None)
        if source:
            return source.upper()
        return 'COMMON'

# --- 各マスターモデルの実装 ---
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
# 2. 属性・タグ用シリアライザー
# --------------------------------------------------------------------------

class AdultAttributeSerializer(serializers.ModelSerializer):
    """
    身体的特徴やシチュエーションタグ用。
    """
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultAttribute
        fields = (
            'id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order', 'product_count'
        )
        read_only_fields = fields

if PCAttribute:
    class PCAttributeSerializer(serializers.ModelSerializer):
        attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
        class Meta:
            model = PCAttribute
            fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order')
            read_only_fields = fields

# --------------------------------------------------------------------------
# 3. 商品データ用シリアライザー (メインエンジン)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    """
    正規化された DUGA/DMM/FANZA データを統合管理
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    author = AuthorSerializer(read_only=True)  # 💡 追加：著者対応
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)
    
    display_id = serializers.CharField(source='product_id_unique', read_only=True)
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'display_id', 'title', 'product_description',
            'release_date', 'affiliate_url', 'price', 'image_url_list', 'sample_movie_url',
            'api_source', 'maker', 'label', 'director', 'series', 'author', 'genres', 'actresses',
            'attributes', 'ai_content', 'ai_summary', 'target_segment',
            'score_visual', 'score_story', 'score_cost', 'score_erotic', 'score_rarity', 
            'spec_score', 'rel_score', 'is_active', 'updated_at'
        )
        read_only_fields = ('id', 'product_id_unique', 'updated_at', 'rel_score')

class FanzaProductSerializer(serializers.ModelSerializer):
    """
    FANZA/DMM Direct API用。
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    authors = AuthorSerializer(many=True, read_only=True) # Fanzaは複数著者の可能性があるためs付き

    display_id = serializers.CharField(source='unique_id', read_only=True)
    api_source = serializers.SerializerMethodField()
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = FanzaProduct
        fields = (
            'id', 'unique_id', 'display_id', 'content_id', 'site_code', 'service_code', 
            'floor_code', 'title', 'url', 'affiliate_url', 'release_date', 'price', 
            'review_average', 'image_urls', 'sample_images', 'sample_movie', 'api_source', 
            'maker', 'label', 'director', 'series', 'genres', 'actresses', 'authors',
            'product_description', 'ai_summary', 'spec_score', 'rel_score', 'is_active', 'updated_at'
        )
        read_only_fields = ('id', 'unique_id', 'updated_at', 'rel_score')

    def get_api_source(self, obj):
        if isinstance(obj, dict):
            return obj.get('site_code', 'FANZA').upper()
        return getattr(obj, 'site_code', 'FANZA').upper()

# --------------------------------------------------------------------------
# 4. Linkshare商品シリアライザー
# --------------------------------------------------------------------------
class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct
        fields = '__all__'