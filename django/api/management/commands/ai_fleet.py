# -*- coding: utf-8 -*-
import feedparser, csv, os, re, random, time, urllib.request, requests, json, unicodedata
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.article import Article 

# --- 外部ライブラリ (Indexing API) ---
from google.oauth2 import service_account
from googleapiclient.discovery import build

# --- 外部ドライバー群 ---
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.data_mapper import ArticleMapper
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'Gemma 3 艦隊司令部 v2.0 [Strategic Indexing Edition]'

    # プロジェクト単位での許可リスト
    ALLOWED_PROJECTS = ['bicstation', 'saving', 'tiper', 'avflash']
    
    # プロジェクトとドメインの紐付け（サチコ通知用）
    DOMAIN_MAP = {
        'tiper': 'https://tiper.live',
        'avflash': 'https://av-flash.com',
        'bicstation': 'https://bic-station.com',
        'saving': 'https://bic-saving.com',
    }

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, help='実行するプロジェクト名またはsite_keyを指定')
        parser.add_argument('--platform', type=str, help='投稿先プラットフォームを指定 (livedoor, hatena, blogger, wordpress)')
        parser.add_argument('--limit', type=int, default=1, help='1サイトあたりの最大投稿数')
        parser.add_argument('--index', action='store_true', help='サチコ(Indexing API)への通知を有効にする')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_urls_in_this_session = []
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys: self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.PROMPT_DIR = os.path.join(self.base_path, 'prompt')
        self.SETTING_DIR = os.path.join(self.base_path, 'teitoku_settings')
        # サチコ鍵のパス
        self.SACHIKO_KEY = os.path.join(self.base_path, 'bs_json', 'google-indexing-key.json')

    def handle(self, *args, **options):
        target = options.get('project')
        target_platform = options.get('platform')
        post_limit = options.get('limit')
        use_index = options.get('index')

        self.log(f"--- 🚀 MISSION START: v2.0 (Target: {target or 'ALL'}, Platform: {target_platform or 'ALL'}) ---", self.style.SUCCESS)
        
        RSS_CSV = os.path.join(self.SETTING_DIR, 'master_rss_sources.csv')
        FLEET_CSV = os.path.join(self.SETTING_DIR, 'master_fleet.csv')

        if not os.path.exists(FLEET_CSV):
            self.log(f"❌ {FLEET_CSV} が見つかりません。", self.style.ERROR)
            return

        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            fleet_reader = csv.DictReader(f, delimiter='\t')
            
            for blog_config in fleet_reader:
                project_name = (blog_config.get('project') or '').strip().lower()
                site_key = (blog_config.get('site_key') or '').strip().lower()
                platform = (blog_config.get('platform') or 'livedoor').strip().lower()

                # プロジェクト制限
                if project_name not in self.ALLOWED_PROJECTS: continue
                if target and target.lower() not in [project_name, site_key]: continue
                
                # プラットフォーム制限（引数指定がある場合）
                if target_platform and target_platform.lower() != platform: continue

                self.log(f"🚢 【出撃】: {project_name} > {site_key} [{platform}]")
                
                prompt_tpl = self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{site_key}.txt") or \
                             self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{project_name}.txt")
                
                if not prompt_tpl:
                    self.log(f"  ⚠️ プロンプト欠如: スキップ ({site_key})")
                    continue

                processor = AIProcessor(api_keys=self.api_keys, template=prompt_tpl)
                self.deploy_mission(site_key, platform, blog_config, post_limit, RSS_CSV, processor, use_index)

        self.log("--- 🏁 全ミッション終了 ---", self.style.SUCCESS)

    def deploy_mission(self, site_key, platform, blog_config, limit, rss_csv_path, processor, use_index):
        project_name = (blog_config.get('project') or '').strip().lower()
        persona = blog_config.get('persona')
        rss_category_str = (blog_config.get('rss_category') or '').strip()
        target_cats = [c.strip().lower() for c in rss_category_str.split(',')]

        rss_urls = []
        if os.path.exists(rss_csv_path):
            with open(rss_csv_path, "r", encoding="utf-8-sig") as f:
                rss_reader = csv.DictReader(f, delimiter='\t')
                for row in rss_reader:
                    if (row.get('project') or '').strip().lower() == project_name and \
                       (row.get('rss_category') or '').strip().lower() in target_cats:
                        url = (row.get('rss_url') or '').strip()
                        if url: rss_urls.append(url)
        
        rss_urls = list(set(rss_urls))
        if not rss_urls: return

        all_entries = []
        for url in rss_urls:
            try:
                res = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
                feed = feedparser.parse(res.content)
                for entry in feed.entries:
                    if not Article.objects.filter(source_url=entry.link, site=site_key).exists() and \
                       entry.link not in self.selected_urls_in_this_session:
                        all_entries.append(entry)
            except: pass

        if not all_entries: return
        random.shuffle(all_entries)
        success_count = 0
        temp_entries = all_entries[:]

        for i in range(limit):
            if success_count >= limit or not temp_entries: break

            selected_entry = self.let_persona_choose_rest(persona, temp_entries[:40], rss_category_str)
            if not selected_entry: break
            
            self.selected_urls_in_this_session.append(selected_entry.link)
            self.log(f"  🎯 選定: {selected_entry.title[:35]}...")
            
            is_adult_site = any(domain in selected_entry.link.lower() for domain in ['dmm.co.jp', 'dmm.com', 'fanza.jp', 'fanza.news'])
            p_data = self.get_parsed_data(selected_entry, is_adult_site=is_adult_site)
            input_data = {'url': selected_entry.link, 'title': selected_entry.title, 'body': p_data.get('body', '')}
            
            try:
                ai_res = processor.generate_blog_content(input_data, platform)
                if not ai_res: raise Exception("AI生成失敗")

                final_title = ai_res.get('title_h') if platform == 'hatena' else ai_res.get('title_g')
                final_body = ai_res.get('cont_h') if platform == 'hatena' else ai_res.get('cont_g')
                summary_box = ai_res.get('summary', '')

                if final_body:
                    teitoku_comment = self.get_random_teitoku_comment(project_name)
                    cta_content = self.load_external_file(self.PROMPT_DIR, f"cta_{site_key}.txt") or \
                                  self.load_external_file(self.PROMPT_DIR, f"cta_{project_name}.txt")
                    
                    full_content = f"{summary_box}\n\n{final_body}" if summary_box else final_body
                    full_html = self.assemble_final_html(full_content, p_data.get('img'), teitoku_comment, cta_content)

                    DriverClass = {'livedoor': LivedoorDriver, 'blogger': BloggerDriver, 'hatena': HatenaDriver, 'wordpress': WordPressDriver}.get(platform)
                    if DriverClass:
                        driver = DriverClass(blog_config)
                        post_category = rss_category_str.split(',')[0] if rss_category_str else "最新情報"
                        if driver.post(title=final_title, body=full_html, image_url=p_data.get('img', ''), source_url=selected_entry.link, category=post_category):
                            new_article_id = self.save_to_db(selected_entry, blog_config, final_title, full_html, p_data.get('img'), platform)
                            self.log(f"  ✅ 成功: {final_title[:25]}...", self.style.SUCCESS)
                            
                            # サチコ通知 (Next.js側のURL)
                            if use_index and new_article_id:
                                base_domain = self.DOMAIN_MAP.get(project_name)
                                if base_domain:
                                    target_url = f"{base_domain}/article/{new_article_id}"
                                    self.notify_google_indexing(target_url)

                            success_count += 1
                            if success_count < limit: time.sleep(random.randint(20, 45))
            except Exception as e:
                self.log(f"  ❌ エラー: {str(e)}", self.style.ERROR)
            
            temp_entries = [e for e in temp_entries if e.link != selected_entry.link]

    def notify_google_indexing(self, target_url):
        """サチコ(Indexing API)への通知"""
        if not os.path.exists(self.SACHIKO_KEY):
            self.log(f"  ⚠️ サチコ鍵欠如: {self.SACHIKO_KEY}", self.style.WARNING)
            return
        try:
            scopes = ['https://www.googleapis.com/auth/indexing']
            credentials = service_account.Credentials.from_service_account_file(self.SACHIKO_KEY, scopes=scopes)
            service = build('indexing', 'v3', credentials=credentials)
            body = {"url": target_url, "type": "URL_UPDATED"}
            service.urlNotifications().publish(body=body).execute()
            self.log(f"  🚀 サチコ通報完了: {target_url}", self.style.SUCCESS)
        except Exception as e:
            self.log(f"  ❌ サチコエラー: {str(e)}", self.style.ERROR)

    def save_to_db(self, entry, blog_config, title, body, img, platform):
        site_key = blog_config.get('site_key')
        raw_cat = blog_config.get('rss_category', '')
        primary_cat = raw_cat.split(',')[0] if raw_cat else "未分類"
        is_adult_flag = True if str(blog_config.get('is_adult', '0')) == '1' else False
        with transaction.atomic():
            new_id = ArticleMapper.create_article(site_id=site_key, title=title, body_text=body, source_url=entry.link, main_image_url=img, category=primary_cat, tags=raw_cat, is_adult=is_adult_flag)
            ArticleMapper.save_post_result(new_id, blog_type=platform, is_published=True)
            Article.objects.filter(source_url=entry.link, site=site_key).update(is_exported=True)
            return new_id

    def assemble_final_html(self, body_content, img_url, comment, cta):
        img_tag = f'<p align="center"><img src="{img_url}" style="max-width:100%; border-radius:10px;"></p>' if img_url else ""
        comment_html = f'<div style="border: 2px dashed #ff4500; padding: 15px; margin: 20px 0; background: #fffaf0; border-radius: 10px;"><strong style="color: #ff4500;">🖋 編集長レビュー：</strong><br><span style="font-size: 1.1em; font-weight: bold;">「{comment}」</span></div>'
        return (img_tag + comment_html + body_content + f"<br><hr><br>{cta}").strip()

    def get_parsed_data(self, entry, is_adult_site=False):
        data = {'body': getattr(entry, 'description', getattr(entry, 'summary', entry.title)).replace('\x00', ''), 'img': ''}
        try:
            parser = RSSParserFactory.get_parser(entry.link)
            parsed = parser.parse(entry.link)
            if parsed:
                if len(parsed.get('body', '')) > 20: data['body'] = parsed['body']
                data['img'] = parsed.get('img', '')
        except: pass
        return data

    def load_external_file(self, directory, filename):
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f: return f.read()
        return ""

    def get_random_teitoku_comment(self, project_name):
        comment_file = os.path.join(self.SETTING_DIR, f"teitoku_{project_name}_comments.csv")
        if not os.path.exists(comment_file): return "要チェックの最新ニュースです。"
        try:
            with open(comment_file, "r", encoding="utf-8") as f:
                comments = [line.strip() for line in f if line.strip() and not line.startswith('キャラ設定')]
                return random.choice(comments) if comments else "必見の内容です。"
        except: return "要チェックです。"

    def let_persona_choose_rest(self, persona, articles, category_hint=""):
        if not articles: return None
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = f"あなたは【ペルソナ】{persona}です。リストから最高の一記事を[番号]のみで選べ。\n{list_txt}"
        try:
            r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=25)
            res_text = r.json()['candidates'][0]['content']['parts'][0]['text']
            m = re.search(r'\[(\d+)\]', res_text)
            idx = int(m.group(1)) if m else 0
            return articles[idx] if idx < len(articles) else articles[0]
        except: return articles[0]

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")