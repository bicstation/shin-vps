# -*- coding: utf-8 -*-
"""
【SYSTEM OVERVIEW: v47.1 Strategic-Ultimate-Unified】
1. 目的: 投稿先の完全視認化、DMM/FANZA画像抽出の復旧、記事ボリュームの最大化。
2. 特徴: 
   - ログの完全透明化: ターゲット拠点名、プラットフォーム、成功IDをすべて明示。
   - 解析力の復元: RSS内のHTMLおよび遷移先サイトからの多段画像抽出ロジック（DMM対応）。
   - 記事の「格」の向上: 提督レビュー、重厚な見出し装飾、内部リンクアーカイブを完備。
   - 精密デバッグ: 失敗時のエンドポイント・ユーザー情報の強制露出。
"""

import os, re, random, requests, feedparser, time, csv, hashlib, json
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.db import connection
from api.models.article import Article
from api.utils.html_utils import HTMLConverter
from api.management.commands.blog_drivers.hatena_driver import HatenaDriver
from api.management.commands.blog_drivers.livedoor_driver import LivedoorDriver
from api.management.commands.blog_drivers.blogger_driver import BloggerDriver
from api.management.commands.blog_drivers.ai_processor import AIProcessor

class Command(BaseCommand):
    help = 'BICSTATION v47.1: Ultimate Unified Strategic System'

    ADULT_PROJECTS = ['tiper', 'avflash', 'adult-test', 'pink-station', 'bic-erog', 'adult-search']

    def add_arguments(self, parser):
        parser.add_argument('--project', type=str, default='tiper', help='Project name')
        parser.add_argument('--platform', type=str, default='all', help='Target platform')
        parser.add_argument('--mode', type=str, default='deploy', choices=['deploy', 'cleanup'], help='Operation mode')

    def log(self, msg, style_func=None):
        ts = datetime.now().strftime('%H:%M:%S')
        text = f"[{ts}] {msg}"
        if style_func: self.stdout.write(style_func(text))
        else: self.stdout.write(text)

    def handle(self, *args, **options):
        # 🚀 1. 初期化
        self.project_name = options['project'].lower()
        self.target_platform = options['platform'].lower()
        self.is_adult_env = self.project_name in self.ADULT_PROJECTS
        
        self.current_cmd_dir = os.path.dirname(os.path.abspath(__file__))
        self.config_dir = os.path.join(self.current_cmd_dir, "teitoku_settings")
        self.prompt_dir = os.path.join(self.current_cmd_dir, "prompt")

        DOMAIN_MAP = {
            'bicstation': 'bicstation.com', 
            'tiper': 'tiper.live', 
            'saving': 'bic-saving.com', 
            'avflash': 'avflash.xyz'
        }
        self.target_domain = DOMAIN_MAP.get(self.project_name, f"{self.project_name}.com")

        self.stdout.write(f"\n{self.style.SUCCESS('▼' * 100)}")
        self.stdout.write(self.style.SUCCESS(f" 🔱 UNIFIED STRATEGIC SYSTEM v47.1 (ULTIMATE-UNIFIED)"))
        self.stdout.write(f" 📂 PROJECT      : {self.project_name.upper()}")
        self.stdout.write(f" 🎯 MISSION      : 全機能統合（画像解析復旧・投稿先明示・ボリューム強化）")
        self.stdout.write(f"{self.style.SUCCESS('▲' * 100)}\n")

        # 🚀 2. データロード
        fleet_path = os.path.join(self.config_dir, f"{self.project_name}_fleet.csv")
        rss_path = os.path.join(self.config_dir, f"{self.project_name}_rss_sources.csv")
        
        fleet_data = self.load_csv_data(fleet_path)
        rss_sources = self.load_csv_data(rss_path)
        
        target_site_keys = {row['site_key'] for row in fleet_data if row.get('site_key')}
        if self.target_platform != 'all':
            target_site_keys = {row['site_key'] for row in fleet_data if row.get('platform', '').lower() == self.target_platform}

        raw_pool = self.get_fresh_rss_pool([row['url'] for row in rss_sources if 'url' in row])
        connection.close()
        rss_pool = [e for e in raw_pool if not Article.objects.filter(site=self.project_name, source_url=e.link).exists()]

        if not rss_pool:
            self.log("🏁 新着記事なし。哨戒終了。", self.style.WARNING)
            return

        self.log(f"📦 解析対象: {len(rss_pool)} 件 / 目標拠点数: {len(target_site_keys)}", self.style.HTTP_INFO)
        
        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}").strip() for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys: 
            self.log("❌ APIキーが見つかりません。", self.style.ERROR)
            return

        # 🚀 3. デプロイループ
        posted_sites = set()
        processed_count = 0

        for index, entry in enumerate(rss_pool):
            if target_site_keys.issubset(posted_sites):
                self.stdout.write(f"\n{self.style.SUCCESS('✨ 全拠点へのデプロイ完了。')}")
                break

            target_site = None
            target_text = (entry.title + getattr(entry, 'summary', '') + getattr(entry, 'description', '')).lower()

            for site in fleet_data:
                sk = site.get('site_key')
                if not sk: continue
                if self.target_platform != 'all' and site.get('platform', '').lower() != self.target_platform: continue
                if sk in posted_sites: continue

                keywords = [k.strip().lower() for k in site.get('routing_keywords', '').split(',') if k.strip()]
                if not keywords or any(k in target_text for k in keywords):
                    target_site = site
                    hit_word = next((k for k in keywords if k in target_text), "適合")
                    break

            if not target_site: continue

            # 投稿先の情報を取得
            site_name = target_site.get('name') or target_site.get('site_key')
            site_platform = target_site.get('platform', 'Livedoor').upper()

            self.stdout.write(f"\n{self.style.HTTP_INFO('━' * 80)}")
            self.log(f" 📄 偵察 [{index+1}/{len(rss_pool)}]: {entry.title[:60]}")
            self.log(f" 🎯 ターゲット: 【{site_name}】 ({site_platform}拠点)")

            current_key = api_keys[processed_count % len(api_keys)]
            
            # ✍️ 投稿実行
            success, result_info = self.process_single_post(target_site, entry, [current_key], self.project_name, hit_word)
            
            if success:
                posted_sites.add(target_site['site_key'])
                processed_count += 1
                self.log(f" ✅ 【{site_name}】へのデプロイ成功！ ID: {result_info}", self.style.SUCCESS)
                self.log(f" 🚩 進捗: {len(posted_sites)}/{len(target_site_keys)} 拠点完了", self.style.SUCCESS)
                time.sleep(random.randint(20, 35))
            else:
                self.log(f" ❌ 【{site_name}】投稿失敗。 {result_info}", self.style.ERROR)

        self.log(f"🏁 任務完了。総処理数: {processed_count}件", self.style.SUCCESS)

    def extract_tag(self, text, tag):
        pattern = rf"\[{tag}\](.*?)\[/{tag}\]"
        match = re.search(pattern, text, re.DOTALL)
        return match.group(1).strip() if match else ""

    def process_single_post(self, cfg, entry, api_keys, project_name, hit_word):
        site_key = cfg.get('site_key', 'UNKNOWN')
        endpoint = (cfg.get('endpoint') or cfg.get('url_or_endpoint') or cfg.get('url') or '').strip()
        user_id = (cfg.get('user') or cfg.get('user_id') or '').strip()
        api_pw = (cfg.get('api_key_or_pw') or cfg.get('api_key') or '').strip()
        platform = cfg.get('platform', 'livedoor').lower()

        debug_coord = f"URL: {endpoint} | User: {user_id} | Key: {api_pw[:4]}***"

        if not user_id or not endpoint:
            return False, f"CONFIG_ERROR: 設定不足 ({debug_coord})"

        connection.close()
        # 🚀 進化版スクレイピング（DMM解析ロジックを含む）
        raw_data = self.scrape_article_advanced(entry)
        if not raw_data: 
            return False, "SCRAPE_ERROR: 画像または本文の抽出に失敗"

        try:
            with open(os.path.join(self.config_dir, "project_configs.json"), 'r', encoding='utf-8') as f:
                config_pool = json.load(f)
            meta = config_pool.get(project_name, config_pool.get('bicstation'))
        except:
            return False, "FS_ERROR: project_configs.json load failed"

        with open(os.path.join(self.prompt_dir, "ai_prompt_master.txt"), 'r', encoding='utf-8') as f:
            prompt_template = f.read()

        replaces = {
            "{{project_display_name}}": meta['project_display_name'],
            "{{persona}}": meta['persona'],
            "{{category}}": meta['category'],
            "{{item_term}}": meta['item_term'],
            "{{mission_detail}}": meta['mission_detail'],
            "{{body_structure}}": meta['body_structure'],
            "{{footer_msg}}": meta['footer_msg'],
            "{{url}}": entry.link,
            "{{body}}": raw_data['body'],
            "{{maker}}": hit_word,
            "{{name_or_actor}}": entry.title
        }

        final_prompt = prompt_template
        for k, v in replaces.items():
            final_prompt = final_prompt.replace(k, str(v))

        processor = AIProcessor(api_keys, final_prompt)
        ai_response = processor.generate_blog_content(raw_data, site_key)
        
        raw_text = ai_response.get('raw_text', '') if isinstance(ai_response, dict) else str(ai_response)
        if not raw_text: return False, "AI_ERROR: 生成結果が空です。"

        gen_title = self.extract_tag(raw_text, "TITLE") or entry.title
        gen_body = self.extract_tag(raw_text, "BODY")

        # 🚀 ボリューム最大化装飾（v46.9より継承・強化）
        comment_file = os.path.join(self.config_dir, meta.get('comment_file', f"teitoku_{project_name}_comments.csv"))
        selected_comment = "本日のトピックを戦略的視点から徹底解析します。"
        if os.path.exists(comment_file):
            with open(comment_file, 'r', encoding='utf-8') as f:
                comments = [line.strip() for line in f if line.strip()]
                if comments: selected_comment = random.choice(comments)

        accent = meta.get('accent_color', '#1e293b')
        
        # ヘッダー装飾
        header_html = f"""
<div style="border: 2px dashed {accent}; padding: 20px; margin-bottom: 25px; background: #fffaf0; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
  <strong style="color: {accent}; font-size: 1.25em; display: block; margin-bottom: 10px;">🖋 提督の戦略的レビュー：</strong>
  <span style="font-size: 1.15em; font-weight: bold; color: #333; line-height: 1.5;">「{selected_comment}」</span>
</div>
<p style="font-size: 1.1em; line-height: 1.9; color: #374151; margin-bottom: 30px;">
  司令部が精査した最新データに基づき、本件の重要性を多角的に解析しました。以下の通り、詳細なレポートを展開します。
</p>
"""
        # 本文装飾
        converted_body = HTMLConverter.md_to_html(gen_body)
        enhanced_body = converted_body.replace('<h3>', f'<h3 style="border-left: 8px solid {accent}; border-bottom: 1px solid #e5e7eb; padding: 10px 15px; margin: 40px 0 20px 0; color: {accent}; background: #f9fafb;">')
        enhanced_body = enhanced_body.replace('<h4>', f'<h4 style="color: {accent}; border-bottom: 2px solid {accent}33; padding-bottom: 5px; margin-top: 25px;">')
        
        # フッター装飾（重厚なアーカイブセクション）
        url_hash = hashlib.md5(entry.link.encode()).hexdigest()[:8]
        internal_url = f"https://{self.target_domain}/news/{datetime.now().strftime('%Y%m%d')}_{url_hash}/"
        
        footer_html = f"""
<hr style="border: 0; height: 1px; background: #e5e7eb; margin: 50px 0 30px 0;">
<div style="padding: 25px; background: #f1f5f9; border-radius: 10px; border: 1px solid #e2e8f0;">
  <p style="font-weight: bold; margin-bottom: 15px; color: #1e293b; font-size: 1.1em;">📑 情報アーカイブ・追跡調査：</p>
  <p style="font-size: 0.95em; color: #475569; line-height: 1.6;">
    本件に関する追加情報や、過去のアーカイブとの相関関係については、以下の特設セクションにて継続的にアップデートしております。
    詳細な仕様や、より深いバックグラウンドに興味がある読者諸君は、是非チェックしていただきたい。
  </p>
  <div style="text-align: center; margin-top: 25px;">
    <a href="{internal_url}" style="display: inline-block; padding: 15px 40px; background: {accent}; color: #ffffff !important; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 1.1em; transition: all 0.3s ease;">▶ 続きを詳しく読む（公式アーカイブへ）</a>
  </div>
</div>
<p style="text-align: right; font-size: 0.8em; color: #94a3b8; margin-top: 15px;">※最終更新: {datetime.now().strftime('%Y/%m/%d %H:%M')}</p>
"""
        final_html_body = header_html + enhanced_body + footer_html

        try:
            Article.objects.update_or_create(
                source_url=entry.link, site=project_name, 
                defaults={
                    'title': gen_title, 'body_text': raw_text, 
                    'main_image_url': raw_data['img'], 'is_exported': True,
                    'extra_metadata': {'model': 'v47.1-ultimate', 'hit': hit_word}
                }
            )

            driver_cfg = {'endpoint': endpoint, 'user': user_id, 'api_key': api_pw}
            driver_class = {'hatena': HatenaDriver, 'blogger': BloggerDriver}.get(platform, LivedoorDriver)
            driver = driver_class(driver_cfg)
            
            res = driver.post(title=gen_title, body=final_html_body, image_url=raw_data['img'], source_url=entry.link)
            if res:
                return True, str(res)
            else:
                return False, f"DRIVER_REJECTED: 認証失敗またはURL不正 ({debug_coord})"

        except Exception as e:
            return False, f"EXCEPTION: {str(e)} | {debug_coord}"

    def scrape_article_advanced(self, entry):
        """DMM/FANZA解析ロジックを含む進化版スクレイピング"""
        try:
            url = entry.link
            img_url = ""

            # 1. RSSの概要文から抽出
            summary_text = getattr(entry, 'summary', getattr(entry, 'description', ''))
            if summary_text:
                img_match = re.search(r'src=["\'](https?://.*?\.(?:jpg|jpeg|png|gif|webp)(?:\?.*?)?)["\']', summary_text, re.I)
                if img_match: img_url = img_match.group(1)

            # 2. サイト本体から抽出（DMM等の特殊タグ対応）
            if not img_url or "dmm.co.jp" in url or "fanza.com" in url:
                res = requests.get(url, timeout=15, headers={'User-Agent': 'Mozilla/5.0'})
                soup = BeautifulSoup(res.text, 'html.parser')
                
                # DMM/FANZA 特化型セレクタ
                pkg_img = soup.select_one('#sample-video img, .package-image img, .main-image img, meta[property="og:image"]')
                if pkg_img:
                    img_url = pkg_img.get('src') or pkg_img.get('content') or pkg_img.get('href')
                
                # 一般的なOGP
                if not img_url:
                    og_img = soup.find("meta", property="og:image")
                    if og_img: img_url = og_img.get("content")

            if not img_url: return None
            if img_url.startswith('//'): img_url = 'https:' + img_url

            # 本文抽出
            res = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            for tag in soup(['script', 'style', 'nav', 'header', 'footer', 'aside']): tag.decompose()
            
            # 本文エリアの特定（DMM系 detail-box 対応）
            body_area = soup.select_one('article, .article-body, .entry-content, #main, .common-detail-box, .mg-b20.lh4')
            main_text = (body_area.get_text() if body_area else soup.get_text()).strip()

            return {'url': url, 'title': entry.title, 'img': img_url, 'body': main_text[:2500]}
        except: return None

    def load_csv_data(self, path):
        if not os.path.exists(path): return []
        try:
            with open(path, "r", encoding="utf-8") as f:
                return list(csv.DictReader(f, delimiter='|'))
        except: return []

    def get_fresh_rss_pool(self, urls):
        pool = []
        for url in urls:
            try:
                res = requests.get(url, timeout=15)
                feed = feedparser.parse(res.text)
                pool.extend(feed.entries)
            except: continue
        return pool