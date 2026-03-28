# -*- coding: utf-8 -*-
import os, random, requests, feedparser, time, csv, re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.db import connection, transaction
from django.utils.text import slugify

# モデルのインポート
from api.models.article import Article

from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.rss_parsers import RSSParserFactory 
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor
from api.management.commands.blog_drivers.rss_extractors import ExtractorFactory

class Command(BaseCommand):
    help = "Deploy articles to fleet sites with robust RSS extraction, AI cleaning, and JSON metadata auto-fill."

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default=None)
        parser.add_argument('--site', type=str, default=None)
        parser.add_argument('--platform', type=str, default=None)

    def handle(self, *args, **options):
        if not options['project']:
            self.print_custom_help()
            return

        project_label = options['project'].lower()
        target_site_key = options['site'].lower() if options['site'] else None
        target_platform = options['platform'].lower() if options['platform'] else None
        
        self.log(f"--- 🚀 STRATEGIC DEPLOYMENT START: [{project_label.upper()}] ---", self.style.SUCCESS)
        
        config_dir = "/usr/src/app/api/management/commands/teitoku_settings"
        if not os.path.exists(config_dir):
            config_dir = "/home/maya/shin-dev/shin-vps/django/api/management/commands/teitoku_settings"
        
        prompt_dir = "/usr/src/app/api/management/commands/prompt"
        fleet_path = os.path.join(config_dir, "master_fleet.csv")
        rss_path = os.path.join(config_dir, "master_rss_sources.csv")
        comment_path = os.path.join(config_dir, f"{project_label}_comments.csv")

        all_fleet = self.load_master_csv(fleet_path)
        rss_master = self.load_master_csv(rss_path)
        char_comments = self.load_character_comments(comment_path)

        fleet_data = [f for f in all_fleet if str(f.get('project', '')).strip().lower() == project_label]
        if target_platform:
            fleet_data = [f for f in fleet_data if str(f.get('platform', '')).strip().lower() == target_platform]
        if target_site_key:
            fleet_data = [f for f in fleet_data if str(f.get('site_key', '')).strip().lower() == target_site_key]

        if not fleet_data:
            return self.log(f"❌ 該当データなし (Project: {project_label})", self.style.ERROR)

        api_keys = [{"key": os.getenv(f"GEMINI_API_KEY_{i}").strip()} for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        try:
            with open(os.path.join(prompt_dir, f"ai_prompt_{project_label}.txt"), "r", encoding='utf-8') as f: ai_template = f.read()
            with open(os.path.join(prompt_dir, f"cta_{project_label}.txt"), "r", encoding='utf-8') as f: cta_template = f.read()
        except Exception as e:
            return self.log(f"❌ テンプレート読込失敗: {e}", self.style.ERROR)

        needed_cats = set(f.get('rss_category') or self.guess_category(f.get('site_key')) for f in fleet_data)
        rss_pool = self.build_rss_pool(rss_master, list(needed_cats))

        success_count = 0
        used_links = set()

        for idx, site_cfg in enumerate(fleet_data, 1):
            site_key = site_cfg.get('site_key', 'UNKNOWN')
            platform = site_cfg.get('platform', '').lower()
            cat_name = site_cfg.get('rss_category') or self.guess_category(site_key)
            keywords = [k.strip() for k in site_cfg.get('keywords', '').split(',') if k.strip()]
            
            self.log(f"🔄 [{idx}/{len(fleet_data)}] {site_key} ({platform})")
            
            target_entries = rss_pool.get(cat_name, [])
            posted_successfully = False

            for entry in target_entries:
                if entry['link'] in used_links: continue
                if Article.objects.filter(site=project_label, source_url=entry['link']).exists(): continue

                parser = RSSParserFactory.get_parser(entry['link'])
                parsed_data = parser.parse(entry['link'])
                if not parsed_data or not parsed_data.get('body'): continue

                if entry.get('rss_img'):
                    parsed_data['img'] = entry['rss_img']

                if keywords:
                    search_text = (entry['title'] + " " + parsed_data.get('body', '')).lower()
                    search_text = search_text.replace('ｖｒ', 'vr').replace('ヴイアール', 'vr')
                    if not any(kw.lower() in search_text for kw in keywords): continue

                self.log(f"   🎯 マッチ: {entry['title'][:40]}...")
                selected_comment = random.choice(char_comments) if char_comments else "おすすめの最新情報です。"
                
                # 🚀 投稿ユニット呼び出し
                success, result = self.deploy_unit(site_cfg, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, selected_comment, cat_name)

                if success:
                    used_links.add(entry['link'])
                    success_count += 1
                    posted_successfully = True
                    self.log(f"   ✅ 成功: {result.get('title')[:30]}", self.style.SUCCESS)
                    time.sleep(random.randint(20, 35))
                    break 

            if not posted_successfully:
                self.log(f"   ⚠️ 合致記事なし (Category: {cat_name})", self.style.WARNING)

        self.log(f"🏁 完了: {success_count} / {len(fleet_data)} SUCCESS", self.style.SUCCESS)

    def deploy_unit(self, site, entry, parsed_data, ai_template, cta_template, api_keys, project_label, config_dir, comment, cat_name):
        ext = None
        for _ in range(3):
            selected = random.choice(api_keys)
            try:
                processor = AIProcessor([selected['key']], ai_template)
                ext = processor.generate_blog_content({
                    'url': entry['link'], 'title': entry['title'], 
                    'img': parsed_data.get('img'), 'body': parsed_data.get('body'),
                    'is_adult': str(site.get('is_adult', '0')).strip() == '1'
                }, site.get('site_key'))
                if ext: break
            except: time.sleep(2)
        
        if not ext: return False, {}

        platform = site.get('platform', '').lower()
        p_title = ext.get('title_h') if platform == 'hatena' and ext.get('title_h') else ext.get('title_g', entry['title'])
        p_body = ext.get('cont_g', ext.get('raw_text', ''))
        
        # 不要なパターンの削除
        unwanted_patterns = [
            r"📥\s*入力データ.*?\n", r"元ネタ:.*?\n", r"メーカー:.*?\n",
            r"出演者:.*?\n", r"対象:.*?\n", r"📤\s*出力.*?\n",
            r"【出力】.*?\n", r"^出力[:：].*?\n"
        ]
        for pattern in unwanted_patterns:
            p_body = re.sub(pattern, "", p_body, flags=re.IGNORECASE | re.MULTILINE)

        p_body = p_body.strip()

        # 🚀 Articleモデルに合わせて extra_metadata を構築
        meta = {
            "category": cat_name,
            "tags": entry.get('raw_tags', []),
            "is_adult": str(site.get('is_adult', '0')).strip() == '1',
            "original_title": entry['title'],
            "extracted_at": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }

        try:
            with transaction.atomic():
                # JSONField(extra_metadata) を活用して保存
                new_art = Article.objects.create(
                    site=project_label,
                    content_type='news' if project_label in ['saving', 'it'] else 'post',
                    title=p_title[:500],
                    body_text=p_body,
                    main_image_url=parsed_data.get('img'),
                    source_url=entry['link'],
                    extra_metadata=meta 
                )
                art_id = new_art.id
        except Exception as e:
            self.log(f"❌ DB Save Error: {e}")
            return False, {}

        target_url = str(site.get('endpoint') or site.get('url') or '').strip()
        target_api = str(site.get('api_key') or site.get('api_key_or_pw') or '').strip()
        target_user = str(site.get('user') or '').strip()
        
        if not target_url.startswith('http'):
            Article.objects.filter(id=art_id).delete()
            return False, {}

        try:
            cfg = site.copy()
            cfg.update({'api_key': target_api, 'endpoint': target_url, 'user': target_user, 'current_dir': config_dir})
            driver = ({'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(platform, LivedoorDriver))(cfg)
            
            domain_map = {'tiper': 'https://tiper.live', 'avflash': 'https://avflash.xyz'}
            base_url = domain_map.get(project_label, f"https://{project_label}.com")
            full_internal_url = f"{base_url}/news/{art_id}"

            img_html = f'<div style="text-align:center; margin-bottom:15px;"><img src="{parsed_data.get("img")}" style="max-width:100%;"></div><br>' if parsed_data.get("img") else ""
            review_html = f'<div style="background:#fefefe; padding:15px; border:1px solid #ddd; border-left:5px solid #ff6600; margin-bottom:20px;"><strong>🖋 編集部レビュー：</strong><br>「{comment}」</div>'
            
            # カテゴリ情報をHTMLに反映（外部ブログ表示用）
            tax_html = f'<p style="font-size:0.8em; color:#888; margin-top:20px;">カテゴリー: {cat_name}</p>'
            
            final_content = img_html + review_html + HTMLConverter.md_to_html(p_body) + tax_html + cta_template.replace("{{internal_url}}", full_internal_url)
            
            # 外部ブログへ投稿
            if driver.post(title=p_title, body=final_content, source_url=entry['link'], category=cat_name):
                Article.objects.filter(id=art_id).update(is_exported=True)
                return True, {'title': p_title}
            else:
                Article.objects.filter(id=art_id).delete()
                return False, {}
        except Exception as e:
            self.log(f"    ❌ Driver Error: {e}")
            Article.objects.filter(id=art_id).delete()
            return False, {}

    def build_rss_pool(self, rss_master, categories):
        pool = {}
        for cat in categories:
            if not cat: continue
            entries = []
            rss_sources = [r for r in rss_master if str(r.get('rss_category')).strip() == cat]
            for source in rss_sources:
                url = source.get('rss_url')
                try:
                    res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
                    feed = feedparser.parse(res.text)
                    for e in feed.entries:
                        link = getattr(e, 'link', None) or getattr(e, 'id', None)
                        if not link: continue

                        content_val = ""
                        if hasattr(e, 'content'): content_val = e.content[0].value
                        elif hasattr(e, 'description'): content_val = e.description
                        
                        extractor = ExtractorFactory.get_extractor(url, cat)
                        rss_img = extractor.extract(content_val, entry=e)

                        # RSSからタグを取得
                        raw_tags = [t.term for t in e.tags] if hasattr(e, 'tags') else []

                        entries.append({
                            'title': e.title, 
                            'link': link, 
                            'rss_img': rss_img,
                            'raw_tags': raw_tags
                        })
                except: continue
            pool[cat] = entries
        return pool

    def load_master_csv(self, path):
        if not os.path.exists(path): return []
        data = []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                lines = f.readlines()
                if not lines: return []
                header = [h.strip() for h in lines[0].split('\t')]
                for line in lines[1:]:
                    vals = [v.strip() for v in line.split('\t')]
                    if len(vals) < len(header): continue
                    row = dict(zip(header, vals))
                    if row.get('project'): data.append(row)
        except Exception as e: self.log(f"❌ CSV Error: {e}")
        return data

    def load_character_comments(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8-sig") as f:
                return [l.strip().strip('"') for l in f if l.strip() and "キャラ設定" not in l]
        except: return []

    def guess_category(self, site_key):
        return 'adult_vr' if 'vr' in str(site_key).lower() else 'adult_video'

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        if style_func: self.stdout.write(style_func(f"[{ts}] {msg}"))
        else: self.stdout.write(f"[{ts}] {msg}")

    def print_custom_help(self):
        self.stdout.write(self.style.WARNING("Usage: python manage.py ai_fleet_deployer --project [tiper|avflash|saving]"))