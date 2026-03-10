# -*- coding: utf-8 -*-
from rest_framework import serializers
from ..models.article import Article

class ArticleSerializer(serializers.ModelSerializer):
    """
    4サイト統合配信記事(Article)用のシリアライザー
    """
    # 選択肢のラベルを表示用のフィールドとして追加（任意）
    site_display = serializers.CharField(source='get_site_display', read_only=True)
    content_type_display = serializers.CharField(source='get_content_type_display', read_only=True)

    class Meta:
        model = Article
        # すべてのフィールドを対象にする
        fields = [
            'id', 
            'site', 'site_display',
            'content_type', 'content_type_display',
            'title', 'body_text', 
            'main_image_url', 'source_url', 
            'extra_metadata', 
            'is_exported', 
            'created_at', 'updated_at'
        ]
        # 自動生成されるフィールドは読み取り専用に設定
        read_only_fields = ('id', 'created_at', 'updated_at', 'site_display', 'content_type_display')

    def validate_source_url(self, value):
        """
        取得元URLの重複チェックをカスタムバリデーションとして定義
        (モデルの unique=True でも弾けますが、ここで制御するとエラーメッセージが扱いやすくなります)
        """
        if self.instance is None:  # 新規作成時のみチェック
            if Article.objects.filter(source_url=value).exists():
                raise serializers.ValidationError("このURLの記事は既にデータベースに存在します。")
        return value