# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import AdultProduct, LinkshareProduct, AdultAttribute
from .master_serializers import (
    MakerSerializer, LabelSerializer, DirectorSerializer,
    SeriesSerializer, GenreSerializer, ActressSerializer
)

# 🚀 属性タグ用のシリアライザー
class AdultAttributeSerializer(serializers.ModelSerializer):
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
    
    # 🚀 詳細属性タグ
    attributes = AdultAttributeSerializer(many=True, read_only=True)

    # 🎥 JSONField の明示的定義
    image_url_list = serializers.JSONField(required=False, allow_null=True)
    sample_movie_url = serializers.JSONField(required=False, allow_null=True)
    
    # 🤖 AI生成コンテンツ & 解析スコア
    # 💡 models.py では TextField や IntegerField ですが、
    # フロントエンドとの柔軟なやり取りや、null/空文字の安全なハンドリングのために定義を維持します。
    ai_content = serializers.CharField(required=False, allow_null=True)
    product_description = serializers.CharField(required=False, allow_null=True) # 🚀 新設カラムを追加
    
    # 📊 解析スコア (数値型として明示)
    score_visual = serializers.IntegerField(required=False, allow_null=True)
    score_story = serializers.IntegerField(required=False, allow_null=True)
    score_cost = serializers.IntegerField(required=False, allow_null=True)
    score_erotic = serializers.IntegerField(required=False, allow_null=True)
    score_rarity = serializers.IntegerField(required=False, allow_null=True)
    spec_score = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'product_description', # 🚀 紹介文を追加
            'release_date', 'affiliate_url', 'price', 
            'image_url_list', 'sample_movie_url', # 🎥 動画
            'api_source',
            'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'attributes', # 🏷️ 属性タグ
            
            # 🤖 AI生成コンテンツ
            'ai_content', 'ai_summary', 'target_segment',
            
            # 📊 解析スコア (レーダーチャート用)
            'score_visual', 'score_story', 'score_cost', 
            'score_erotic', 'score_rarity', 'spec_score',
            
            # ステータス系
            'is_active', 'is_posted', 'last_spec_parsed_at', 'updated_at',
        )
        read_only_fields = fields 

class LinkshareProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = LinkshareProduct 
        fields = (
            'id', 'sku', 'product_name', 'availability', 
            'affiliate_url', 'image_url', 'merchant_id', 'updated_at',
        )
        read_only_fields = fields