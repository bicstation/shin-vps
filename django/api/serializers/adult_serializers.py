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

# 💡 PCAttribute 相互参照回避の try-except 処理 (既存ロジックを維持)
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
        オブジェクト属性、または辞書キーから api_source を取得し、一貫して大文字で返却
        """
        # dict(values()経由)の場合
        if isinstance(obj, dict):
            # 💡 最適化: tmp_slug など別名でアノテートされている場合も考慮
            return obj.get('api_source', obj.get('tmp_source', 'COMMON')).upper()
        
        # モデルオブジェクトの場合
        source = getattr(obj, 'api_source', None)
        if source:
            return source.upper()
        return 'COMMON'

    def to_representation(self, instance):
        """
        💡 最適化: 辞書データ(values()アノテーション結果)が渡された場合でも
        シリアライズエラーにならないように拡張。
        TaxonomyIndexView で使用される tmp_name 等のキーも吸収します。
        """
        if isinstance(instance, dict):
            # 💡 最適化: values()で取得した際にキー名が tmp_name 等になっている場合を吸収
            data = {
                'id': instance.get('id') or instance.get('tmp_id'),
                'name': instance.get('name') or instance.get('tmp_name'),
                'slug': instance.get('slug') or instance.get('tmp_slug'),
                'ruby': instance.get('ruby') or instance.get('tmp_ruby', ''),
                'api_source': self.get_api_source(instance),
                'product_count': instance.get('product_count', 0)
            }
            return data
        return super().to_representation(instance)

# --- 各マスターモデルの実装 (BaseMasterSerializerを継承) ---
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

    def to_representation(self, instance):
        """辞書データ(values())対応を属性シリアライザーにも適用"""
        if isinstance(instance, dict):
            return {
                'id': instance.get('id') or instance.get('tmp_id'),
                'attr_type': instance.get('attr_type'),
                'attr_type_display': instance.get('attr_type_display', ''),
                'name': instance.get('name') or instance.get('tmp_name'),
                'slug': instance.get('slug') or instance.get('tmp_slug'),
                'order': instance.get('order', 0),
                'product_count': instance.get('product_count', 0)
            }
        return super().to_representation(instance)

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
    正規化された DUGA/DMM/FANZA データを統合管理。
    AIスコア、AIサマリー、複数著者(authors)に対応。
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    authors = AuthorSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)
    
    # フロントエンド統合フィールド
    display_id = serializers.CharField(source='product_id_unique', read_only=True)
    thumbnail = serializers.SerializerMethodField()
    product_url = serializers.CharField(source='affiliate_url', read_only=True)
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'display_id', 'title', 'product_description',
            'release_date', 'affiliate_url', 'product_url', 'price', 
            'image_url_list', 'thumbnail', 'sample_movie_url',
            'api_source', 'maker', 'label', 'director', 'series', 'authors', 'genres', 'actresses',
            'attributes', 'ai_content', 'ai_summary', 'target_segment',
            'score_visual', 'score_story', 'score_cost_performance', 'ranking_trend', 
            'spec_score', 'rel_score', 'is_active', 'updated_at'
        )
        read_only_fields = ('id', 'product_id_unique', 'updated_at', 'rel_score')

    def get_thumbnail(self, obj):
        """画像リストから代表画像URLを抽出"""
        imgs = obj.image_url_list
        if isinstance(imgs, list) and len(imgs) > 0:
            return imgs[0]
        if isinstance(imgs, dict):
            return imgs.get('large') or imgs.get('main')
        return None

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
    authors = AuthorSerializer(many=True, read_only=True)

    # フロントエンド統合フィールド
    display_id = serializers.CharField(source='unique_id', read_only=True)
    thumbnail = serializers.SerializerMethodField()
    product_url = serializers.CharField(source='affiliate_url', read_only=True)
    api_source = serializers.SerializerMethodField()
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = FanzaProduct
        fields = (
            'id', 'unique_id', 'display_id', 'content_id', 'site_code', 'service_code', 
            'floor_code', 'title', 'url', 'affiliate_url', 'product_url', 'release_date', 'price', 
            'review_average', 'image_urls', 'thumbnail', 'sample_images', 'sample_movie', 'api_source', 
            'maker', 'label', 'director', 'series', 'genres', 'actresses', 'authors',
            'product_description', 'ai_summary', 'spec_score', 'rel_score', 'is_active', 'updated_at'
        )
        read_only_fields = ('id', 'unique_id', 'updated_at', 'rel_score')

    def get_api_source(self, obj):
        if isinstance(obj, dict):
            return obj.get('site_code', 'FANZA').upper()
        return getattr(obj, 'site_code', 'FANZA').upper()

    def get_thumbnail(self, obj):
        """image_urls辞書から最適な画像URLを抽出"""
        imgs = obj.image_urls
        if isinstance(imgs, dict):
            return imgs.get('large') or imgs.get('list') or imgs.get('small')
        if isinstance(imgs, list) and len(imgs) > 0:
            return imgs[0]
        return None

# --------------------------------------------------------------------------
# 4. Linkshare商品シリアライザー
# --------------------------------------------------------------------------
class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct
        fields = '__all__'