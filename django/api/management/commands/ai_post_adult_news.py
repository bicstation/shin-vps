# -*- coding: utf-8 -*-
import os, re, random, requests, feedparser, time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from django.db import connection, IntegrityError
from bs4 import BeautifulSoup

# モデルとユーティリティ
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver # XML-RPC対応ドライバ
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.adult_ai_processor import AdultAIProcessor as AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 Adult Multi-Blog System v15.1 (Full RSS + Livedoor + Dual WP)'

    SHARED_API_KEY = "lNh8lSooOq" 

    # --- Livedoor Blog Configs ---
    BLOG_CONFIGS = {
        "tiper": {
            "name": "Tiper.Live", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic/article", "keywords": []
        },
        "reserve": {
            "name": "先行予約！エロ動画最速ニュース", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-br9qoupv/article", "keywords": ["予約", "先行", "2026", "発売予定"] 
        },
        "jukujo": {
            "name": "熟成の蜜月 ～熟女・人妻の背徳～", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-eaenvfmg/article", "keywords": ["熟女", "人妻", "母", "40代", "50代", "女上司", "奥様", "佐久間楓", "沢口紫乃"]
        },
        "vr": {
            "name": "VR快楽研究所 360°の没入体験", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-7vu6rapd/article", "keywords": ["VR", "360", "没入"]
        },
        "amateur": {
            "name": "【禁断】素人・ハメ撮り暴露録", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["素人", "ハメ", "流出", "個人", "自撮り"]
        },
        "idol": {
            "name": "美少女・アイドルの登竜門", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-ldp7wpxx/article", "keywords": ["新人", "単体", "美少女", "アイドル", "女子大生", "専属", "イメージビデオ"]
        },
        "ntr": {
            "name": "背徳 of 淫靡 ～NTR・不倫の深淵～", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-xem23smb/article", "keywords": ["NTR", "寝取", "不倫", "略奪", "妻", "浮気", "近親相姦", "母と息子"]
        },
        "fetish": {
            "name": "巨乳・美尻の黄金比フェチ図鑑", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-txjhpcdr/article", "keywords": ["巨乳", "爆乳", "美尻", "フェチ", "パイパン", "美脚", "アナル", "ナース"]
        },
        "wiki": {
            "name": "【神作】歴代アダルト名作まとめ", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-ihotsur8/article", "keywords": ["神作", "名作", "殿堂", "まとめ", "ベスト", "総集編"]
        },
        "nakadashi": {
            "name": "中出し背徳…愛欲의 種付け記録", "user": "pbic", "api_key": SHARED_API_KEY, 
            "url": "https://livedoor.blogcms.jp/atompub/pbic-znfejpqv/article", "keywords": ["中出し", "生ハメ", "種付け", "無修正", "ゴムなし"]
        }
    }

    # --- WordPress Configs (🌟 追加分) ---
    WP_CONFIGS = {
        "wp_a": {
            "name": "WordPress A (bic-erog.com)",
            "url": "https://blog.bic-erog.com/xmlrpc.php",
            "user": "bicstation",
            "password": "a0H2 McUX 3XK6 apzh JZ82 SzTm",
            "keywords": [] # 総合なので全通し
        },
        "wp_b": {
            "name": "WordPress B (adult-search.xyz)",
            "url": "https://blog.adult-search.xyz/xmlrpc.php",
            "user": "bicstation",
            "password": "OBlD Yz2v lR8F wswY zwaW cF43",
            "keywords": [] # 総合なので全通し
        }
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
        parser.add_argument('--limit', type=int, default=1)
        parser.add_argument('--target', type=str, default='all')

    def handle(self, *args, **options):
        self.log("--- 🔞 RSS Multi-Hybrid v15.1 (Livedoor & Dual WP) 始動 ---", self.style.SUCCESS)
        
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys:
            self.log("❌ APIキーなし。", self.style.ERROR)
            return

        prompt_path = os.path.join(os.path.dirname(__file__), "prompt", "ai_prompt_adult.txt")
        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()

        all_entries = self.get_rss_pool()
        if not all_entries:
            self.log("⚠️ 新着なし。")
            return

        process_count = min(len(all_entries), options['limit'])
        selected_entries = random.sample(all_entries, process_count)

        for entry in selected_entries:
            # データの共通解析
            data = self.parse_item(entry)
            processor = AIProcessor(api_keys, template)

            # --- Livedoor投稿セクション ---
            ld_targets = self.auto_route_logic(entry, self.BLOG_CONFIGS, options['target'])
            for b_type in ld_targets:
                self.process_single_post(b_type, data, processor, "livedoor")

            # --- WordPress投稿セクション ---
            wp_targets = self.auto_route_logic(entry, self.WP_CONFIGS, options['target'])
            for b_type in wp_targets:
                self.process_single_post(b_type, data, processor, "wordpress")

    def get_rss_pool(self):
        pool = []
        seen_urls = set()
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if e.link not in seen_urls and not Article.objects.filter(source_url=e.link).exists():
                        pool.append(e)
                        seen_urls.add(e.link)
            except Exception as e:
                self.log(f"⚠️ RSS取得失敗: {str(e)}")
        return pool

    def auto_route_logic(self, entry, config_dict, target_arg):
        matched = []
        content_val = entry.title + getattr(entry, "summary", "")
        if hasattr(entry, 'content'): content_val += entry.content[0].value

        for b_id, cfg in config_dict.items():
            if target_arg != 'all' and b_id != target_arg: continue
            # キーワードが空の場合は「総合」として全通し、ある場合はマッチング
            if not cfg.get("keywords") or any(k in content_val for k in cfg["keywords"]):
                matched.append(b_id)
        return matched

    def process_single_post(self, b_type, data, processor, mode):
        connection.close() 
        self.log(f"🧵 [{mode.upper()}:{b_type}] AI解析中...")

        ext = processor.generate_blog_content(data, b_type)
        if not ext or not ext.get('title_g'): return

        ext['html_body'] = HTMLConverter.md_to_html(ext.get('cont_g', ''))
        
        # ギャラリー生成
        if data.get('samples'):
            gallery = '<div style="margin-top:25px; display:grid; grid-template-columns: repeat(2, 1fr); gap:12px;">'
            for img in data['samples'][:20]:
                gallery += f'<img src="{img}" style="width:100%; border-radius:6px; box-shadow:0 3px 8px rgba(0,0,0,0.15);">'
            gallery += '</div>'
            ext['html_body'] += gallery
        
        # 投稿ドライバの切り替え
        success = False
        if mode == "livedoor":
            driver = LivedoorDriver(self.BLOG_CONFIGS[b_type])
            success = self.execute_post_action(driver, ext, data)
        else: # wordpress
            driver = WordPressDriver(self.WP_CONFIGS[b_type])
            success = self.execute_post_action(driver, ext, data)

        if success:
            try:
                ArticleMapper.save_post_result(f"{mode}_{b_type}", ext, data, True)
                self.log(f"✅ [{mode.upper()}:{b_type}] 成功", self.style.SUCCESS)
            except IntegrityError: pass

    def execute_post_action(self, driver, ext, data):
        raw_title = ext.get('title_g', data['title'])
        safe_title = (raw_title[:87] + '...') if len(raw_title) > 90 else raw_title
        eye_catch = f'<div style="text-align:center;margin-bottom:25px;"><img src="{data["img"]}" style="max-width:100%;border-radius:10px;"></div>'
        
        try:
            return driver.post(
                title=safe_title, body=eye_catch + ext.get('html_body', ''),
                image_url=data['img'], source_url=data['url'], summary=ext.get('summary', '')
            )
        except Exception as e:
            self.log(f"❌ 投稿エラー: {str(e)}", self.style.ERROR)
            return False

    def parse_item(self, entry):
        content = entry.content[0].value if hasattr(entry, 'content') else getattr(entry, "summary", "")
        soup = BeautifulSoup(content, 'html.parser')

        actresses = [a.get_text() for a in soup.find_all('a') if 'article=actress' in a.get('href', '')]
        genres = [a.get_text() for a in soup.find_all('a') if 'article=keyword' in a.get('href', '')]
        maker = next((a.get_text() for a in soup.find_all('a') if 'article=maker' in a.get('href', '')), "")
        
        text_content = soup.get_text(separator="\n")
        if "コメント：" in text_content:
            rich_body = text_content.split("コメント：")[-1].split("ムービープレビュー")[0].split("品番：")[0].split("販売価格：")[0].strip()
        else:
            rich_body = text_content.split("収録時間：")[0].strip()[:1000]

        samples = [img.get('src') for img in soup.find_all('img') if 'サンプル画像' in img.get('alt', '') or '/digital/video/' in img.get('src', '')]
        
        img_url = ""
        package_tag = soup.find('package')
        if package_tag: img_url = package_tag.get_text().replace("pt.jpg", "pl.jpg")
        if not img_url:
            p_link = soup.find('a', attrs={'name': 'package-image'})
            if p_link: img_url = p_link.get('href', '')
        if not img_url:
            f_img = soup.find('img')
            if f_img: img_url = f_img.get('src', '').replace("ps.jpg", "pl.jpg").replace("pt.jpg", "pl.jpg")
        
        return {
            'url': entry.link, 'title': entry.title, 'img': img_url, 'body': rich_body,
            'samples': samples, 'actresses': actresses, 'genres': genres, 'maker': maker
        }