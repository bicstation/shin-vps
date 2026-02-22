# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/adult_serializers.py

import re
import logging
from rest_framework import serializers
from api.models import (
    Maker, Label, Director, Series, Genre, Actress, Author,
    AdultProduct, AdultAttribute, LinkshareProduct, FanzaFloorMaster,
    AdultActressProfile
)

logger = logging.getLogger(__name__)

# --------------------------------------------------------------------------
# 0. 🚀 階層マスタ用シリアライザー (Next.jsナビゲーション用)
# --------------------------------------------------------------------------
class FanzaFloorMasterSerializer(serializers.ModelSerializer):
    """
    FANZA/DMMのサービス・フロア階層を表示するためのシリアライザー。
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
# 1. マスターデータ用ベースシリアライザー (女優プロフィール統合)
# --------------------------------------------------------------------------
class BaseMasterSerializer(serializers.ModelSerializer):
    """
    辞書型(values)取得とオブジェクト型の両方に対応した基底クラス。
    タクソノミー集計View(AdultTaxonomyIndexAPIView)からの出力を正確に変換する。
    """
    id = serializers.IntegerField(read_only=True)
    slug = serializers.CharField(read_only=True)
    ruby = serializers.CharField(read_only=True)
    api_source = serializers.SerializerMethodField() 
    product_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        model = None
        fields = ('id', 'name', 'slug', 'ruby', 'api_source', 'product_count')

    def get_api_source(self, obj):
        if isinstance(obj, dict):
            val = obj.get('tmp_source') or obj.get('api_source') or 'common'
        else:
            val = getattr(obj, 'api_source', 'common')
        return val.lower() if val else 'common'

    def to_representation(self, instance):
        if isinstance(instance, dict):
            return {
                'id': instance.get('tmp_id') or instance.get('id'),
                'name': instance.get('tmp_name') or instance.get('name'),
                'slug': instance.get('tmp_slug') or instance.get('slug') or instance.get('tmp_name'),
                'ruby': instance.get('tmp_ruby') or instance.get('ruby', ''),
                'api_source': self.get_api_source(instance),
                'product_count': instance.get('product_count', 0)
            }
        return super().to_representation(instance)

# --- 各マスタの継承 ---
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
class AuthorSerializer(BaseMasterSerializer):
    class Meta(BaseMasterSerializer.Meta): model = Author

# --- 💡 女優用シリアライザー (黄金比スコアを統合) ---
class ActressSerializer(BaseMasterSerializer):
    """
    Actressモデルと紐付いた AdultActressProfile から黄金比スコアを取得して表示する。
    辞書型(values)とオブジェクト型の両方でスコアをマッピングする。
    """
    ai_power_score = serializers.IntegerField(read_only=True, required=False)
    score_style = serializers.IntegerField(read_only=True, required=False)
    cup = serializers.CharField(read_only=True, required=False)

    class Meta(BaseMasterSerializer.Meta):
        model = Actress
        # 基底クラスのフィールド + AIスコア系を追加
        fields = BaseMasterSerializer.Meta.fields + ('ai_power_score', 'score_style', 'cup')

    def to_representation(self, instance):
        # まず基底クラス（BaseMasterSerializer）の共通処理を呼び出す
        ret = super().to_representation(instance)

        if isinstance(instance, dict):
            # 💡 辞書型（values()取得）の場合: 注釈(annotate)などで取得した値をセット
            ret['ai_power_score'] = instance.get('ai_power_score')
            ret['score_style'] = instance.get('score_style')
            ret['cup'] = instance.get('cup')
        else:
            # 💡 オブジェクト型の場合: 1対1リレーション(profile)から取得
            profile = getattr(instance, 'profile', None)
            if profile:
                ret['ai_power_score'] = profile.ai_power_score
                ret['score_style'] = profile.score_style
                ret['cup'] = profile.cup
            else:
                ret['ai_power_score'] = None
                ret['score_style'] = None
                ret['cup'] = None
        
        return ret

# --------------------------------------------------------------------------
# 2. 属性・タグ用シリアライザー
# --------------------------------------------------------------------------
class AdultAttributeSerializer(serializers.ModelSerializer):
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
    product_count = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultAttribute
        fields = ('id', 'attr_type', 'attr_type_display', 'name', 'slug', 'order', 'product_count')

# --------------------------------------------------------------------------
# 3. 統合商品データ用シリアライザー (AI解析・黄金比を完全統合)
# --------------------------------------------------------------------------
class AdultProductSerializer(serializers.ModelSerializer): 
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
            'attributes', 'ai_content', 'ai_summary', 'ai_catchcopy',
            'target_segment', 'ai_chat_comments',
            'ai_score_visual', 'ai_score_story', 'ai_score_erotic',
            'score_visual', 'score_story', 'score_erotic', 'score_rarity', 'score_cost_performance', 
            'score_fetish', 'spec_score', 'rel_score', 
            'is_active', 'updated_at'
        )

    def get_thumbnail(self, obj):
        imgs = getattr(obj, 'image_url_list', {})
        if isinstance(imgs, dict):
            return imgs.get('large') or imgs.get('main') or imgs.get('list')
        if isinstance(imgs, list) and len(imgs) > 0:
            return imgs[0]
        return None

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        
        # Next.js側との整合性（小文字統一）
        for key in ['api_source', 'api_service', 'floor_code']:
            if ret.get(key):
                ret[key] = ret[key].lower()
        
        # 欠損補完: api_source が空の場合は floor_master から補完
        if not ret.get('api_source') and instance.floor_master:
            ret['api_source'] = instance.floor_master.site_code.lower()

        # AI解析データのデフォルト値補完
        if ret.get('ai_summary') is None:
            ret['ai_summary'] = "解析準備中..."
        if ret.get('ai_catchcopy') is None:
            ret['ai_catchcopy'] = instance.title

        return ret