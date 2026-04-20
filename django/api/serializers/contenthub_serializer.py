# -*- coding: utf-8 -*-
"""
ContentHub Serializer
Path: /home/maya/dev/shin-vps/django/api/serializers/contenthub_serializer.py

Handling serialization for integrated content management, including 
AI-generated metadata and multi-site distribution status.
"""

from rest_framework import serializers
from api.models import ContentHub  # モデルが定義されている前提

class ContentHubSerializer(serializers.ModelSerializer):
    """
    コンテンツハブ専用シリアライザー
    AI生成データ、ソースURL、各サイトへの配信ステータスを管理します。
    """
    
    # 読み取り専用フィールド（自動生成されるプロパティなどがあれば）
    created_at_display = serializers.DateTimeField(source='created_at', format='%Y-%m-%d %H:%M:%S', read_only=True)
    
    class Meta:
        model = ContentHub
        fields = [
            'id',
            'title',            # 記事タイトル
            'content',          # 記事本文（MarkdownまたはHTML）
            'source_url',       # 取得元URL
            'status',           # 全体ステータス (draft, pending, published, archived)
            
            # AIメタデータ (JSONField想定)
            'ai_metadata',      # {'summary': '...', 'keywords': [], 'sentiment': '...'}
            
            # 各ドメインへの配信フラグ/ステータス
            'is_pushed_general',
            'is_pushed_adult',
            'is_pushed_bs',
            
            # タイムスタンプ
            'created_at',
            'updated_at',
            'created_at_display',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_ai_metadata(self, value):
        """
        AIメタデータのバリデーション（必要に応じて）
        """
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("ai_metadata must be a dictionary.")
        return value

class ContentHubListSerializer(serializers.ModelSerializer):
    """
    一覧表示用の軽量シリアライザー
    本文(content)を除外してレスポンスを高速化します。
    """
    class Meta:
        model = ContentHub
        fields = [
            'id', 
            'title', 
            'status', 
            'source_url', 
            'is_pushed_general', 
            'is_pushed_adult', 
            'is_pushed_bs', 
            'created_at'
        ]