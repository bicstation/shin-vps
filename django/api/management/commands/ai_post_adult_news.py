# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_adult_fleet.py
import os, re, random, requests, feedparser, time, hashlib
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, IntegrityError
from bs4 import BeautifulSoup

# 各種モジュール
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver 
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.adult_ai_processor import AdultAIProcessor as AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION Adult Fleet v18.0: Livedoor & WP Multi-Post System'

    # --- 🔐 共通認証設定 ---
    LD_API_KEY = "lNh8lSooOq" # 司令官提供の共通パスワード

    # --- 📂 出力先設定 ---
    SITE_LAYOUTS = {
        "tiper_group": {"md_path": "next-tiper/content/posts", "base_url": "https://tiper.live/posts"},
        "avflash_group": {"md_path": "/home/maya/shin-dev/shin-vps/next-avflash/content/posts", "base_url": "https://avflash.jp/posts"}
    }

    # --- 🏘 Livedoorブログ艦隊 (FC2ロジック完全排除) ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": []},
        "reserve": {"name": "先行予約", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"]},
        "jukujo": {"name": "熟女・人妻", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代", "50代", "熟れ"]},
        "vr": {"name": "VR快楽", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "vr", "バーチャル"]},
        "idol": {"name": "美少女", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル"]},
        "ntr": {"name": "NTR・不倫", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫"]},
        "fetish": {"name": "フェチ・巨乳", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "アナル"]},
        "wiki": {"name": "名作まとめ", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "まとめ"]},
        "nakadashi": {"name": "中出し", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け"]},
        "amateur": {"name": "素人", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18", "JK", "女子高生"]}
    }

    # --- 🏰 WordPress拠点 ---
    WP_CONFIGS = {
        "wp_a": {"name": "WP A", "url": "https://blog.bic-erog.com/xmlrpc.php", "user": "bicstation", "pw": "a0H2 McUX 3XK6 apzh JZ82 SzTm", "blog_id": 0, "keywords": []},
        "wp_b": {"name": "WP B", "url": "https://blog.adult-search.xyz/xmlrpc.php", "user": "bicstation", "pw": "OBlD Yz2v lR8F wswY zwaW cF43", "blog_id": 0, "keywords": []}
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/ppr/-/list/=/reserve=only/rss=create/sort=date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=date/",
    ]

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        self.log("--- 🔞 BICSTATION Adult Fleet v18.0 起動 ---", self.style.SUCCESS)
        
        # 1. RSSプールから「完全未投稿」の記事を全取得
        rss_pool = self.get_fresh_rss_pool()
        if not rss_pool:
            self.log("🏁 新着記事はありません。終了します。")
            return
        
        self.log(f"📦 未投稿RSSを {len(rss_pool)} 件確保しました。")

        # 2. 全サイトリストを生成してシャッフル（配給のランダム化）
        all_sites = []
        for b_id in self.BLOG_CONFIGS.keys(): all_sites.append((b_id, "livedoor"))
        for b_id in self.WP_CONFIGS.keys(): all_sites.append((b_id, "wordpress"))
        random.shuffle(all_sites)

        # AIプロセッサの準備
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()
        processor = AIProcessor(api_keys, template)

        used_urls_this_run = set()

        # 3. 各サイトに最適な1記事を配給して投稿
        for b_id, mode in all_sites:
            cfg = self.BLOG_CONFIGS[b_id] if mode == "livedoor" else self.WP_CONFIGS[b_id]
            
            target_data = self.find_best_match(rss_pool, cfg.get("keywords", []), used_urls_this_run)
            if target_data:
                used_urls_this_run.add(target_data['url'])
                try:
                    self.process_single_post(b_id, target_data, processor, mode)
                    time.sleep(35) # 連続投稿制限回避
                except Exception as e:
                    self.log(f"🔥 [{b_id}] 致命的エラー: {str(e)}", self.style.ERROR)

    def get_fresh_rss_pool(self):
        pool = []
        seen_urls = set()
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if e.link not in seen_urls and not Article.objects.filter(source_url=e.link).exists():
                        data = self.parse_item(e)
                        pool.append(data)
                        seen_urls.add(e.link)
            except: continue
        return pool

    def find_best_match(self, pool, keywords, used_urls):
        candidates = [i for i in pool if i['url'] not in used_urls]
        if not candidates: return None
        if not keywords: return random.choice(candidates)
        
        matches = [i for i in candidates if any(k.lower() in (i['title'] + i['body']).lower() for k in keywords)]
        return random.choice(matches) if matches else random.choice(candidates)

    def process_single_post(self, b_id, data, processor, mode):
        connection.close()
        self.log(f"🧵 [{mode.upper()}:{b_id}] 執筆中: {data['title'][:20]}...")

        raw_res = processor.generate_blog_content(data, b_id)
        if not raw_res: return
        content_text = raw_res.get('cont_g', '')

        # タイトルと本文のパース
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else data['title']

        # ハルシネーション（桃井かおり等）の物理ガードレール
        banned = ["桃井かおり", "三佳詩", "禁断の果実"]
        if any(b in gen_title for b in banned):
            gen_title = f"【特選】{data['title'][:40]}... 至高のレビュー"

        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # ライブドアのアイキャッチ対策：文頭にメイン画像を配置
        cover_img = data["img"] if data["img"] else ""
        img_tag = f'<p><img src="{cover_img}" alt="{gen_title}" style="max-width:100%; border-radius:8px;"></p>'
        
        html_body = img_tag + HTMLConverter.md_to_html(clean_body)

        # サンプル画像ギャラリー
        if data.get('samples'):
            gallery = '<div style="display:flex; flex-wrap:wrap; gap:8px; margin:20px 0;">'
            for img in data['samples'][:10]:
                gallery += f'<img src="{img}" style="width:48%; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.1);">'
            html_body += gallery + '</div>'

        # Tiperへのリンクボタン
        slug = f"{datetime.now().strftime('%Y%m%d')}_{hashlib.md5(data['url'].encode()).hexdigest()[:8]}"
        tiper_url = f"{self.SITE_LAYOUTS['tiper_group']['base_url']}/{slug}/"
        html_body += f'''
            <div style="text-align:center; padding:20px; background:#fff0f0; border:2px dashed #ff4444; border-radius:10px;">
                <p style="font-weight:bold; color:#ff4444;">▼ サンプル動画・全画像レビューはこちら</p>
                <a href="{tiper_url}" target="_blank" style="background:#ff4444; color:#fff; padding:15px 30px; text-decoration:none; font-weight:bold; border-radius:5px; display:inline-block;">▶ Tiper.Live で詳しく見る</a>
            </div>
        '''

        # 投稿実行
        driver_cfg = self.BLOG_CONFIGS[b_id] if mode == "livedoor" else self.WP_CONFIGS[b_id]
        driver = LivedoorDriver(driver_cfg) if mode == "livedoor" else WordPressDriver(driver_cfg)
        
        # ライブドアの文字数制限とWordPressの安定性を考慮
        safe_title = gen_title[:95]

        if driver.post(title=safe_title, body=html_body, image_url=cover_img, source_url=data['url']):
            ArticleMapper.save_post_result(f"{mode}_{b_id}", {'title_g': safe_title, 'cont_g': clean_body}, data, True)
            self.log(f"📊 [{b_id.upper()}] ✅ 投稿完了")
        else:
            self.log(f"⚠️ [{b_id.upper()}] ドライバ側で拒否されました。")

    def parse_item(self, entry):
        # DMMのRSSから画像とサンプルを抽出
        content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(content, 'html.parser')
        
        # 画像サイズを「pl.jpg（大）」に正規化
        img_tag = soup.find('img')
        img_url = ""
        if img_tag:
            img_url = img_tag.get('src', '').replace("ps.jpg", "pl.jpg").replace("pt.jpg", "pl.jpg")
            
        return {
            'url': entry.link, 
            'title': entry.title, 
            'img': img_url, 
            'body': soup.get_text()[:500].strip(), 
            'samples': [i.get('src') for i in soup.find_all('img') if 'sample' in i.get('src', '').lower()]
        }