# -*- coding: utf-8 -*-
# BIC-FLEET Engine v1.2: Project Integrity Edition
# 修正内容: プロジェクト引数チェックの厳格化、プロジェクト名とsite_idの不一致を自動補正

import os, re, random, requests, feedparser, time, csv
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection
from urllib.parse import urljoin

from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BIC-FLEET v1.2: Project-Aware Deployment Engine'

    # 許可されるプロジェクト名の定義（ホワイトリスト）
    VALID_PROJECTS = ['bicstation', 'tiper', 'avflash', 'saving']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='bicstation', help='プロジェクト名')
        parser.add_argument('--target', '-t', type=str, default=None, help='投稿先指定: LD, BG, HT')

    def handle(self, *args, **options):
        project = options['project'].lower()
        
        # 🚨 【強化】プロジェクト名のバリデーション
        if project not in self.VALID_PROJECTS:
            self.log(f"❌ 不正なプロジェクト名です: '{project}'", self.style.ERROR)
            self.log(f"💡 許可されている値: {', '.join(self.VALID_PROJECTS)}", self.style.WARNING)
            return

        target = options['target'].upper() if options['target'] else None
        self.log(f"--- 🚀 BIC-FLEET Engine v1.2 [{project.upper()}] START ---", self.style.SUCCESS)
        
        current_cmd_dir = "/usr/src/app/api/management/commands"
        config_dir = os.path.join(current_cmd_dir, "config")
        prompt_dir = os.path.join(current_cmd_dir, "prompt")
        
        fleet_csv = os.path.join(config_dir, f"{project}_fleet.csv")
        rss_csv = os.path.join(config_dir, f"{project}_rss_sources.csv")

        # 設定ファイルの存在チェック
        if not os.path.exists(fleet_csv) or not os.path.exists(rss_csv):
            self.log(f"❌ 設定ファイルが見つかりません: {project}_fleet.csv または {project}_rss_sources.csv", self.style.ERROR)
            return

        rss_sources = self.load_csv_data(rss_csv)
        all_fleet_data = self.load_csv_data(fleet_csv)

        # 投稿ターゲットのフィルタリング
        fleet_data = [s for s in all_fleet_data if not target or s['platform'].upper().startswith(target)]
        if not fleet_data:
            self.log(f"⚠️ 指定されたターゲット '{target}' に合致するサイトがありません。", self.style.WARNING)
            return
            
        random.shuffle(fleet_data)

        # RSS取得と未登録チェック
        rss_urls = [row['url'] for row in rss_sources]
        raw_pool = self.get_fresh_rss_pool(rss_urls)
        # source_urlが既にArticleモデルに存在するかグローバルにチェック（重複投稿防止）
        rss_pool = [e for e in raw_pool if not Article.objects.filter(source_url=e.link).exists()]
        
        if not rss_pool:
            self.log("🏁 新着記事はありません（全記事登録済み）。")
            return

        # AIプロンプトの読み込み
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        prompt_path = os.path.join(prompt_dir, f"ai_prompt_{project}.txt")
        if not os.path.exists(prompt_path): prompt_path = os.path.join(prompt_dir, "ai_prompt_news.txt")
        
        with open(prompt_path, "r", encoding='utf-8') as f:
            ai_template = f.read()

        # CTAの読み込み
        cta_path = os.path.join(prompt_dir, f"cta_{project}.txt")
        if not os.path.exists(cta_path): cta_path = os.path.join(prompt_dir, "cta_default.txt")
        cta_template = ""
        if os.path.exists(cta_path):
            with open(cta_path, "r", encoding='utf-8') as f:
                cta_template = f.read()

        stats = {"success": [], "fail": [], "skip": []}

        for site in fleet_data:
            b_key = site['site_key']
            try:
                # 当該サイトで未投稿の記事を抽出
                current_unused = [e for e in rss_pool if not Article.objects.filter(site=b_key, source_url=e.link).exists()]
                if not current_unused:
                    stats["skip"].append(b_key.upper())
                    continue

                target_entry = random.choice(current_unused)
                success = self.process_single_post(b_key, site.copy(), target_entry, ai_template, cta_template, api_keys, current_cmd_dir, project)
                
                if success:
                    stats["success"].append(b_key.upper())
                    # 投稿に成功したらプールから削除（同一セッション内での他サイトへの重複を防ぐ場合）
                    rss_pool = [e for e in rss_pool if e.link != target_entry.link]
                else:
                    stats["fail"].append(b_key.upper())
                
                time.sleep(random.randint(15, 45))
            except Exception as e:
                self.log(f"🔥 [{b_key}] 致命的エラー: {str(e)}", self.style.ERROR)
                stats["fail"].append(b_key.upper())

        self.show_final_report(stats)

    def process_single_post(self, b_key, cfg, entry, ai_template, cta_template, api_keys, cmd_dir, project):
        connection.close()
        self.log(f"🧵 [{b_key.upper()}] プロジェクト: {project} | 処理開始: {entry.title[:25]}...")
        
        data = self.scrape_article(entry)
        if not data: return False
        
        processor = AIProcessor(api_keys, ai_template)
        ext = processor.generate_blog_content(data, b_key)
        if not ext or not ext.get('title_g'): return False
        
        # 🌟 【重要】ArticleMapper.create_article 呼び出し
        # site_id（b_key）がプロジェクト識別子（bicstation等）としてDBに刻まれます
        article_id = ArticleMapper.create_article(
            site_id=b_key, 
            title=ext.get('title_g', 'No Title').strip(),
            body_text=ext.get('cont_g', ''),
            source_url=data['url'],
            content_type='post',
            extra_metadata={
                'project': project, # 👈 引数で指定したプロジェクト名を明示的に保存
                'is_main_brand': (b_key == project), # site_keyがproject名と一致すればメイン
                'original_title': data['title'],
                'source_img': data['img'],
                'scraped_at': datetime.now().isoformat()
            }
        )
        
        if not article_id: return False

        # 🌟 【DB_FIX】featured_image を強制同期（再確認）
        try:
            Article.objects.filter(id=article_id).update(featured_image=data['img'], site=b_key)
            self.log(f"💾 [SYNC] Article ID:{article_id} の site='{b_key}' と画像を確定しました。")
        except Exception as e:
            self.log(f"⚠️ DB更新失敗: {str(e)}")

        # ドメインマップに基づいた内部URL生成
        domain_map = {'bicstation': 'bicstation.com', 'saving': 'bic-saving.com', 'tiper': 'tiper.live', 'avflash': 'avflash.net'}
        domain = domain_map.get(project, 'bicstation.com')
        internal_url = f"https://{domain}/news/{article_id}"
        
        title = ext.get('title_g', '').strip()
        pf = cfg['platform'].lower()
        cfg['current_dir'] = cmd_dir 

        # ドライバー選定
        if pf == 'hatena':
            raw_body = ext.get('cont_h') or ext.get('cont_g')
            driver_class = HatenaDriver
        elif pf == 'blogger':
            raw_body = ext.get('cont_g')
            driver_class = BloggerDriver
        else:
            raw_body = ext.get('cont_g')
            driver_class = LivedoorDriver
            
        html_body = HTMLConverter.md_to_html(raw_body)
        final_cta = cta_template.replace("{{internal_url}}", internal_url)
        
        post_config = {
            **cfg, 
            'api_key': cfg.get('api_key_or_pw'), 
            'endpoint': cfg.get('url_or_endpoint'), 
            'url': cfg.get('url_or_endpoint'), 
            'blog_id': cfg.get('blog_id_or_rpc')
        }
        
        try:
            driver = driver_class(post_config)
            if driver.post(title=title, body=html_body + final_cta, image_url=data['img'], source_url=data['url']):
                ArticleMapper.save_post_result(article_id, blog_type=pf, post_url=post_config['url'], is_published=True)
                self.log(f"📊 [{b_key.upper()}] 配信完了: {internal_url}", self.style.SUCCESS)
                return True
        except Exception as e:
            self.log(f"❌ 外部投稿失敗 [{b_key}]: {str(e)}", self.style.WARNING)
            
        return False

    def scrape_article(self, entry):
        """画像・本文の抽出ロジック"""
        try:
            target_url = entry.link
            headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
            res = requests.get(target_url, timeout=12, headers=headers)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')

            img_url = ""
            og = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"}) or soup.find("meta", property="twitter:image")
            
            if og and og.get("content"):
                img_url = og["content"]
                if img_url.startswith('/'): img_url = urljoin(target_url, img_url)
            
            # 画像がない場合のランダム生成（テック/アダルト問わず視認性確保）
            if not img_url or "no-image" in img_url.lower():
                seed = random.randint(1000, 9999)
                img_url = f"https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1024&sig={seed}"

            # 本文抽出（ノイズ除去）
            area = soup.find('article') or soup.find('main') or soup.find('div', class_=re.compile(r'content|post|entry')) or soup.body
            if area:
                for tags in area.find_all(['img', 'script', 'style', 'nav', 'header', 'footer', 'aside']):
                    tags.decompose()
                body_text = area.get_text(separator=' ', strip=True)[:5500]
            else:
                body_text = ""

            return {'url': target_url, 'title': entry.title, 'img': img_url, 'body': body_text}
        except Exception as e:
            self.log(f"🚨 スクレイピングエラー: {str(e)}", self.style.ERROR)
            return None

    def load_csv_data(self, path):
        data = []
        if not os.path.exists(path): return data
        with open(path, "r", encoding="utf-8") as f:
            reader = csv.DictReader(f, delimiter='|')
            for row in reader: data.append(row)
        return data

    def get_fresh_rss_pool(self, urls):
        pool = []
        for url in urls:
            try:
                res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                feed = feedparser.parse(res.text)
                pool.extend(feed.entries)
            except: continue
        return pool

    def show_final_report(self, stats):
        self.stdout.write(self.style.MIGENT(f"\n--- 🏁 最終レポート ---"))
        self.stdout.write(f"成功: {len(stats['success'])} 件")
        self.stdout.write(f"失敗: {len(stats['fail'])} 件")
        self.stdout.write(f"スキップ: {len(stats['skip'])} 件\n")

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)