# -*- coding: utf-8 -*-
import os, re, json, random, requests, feedparser, urllib.parse, time, hashlib, base64
import xmlrpc.client
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

# モデルのインポート
from api.models.pc_products import PCProduct
from api.models.article import Article

# Google API / Blogger インポート
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

class Command(BaseCommand):
    help = '外部ブログ投稿・DB保存・Next.js用Markdown生成を1ステップで実行します'

    # --- 配信先設定 ---
    BLOG_CONFIGS = {
        'hatena': {
            'id': "bicstation",
            'domain': "bicstation.hatenablog.com",
            'api_key': "se0o5znod6",
            'url': "https://blog.hatena.ne.jp/bicstation/bicstation.hatenablog.com/atom/entry"
        },
        'livedoor': {
            'user': "pbic",
            'blog_name': "pbic-bcorjo9q",
            'api_key': "a4lnDJzzXU",
            'url': "https://livedoor.blogcms.jp/atompub/pbic-bcorjo9q/article"
        },
        'seesaa': {
            'rpc_url': "https://blog.seesaa.jp/rpc",
            'user': "bicstation@gmail.com",
            'pw': "1492nabe",
            'blog_id': "7242363"
        },
        'blogger': {
            'client_json_dir': 'bs_json'
        }
    }

    # --- RSSリスト ---
    RSS_SOURCES = [
        "https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf",
        "https://rss.itmedia.co.jp/rss/2.0/pcuser.xml",
        "https://news.mynavi.jp/rss/digital/pc",
        "https://www.4gamer.net/rss/index.xml",
        "https://www.gizmodo.jp/index.xml"
    ]

    # --- Next.js出力設定 ---
    MD_OUTPUT_DIR = "/home/maya/dev/shin-vps/next-bicstation/content/posts"

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='各媒体に投稿する記事数')
        parser.add_argument('--target', type=str, default='all', help='配信先 (all/hatena/livedoor/seesaa/blogger)')

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- 🚀 Maya's Logic v5.0: Triple Output System ---"))
        current_dir = os.path.dirname(os.path.abspath(__file__))
        prompt_path = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")

        if not os.path.exists(prompt_path):
            self.stdout.write(self.style.ERROR("❌ プロンプトファイルなし"))
            return

        with open(prompt_path, "r", encoding='utf-8') as f:
            template = f.read()

        api_keys = [os.getenv(f"GEMINI_API_KEY_{i}") for i in range(1, 11) if os.getenv(f"GEMINI_API_KEY_{i}")]
        if not api_keys:
            self.stdout.write(self.style.ERROR("❌ APIキー未設定"))
            return

        targets = ['hatena', 'livedoor', 'seesaa', 'blogger'] if options['target'] == 'all' else [options['target']]
        random.shuffle(self.RSS_SOURCES)
        rss_pool = self.RSS_SOURCES[:]

        for i in range(options['limit']):
            for blog_type in targets:
                self.stdout.write(self.style.NOTICE(f"\n--- 📦 Processing: {blog_type} (Round {i+1}) ---"))
                
                # 1. 独立した新着記事の確保
                entry = None
                checked_sources = 0
                while rss_pool and not entry and checked_sources < len(self.RSS_SOURCES):
                    source_url = rss_pool.pop(0)
                    rss_pool.append(source_url)
                    feed = feedparser.parse(source_url)
                    for e in feed.entries:
                        if not Article.objects.filter(source_url=e.link).exists():
                            entry = e
                            break
                    checked_sources += 1
                
                if not entry:
                    self.stdout.write(self.style.WARNING(f"⚠️ {blog_type} 用の新しい記事が見つかりませんでした"))
                    continue

                # 2. スクレイピング & OGP取得
                article_data = self.scrape_article(entry)
                if not article_data: continue

                # 3. AI生成 (APIキーシャッフル)
                random.shuffle(api_keys)
                ai_content = self.get_ai_content(template, api_keys, entry.link, article_data['body'], article_data['title'])
                if not ai_content: continue

                # 4. タグ抽出
                extracted = self.extract_all_tags(ai_content, article_data['title'])

                # 5. 外部ブログ投稿
                success = self.post_to_specific_blog(blog_type, extracted, article_data, current_dir)
                
                # 6. DB保存
                self.save_to_db(blog_type, extracted, article_data, success)

                # 7. Next.js用Markdown生成 (追加)
                md_path = self.save_as_markdown(extracted, article_data)
                if md_path:
                    self.stdout.write(self.style.SUCCESS(f"📝 Markdown作成完了: {os.path.basename(md_path)}"))

    def save_as_markdown(self, ext, data):
        """Next.jsのコンテンツディレクトリにMDファイルを生成します"""
        try:
            os.makedirs(self.MD_OUTPUT_DIR, exist_ok=True)
            # ファイル名を一意にする (日付 + URLのハッシュ)
            file_hash = hashlib.md5(data['url'].encode()).hexdigest()[:8]
            filename = f"{datetime.now().strftime('%Y%m%d')}_{file_hash}.md"
            filepath = os.path.join(self.MD_OUTPUT_DIR, filename)

            # Frontmatter付きのMarkdown
            md_content = f"""---
title: "{ext['title_g'].replace('"', "'")}"
date: "{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
image: "{data['img'] or ''}"
description: "{ext['summary'].replace('"', "'")[:160]}"
source_url: "{data['url']}"
---

{ext['summary']}

{ext['cont_g']}

---
*出典: [{data['title']}]({data['url']})*
"""
            with open(filepath, "w", encoding='utf-8') as f:
                f.write(md_content)
            return filepath
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Markdown生成失敗: {e}"))
            return None

    def scrape_article(self, entry):
        try:
            res = requests.get(entry.link, timeout=15)
            res.encoding = res.apparent_encoding
            soup = BeautifulSoup(res.text, 'html.parser')
            og_img = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
            return {
                'url': entry.link,
                'title': entry.title,
                'img': og_img["content"] if og_img else None,
                'body': (soup.find('article') or soup.body).get_text(strip=True)[:4000]
            }
        except: return None

    def get_ai_content(self, template, keys, url, body, raw_title):
        rel_prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
        maker = rel_prod.name.split()[0] if rel_prod else "不明"
        prompt = template.format(current_url=url, description=body, maker=maker, name=rel_prod.name if rel_prod else "PC", price=rel_prod.price if rel_prod else "要確認")
        
        for key in keys:
            try:
                res = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}",
                    json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.7}}, timeout=60)
                return re.sub(r'```[a-z]*\n|```', '', res.json()['candidates'][0]['content']['parts'][0]['text']).strip()
            except: continue
        return None

    def extract_all_tags(self, text, default_title):
        def get_tag(tag):
            m = re.search(rf'\[\*{{0,2}}{tag}\*{{0,2}}\]\s*(.*?)\s*\[/\*{{0,2}}{tag}\*{{0,2}}\]', text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else None
        return {
            'title_h': get_tag("TITLE_HATENA") or default_title,
            'title_g': get_tag("TITLE_GENERAL") or default_title,
            'cont_h': get_tag("CONTENT_HATENA") or text,
            'cont_g': get_tag("CONTENT_GENERAL") or text,
            'summary': get_tag("SUMMARY_BOX") or ""
        }

    def post_to_specific_blog(self, b_type, ext, data, current_dir):
        rel_prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
        img_html = f'<div style="text-align:center;margin-bottom:20px;"><img src="{data["img"]}" style="max-width:100%;border-radius:10px;"></div>' if data["img"] else ""
        rel_html = f'<div style="background:#f8fbff;padding:20px;border:1px solid #d1e9ff;border-radius:10px;text-align:center;margin:30px 0;"><h4>紹介製品: {rel_prod.name if rel_prod else ""}</h4><a href="{rel_prod.url if rel_prod else "#"}" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:5px;">詳細はこちら</a></div>'
        footer = f'<p style="font-size:12px;color:#888;border-top:1px dotted #ccc;padding-top:10px;">出典: <a href="{data["url"]}">{data["title"]}</a></p>'
        
        if b_type == 'hatena':
            conf = self.BLOG_CONFIGS['hatena']
            body = f"{img_html}{ext['summary']}{ext['cont_h']}{rel_html}{footer}"
            return self.post_to_atom(conf['url'], conf['id'], conf['api_key'], ext['title_h'], body)
        elif b_type == 'livedoor':
            conf = self.BLOG_CONFIGS['livedoor']
            body = f"{img_html}{ext['summary']}{ext['cont_g']}{rel_html}{footer}"
            return self.post_to_atom(conf['url'], conf['user'], conf['api_key'], ext['title_g'], body, True)
        elif b_type == 'seesaa':
            conf = self.BLOG_CONFIGS['seesaa']
            body = f"{img_html}{ext['summary']}{ext['cont_g']}{rel_html}{footer}"
            try:
                s = xmlrpc.client.ServerProxy(conf['rpc_url'])
                s.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], {'title': ext['title_g'], 'description': body}, True)
                return True
            except: return False
        elif b_type == 'blogger':
            body = f"{img_html}{ext['summary']}{ext['cont_g']}{rel_html}{footer}"
            return self.post_to_blogger(ext['title_g'], body, current_dir)
        return False

    def post_to_atom(self, url, user, key, title, body, is_ld=False):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce = os.urandom(16)
        digest = base64.b64encode(hashlib.sha1(nonce + created.encode() + key.encode()).digest()).decode()
        wsse = f'UsernameToken Username="{user}", PasswordDigest="{digest}", Nonce="{base64.b64encode(nonce).decode()}", Created="{created}"'
        headers = {'X-WSSE': wsse, 'Content-Type': 'application/atom+xml'}
        if is_ld: headers['Authorization'] = 'WSSE profile="UsernameToken"'
        xml = f'<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><title>{title}</title><content type="text/html"><![CDATA[{body}]]></content></entry>'
        try:
            r = requests.post(url, data=xml.encode('utf-8'), headers=headers, timeout=30)
            return r.status_code in [200, 201]
        except: return False

    def post_to_blogger(self, title, body, current_dir):
        try:
            p = os.path.join(current_dir, self.BLOG_CONFIGS['blogger']['client_json_dir'], 'token.json')
            creds = Credentials.from_authorized_user_file(p, ['https://www.googleapis.com/auth/blogger'])
            if creds.expired: creds.refresh(Request())
            s = build('blogger', 'v3', credentials=creds)
            b = s.blogs().listByUser(userId='self').execute()
            s.posts().insert(blogId=b['items'][0]['id'], body={'title': title, 'content': body}).execute()
            return True
        except: return False

    def save_to_db(self, b_type, ext, data, success):
        try:
            Article.objects.create(
                site=f'bicstation_{b_type}', content_type='news', title=ext['title_g'],
                body_text=ext['cont_g'], main_image_url=data['img'], source_url=data['url'],
                is_exported=success, extra_metadata={"target_blog": b_type, "scraped_at": datetime.now().isoformat()}
            )
            self.stdout.write(self.style.SUCCESS(f"⭐ DB保存完了 [{b_type}]"))
        except: pass