# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time, hashlib
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, IntegrityError
from bs4 import BeautifulSoup

# モデルとユーティリティ
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver 
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.adult_ai_processor import AdultAIProcessor as AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 Adult Multi-Blog System v17.5 (Fixed: Deduplication & Livedoor Image Sync)'

    SHARED_API_KEY = "lNh8lSooOq" 

    # --- 振り分け設定 ---
    SITE_LAYOUTS = {
        "tiper_group": {
            "md_path": "next-tiper/content/posts",
            "base_url": "https://tiper.live/posts"
        },
        "default_group": {
            "md_path": "next-bicstation/content/posts",
            "base_url": "https://bic-saving.com/posts"
        },
        "avflash_group": {
            "md_path": "/home/maya/shin-dev/shin-vps/next-avflash/content/posts",
            "base_url": "https://avflash.jp/posts"
        }
    }

    # --- ブログ設定 ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": []},
        "reserve": {"name": "先行予約", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"]},
        "jukujo": {"name": "熟女・人妻", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代", "50代", "女上司"]},
        "vr": {"name": "VR快楽", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360"]},
        "amateur": {"name": "素人・ハメ", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["素人", "ハメ", "流出"]},
        "idol": {"name": "美少女", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル"]},
        "ntr": {"name": "NTR・不倫", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫"]},
        "fetish": {"name": "フェチ・巨乳", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "アナル"]},
        "wiki": {"name": "名作まとめ", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "まとめ"]},
        "nakadashi": {"name": "中出し", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け"]}
    }

    WP_CONFIGS = {
        "wp_a": {"name": "WP A", "url": "https://blog.bic-erog.com/xmlrpc.php", "user": "bicstation", "pw": "a0H2 McUX 3XK6 apzh JZ82 SzTm", "blog_id": 0, "keywords": []},
        "wp_b": {"name": "WP B", "url": "https://blog.adult-search.xyz/xmlrpc.php", "user": "bicstation", "pw": "OBlD Yz2v lR8F wswY zwaW cF43", "blog_id": 0, "keywords": []}
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/ppr/-/list/=/reserve=only/rss=create/sort=date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/rental/ppr/-/list/=/rss=create/sort=date/",
    ]

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def add_arguments(self, parser):
        parser.add_argument('--target', type=str, default='all')

    def handle(self, *args, **options):
        self.log("--- 🔞 RSS Matching System v17.5 始動 ---", self.style.SUCCESS)
        
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()
        processor = AIProcessor(api_keys, template)

        self.log("📥 RSSプールを構築中...")
        rss_pool = self.get_rss_pool()
        if not rss_pool:
            self.log("⚠️ 投稿可能な新着記事が見つかりませんでした。")
            return
        
        # 今回の実行で「既に選択したURL」を保持する。重複防止の鍵。
        globally_used_urls = set()

        # Livedoor
        for b_id, cfg in self.BLOG_CONFIGS.items():
            if options['target'] != 'all' and b_id != options['target']: continue
            target_data = self.find_best_match(rss_pool, cfg["keywords"], globally_used_urls)
            if target_data:
                self.process_single_post(b_id, target_data, processor, "livedoor")
                globally_used_urls.add(target_data['url']) # 投稿決定したURLをロック

        # WordPress
        for b_id, cfg in self.WP_CONFIGS.items():
            if options['target'] != 'all' and b_id != options['target']: continue
            target_data = self.find_best_match(rss_pool, cfg["keywords"], globally_used_urls)
            if target_data:
                self.process_single_post(b_id, target_data, processor, "wordpress")
                globally_used_urls.add(target_data['url'])

    def get_rss_pool(self):
        pool = []
        seen_urls = set()
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    # DBに存在せず、かつ現在のソース読み込み内で重複していないもの
                    if e.link not in seen_urls and not Article.objects.filter(source_url=e.link).exists():
                        data = self.parse_item(e)
                        pool.append(data)
                        seen_urls.add(e.link)
            except Exception as ex:
                self.log(f"⚠️ RSS取得エラー ({url}): {str(ex)}")
        return pool

    def find_best_match(self, pool, keywords, used_urls):
        candidates = []
        for item in pool:
            # 既に他のブログが今回のループで採用したURLは除外
            if item['url'] in used_urls: continue
            
            search_text = (item['title'] + item['body'] + "".join(item['genres'])).lower()
            if not keywords:
                candidates.append(item)
            else:
                if any(k.lower() in search_text for k in keywords):
                    candidates.append(item)
        
        # 候補があればランダムに1つ。重複防止のため呼び出し元でURLをused_urlsに追加する。
        return random.choice(candidates) if candidates else None

    def process_single_post(self, b_type, data, processor, mode):
        connection.close() 
        self.log(f"🧵 [{mode.upper()}:{b_type}] 処理中: {data['title'][:30]}...")

        raw_res = processor.generate_blog_content(data, b_type)
        if not raw_res: return

        content_text = raw_res.get('cont_g', '')

        # タイトル抽出
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        generated_title = title_match.group(1).strip() if title_match else raw_res.get('title_g', data['title'])

        # 本文抽出
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else re.sub(r'\[TITLE\].*?\[/TITLE\]', '', content_text, flags=re.DOTALL).strip()

        ext = {'title_g': generated_title, 'cont_g': clean_body}

        # 振り分け先決定
        target_layouts = ["avflash_group"]
        if b_type in self.BLOG_CONFIGS.keys() or b_type.startswith("wp"):
            target_layouts.append("tiper_group")
        else:
            target_layouts.append("default_group")

        slug = f"{datetime.now().strftime('%Y%m%d')}_{hashlib.md5(data['url'].encode()).hexdigest()[:8]}"
        
        # SSG用Markdown
        full_body_md = f"![{ext['title_g']}]({data['img']})\n\n{ext['cont_g']}"

        for layout_key in target_layouts:
            config = self.SITE_LAYOUTS[layout_key]
            save_dir = config["md_path"] if config["md_path"].startswith("/") else os.path.join(os.getcwd(), config["md_path"])
            os.makedirs(save_dir, exist_ok=True)
            with open(os.path.join(save_dir, f"{slug}.md"), "w", encoding="utf-8") as f:
                f.write(f"---\ntitle: \"{ext['title_g']}\"\ndate: \"{datetime.now().isoformat()}\"\n")
                f.write(f"thumbnail: \"{data['img']}\"\nimages: {data['samples'][:12]}\n---\n\n")
                f.write(full_body_md)

        # HTML変換（ライブドア/WP用）
        # 【重要】本文の最初にHTMLタグを挿入することでライブドアの画像認識を確実にする
        img_html = f'<img src="{data["img"]}" alt="{ext["title_g"]}" style="display:none;">'
        ext['html_body'] = img_html + HTMLConverter.md_to_html(clean_body)
        
        if data.get('samples'):
            gallery = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin:20px 0;">'
            for img in data['samples'][:12]:
                gallery += f'<img src="{img}" style="width:100%; border-radius:5px;">'
            ext['html_body'] += gallery + '</div>'

        main_url = f"{self.SITE_LAYOUTS['tiper_group']['base_url']}/{slug}/"
        ext['html_body'] += f'''
            <div style="text-align:center; background:#fff5f5; border:2px solid #ff4444; padding:20px; border-radius:10px; margin-top:20px;">
                <p style="font-weight:bold; color:#d00;">🔞 続き・サンプル画像・レビューの全文はこちら</p>
                <a href="{main_url}" target="_blank" style="background:#ff4444; color:#fff; padding:10px 20px; border-radius:5px; text-decoration:none; font-weight:bold;">▶ メインサイトで見る</a>
            </div>
        '''

        driver = LivedoorDriver(self.BLOG_CONFIGS[b_type]) if mode == "livedoor" else WordPressDriver(self.WP_CONFIGS[b_type])
        
        if self.execute_post_action(driver, ext, data):
            try:
                ArticleMapper.save_post_result(f"{mode}_{b_type}", ext, data, True)
                self.log(f"✅ [{mode.upper()}:{b_type}] 完了: {slug}.md", self.style.SUCCESS)
            except IntegrityError: pass

    def execute_post_action(self, driver, ext, data):
        title = ext['title_g'][:87] + '...' if len(ext['title_g']) > 90 else ext['title_g']
        try:
            return driver.post(
                title=title, 
                body=ext['html_body'], 
                image_url=data['img'], 
                source_url=data['url']
            )
        except Exception as e:
            self.log(f"❌ 投稿エラー: {str(e)}", self.style.ERROR)
            return False

    def parse_item(self, entry):
        content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(content, 'html.parser')
        genres = [a.get_text() for a in soup.find_all('a') if 'article=keyword' in a.get('href', '')]
        img_tag = soup.find('img')
        img_url = img_tag.get('src', '').replace("ps.jpg", "pl.jpg").replace("pt.jpg", "pl.jpg") if img_tag else ""
        samples = [img.get('src') for img in soup.find_all('img') if 'サンプル画像' in img.get('alt', '')]
        
        return {
            'url': entry.link, 
            'title': entry.title, 
            'img': img_url, 
            'body': soup.get_text()[:600].strip(), 
            'genres': genres, 
            'samples': samples
        }