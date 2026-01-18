# -*- coding: utf-8 -*-
from rest_framework import serializers
from .models import AdultProduct, LinkshareProduct, Maker, Genre, Actress, Label, Director, Series 
from .models.pc_products import PCProduct, PCAttribute

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
# 4. PC製品モデル (PCProductSerializer)
# --------------------------------------------------------------------------

class PCProductSerializer(serializers.ModelSerializer):
    attributes = PCAttributeSerializer(many=True, read_only=True)

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
            
            # --- AI解析抽出スペック ---
            'cpu_model',
            'gpu_model',
            'memory_gb',
            'storage_gb',
            'display_info',
            'npu_tops',
            
            # --- 🚀 自作PC提案・相性用データ（追加分） ---
            'cpu_socket',           # CPUソケット (LGA1700等)
            'motherboard_chipset',  # 推奨チップセット
            'ram_type',             # メモリ規格 (DDR5等)
            'power_recommendation', # 推奨電源容量
            
            # --- AI判定・スコアリング ---
            'target_segment',
            'is_ai_pc',
            'spec_score',
            'ai_summary',           # 記事要約
            'ai_content',           # 記事本文
            
            # --- ステータス・メタ情報 ---
            'attributes',
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