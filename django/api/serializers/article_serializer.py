# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/serializers/article_serializer.py

from rest_framework import serializers
from ..models.article import Article

class ArticleSerializer(serializers.ModelSerializer):
    """
    🔱 BICSTATION API v5.0 [ULTIMATE SERIALIZER]
    - 4サイト統合配信記事(Article)用のベースシリアライザー。
    - v5.0新カラム（is_adult, 配信フラグ, JSONメディア）に完全対応。
    - 後方互換性：images_jsonから main_image_url を動的に生成。
    - 一覧取得(list)時は、重い本文カラムを除外してレスポンス速度を最大化します。
    """
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    
    # 🚨 旧フロントエンドとの互換性を維持するための動的フィールド
    main_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        # 🚨 一覧表示用の軽量フィールドセット
        fields = [
            'id', 
            'is_adult', 'show_on_main', 'show_on_satellite',
            'site', 'site_display',
            'content_type', 'content_type_display',
            'title', 
            'main_image_url',  # 旧フロントエンド用（動的生成）
            'images_json', 'videos_json',  # 新JSONメディアセット
            'source_url', 
            'extra_metadata', 
            'is_exported', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'site_display', 'content_type_display')

    def get_main_image_url(self, obj):
        """
        images_json 配列の最初の要素の 'url' を main_image_url として返却する。
        これにより、フロントエンド側の変更なしで画像表示を維持します。
        """
        if obj.images_json and isinstance(obj.images_json, list) and len(obj.images_json) > 0:
            first_image = obj.images_json[0]
            if isinstance(first_image, dict):
                return first_image.get('url')
        # images_jsonが空の場合のフォールバック（移行漏れ対策）
        return getattr(obj, 'main_image_url', None) if hasattr(obj, 'main_image_url') else None

    def validate_source_url(self, value):
        """
        取得元URLの重複チェック（新規作成時のみ）
        """
        if self.instance is None:
            # 同一サイト内での重複をチェック
            # site = self.initial_data.get('site')
            # if Article.objects.filter(site=site, source_url=value).exists():
            
            # 全サイト横断での重複チェック（より厳格な防衛）
            if Article.objects.filter(source_url=value).exists():
                raise serializers.ValidationError("このURLの記事は既にデータベースに存在します。")
        return value

class ArticleDetailSerializer(ArticleSerializer):
    """
    🔱 BICSTATION API v5.0 [DETAIL SERIALIZER]
    - 個別記事取得(retrieve)時に、メイン用およびサテライト用のAI本文を同梱します。
    """
    class Meta(ArticleSerializer.Meta):
        # 親のフィールドリストに、用途別の独立した本文カラムを追加
        # body_text は廃止予定だが、移行期間中は必要に応じて追加可能
        fields = ArticleSerializer.Meta.fields + ['body_main', 'body_satellite']