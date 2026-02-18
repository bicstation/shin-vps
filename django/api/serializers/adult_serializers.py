# -*- coding: utf-8 -*-
import re
from rest_framework import serializers
from api.models import (
    Maker, Label, Director, Series, Genre, Actress, Author,
    AdultProduct, AdultAttribute, LinkshareProduct, FanzaFloorMaster
)

# 💡 PCAttribute 相互参照回避 (既存ロジックを維持)
try:
    from api.models.pc_products import PCAttribute
except ImportError:
    PCAttribute = None

# --------------------------------------------------------------------------
# 0. 🚀 階層マスタ用シリアライザー (Next.jsナビゲーション用)
# --------------------------------------------------------------------------
class FanzaFloorMasterSerializer(serializers.ModelSerializer):
    """
    FANZA/DMMのサービス・フロア階層を表示するためのシリアライザー。
    出力コードをすべて小文字に統一し、URLパラメータとの整合性を確保。
    """
    site_code = serializers.SerializerMethodField()
    service_code = serializers.SerializerMethodField()
    floor_code = serializers.SerializerMethodField()

    class Meta:
        model = FanzaFloorMaster
        fields = (
            'id', 'site_code', 'site_name', 'service_code', 'service_name',
            'floor_code', 'floor_name', 'is_active'
        )

    def get_site_code(self, obj): return obj.site_code.lower() if obj.site_code else ''
    def get_service_code(self, obj): return obj.service_code.lower() if obj.service_code else ''
    def get_floor_code(self, obj): return obj.floor_code.lower() if obj.floor_code else ''

# --------------------------------------------------------------------------
# 1. マスターデータ用ベースシリアライザー
# --------------------------------------------------------------------------
class BaseMasterSerializer(serializers.ModelSerializer):
    """
    ジャンル、女優、メーカー等のマスタデータ用。
    辞書型(values)取得とオブジェクト型の両方に対応。
    """
    slug = serializers.CharField(read_only=True)
    ruby = serializers.CharField(read_only=True)
    api_source = serializers.SerializerMethodField() 
    product_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        fields = ('id', 'name', 'slug', 'ruby', 'api_source', 'product_count')

    def get_api_source(self, obj):
        if isinstance(obj, dict):
            val = obj.get('api_source') or obj.get('tmp_source') or 'common'
        else:
            val = getattr(obj, 'api_source', 'common')
        return val.lower() if val else 'common'

    def to_representation(self, instance):
        if isinstance(instance, dict):
            return {
                'id': instance.get('id') or instance.get('tmp_id'),
                'name': instance.get('name') or instance.get('tmp_name'),
                'slug': instance.get('slug') or instance.get('tmp_slug'),
                'ruby': instance.get('ruby') or instance.get('tmp_ruby', ''),
                'api_source': self.get_api_source(instance),
                'product_count': instance.get('product_count', 0)
            }
        return super().to_representation(instance)

# 各マスタ用シリアライザーの継承（AdultProductのリレーション名に基づき一貫性を保持）
class MakerSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Maker

class LabelSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Label

class DirectorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Director

class SeriesSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Series

class GenreSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Genre

class ActressSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Actress

class AuthorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Author

# --------------------------------------------------------------------------
# 2. 属性・タグ用シリアライザー
# --------------------------------------------------------------------------
class AdultAttributeSerializer(serializers.ModelSerializer):
    """作品タグ（身体的特徴、シチュエーション等）用"""
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order', 'product_count')

# --------------------------------------------------------------------------
# 3. 統合商品データ用シリアライザー (AdultProduct 一本化)
# --------------------------------------------------------------------------
class AdultProductSerializer(serializers.ModelSerializer): 
    """
    FANZA / DMM / DUGA すべてのデータを統合して返却するメインシリアライザー。
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    authors = AuthorSerializer(many=True, read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)
    floor_master = FanzaFloorMasterSerializer(read_only=True)
    
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
            'api_source', 'api_service', 'floor_code', 'floor_master',
            'maker', 'label', 'director', 'series', 'authors', 'genres', 'actresses',
            'attributes', 'ai_content', 'ai_summary', 'target_segment', 'ai_chat_comments',
            'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance', 
            'score_fetish', 'spec_score', 'rel_score', 
            'is_active', 'updated_at'
        )

    def get_thumbnail(self, obj):
        """画像データ形式（JSON辞書/リスト）を判別して最適なURLを返却"""
        imgs = getattr(obj, 'image_url_list', {})
        if isinstance(imgs, dict):
            # large -> main -> list の順で優先。FANZAやDUGAのキー名の違いを吸収。
            return imgs.get('large') or imgs.get('main') or imgs.get('list')
        if isinstance(imgs, list) and len(imgs) > 0:
            return imgs[0]
        return None

    def to_representation(self, instance):
        """
        出力データを正規化。
        1. api_source等を小文字に統一。
        2. api_sourceが空の場合の補完ロジック。
        """
        ret = super().to_representation(instance)
        
        # URLクエリパラメータとの整合性のための小文字化
        for key in ['api_source', 'api_service', 'floor_code']:
            if ret.get(key):
                ret[key] = ret[key].lower()
        
        # 💡 ソース名補完ロジック（データ移行直後などの欠損対策）
        if not ret.get('api_source') and instance.floor_master:
            ret['api_source'] = instance.floor_master.site_code.lower()

        return ret

# --------------------------------------------------------------------------
# 4. Linkshare商品シリアライザー
# --------------------------------------------------------------------------
class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct
        fields = '__all__'