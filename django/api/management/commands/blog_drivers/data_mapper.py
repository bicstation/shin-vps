# -*- coding: utf-8 -*-
import logging
from api.models.article import Article

logger = logging.getLogger(__name__)

class ArticleMapper:
    @staticmethod
    def create_article(site_id, title, body_text, source_url, content_type='post', **kwargs):
        """最新エンジンが要求する：新規記事をDBに作成し、そのIDを返す"""
        try:
            article = Article.objects.create(
                site=site_id,
                title=title,
                body_text=body_text,
                source_url=source_url,
                content_type=content_type,
                extra_metadata=kwargs.get('extra_metadata', {})
            )
            return article.id
        except Exception as e:
            print(f"🔥 [ArticleMapper] create_article Error: {str(e)}")
            return None

    @staticmethod
    def save_post_result(article_id, blog_type=None, post_url=None, is_published=True, **kwargs):
        """投稿完了後の最終ステータス（公開済フラグなど）を反映する"""
        try:
            article = Article.objects.get(id=article_id)
            article.is_exported = is_published
            if not article.extra_metadata: article.extra_metadata = {}
            if post_url: article.extra_metadata['post_url'] = post_url
            article.save()
            return True
        except Exception as e:
            print(f"🔥 [ArticleMapper] save_post_result Error: {str(e)}")
            return False

    @staticmethod
    def check_exists(site_id, source_url):
        return Article.objects.filter(site=site_id, source_url=source_url).exists()