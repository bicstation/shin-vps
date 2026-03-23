# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/serializers/article_serializer.py

from rest_framework import serializers
from ..models.article import Article

class ArticleSerializer(serializers.ModelSerializer):
    """
    4サイト統合配信記事(Article)用のベースシリアライザー。
    共通のバリデーションと表示用ラベルのロジックを保持します。
    """
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)

    class Meta:
        model = Article
        # 基本フィールドから「body_text」を除いたものをデフォルトにする（軽量化の肝）
        fields = [
            'id', 
            'site', 'site_display',
            'content_type', 'content_type_display',
            'title', 
            # 'body_text',  <-- ここでは除外（一覧用）
            'main_image_url', 'source_url', 
            'extra_metadata', 
            'is_exported', 
            'created_at', 'updated_at'
        ]
        read_only_fields = ('id', 'created_at', 'updated_at', 'site_display', 'content_type_display')

    def validate_source_url(self, value):
        """
        取得元URLの重複チェックをカスタムバリデーションとして定義
        """
        if self.instance is None:  # 新規作成時のみチェック
            if Article.objects.filter(source_url=value).exists():
                raise serializers.ValidationError("このURLの記事は既にデータベースに存在します。")
        return value

class ArticleDetailSerializer(ArticleSerializer):
    """
    【個別記事用】body_text を含むフルセットのシリアライザー
    """
    class Meta(ArticleSerializer.Meta):
        # 親のフィールドリストに body_text を追加
        fields = ArticleSerializer.Meta.fields + ['body_text']