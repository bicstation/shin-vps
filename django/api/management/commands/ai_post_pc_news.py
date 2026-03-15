# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/ai_post_pc_news.py
import os, re, random, requests, feedparser, time, hashlib
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.seesaa_driver import SeesaaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemini-3 BICSTATION v17.3：全艦隊配給・WP投稿・MD保存 統合モデル'

    # --- 🚀 艦隊構成 ---
    BLOG_CONFIGS = {
        # WordPress本拠地 (アプリケーションパスワードを使用)
        'wp_main': {'endpoint': "https://bicstation.com", 'user': "admin", 'app_password': "xxxx xxxx xxxx xxxx"},
        'wp_saving': {'endpoint': "https://bic-saving.com", 'user': "admin", 'app_password': "xxxx xxxx xxxx xxxx"},
        
        # Seesaa
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'seesaa_ai': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242440"},
        'seesaa_game': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242441"},
        'seesaa_mobile': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242442"},
        'seesaa_work': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242443"},
        
        # Livedoor (Shop/Global)
        'ld_mouse': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station/article"},
        'ld_iiyama': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-zq1gwghp/article"},
        'ld_dospara': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-gevemmot/article"},
        'ld_tsukumo': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-jcjp5tqh/article"},
        'ld_ark': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-fbtird2v/article"},
        'ld_frontier': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-qpmycvvo/article"},
        'ld_sycom': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-ufhdrs8l/article"},
        'ld_dynabook': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-d00amao5/article"},
        'ld_nec': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-a3wiv6xl/article"},
        'ld_fujitsu': {'user': "pbic_station", 'api_key': "ULL2YG8X0z", 'url': "https://livedoor.blogcms.jp/atompub/pbic_station-mujuq4ew/article"},
        'ld_apple': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation/article"},
        'ld_asus': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-rstaipkg/article"},
        'ld_msi': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-mw56ftkt/article"},
        'ld_sony': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-is61wtfe/article"},
        'ld_dell': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-ufgtyxdn/article"},
        'ld_hp': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tiodrmio/article"},
        'ld_lenovo': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zbjz0l1a/article"},
        'ld_logicool': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-tjicu3hv/article"},
        'ld_intel': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-zftrmwub/article"},
        'ld_amd': {'user': "bicstation", 'api_key': "lmSZuzJO6O", 'url': "https://livedoor.blogcms.jp/atompub/bicstation-u5yjy0lt/article"},
        
        # Hatena
        'h_main': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"},
        'h_money': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-money.hatenadiary.com/atom/entry"},
        'h_ai': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-ai.hatenablog.jp/atom/entry"},
    }

    DRIVERS = {k: LivedoorDriver for k in BLOG_CONFIGS.keys() if k.startswith('ld_')}
    DRIVERS.update({k: SeesaaDriver for k in BLOG_CONFIGS.keys() if k.startswith('seesaa')})
    DRIVERS.update({k: HatenaDriver for k in BLOG_CONFIGS.keys() if k.startswith('h_')})
    DRIVERS.update({'wp_main': WordPressDriver, 'wp_saving': WordPressDriver})

    MD_PATHS = {
        'default': "/home/maya/shin-dev/shin-vps/next-bicstation/content/posts",
        'saving': "/home/maya/shin-dev/shin-vps/next-bic-saving/content/posts"
    }

    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://ascii.jp/rss.xml",
        "https://www.gizmodo.jp/index.xml",
    ]

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        self.log("--- 🚀 BICSTATION Multi-Fleet v17.3 統合運用 ---", self.style.SUCCESS)
        
        rss_pool = self.get_fresh_rss_pool()
        if not rss_pool:
            self.log("🏁 新着記事はありません。")
            return

        final_tasks = {}
        used_links = set()
        routing_map = self.get_routing_map()

        # ブログキーをシャッフルして配給の公平性を担保
        blog_keys = list(self.BLOG_CONFIGS.keys())
        random.shuffle(blog_keys)

        for b_key in blog_keys:
            best_entry = None
            keys = routing_map.get(b_key, [])
            
            for entry in rss_pool:
                if entry.link in used_links: continue
                text = (entry.title + (entry.summary if hasattr(entry, 'summary') else "")).lower()
                if any(k in text for k in keys):
                    best_entry = entry
                    break
            
            if not best_entry and b_key in ['seesaa', 'h_main', 'wp_main']:
                for entry in rss_pool:
                    if entry.link in used_links: continue
                    best_entry = entry
                    break

            if best_entry:
                final_tasks[b_key] = best_entry
                used_links.add(best_entry.link)

        if not final_tasks:
            self.log("⚠️ 割り当てタスクなし。")
            return

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        current_dir = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(current_dir, "prompt", "ai_prompt_news.txt"), "r", encoding='utf-8') as f:
            template = f.read()

        for b_key, entry in final_tasks.items():
            try:
                self.process_single_post(b_key, entry, template, api_keys)
                time.sleep(35) 
            except Exception as e:
                self.log(f"🔥 [{b_key}] エラー: {str(e)}", self.style.ERROR)

    def get_fresh_rss_pool(self):
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

    def get_routing_map(self):
        return {
            'ld_mouse': ['mouse', 'g-tune', 'daiv'],
            'ld_iiyama': ['iiyama', 'パソコン工房', 'level∞'],
            'ld_dospara': ['dospara', 'ドスパラ', 'galleria'],
            'ld_tsukumo': ['tsukumo', 'ツクモ', 'g-gear'],
            'ld_ark': ['ark', 'アーク'],
            'ld_frontier': ['frontier', 'フロンティア'],
            'ld_sycom': ['sycom', 'サイコム'],
            'ld_dynabook': ['dynabook', 'ダイナブック'],
            'ld_nec': ['nec', 'lavie'],
            'ld_fujitsu': ['fujitsu', '富士通', 'fmv'],
            'ld_apple': ['apple', 'mac', 'ipad', 'iphone'],
            'ld_asus': ['asus', 'rog', 'zenbook'],
            'ld_msi': ['msi', 'claw'],
            'ld_sony': ['sony', 'playstation', 'vaio', 'xperia'],
            'ld_dell': ['dell', 'alienware'],
            'ld_hp': ['hp', 'omen'],
            'ld_lenovo': ['lenovo', 'thinkpad'],
            'ld_logicool': ['logicool', 'razer', 'mouse', 'keyboard'],
            'ld_intel': ['intel', 'nvidia', 'rtx'],
            'ld_amd': ['amd', 'ryzen', 'radeon'],
            'wp_saving': ['得', '節約', 'ポイント', '還元', '無料'],
            'h_money': ['得', '節約', '金', '投資'],
            'h_ai': ['ai', 'chatgpt', 'gemini'],
            'seesaa_ai': ['生成', '人工知能'],
        }

    def process_single_post(self, b_key, entry, template, api_keys):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] 処理中...")
        data = self.scrape_article(entry)
        if not data: return
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext: return
        
        title = ext.get('title_g', '').replace('\n', '').strip()
        raw_body = ext.get('cont_h') if b_key.startswith('h_') else ext.get('cont_g')
        html_body = HTMLConverter.md_to_html(raw_body)
        
        # 1. ブログサービスへ投稿
        driver_class = self.DRIVERS.get(b_key)
        if driver_class:
            driver = driver_class(self.BLOG_CONFIGS[b_key])
            is_saving = (b_key == 'wp_saving' or b_key == 'h_money')
            brand_name = "賢い節約情報" if is_saving else "最新PCガジェット"
            base_url = "https://bic-saving.com" if is_saving else "https://bicstation.com"
            footer = f'<hr><p style="text-align:center;">🚀 <b>{brand_name}</b>: <a href="{base_url}">{base_url}</a></p>'
            
            if driver.post(title=title, body=html_body + footer, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(b_key, ext, data, True)
                self.log(f"📊 [{b_key.upper()}] ✅ 投稿完了")
                
                # 2. Markdownとしてローカル保存（Hugo/Next.js用）
                save_dir = self.MD_PATHS['saving'] if is_saving else self.MD_PATHS['default']
                self.save_as_markdown(ext, data, save_dir)

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            content = soup.find('article') or soup.find('main') or soup.body
            return {'url': entry.link, 'title': entry.title, 'img': og_img["content"] if og_img else "", 'body': content.get_text(strip=True)[:5000]}
        except: return None

    def save_as_markdown(self, ext, data, output_dir):
        try:
            if not os.path.exists(output_dir): os.makedirs(output_dir, exist_ok=True)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            path = os.path.join(output_dir, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
            m = ArticleMapper.format_for_markdown(ext, data)
            md_content = f'---\ntitle: "{m["title"]}"\ndate: "{datetime.now().strftime("%Y-%m-%d")}"\ncategory: "News"\nimage: "{m["image"]}"\nsource_url: "{m["source"]}"\n---\n\n{m["content"]}\n'
            with open(path, "w", encoding='utf-8') as f: f.write(md_content)
            self.log(f"📝 MD保存: {os.path.basename(path)}")
        except Exception as e:
            self.log(f"⚠️ MD保存失敗: {str(e)}")