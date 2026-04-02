# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/post_fleet.py

import feedparser, csv, os, re, random, time, urllib.request, requests, json, unicodedata
import markdown
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models.article import Article 

from google.oauth2 import service_account
from googleapiclient.discovery import build

# 既存のドライバー群
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.wordpress_driver import WordPressDriver
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = '🔱 Gemma 3 艦隊司令部 v3.0 [v5.0 DB規格完全準拠版]'

    ALLOWED_PROJECTS = ['bicstation', 'saving', 'tiper', 'avflash']
    
    DOMAIN_MAP = {
        'tiper': 'https://tiper.live',
        'avflash': 'https://avflash.xyz',
        'bicstation': 'https://bic-station.com',
        'saving': 'https://bic-saving.com',
    }

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, help='実行するプロジェクト名')
        parser.add_argument('--platform', type=str, help='投稿先プラットフォーム')
        parser.add_argument('--limit', type=int, default=1, help='最大投稿数')
        parser.add_argument('--index', action='store_true', help='Indexing API有効化')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.selected_urls_in_this_session = []
        # APIキーの読み込み（最大10個）
        self.api_keys = [os.getenv(f'GEMINI_API_KEY_{i}') for i in range(1, 11)]
        self.api_keys = [k for k in self.api_keys if k and not k.startswith('GEMINI')]
        if not self.api_keys: self.api_keys = [os.getenv('GEMINI_API_KEY')]
        
        self.base_path = os.path.dirname(os.path.abspath(__file__))
        self.PROMPT_DIR = os.path.join(self.base_path, 'prompt')
        self.SETTING_DIR = os.path.join(self.base_path, 'teitoku_settings')
        self.SACHIKO_KEY = os.path.join(self.base_path, 'bs_json', 'google-indexing-key.json')

    def handle(self, *args, **options):
        target = options.get('project')
        target_platform = options.get('platform')
        post_limit = options.get('limit')
        use_index = options.get('index')

        self.log(f"--- 🚀 MISSION START: v3.0 (v5.0 DB Sync) ---", self.style.SUCCESS)
        
        FLEET_CSV = os.path.join(self.SETTING_DIR, 'master_fleet.csv')
        RSS_CSV = os.path.join(self.SETTING_DIR, 'master_rss_sources.csv')

        if not os.path.exists(FLEET_CSV):
            self.log(f"❌ Fleet CSVが見つかりません: {FLEET_CSV}", self.style.ERROR)
            return

        with open(FLEET_CSV, "r", encoding="utf-8-sig") as f:
            fleet_reader = csv.DictReader(f, delimiter='\t')
            for blog_config in fleet_reader:
                project_name = (blog_config.get('project') or '').strip().lower()
                site_key = (blog_config.get('site_key') or '').strip().lower()
                platform = (blog_config.get('platform') or 'livedoor').strip().lower()

                if project_name not in self.ALLOWED_PROJECTS: continue
                if target and target.lower() not in [project_name, site_key]: continue
                if target_platform and target_platform.lower() != platform: continue

                self.log(f"🚢 【出撃】: {project_name} > {site_key} [{platform}]")
                prompt_tpl = self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{site_key}.txt") or \
                             self.load_external_file(self.PROMPT_DIR, f"ai_prompt_{project_name}.txt")
                
                if not prompt_tpl:
                    self.log(f" ⏩ プロンプト不在のためスキップ")
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
                    if not Article.objects.filter(source_url=entry.link, site=site_key).exists():
                        all_entries.append(entry)
            except: pass

        if not all_entries: return
        random.shuffle(all_entries)
        
        success_count = 0
        while success_count < limit and all_entries:
            selected_entry = self.let_persona_choose_rest(persona, all_entries[:30], rss_category_str)
            if not selected_entry: break
            
            all_entries = [e for e in all_entries if e.link != selected_entry.link]
            
            # 【画像チェック】
            is_adult_ref = any(dm in selected_entry.link.lower() for dm in ['dmm.co.jp', 'dmm.com', 'fanza'])
            p_data = self.get_parsed_data(selected_entry)
            
            if not p_data.get('img'):
                self.log(f" ⏩ 画像なしを検知。次を探します。")
                continue 

            self.log(f" 🎯 選定: {selected_entry.title[:35]}...")

            input_data = {'url': selected_entry.link, 'title': selected_entry.title, 'body': p_data.get('body', '')}
            try:
                # 2. AI本文生成 (Main用とSatellite用を想定)
                ai_res = processor.generate_blog_content(input_data, platform)
                if not ai_res: raise Exception("AI生成失敗")

                final_title = ai_res.get('title_h') if platform == 'hatena' else ai_res.get('title_g')
                final_body_md = ai_res.get('cont_h') if platform == 'hatena' else ai_res.get('cont_g')
                summary_box = ai_res.get('summary', '')

                if final_body_md:
                    # v5.0新仕様: Articleを先に作成（ID確定）
                    # is_adult は blog_config または URLドメインから判定
                    is_adult_val = True if str(blog_config.get('is_adult', '0')) == '1' or is_adult_ref else False
                    
                    with transaction.atomic():
                        new_article = Article.objects.create(
                            site=site_key,
                            is_adult=is_adult_val,
                            title=final_title,
                            source_url=selected_entry.link,
                            body_main="", # 後でHTML化して入れる
                            body_satellite="",
                            images_json=[{"url": p_data.get('img'), "type": "main"}],
                            show_on_main=True,
                            show_on_satellite=True,
                            content_type='news',
                            is_exported=True
                        )
                        new_article_id = new_article.id

                    # 4. メインサイトURLの組み立て (avflash.xyz/post/ID)
                    base_domain = self.DOMAIN_MAP.get(project_name, "https://avflash.xyz")
                    main_site_url = f"{base_domain}/post/{new_article_id}"

                    # 5. CTA置換
                    cta_raw = self.load_external_file(self.PROMPT_DIR, f"cta_{site_key}.txt") or \
                              self.load_external_file(self.PROMPT_DIR, f"cta_{project_name}.txt")
                    cta_replaced = cta_raw.replace('{{internal_url}}', main_site_url) if cta_raw else ""

                    # 6. HTML最終構築
                    teitoku_comment = self.get_random_teitoku_comment(project_name)
                    full_content_md = f"{summary_box}\n\n{final_body_md}" if summary_box else final_body_md
                    full_html = self.assemble_final_html(full_content_md, p_data.get('img'), teitoku_comment, cta_replaced)

                    # 7. 外部ブログへ投稿
                    DriverClass = {'livedoor': LivedoorDriver, 'blogger': BloggerDriver, 'hatena': HatenaDriver, 'wordpress': WordPressDriver}.get(platform)
                    if DriverClass:
                        driver = DriverClass(blog_config)
                        post_category = rss_category_str.split(',')[0] if rss_category_str else "最新情報"
                        
                        if driver.post(title=final_title, body=full_html, image_url='', source_url=selected_entry.link, category=post_category):
                            # 8. DBを完成版HTMLで更新 (v5.0仕様)
                            # ここでは body_main にメインコンテンツを、body_satellite にも予備で入れます
                            Article.objects.filter(id=new_article_id).update(
                                body_main=full_html,
                                body_satellite=full_html
                            )
                            
                            self.log(f" ✅ 成功(ID:{new_article_id}): {final_title[:25]}...", self.style.SUCCESS)
                            
                            # 9. Google Indexing API
                            if use_index:
                                self.notify_google_indexing(main_site_url)

                            success_count += 1
                            if success_count < limit: time.sleep(random.randint(20, 45))
            except Exception as e:
                self.log(f" ❌ エラー: {str(e)}", self.style.ERROR)

    def get_parsed_data(self, entry):
        data = {'body': getattr(entry, 'description', getattr(entry, 'summary', entry.title)).replace('\x00', ''), 'img': ''}
        try:
            parser = RSSParserFactory.get_parser(entry.link)
            parsed = parser.parse(entry.link)
            if parsed:
                if len(parsed.get('body', '')) > 20: data['body'] = parsed['body']
                img_url = parsed.get('img', '')
                if img_url:
                    if 'pics.dmm.' in img_url:
                        img_url = img_url.replace('ps.jpg', 'pl.jpg').replace('pt.jpg', 'pl.jpg')
                    try:
                        resp = requests.head(img_url, timeout=10, allow_redirects=True)
                        final_url = resp.url.lower()
                        is_dummy = any(k in final_url for k in ['now_printing', 'noimage', 'common/no_photo'])
                        content_size = int(resp.headers.get('Content-Length', 0))
                        if is_dummy or (content_size > 0 and content_size < 10000):
                            img_url = ''
                        else:
                            img_url = resp.url
                    except: pass
                data['img'] = img_url
        except: pass
        return data

    def assemble_final_html(self, md_content, img_url, comment, cta):
        html_body = markdown.markdown(md_content, extensions=['extra', 'nl2br'])
        img_tag = f'<p align="center"><img src="{img_url}" style="max-width:100%; border-radius:10px; margin-bottom:25px;"></p>' if img_url else ""
        comment_html = (
            f'<div style="border-left: 5px solid #ff4500; padding: 10px 15px; margin: 20px 0; '
            f'background: #fffaf0; border-radius: 0 10px 10px 0;">'
            f'<strong style="color: #ff4500;">🖋 編集長レビュー</strong><br>'
            f'<span style="font-size: 1.05em; font-weight: bold;">「{comment}」</span></div>'
        )
        cta_html = markdown.markdown(cta, extensions=['extra']) if cta else ""
        return (img_tag + comment_html + html_body + f"<br><hr><br>{cta_html}").strip()

    def notify_google_indexing(self, target_url):
        if not os.path.exists(self.SACHIKO_KEY): return
        try:
            scopes = ['https://www.googleapis.com/auth/indexing']
            credentials = service_account.Credentials.from_service_account_file(self.SACHIKO_KEY, scopes=scopes)
            service = build('indexing', 'v3', credentials=credentials)
            body = {"url": target_url, "type": "URL_UPDATED"}
            service.urlNotifications().publish(body=body).execute()
            self.log(f" 🚀 Index通知完了: {target_url}", self.style.SUCCESS)
        except Exception as e:
            self.log(f" ⚠️ Index通知失敗: {str(e)}")

    def load_external_file(self, directory, filename):
        path = os.path.join(directory, filename)
        if os.path.exists(path):
            with open(path, 'r', encoding='utf-8') as f: return f.read()
        return ""

    def get_random_teitoku_comment(self, project_name):
        comment_file = os.path.join(self.SETTING_DIR, f"teitoku_{project_name}_comments.csv")
        if not os.path.exists(comment_file): return "注目の最新作です。"
        try:
            with open(comment_file, "r", encoding="utf-8") as f:
                comments = [line.strip() for line in f if line.strip() and not line.startswith('キャラ設定')]
                return random.choice(comments) if comments else "必見です。"
        except: return "要チェックです。"

    def let_persona_choose_rest(self, persona, articles, category_hint=""):
        if not articles: return None
        key = random.choice(self.api_keys)
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={key}"
        list_txt = "\n".join([f"[{i}] {a.title}" for i, a in enumerate(articles)])
        prompt = f"あなたは【{persona}】です。リストから最高の一記事を[番号]のみで選べ。\n{list_txt}"
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