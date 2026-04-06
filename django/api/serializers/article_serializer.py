# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/serializers/article_serializer.py

from rest_framework import serializers
from ..models.article import Article

class ArticleSerializer(serializers.ModelSerializer):
    """
    🔱 BICSTATION API v5.1 [ULTIMATE SERIALIZER]
    - 4サイト統合配信記事(Article)用のベースシリアライザー。
    - v5.0新カラム（is_adult, 配信フラグ, JSONメディア）に完全対応。
    - 後方互換性：images_jsonから main_image_url を動的に生成。
    - 【最適化】一覧取得時、重い body_main は除外するが、軽量な body_satellite は含める。
    """
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)
    
    # 🚨 旧フロントエンドとの互換性を維持するための動的フィールド
    main_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Article
        # 🚨 一覧表示用のフィールドセット（body_mainのみを除外して軽量化）
        fields = [
            'id', 
            'is_adult', 'show_on_main', 'show_on_satellite',
            'site', 'site_display',
            'content_type', 'content_type_display',
            'title', 
            'body_satellite',  # ✅ 一覧でも「要約」が見れるように追加
            'main_image_url',   # 旧フロントエンド用（動的生成）
            'images_json', 'videos_json', 
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
        # images_jsonが空の場合のフォールバック
        return getattr(obj, 'main_image_url', None) if hasattr(obj, 'main_image_url') else None

    def validate_source_url(self, value):
        """
        取得元URLの重複チェック（新規作成時のみ）
        全サイト横断での重複チェックにより、コンテンツの「共食い」を防ぎます。
        """
        if self.instance is None:
            if Article.objects.filter(source_url=value).exists():
                raise serializers.ValidationError("このURLの記事は既にデータベースに存在します。")
        return value

class ArticleDetailSerializer(ArticleSerializer):
    """
    🔱 BICSTATION API v5.1 [DETAIL SERIALIZER]
    - 個別記事取得(retrieve)時に、メイン用の重厚なAI本文(HTML)を同梱します。
    """
    class Meta(ArticleSerializer.Meta):
        # 親のフィールドリスト（body_satellite入り）に、さらに body_main を追加
        fields = ArticleSerializer.Meta.fields + ['body_main']