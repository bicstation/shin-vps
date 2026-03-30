# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/api/management/commands/blog_drivers/data_mapper.py
import logging
from api.models.article import Article

logger = logging.getLogger(__name__)

class ArticleMapper:
    @staticmethod
    def create_article(site_id, title, body_text, source_url, main_image_url=None, content_type='post', **kwargs):
        """
        最新エンジンが要求する：新規記事をDBに作成し、そのIDを返す
        修正内容: main_image_url を引数に追加し、DB作成時に確実にセットするように変更
        """
        try:
            # 🚀 万が一画像URLが空だった場合、DB制約エラーを防ぐためのフォールバック
            final_img = main_image_url or kwargs.get('source_img') or "https://images.unsplash.com/photo-1518770660439-4636190af475"

            article = Article.objects.create(
                site=site_id,
                title=title,
                body_text=body_text,
                main_image_url=final_img,  # 👈 ここが重要！DBの NOT NULL 制約を突破します
                source_url=source_url,
                content_type=content_type,
                extra_metadata=kwargs.get('extra_metadata', {})
            )
            return article.id
        except Exception as e:
            # printだとコンテナログで見やすいですが、loggerも併用
            print(f"🔥 [ArticleMapper] create_article Error: {str(e)}")
            return None

    @staticmethod
    def save_post_result(article_id, blog_type=None, post_url=None, is_published=True, **kwargs):
        """投稿完了後の最終ステータス（公開済フラグなど）を反映する"""
        try:
            article = Article.objects.get(id=article_id)
            article.is_exported = is_published
            
            # メタデータの初期化と更新
            meta = article.extra_metadata or {}
            if post_url: 
                meta['post_url'] = post_url
            if blog_type:
                meta['blog_type'] = blog_type
            
            article.extra_metadata = meta
            article.save()
            return True
        except Exception as e:
            print(f"🔥 [ArticleMapper] save_post_result Error: {str(e)}")
            return False

    @staticmethod
    def check_exists(site_id, source_url):
        """重複チェック"""
        return Article.objects.filter(site=site_id, source_url=source_url).exists()