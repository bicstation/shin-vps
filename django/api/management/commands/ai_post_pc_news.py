# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_pc_news.py
import os, re, random, requests, feedparser, time, hashlib, base64
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

# モデルとユーティリティ
from api.models.article import Article
from api.utils.html_utils import HTMLConverter

# 専門ロジック
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.seesaa_driver import SeesaaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 BICSTATION v16.8：節約系(bic-saving)完全対応モデル'

    # --- 🚀 艦隊構成 ---
    BLOG_CONFIGS = {
        # 'wp_main': {'endpoint': "https://bicstation.com", 'user': "admin", 'app_password': "xxxx xxxx xxxx xxxx"},
        
        # 🚨 節約系メイン (WordPress)
        # 'wp_saving': {'endpoint': "https://bic-saving.com", 'user': "admin", 'app_password': "xxxx xxxx xxxx xxxx"},
        
        # Seesaa艦隊
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'seesaa_ai': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242440"},
        'seesaa_game': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242441"},
        'seesaa_mobile': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242442"},
        'seesaa_work': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242443"},
        
        # Livedoor艦隊
        'ld_apple': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation/article"},
        'ld_asus': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-rstaipkg/article"},
        'ld_msi': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-1if6nwcy/article"},
        'ld_sony': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-is61wtfe/article"},
        'ld_dell': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-ufgtyxdn/article"},
        'ld_hp': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tiodrmio/article"},
        'ld_lenovo': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zbjz0l1a/article"},
        'ld_logicool': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tjicu3hv/article"},
        'ld_intel': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zftrmwub/article"},
        'ld_amd': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-u5yjy0lt/article"},

        # はてな艦隊
        'h_main': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"},
        'h_money': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-money.hatenadiary.com/atom/entry"},
        'h_ai': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-ai.hatenablog.jp/atom/entry"},
    }

    DRIVERS = {
        'wp_main': WordPressDriver, 'wp_saving': WordPressDriver,
        'seesaa': SeesaaDriver, 'seesaa_ai': SeesaaDriver, 'seesaa_game': SeesaaDriver, 
        'seesaa_mobile': SeesaaDriver, 'seesaa_work': SeesaaDriver,
        'ld_apple': LivedoorDriver, 'ld_asus': LivedoorDriver, 'ld_msi': LivedoorDriver,
        'ld_sony': LivedoorDriver, 'ld_dell': LivedoorDriver, 'ld_hp': LivedoorDriver,
        'ld_lenovo': LivedoorDriver, 'ld_logicool': LivedoorDriver, 'ld_intel': LivedoorDriver,
        'ld_amd': LivedoorDriver,
        'h_main': HatenaDriver, 'h_money': HatenaDriver, 'h_ai': HatenaDriver
    }

    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://ascii.jp/rss.xml",
        "https://www.gizmodo.jp/index.xml",
        "https://www.theverge.com/rss/index.xml",
        "https://www.engadget.com/rss.xml",
    ]

    # Markdown保存先の定義
    MD_PATHS = {
        'default': "/home/maya/shin-dev/shin-vps/next-bicstation/content/posts",
        'saving': "/home/maya/shin-dev/shin-vps/next-bic-saving/content/posts"
    }

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        self.log("--- 🚀 BICSTATION Multi-Fleet v16.8 (Saving-Ready) ---", self.style.SUCCESS)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        
        prompt_path = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")
        with open(prompt_path, "r", encoding='utf-8') as f: template = f.read()

        all_entries = self.get_random_rss_pool()
        random.shuffle(all_entries)
        
        if not all_entries: 
            self.log("🏁 新着記事はありません。")
            return

        assigned_tasks = {}
        used_links = set()

        for b_type in self.BLOG_CONFIGS.keys():
            for entry in all_entries:
                if entry.link in used_links: continue
                if self.auto_route_all(entry) == b_type:
                    assigned_tasks[b_type] = entry
                    used_links.add(entry.link)
                    break 

        task_list = list(assigned_tasks.items())
        random.shuffle(task_list)

        for b_type, entry in task_list:
            try: 
                success = self.process_single_post(b_type, entry, template, api_keys, current_dir)
                if not success: continue
                time.sleep(45) 
            except Exception as e: 
                self.log(f"🔥 [{b_type.upper()}] 処理異常: {str(e)}", self.style.ERROR)

    def auto_route_all(self, entry):
        text = (entry.title + (entry.summary if hasattr(entry, 'summary') else "")).lower()
        
        # 🚨 節約・マネー系キーワードの優先振り分け
        if any(k in text for k in ['得', '節約', 'ポイント', '還元', '無料', 'セール', 'キャンペーン']):
            # 節約系のメインは wp_saving または h_money
            return random.choice(['wp_saving', 'h_money'])

        if any(k in text for k in ['ai', 'chatgpt', 'gemini']):
            return random.choice(['h_ai', 'seesaa_ai'])

        if any(k in text for k in ['新型', 'レビュー', 'リーク']):
            return 'wp_main'
        
        mapping = {
           'ld_apple': ['apple', 'macbook', 'ipad', 'iphone', 'ios', 'm3 chip', 'm4 chip', 'airpods', 'vision pro'],
            'ld_asus': ['asus', 'rog', 'zenbook', 'vivobook', 'tuf gaming', 'proart', 'ally'],
            'ld_msi': ['msi', 'stealth', 'raider', 'cyborg', 'prestige', 'modern', 'claw'],
            'ld_sony': ['sony', 'playstation', 'ps5', 'vaio', 'xperia', 'bravia', 'inzone', 'walkman'],
            'ld_dell': ['dell', 'alienware', 'xps', 'inspiron', 'latitude', 'precision', 'vostro'],
            'ld_hp': ['hp', 'omen', 'victus', 'spectre', 'envoy', 'pavilion', 'elitebook'],
            'ld_lenovo': ['lenovo', 'thinkpad', 'legion', 'yoga', 'ideapad', 'loq', 'thinkbook'],
            'ld_logicool': ['logicool', 'logitech', 'razer', 'corsair', 'steelseries', 'elecom', 'mechanical keyboard', 'gaming mouse'],
            'ld_intel': ['intel', 'nvidia', 'rtx', 'geforce', 'core ultra', 'arc gpu', 'cuda', 'dlss', 'motherboard'],
            'ld_amd': ['amd', 'ryzen', 'radeon', 'rdna', 'epyc', 'am5', 'fsr', 'rog ally'], # handheldもAMDが多いので
        }
        
        for target, keys in mapping.items():
            if any(k in text for k in keys): return target

        if any(k in text for k in ['便利', 'ツール']): return 'h_main'
        
        return 'seesaa'

    def get_random_rss_pool(self):
        pool = []
        for url in self.RSS_SOURCES:
            try:
                res = requests.get(url, timeout=10)
                feed = feedparser.parse(res.text)
                for e in feed.entries:
                    if not Article.objects.filter(source_url=e.link).exists(): 
                        pool.append(e)
            except: continue
        return pool

    def process_single_post(self, b_type, entry, template, api_keys, current_dir):
        connection.close()
        self.log(f"🧵 [{b_type.upper()}] 処理中: {entry.title[:30]}...")
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_type)
        if not ext: return False
        
        title = ext.get('title_g', '').strip()
        if not re.search(r'[ぁ-んァ-ヶー一-龠]', title): return False

        title = title.replace('\n', '').strip()
        raw_body = ext.get('cont_h') if b_type.startswith('h_') else ext.get('cont_g')
        ext['html_body'] = HTMLConverter.md_to_html(raw_body)
        
        success_post = self.execute_blog_post(b_type, title, ext['html_body'], data)
        
        if success_post:
            ArticleMapper.save_post_result(b_type, ext, data, True)
            # 🚨 保存先の動的切り替え
            save_path = self.MD_PATHS['saving'] if (b_type == 'wp_saving' or b_type == 'h_money') else self.MD_PATHS['default']
            self.save_as_markdown(ext, data, save_path)
            self.log(f"📊 [{b_type.upper()}] ✅ 成功")
            return True
        return False

    def execute_blog_post(self, b_type, title, html_body, data):
        DriverClass = self.DRIVERS.get(b_type)
        if not DriverClass: return False
        driver = DriverClass(self.BLOG_CONFIGS.get(b_type))
        
        # 節約系とPC系でフッターURLを切り替え
        is_saving = (b_type == 'wp_saving' or b_type == 'h_money')
        brand = "賢い節約・ポイ活情報" if is_saving else "最新PC・ガジェット"
        url = "https://bic-saving.com" if is_saving else "https://bicstation.com"
        
        footer = f'<hr><div style="text-align:center;"><p>🚀 <b>{brand}</b> をチェック！</p><a href="{url}">公式サイトはこちら</a></div>'
        try:
            return driver.post(title=title, body=html_body + footer, image_url=data['img'], source_url=data['url'])
        except Exception as e:
            self.log(f"❌ {b_type.upper()}投稿エラー: {str(e)}")
            return False

    def scrape_article(self, entry):
        try:
            headers = {'User-Agent': 'Mozilla/5.0'}
            res = requests.get(entry.link, timeout=10, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            content_area = soup.find('article') or soup.find('main') or soup.body
            return {'url': entry.link, 'title': entry.title, 'img': og_img["content"] if og_img else "", 'body': content_area.get_text(strip=True)[:5000]}
        except: return None

    def save_as_markdown(self, ext, data, output_dir):
        try:
            if not os.path.exists(output_dir): os.makedirs(output_dir, exist_ok=True)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            path = os.path.join(output_dir, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
            m = ArticleMapper.format_for_markdown(ext, data)
            md_content = f'---\ntitle: "{m["title"]}"\ndate: "{datetime.now().strftime("%Y-%m-%d")}"\ncategory: "News"\nimage: "{m["image"]}"\nsource_url: "{m["source"]}"\n---\n\n{m["content"]}\n'
            with open(path, "w", encoding='utf-8') as f: f.write(md_content)
        except: pass