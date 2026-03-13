# -*- coding: utf-8 -*-
import os
from datetime import datetime
from django.utils import timezone
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver

class ArticleMapper:
    # ---------------------------------------------------------
    # 1. ライブドア10サイトの配信設定
    # 🔴 各サイトの "api_key" の中に、実際のキーをコピペしてください。
    # ---------------------------------------------------------
    LIVEDOOR_CONFIGS = {
        "tiper": {
            "name": "Tiper.Live",
            "url": "https://livedoor.blogcms.jp/atompub/pbic",
            "user": "pbic",
            "api_key": "lNh8lSooOq"
        },
        "reserve": {
            "name": "先行予約！エロ動画最速ニュース",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupvWa7ikjqb4th",
            "user": "pbic",
            "api_key": "Wa7ikjqb4t"
        },
        "jukujo": {
            "name": "熟成の蜜月 ～熟女・人妻の背徳～",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmglNh8lSooOq",
            "user": "pbic",
            "api_key": "lNh8lSooOq"
        },
        "vr": {
            "name": "VR快楽研究所 360°の没入体験",
            "url": "https://livedoor.blogcms.jp/atompub/pbiclNh8lSooOq",
            "user": "pbic",
            "api_key": "lNh8lSooOq"
        },
        "idol": {
            "name": "美少女・アイドルの登竜門",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxxt0l5ighPbZ",
            "user": "pbic",
            "api_key": "t0l5ighPbZ"
        },
        "ntr": {
            "name": "背徳のシナリオ ～NTR・寝取られの深淵～",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smbvpLF5VK6LM",
            "user": "pbic",
            "api_key": "vpLF5VK6LM"
        },
        "fetish": {
            "name": "巨乳・美尻の黄金比フェチ図鑑",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdrbGfcY8d4qy",
            "user": "pbic",
            "api_key": "bGfcY8d4qy"
        },
        "wiki": {
            "name": "【神作】歴代アダルト名作まとめ",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8FKQ0MmLxzQ",
            "user": "pbic",
            "api_key": "FKQ0MmLxzQ"
        },
        "nakadashi": {
            "name": "中出し背徳…愛欲の種付け記録",
            "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqviIkXnvllQ0",
            "user": "pbic",
            "api_key": "iIkXnvllQ0"
        }
    }

    @staticmethod
    def save_post_result(b_type, ext, data, success_status):
        """
        AI生成データと投稿結果をDBに保存し、同時にLivedoorへ配信を実行する
        """
        posted_successfully = success_status
        
        # --- Livedoorへの投稿実行 ---
        if b_type in ArticleMapper.LIVEDOOR_CONFIGS:
            config = ArticleMapper.LIVEDOOR_CONFIGS[b_type]
            # APIキーがデフォルト文字列でない場合のみ実行
            if config["api_key"] and "入力" not in config["api_key"]:
                driver = LivedoorDriver(config)
                image_url = ext.get('main_image_url') or data.get('img')
                
                posted_successfully = driver.post(
                    title=ext.get('title_g') or data.get('title'),
                    body=ext.get('cont_g') or "",
                    image_url=image_url,
                    source_url=data.get('url'),
                    summary=ext.get('summary', '')
                )

        # --- DB保存ロジック (Maya's Logic) ---
        try:
            from api.models.article import Article
            site_identifier = 'bicstation' 
            
            metadata = {
                "post_service": b_type,
                "target_blog_name": ArticleMapper.LIVEDOOR_CONFIGS.get(b_type, {}).get('name', 'unknown'),
                "summary": ext.get('summary', ''),
                "original_title": data.get('title')
            }

            article = Article.objects.create(
                site=site_identifier,
                content_type='news',
                title=ext.get('title_g') or data.get('title'),
                body_text=ext.get('cont_g') or "",
                main_image_url=ext.get('main_image_url') or data.get('img'),
                source_url=data.get('url'),
                extra_metadata=metadata,
                is_exported=posted_successfully,
                created_at=timezone.now()
            )
            return posted_successfully, article.id
        except Exception as e:
            print(f"   ❗ DB Mapping Error: {str(e)}")
            return False, None

    @staticmethod
    def format_for_markdown(ext, data):
        """Markdown出力用のフロントマター作成"""
        return {
            "title": ext.get('title_g', data.get('title')),
            "date": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            "image": data.get('img', ''),
            "source": data.get('url', ''),
            "content": f"{ext.get('summary', '')}\n\n{ext.get('cont_g', '')}"
        }