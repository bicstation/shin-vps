# -*- coding: utf-8 -*-
"""
ContentHub Serializer (v5.5 Optimized)
Path: /home/maya/dev/shin-vps/django/api/serializers/contenthub_serializer.py

SHIN-VPS v5.5 統合コンテンツハブ (ContentHub) 専用シリアライザー
モデル定義（api/models/contenthub.py）と完全に一致させた本番用コードです。
"""

from rest_framework import serializers
from api.models.contenthub import ContentHub

class ContentHubSerializer(serializers.ModelSerializer):
    """
    コンテンツハブ詳細・更新用シリアライザー
    AI生成のMarkdown(body_md)や連載階層データを管理します。
    """
    
    # 表示用の整形フィールド
    created_at_display = serializers.DateTimeField(source='created_at', format='%Y-%m-%d %H:%M:%S', read_only=True)
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    
    # フロントエンド側が 'content' という名前でアクセスすることを考慮したエイリアス
    content = serializers.CharField(source='body_md', help_text="body_mdのエイリアス")

    class Meta:
        model = ContentHub
        fields = [
            'id',
            'site',             # 配信ドメイン (bicstation, saving, tiper, avflash)
            'site_display',     # ドメイン表示名 (read_only)
            'is_adult',         # アダルト属性
            'is_pub',           # 公開状態
            'content_type',     # 種別 (post, course, news)
            'type_display',     # 種別表示名 (read_only)
            
            # 連載・階層管理
            'series_slug',      # 連載スラグ
            'phase_title',      # フェーズ名
            'episode_no',       # エピソード番号
            
            # 本文・コンテンツ
            'title',            # タイトル
            'slug',             # URLスラグ
            'body_md',          # 本文 (Markdown)
            'content',          # 本文エイリアス (フロントエンド互換用)
            'excerpt',          # 要約/コンテキスト
            
            # メディア & 拡張データ
            'images_json',      # 画像リソース
            'extra_data',       # 拡張メタデータ (旧 ai_metadata)
            'ai_trace',         # AI生成履歴
            
            # 分類・ステータス
            'category',         # カテゴリ
            'tags',             # タグ (カンマ区切り)
            'is_reviewed',      # 検閲フラグ
            
            # タイムスタンプ
            'created_at',
            'updated_at',
            'created_at_display',
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'site_display', 'type_display')

    def validate_extra_data(self, value):
        """
        拡張メタデータのバリデーション
        """
        if value and not isinstance(value, dict):
            raise serializers.ValidationError("extra_data must be a dictionary.")
        return value

    def validate_images_json(self, value):
        """
        画像リストのバリデーション
        """
        if value and not isinstance(value, list):
            raise serializers.ValidationError("images_json must be a list.")
        return value


class ContentHubListSerializer(serializers.ModelSerializer):
    """
    コンテンツハブ一覧表示用の軽量シリアライザー
    body_mdを除外してレスポンスパフォーマンスを最大化します。
    """
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    
    class Meta:
        model = ContentHub
        fields = [
            'id',
            'site',
            'site_display',
            'is_adult',
            'is_pub',
            'content_type',
            'title',
            'slug',
            'series_slug',
            'episode_no',
            'category',
            'is_reviewed',
            'created_at'
        ]