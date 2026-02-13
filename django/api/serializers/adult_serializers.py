# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import (
    # 基本モデル
    Maker, Label, Director, Series, Genre, Actress, Author,
    # 商品・属性モデル
    AdultProduct, AdultAttribute, FanzaProduct
)

# 💡 PCAttribute は general_serializers で主に使われるが、
# 相互参照を避けるため、定義のみこちらで try-except 処理を維持
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
    api_source により、どのドメイン由来のデータか判別可能にします。
    """
    slug = serializers.CharField(read_only=True)
    ruby = serializers.CharField(read_only=True)
    api_source = serializers.CharField(read_only=True) 
    product_count = serializers.IntegerField(read_only=True, required=False)
    
    class Meta:
        fields = ('id', 'name', 'slug', 'ruby', 'api_source', 'product_count')
        read_only_fields = fields

# --- 各マスターモデルの実装 (個別のメタクラス定義) ---
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
# 2. 属性・タグ用シリアライザー (詳細スペック)
# --------------------------------------------------------------------------

class AdultAttributeSerializer(serializers.ModelSerializer):
    """
    作品の身体的特徴やシチュエーションタグ用。
    AI解析によって付与された '属性' をフロントエンドに渡します。
    """
    attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)

    class Meta:
        model = AdultAttribute
        fields = (
            'id', 
            'attr_type', 
            'attr_type_display', 
            'name', 
            'slug', 
            'order'
        )
        read_only_fields = fields

if PCAttribute:
    class PCAttributeSerializer(serializers.ModelSerializer):
        """PC製品用の属性（本来はgeneral用だが、モデル構成上ここに定義）"""
        attr_type_display = serializers.CharField(source='get_attr_type_display', read_only=True)
        
        class Meta:
            model = PCAttribute
            fields = (
                'id', 
                'attr_type', 
                'attr_type_display', 
                'name', 
                'slug', 
                'order'
            )
            read_only_fields = fields

# --------------------------------------------------------------------------
# 3. 商品データ用シリアライザー (メインエンジン)
# --------------------------------------------------------------------------

class AdultProductSerializer(serializers.ModelSerializer): 
    """
    正規化された DUGA/DMM/FANZA データを共通で扱うためのメインシリアライザー。
    View側で計算された関連度スコア (rel_score) もオプションで含めます。
    """
    # 各種リレーションモデルのネスト
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True) 
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    attributes = AdultAttributeSerializer(many=True, read_only=True)

    # 💡 共通化フィールド
    display_id = serializers.CharField(source='product_id_unique', read_only=True)
    
    # 💡 [NEW] 関連度スコア：Viewのannotateで計算されたスコアを受け取る
    # これにより、なぜ関連商品として選ばれたかの「重み」をフロント側で把握可能
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 
            'product_id_unique', 
            'display_id', 
            'title', 
            'product_description',
            'release_date', 
            'affiliate_url', 
            'price', 
            'image_url_list', 
            'sample_movie_url',
            'api_source', 
            'maker', 
            'label', 
            'director', 
            'series', 
            'genres', 
            'actresses',
            'attributes', 
            'ai_content', 
            'ai_summary', 
            'target_segment',
            'score_visual', 
            'score_story', 
            'score_cost', 
            'score_erotic', 
            'score_rarity', 
            'spec_score',
            'rel_score',  # 👈 スコアリングフィールドを追加
            'is_active', 
            'is_posted', 
            'last_spec_parsed_at', 
            'updated_at',
        )
        read_only_fields = ('id', 'product_id_unique', 'updated_at', 'rel_score')

class FanzaProductSerializer(serializers.ModelSerializer):
    """
    FANZA Direct API 用の個別シリアライザー。
    既存の FanzaProduct モデルのデータ構造を維持しつつ、共通インターフェースを提供。
    """
    maker = MakerSerializer(read_only=True)
    label = LabelSerializer(read_only=True)
    director = DirectorSerializer(read_only=True)
    series = SeriesSerializer(read_only=True)
    genres = GenreSerializer(many=True, read_only=True)
    actresses = ActressSerializer(many=True, read_only=True)
    authors = AuthorSerializer(many=True, read_only=True)

    # 💡 フロントエンド統一用エイリアス
    display_id = serializers.CharField(source='unique_id', read_only=True)
    
    # 💡 共通化：FanzaProductにも api_source を定義
    api_source = serializers.SerializerMethodField()
    
    # View側でのannotate対応用（将来的な拡張）
    rel_score = serializers.IntegerField(read_only=True, required=False)

    class Meta:
        model = FanzaProduct
        fields = (
            'id', 
            'unique_id', 
            'display_id', 
            'content_id', 
            'product_id',
            'site_code', 
            'service_code', 
            'floor_code', 
            'floor_name',
            'title', 
            'url', 
            'affiliate_url', 
            'release_date', 
            'volume',
            'price', 
            'price_info', 
            'review_count', 
            'review_average',
            'image_urls', 
            'sample_images', 
            'sample_movie',
            'api_source', 
            'maker', 
            'label', 
            'series', 
            'director', 
            'genres', 
            'actresses', 
            'authors',
            'product_description', 
            'ai_summary',
            'score_visual', 
            'score_story', 
            'score_cost', 
            'score_erotic', 
            'score_rarity',
            'rel_score',
            'radar_chart_data', 
            'is_active', 
            'is_recommend', 
            'created_at', 
            'updated_at'
        )
        read_only_fields = ('id', 'unique_id', 'content_id', 'created_at', 'updated_at', 'rel_score')

    def get_api_source(self, obj):
        """
        site_code (FANZA/DMM) を api_source として正規化。
        フロントエンドはこの値を見て、iframeかvideoかの判定等を行います。
        """
        if hasattr(obj, 'site_code') and obj.site_code:
            return obj.site_code.upper()
        return 'FANZA'