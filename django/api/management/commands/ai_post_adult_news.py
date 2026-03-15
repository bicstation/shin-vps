# -*- coding: utf-8 -*-
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
    help = 'BICSTATION Adult Fleet v18.6: Full Monolithic Code'

    # --- 🔐 共通認証設定 ---
    LD_API_KEY = "lNh8lSooOq"

    # --- 🏘 Livedoorブログ設定 (20サイト体制への土台) ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": []},
        "reserve": {"name": "先行予約", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行"]},
        "jukujo": {"name": "熟女・人妻", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代"]},
        "vr": {"name": "VR快楽", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360"]},
        "idol": {"name": "美少女", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "美少女", "アイドル"]},
        "ntr": {"name": "NTR・不倫", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取"]},
        "fetish": {"name": "フェチ・巨乳", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "フェチ"]},
        "wiki": {"name": "名作まとめ", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "まとめ"]},
        "nakadashi": {"name": "中出し", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ"]},
        "amateur": {"name": "素人", "user": "pbic", "api_key": LD_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18"]}
    }

    # --- 🏰 WordPress拠点 ---
    WP_CONFIGS = {
        "wp_a": {"name": "WP A", "endpoint": "https://blog.bic-erog.com", "user": "bicstation", "app_password": "a0H2 McUX 3XK6 apzh JZ82 SzTm", "keywords": []},
        "wp_b": {"name": "WP B", "endpoint": "https://blog.adult-search.xyz", "user": "bicstation", "app_password": "OBlD Yz2v lR8F wswY zwaW cF43", "keywords": []}
    }

    RSS_SOURCES = [
        "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/digital/videoa/-/list/=/rss=create/sort=p_date/",
        "https://www.dmm.co.jp/rental/ppr/-/list/=/reserve=only/rss=create/sort=date/",
        "https://www.dmm.co.jp/rental/-/list/=/rss=create/sort=date/",
    ]

    def add_arguments(self, parser):
        parser.add_argument('--target', type=str, default='all', help='Target blog ID (e.g. tiper)')

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        target_id = options['target']
        self.log(f"--- 🔞 BICSTATION v18.6 弩級艦隊 抜錨 (Target: {target_id}) ---", self.style.SUCCESS)
        
        # 1. RSSから未投稿記事を収集
        rss_pool = self.get_fresh_rss_pool()
        if not rss_pool:
            self.log("🏁 新着記事が見つかりませんでした。終了します。")
            return
        self.log(f"📦 未投稿RSSを {len(rss_pool)} 件確保しました。")

        # 2. ターゲットの整理
        targets = []
        for b_id in self.BLOG_CONFIGS.keys(): targets.append((b_id, "livedoor"))
        for b_id in self.WP_CONFIGS.keys(): targets.append((b_id, "wordpress"))
        
        if target_id != 'all':
            targets = [t for t in targets if t[0] == target_id]
        random.shuffle(targets)

        # 3. AIプロセッサ初期化
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()
        processor = AIProcessor(api_keys, template)

        used_urls = set()
        for b_id, mode in targets:
            cfg = self.BLOG_CONFIGS[b_id] if mode == "livedoor" else self.WP_CONFIGS[b_id]
            self.log(f"🔍 [{b_id.upper()}] 配給記事を選定中...")
            
            data = self.find_guaranteed_match(rss_pool, cfg.get("keywords", []), used_urls)
            if data:
                used_urls.add(data['url'])
                try:
                    self.process_single_post(b_id, data, processor, mode)
                    time.sleep(30) # スパム回避
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
            except Exception as ex:
                self.log(f"⚠️ RSS取得エラー ({url}): {str(ex)}")
        return pool

    def parse_item(self, entry):
        content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(content, 'html.parser')
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

    def find_guaranteed_match(self, pool, keywords, used_urls):
        candidates = [i for i in pool if i['url'] not in used_urls]
        if not candidates: return None
        
        # キーワード一致を優先
        matches = [i for i in candidates if any(k.lower() in (i['title'] + i['body']).lower() for k in keywords)]
        if matches:
            return random.choice(matches)
        
        # なければプールの中から選ぶ
        return candidates[0]

    def process_single_post(self, b_id, data, processor, mode):
        connection.close()
        self.log(f"🧵 [{mode.upper()}:{b_id}] AI執筆開始: {data['title'][:15]}...")

        raw_res = processor.generate_blog_content(data, b_id)
        if not raw_res: return

        content_text = raw_res.get('cont_g', '')
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        gen_title = title_match.group(1).strip() if title_match else data['title']

        # 物理ガードレール
        banned = ["桃井かおり", "三佳詩", "禁断の果実"]
        if any(b in gen_title for b in banned):
            gen_title = f"【厳選レビュー】{data['title'][:40]}..."

        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # 共通HTML構築
        cover_img = data["img"]
        img_tag = f'<p><img src="{cover_img}" style="max-width:100%; border-radius:8px;"></p>'
        html_body = img_tag + HTMLConverter.md_to_html(clean_body)

        # Tiperへの誘導（slug生成）
        slug = f"{datetime.now().strftime('%Y%m%d')}_{hashlib.md5(data['url'].encode()).hexdigest()[:8]}"
        tiper_url = f"https://tiper.live/posts/{slug}/"
        html_body += f'''
            <div style="text-align:center; padding:20px; background:#fff0f0; border:2px dashed #ff4444; border-radius:10px; margin-top:20px;">
                <p style="font-weight:bold; color:#ff4444;">▼ サンプル動画・全画像レビューはこちら</p>
                <a href="{tiper_url}" target="_blank" style="background:#ff4444; color:#fff; padding:15px 30px; text-decoration:none; font-weight:bold; border-radius:5px; display:inline-block;">▶ Tiper.Live で詳しく見る</a>
            </div>
        '''

        # 投稿実行
        driver_cfg = self.BLOG_CONFIGS[b_id] if mode == "livedoor" else self.WP_CONFIGS[b_id]
        driver = LivedoorDriver(driver_cfg) if mode == "livedoor" else WordPressDriver(driver_cfg)
        
        # 400エラー対策（改行除去と文字数制限）
        safe_title = re.sub(r'[\r\n\t]', ' ', gen_title)[:95].strip()

        if driver.post(title=safe_title, body=html_body, image_url=cover_img, source_url=data['url']):
            ArticleMapper.save_post_result(f"{mode}_{b_id}", {'title_g': safe_title, 'cont_g': clean_body}, data, True)
            self.log(f"✅ [{b_id.upper()}] 投稿完了")
        else:
            self.log(f"❌ [{b_id.upper()}] 投稿失敗")