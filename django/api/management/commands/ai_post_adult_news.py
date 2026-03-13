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
    help = 'v17.9 (Optimized for Gemma-3 & Physical Hallucination Guardrail)'

    SHARED_API_KEY = "lNh8lSooOq" 

    # --- サイト別出力先設定 ---
    SITE_LAYOUTS = {
        "tiper_group": {"md_path": "next-tiper/content/posts", "base_url": "https://tiper.live/posts"},
        "default_group": {"md_path": "next-bicstation/content/posts", "base_url": "https://bic-saving.com/posts"},
        "avflash_group": {"md_path": "/home/maya/shin-dev/shin-vps/next-avflash/content/posts", "base_url": "https://avflash.jp/posts"}
    }

    # --- Livedoorブログ設定 (400エラー回避のためURLとIDを再点検済み) ---
    BLOG_CONFIGS = {
        "tiper": {"name": "Tiper.Live", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": []},
        "reserve": {"name": "先行予約", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"]},
        "jukujo": {"name": "熟女・人妻", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "40代", "50代", "女上司"]},
        "vr": {"name": "VR快楽", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "vr", "バーチャル"]},
        "idol": {"name": "美少女", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル"]},
        "ntr": {"name": "NTR・不倫", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫"]},
        "fetish": {"name": "フェチ・巨乳", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "アナル"]},
        "wiki": {"name": "名作まとめ", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "まとめ"]},
        "nakadashi": {"name": "中出し", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け"]},
        "amateur": {"name": "素人", "user": "pbic", "api_key": SHARED_API_KEY, "url": "https://livedoor.blogcms.jp/atompub/pbic-7zjsg4zw/article", "keywords": ["素人", "18", "女子高生"]}
    }

    # --- WordPress設定 ---
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
        self.log("--- 🔞 RSS Matching System v17.9 始動 ---", self.style.SUCCESS)
        
        # APIキー取得
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()
            
        # Gemma-3-27b-it を内部で指定していることを前提としたプロセッサ呼び出し
        processor = AIProcessor(api_keys, template)

        rss_pool = self.get_rss_pool()
        if not rss_pool:
            self.log("⚠️ 取得可能な新着RSSがありません。")
            return
        
        globally_used_urls = set()

        # 1. Livedoor 投稿
        for b_id, cfg in self.BLOG_CONFIGS.items():
            if options['target'] != 'all' and b_id != options['target']: continue
            target_data = self.find_best_match(rss_pool, cfg["keywords"], globally_used_urls)
            if target_data:
                globally_used_urls.add(target_data['url'])
                self.process_single_post(b_id, target_data, processor, "livedoor")

        # 2. WordPress 投稿
        for b_id, cfg in self.WP_CONFIGS.items():
            if options['target'] != 'all' and b_id != options['target']: continue
            target_data = self.find_best_match(rss_pool, cfg["keywords"], globally_used_urls)
            if target_data:
                globally_used_urls.add(target_data['url'])
                self.process_single_post(b_id, target_data, processor, "wordpress")

    def get_rss_pool(self):
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
                self.log(f"RSS取得エラー: {url} - {str(ex)}")
        return pool

    def find_best_match(self, pool, keywords, used_urls):
        candidates = [i for i in pool if i['url'] not in used_urls]
        if not keywords: 
            return random.choice(candidates) if candidates else None
        
        matches = [i for i in candidates if any(k.lower() in (i['title'] + i['body']).lower() for k in keywords)]
        return random.choice(matches) if matches else None

    def process_single_post(self, b_type, data, processor, mode):
        connection.close() 
        self.log(f"🧵 [{mode.upper()}:{b_type}] 固有生成中: {data['title'][:25]}...")

        raw_res = processor.generate_blog_content(data, b_type)
        if not raw_res: return
        content_text = raw_res.get('cont_g', '')

        # タイトル抽出
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', content_text, re.DOTALL)
        generated_title = title_match.group(1).strip() if title_match else data['title']

        # --- 【物理ガードレール】桃井かおり・捏造設定 徹底排除 ---
        core_title = re.sub(r'【.*?】', '', data['title']).split('(')[0].strip()
        banned_hallucinations = ["桃井かおり", "三佳詩", "禁断の果実", "蜜月の果て", "元教師"]
        
        # AIが嘘をついた場合、タイトルをRSSベースに強制置換
        if any(bw in generated_title for bw in banned_hallucinations) or (len(core_title) > 3 and core_title[:5] not in generated_title):
            generated_title = f"【衝撃の特選】{core_title}｜至高の官能体験レビュー"
            self.log(f"🚨 AI異常(ハルシネーション)検知。タイトルを物理修正しました。", self.style.WARNING)

        # 本文抽出
        body_match = re.search(r'\[BODY\](.*?)\[/BODY\]', content_text, re.DOTALL)
        clean_body = body_match.group(1).strip() if body_match else content_text

        # 本文に「桃井かおり」が含まれている場合、最低限の破綻を防ぐため置換（念のため）
        if "桃井かおり" in clean_body:
            clean_body = clean_body.replace("桃井かおり", core_title[:10])
            self.log(f"⚠️ 本文内のハルシネーションを簡易置換しました。", self.style.WARNING)

        ext = {'title_g': generated_title, 'cont_g': clean_body}
        
        # HTML変換・画像埋め込み
        # ライブドアのアイキャッチ用に隠しimgを先頭に配置
        img_html = f'<img src="{data["img"]}" alt="{ext["title_g"]}" style="display:none;">'
        ext['html_body'] = img_html + HTMLConverter.md_to_html(clean_body)
        
        if data.get('samples'):
            gallery = '<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; margin:20px 0;">'
            for img in data['samples'][:12]:
                gallery += f'<img src="{img}" style="width:100%; border-radius:5px; box-shadow:0 2px 5px rgba(0,0,0,0.1);">'
            ext['html_body'] += gallery + '</div>'

        # リンクボタン追加
        slug = f"{datetime.now().strftime('%Y%m%d')}_{hashlib.md5(data['url'].encode()).hexdigest()[:8]}"
        main_url = f"{self.SITE_LAYOUTS['tiper_group']['base_url']}/{slug}/"
        ext['html_body'] += f'''
            <div style="text-align:center; background:#fff5f5; border:2px solid #ff4444; padding:20px; border-radius:10px; margin-top:20px;">
                <p style="font-weight:bold; color:#d00;">🔞 サンプル画像・レビューの全文はこちら</p>
                <a href="{main_url}" target="_blank" style="background:#ff4444; color:#fff; padding:12px 24px; border-radius:5px; text-decoration:none; font-weight:bold; display:inline-block;">▶ メインサイトで詳しく見る</a>
            </div>
        '''

        # 投稿実行
        driver = LivedoorDriver(self.BLOG_CONFIGS[b_type]) if mode == "livedoor" else WordPressDriver(self.WP_CONFIGS[b_type])
        
        if self.execute_post_action(driver, ext, data):
            try:
                ArticleMapper.save_post_result(f"{mode}_{b_type}", ext, data, True)
                self.log(f"✅ 投稿完了: {generated_title[:30]}", self.style.SUCCESS)
            except IntegrityError: pass

    def execute_post_action(self, driver, ext, data):
        # ライブドアのタイトル文字数制限(約100文字)を考慮
        safe_title = ext['title_g'][:90]
        try:
            return driver.post(
                title=safe_title, 
                body=ext['html_body'], 
                image_url=data['img'], 
                source_url=data['url']
            )
        except Exception as e:
            self.log(f"❌ 投稿失敗: {str(e)}", self.style.ERROR)
            return False

    def parse_item(self, entry):
        content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(content, 'html.parser')
        
        # 画像URLの正規化（中サイズから大サイズへ）
        img_tag = soup.find('img')
        img_url = ""
        if img_tag:
            img_url = img_tag.get('src', '').replace("ps.jpg", "pl.jpg").replace("pt.jpg", "pl.jpg")
            
        return {
            'url': entry.link, 
            'title': entry.title, 
            'img': img_url, 
            'body': soup.get_text()[:600].strip(), 
            'samples': [i.get('src') for i in soup.find_all('img') if 'サンプル画像' in i.get('alt', '')]
        }