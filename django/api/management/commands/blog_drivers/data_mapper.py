# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/blog_drivers/data_mapper.py
from datetime import datetime
from django.utils import timezone

class ArticleMapper:
    @staticmethod
    def save_post_result(b_type, ext, data, success_status):
        """
        AI生成データと投稿結果をDBに保存する
        🛡️ Maya's Logic: サイト名識別子の正規化版
        """
        try:
            # 循環インポート回避のため、実行時にインポート
            from api.models.article import Article
            
            # ✅ 修正ポイント: 識別子の正規化
            # Next.js側のクエリ (?site=bicstation) およびモデルの SITE_CHOICES に合わせる
            # 'hatena', 'livedoor' などの投稿先に関わらず、配信対象サイト名を固定
            site_identifier = 'bicstation' 
            
            # もし将来的に site_id 自体に外部サービス名を含めたい場合は、
            # extra_metadata に入れるのが設計として正解です。
            metadata = {
                "post_service": b_type,
                "summary": ext.get('summary', ''),
                "original_title": data.get('title')
            }

            # Djangoモデルにマッピング
            # 重複防止は models.py の source_url(unique=True) が担保
            article = Article.objects.create(
                site=site_identifier,
                content_type='news',
                title=ext.get('title_g') or data.get('title'),
                body_text=ext.get('cont_g') or "",
                main_image_url=data.get('img'),
                source_url=data.get('url'),
                extra_metadata=metadata,
                is_exported=success_status,
                created_at=timezone.now()
            )
            return True, article.id
        except Exception as e:
            # unique制約（source_url）によるエラーもここでキャッチ
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