# -*- coding: utf-8 -*-
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
    help = 'Gemini-3 BICSTATION v18.0: Image-Engine Optimized Multi-Fleet (DB Centric)'

    # --- 🏘 艦隊構成：全サイト網羅 ---
    BLOG_CONFIGS = {
        'seesaa': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242363"},
        'seesaa_ai': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242440"},
        'seesaa_game': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242441"},
        'seesaa_mobile': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242442"},
        'seesaa_work': {'rpc_url': "https://blog.seesaa.jp/rpc", 'user': "bicstation@gmail.com", 'pw': "1492nabe", 'blog_id': "7242443"},
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
        'h_main': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"},
        'h_money': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-money.hatenadiary.com/atom/entry"},
        'h_ai': {'user': "bicstation", 'api_key': "se0o5znod6", 'endpoint': "https://blog.hatena.ne.jp/bicstation/bic-ai.hatenablog.jp/atom/entry"},
    }

    def get_routing_map(self):
        return {
            'ld_mouse': ['mouse', 'g-tune', 'daiv', 'mousepro', '乃木坂', 'クリエイター', 'bto', '飯山', '国産', 'セール', 'キャンペーン', '値引き', 'デスクトップ', 'ノートpc', 'mousejp'],
            'ld_iiyama': ['iiyama', 'パソコン工房', 'level∞', 'ユニットコム', 'sence∞', 'solution∞', 'モニター', 'ディスプレイ', '即納', '特売', '中古pc', 'iiyamapc', 'コラボモデル', 'ゲーミングデバイス', '店舗'],
            'ld_dospara': ['dospara', 'ドスパラ', 'galleria', 'ガレリア', 'raytrek', 'パーツ', 'グラボ', 'rtx', 'ゲーミング', 'クリエイター', 'ポイント還元', '最短出荷'],
            'ld_tsukumo': ['tsukumo', 'ツクモ', 'g-gear', 'excomputer', '九十九', '自作pc', 'マザーボード', 'ケース', '電源', '特価', 'ヤマダ'],
            'ld_ark': ['ark', 'アーク', 'msi', 'razor', 'steelseries', 'corsair', 'メモリ', 'ssd', 'm.2', '秋葉原'],
            'ld_frontier': ['frontier', 'フロンティア', '決算', '爆安', '大特価', '期間限定', '台数限定', 'bto', '格安pc'],
            'ld_sycom': ['sycom', 'サイコム', '静音', '水冷', 'デュアル水冷', '职人', 'こだわりのpc'],
            'ld_dynabook': ['dynabook', 'ダイナブック', 'シャープ', 'sharp', '東芝', 'toshiba', 'ノートパソコン', '軽量', 'モバイル'],
            'ld_nec': ['nec', 'lavie', '国産', '初心者', 'サポート', '安心', 'モバイル'],
            'ld_fujitsu': ['fujitsu', '富士通', 'fmv', 'lifebook', 'arrows', '軽量', '世界最軽量', '国産'],
            'ld_apple': ['apple', 'mac', 'ipad', 'iphone', 'macbook', 'imac', 'ios', 'macos', 'watch', 'm1', 'm2', 'm3', 'm4'],
            'ld_asus': ['asus', 'rog', 'zenbook', 'vivobook', 'expertbook', 'エイスース', 'ally', '新作'],
            'ld_msi': ['msi', 'claw', 'stealth', 'raider', 'cyborg', 'ゲーミングノート', 'マザーボード', 'グラボ'],
            'ld_sony': ['sony', 'playstation', 'vaio', 'xperia', 'ps5', 'ps4', 'ブラビア', 'ソニー', 'カメラ', 'α'],
            'ld_dell': ['dell', 'alienware', 'xps', 'inspiron', 'デル', 'モニター', 'セール'],
            'ld_hp': ['hp', 'omen', 'victus', 'envy', 'spectre', 'pavilion', 'ヒューレットパッカード', 'プリンター'],
            'ld_lenovo': ['lenovo', 'thinkpad', 'thinkcentre', 'legion', 'yoga', 'ideapad', 'レノボ', 'セール'],
            'ld_logicool': ['logicool', 'razer', 'mouse', 'keyboard', 'ヘッドセット', 'マウス', 'キーボード', 'ゲーミングデバイス'],
            'ld_intel': ['intel', 'core', 'i9', 'i7', 'i5', 'nvidia', 'rtx', 'geforce', 'cpu', 'gpu'],
            'ld_amd': ['amd', 'ryzen', 'radeon', 'threadripper', 'am5', 'am4', 'ソケット', 'cpu'],
            'wp_saving': ['得', '節約', 'ポイント', '還元', 'キャンペーン', 'セール', '格安', 'コスパ', '激安', 'クーポン', 'ポイ活'],
            'h_money': ['投資', '株', '資産', '運用', '節約', '金', 'マネー', '新nisa', 'ideco'],
            'h_ai': ['ai', 'chatgpt', 'gemini', 'openai', '生成', 'プロンプト', 'llm', '未来'],
            'seesaa_ai': ['生成', '人工知能', '機械学習', 'ディープラーニング', '自動', 'モデル', '開発'],
        }

    DRIVERS = {k: LivedoorDriver for k in BLOG_CONFIGS.keys() if k.startswith('ld_')}
    DRIVERS.update({k: SeesaaDriver for k in BLOG_CONFIGS.keys() if k.startswith('seesaa')})
    DRIVERS.update({k: HatenaDriver for k in BLOG_CONFIGS.keys() if k.startswith('h_')})
    DRIVERS.update({'wp_main': WordPressDriver, 'wp_saving': WordPressDriver})

    # 🚨 Markdown管理は廃止されたため、パス設定をコメントアウト
    # MD_PATHS = {
    #     'default': "/home/maya/shin-dev/shin-vps/next-bicstation/content/posts",
    #     'saving': "/home/maya/shin-dev/shin-vps/next-bic-saving/content/posts"
    # }

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
        self.log("--- 🚀 BICSTATION Multi-Fleet v18.0 START ---", self.style.SUCCESS)
        
        rss_pool = self.get_fresh_rss_pool()
        if not rss_pool:
            self.log("🏁 新着記事なし。")
            return

        final_tasks = {}
        used_links = set()
        routing_map = self.get_routing_map()
        blog_keys = list(self.BLOG_CONFIGS.keys())
        random.shuffle(blog_keys)

        for b_key in blog_keys:
            best_entry = None
            keys = routing_map.get(b_key, [])
            for entry in rss_pool:
                if entry.link in used_links: continue
                text = (entry.title + (getattr(entry, 'summary', ""))).lower()
                if any(k.lower() in text for k in keys):
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

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        current_dir = os.path.dirname(os.path.abspath(__file__))
        with open(os.path.join(current_dir, "prompt", "ai_prompt_news.txt"), "r", encoding='utf-8') as f:
            template = f.read()

        for b_key, entry in final_tasks.items():
            try:
                self.process_single_post(b_key, entry, template, api_keys)
                time.sleep(30) 
            except Exception as e:
                self.log(f"🔥 [{b_key}] Error: {str(e)}", self.style.ERROR)

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

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')

            # 🚨 [画像エンジン] packageタグ優先、なければOGP、DMMならサイズ置換
            raw_img = ""
            if hasattr(entry, 'package'): 
                raw_img = entry.package
            else:
                og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
                raw_img = og_img["content"] if og_img else ""
            
            # DMM画像の場合のサイズ最大化
            img_url = re.sub(r'(p[s|r|t]|p)\.jpg$', 'pl.jpg', raw_img)

            # 🚨 [重複防止] 本文内のimgを物理除去
            content_area = soup.find('article') or soup.find('main') or soup.body
            if content_area:
                for img in content_area.find_all('img'):
                    img.decompose()
            
            body_text = content_area.get_text(strip=True) if content_area else ""
            
            return {
                'url': entry.link, 
                'title': entry.title, 
                'img': img_url, 
                'body': body_text[:5000]
            }
        except: return None

    def process_single_post(self, b_key, entry, template, api_keys):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] Processing...")
        data = self.scrape_article(entry)
        if not data: return
        
        processor = AIProcessor(api_keys, template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext: return
        
        title = ext.get('title_g', '').replace('\n', '').strip()
        raw_body = ext.get('cont_h') if b_key.startswith('h_') else ext.get('cont_g')
        html_body = HTMLConverter.md_to_html(raw_body)
        
        driver_class = self.DRIVERS.get(b_key)
        if driver_class:
            cfg = self.BLOG_CONFIGS[b_key].copy()
            if 'app_password' in cfg: cfg['password'] = cfg['app_password']
            
            driver = driver_class(cfg)
            is_saving = (b_key == 'wp_saving' or b_key == 'h_money')
            brand_name = "賢い節約情報" if is_saving else "最新PCガジェット"
            base_url = "https://bic-saving.com" if is_saving else "https://bicstation.com"
            footer = f'<hr><p style="text-align:center;">🚀 <b>{brand_name}</b>: <a href="{base_url}">{base_url}</a></p>'
            
            # 🚨 image_urlを明示的に渡す（Driverが1枚だけ大きく表示する）
            if driver.post(title=title, body=html_body + footer, image_url=data['img'], source_url=data['url']):
                # 🏆 Django DBへの保存（これがマスターデータになる）
                ArticleMapper.save_post_result(b_key, ext, data, True)
                self.log(f"📊 [{b_key.upper()}] ✅ Posted & DB Saved")
                
                # 🚨 Markdown保存はDB管理に移行したためコメントアウト
                # save_dir = self.MD_PATHS['saving'] if is_saving else self.MD_PATHS['default']
                # self.save_as_markdown(ext, data, save_dir)

    # 🚨 DB一元管理のため、以下のMD保存関数は不要（コメントアウト）
    # def save_as_markdown(self, ext, data, output_dir):
    #     try:
    #         if not os.path.exists(output_dir): os.makedirs(output_dir, exist_ok=True)
    #         file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
    #         path = os.path.join(output_dir, f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md")
    #         m = ArticleMapper.format_for_markdown(ext, data)
    #         md_content = f'---\ntitle: "{m["title"]}"\ndate: "{datetime.now().strftime("%Y-%m-%d")}"\ncategory: "News"\nimage: "{m["image"]}"\nsource_url: "{m["source"]}"\n---\n\n{m["content"]}\n'
    #         with open(path, "w", encoding='utf-8') as f: f.write(md_content)
    #     except: pass