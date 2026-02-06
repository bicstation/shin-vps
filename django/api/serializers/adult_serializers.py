# -*- coding: utf-8 -*-
from rest_framework import serializers
from api.models import AdultProduct, LinkshareProduct, AdultAttribute
from .master_serializers import (
    MakerSerializer, LabelSerializer, DirectorSerializer,
    SeriesSerializer, GenreSerializer, ActressSerializer
)

# 🚀 追加: 属性タグ用のシリアライザー
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
    # 🚀 追加: 詳細属性タグ
    attributes = AdultAttributeSerializer(many=True, read_only=True)

    class Meta:
        model = AdultProduct 
        fields = (
            'id', 'product_id_unique', 'title', 'release_date',
            'affiliate_url', 'price', 'image_url_list', 'sample_movie_url', # 🎥 動画追加
            'api_source',
            'maker', 'label', 'director', 'series', 'genres', 'actresses',
            'attributes', # 🏷️ 属性タグ追加
            
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