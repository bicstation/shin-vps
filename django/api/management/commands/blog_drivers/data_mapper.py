# -*- coding: utf-8 -*-
from datetime import datetime
from django.utils import timezone

class ArticleMapper:
    @staticmethod
    def save_post_result(b_type, ext, data, success_status):
        """
        AI生成データと投稿結果をDBに保存する
        """
        try:
            # 循環インポート回避のため、実行時にインポート
            from api.models.article import Article
            
            # サイト名の識別子を生成
            site_identifier = f'bicstation_{b_type}'
            
            # Djangoモデルにマッピング
            # アダルト系RSSからの情報を Article モデルのフィールドに合わせて保存
            article = Article.objects.create(
                site=site_identifier,
                content_type='news',
                title=ext.get('title_g') or data.get('title'),
                body_text=ext.get('cont_g') or "",
                main_image_url=data.get('img'),
                source_url=data.get('url'),
                is_exported=success_status,
                created_at=timezone.now() # naive datetime警告対策
            )
            return True, article.id
        except Exception as e:
            print(f"   ❗ DB Mapping Error: {str(e)}")
            return False, None

    @staticmethod
    def format_for_markdown(ext, data):
        """
        Markdown出力用のフロントマター作成ロジック
        """
        return {
            "title": ext.get('title_g', data.get('title')),
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "image": data.get('img', ''),
            "source": data.get('url', ''),
            "content": f"{ext.get('summary', '')}\n\n{ext.get('cont_g', '')}"
        }