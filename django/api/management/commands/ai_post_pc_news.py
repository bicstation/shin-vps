# -*- coding: utf-8 -*-
import os, re, json, random, requests, feedparser, urllib.parse, time, hashlib, base64
import xmlrpc.client
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct

# === APIキー取得設定 ===
def get_all_keys():
    keys = []
    for i in range(1, 11):
        val = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if val: keys.append({"index": i, "key": val})
    return keys

ACTIVE_KEYS = get_all_keys()

# === 配信先設定 ===
LD_USER = "pbic" 
LD_BLOG_NAME = "pbic-bcorjo9q" 
LD_API_KEY = "n9T6n0czGX"
LD_URL = f"https://livedoor.blogcms.jp/atom/blog/{LD_BLOG_NAME}/article"

HT_ID = "bicstation"
HT_BLOG_DOMAIN = "bicstation.hatenablog.com"
HT_API_KEY = "se0o5znod6"
HT_URL = f"https://blog.hatena.ne.jp/{HT_ID}/{HT_BLOG_DOMAIN}/atom/entry"

SS_RPC_URL = "https://blog.seesaa.jp/rpc"
SS_USER = "bicstation@gmail.com"
SS_PW = "1492nabe"
SS_BLOG_ID = "7242363"

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('--url', type=str)
        parser.add_argument('--limit', type=int, default=1)
        parser.add_argument('--target', type=str, default='all')

    def handle(self, *args, **options):
        current_dir = os.path.dirname(os.path.abspath(__file__))
        PROMPT_FILE = os.path.join(current_dir, "prompt", "ai_prompt_news.txt")
        HISTORY_FILE = os.path.join(current_dir, "post_history.txt")
        
        if not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルなし: {PROMPT_FILE}"))
            return

        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        feed = feedparser.parse("https://pc.watch.impress.co.jp/data/rss/1.0/pcw/feed.rdf")
        if not feed.entries:
            self.stdout.write(self.style.ERROR("❌ RSSの取得に失敗しました"))
            return

        targets = [{"url": e.link} for e in random.sample(feed.entries, min(options['limit'], len(feed.entries)))]
        self.stdout.write(self.style.SUCCESS(f"🚀 配信開始 (Gemma 3 / デバッグ出力有効)"))

        for t in targets:
            self.process_task(t['url'], PROMPT_TEMPLATE, HISTORY_FILE, options.get('target'))

    # --- 認証 & 投稿関数 ---
    def generate_wsse(self, user_id, api_key):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce_binary = os.urandom(16)
        nonce_base64 = base64.b64encode(nonce_binary).decode('utf-8')
        sha1_input = nonce_binary + created.encode('utf-8') + api_key.encode('utf-8')
        digest_base64 = base64.b64encode(hashlib.sha1(sha1_input).digest()).decode('utf-8')
        return (f'UsernameToken Username="{user_id}", PasswordDigest="{digest_base64}", '
                f'Nonce="{nonce_base64}", Created="{created}"')

    def post_to_atompub(self, url, user_id, api_key, title, content_html, is_livedoor=False):
        wsse = self.generate_wsse(user_id, api_key)
        headers = {
            'X-WSSE': wsse,
            'Content-Type': 'application/atom+xml;type=entry' if is_livedoor else 'application/atom+xml',
            'User-Agent': 'Gemma3-AutoPost/1.2'
        }
        if is_livedoor:
            headers['Authorization'] = 'WSSE profile="UsernameToken"'

        xml = f"""<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{title}</title>
  <content type="text/html"><![CDATA[{content_html}]]></content>
  <app:control xmlns:app="http://www.w3.org/2007/app"><app:draft>no</app:draft></app:control>
</entry>""".encode('utf-8')
        try:
            res = requests.post(url, data=xml, headers=headers, timeout=30)
            return res.status_code in [200, 201]
        except: return False

    def post_to_seesaa(self, title, content_html):
        try:
            server = xmlrpc.client.ServerProxy(SS_RPC_URL)
            post_data = {'title': title, 'description': content_html, 'mt_allow_comments': 1, 'dateCreated': datetime.utcnow()}
            server.metaWeblog.newPost(SS_BLOG_ID, SS_USER, SS_PW, post_data, True)
            return True
        except: return False

    def process_task(self, current_url, prompt_temp, history_file, target_opt):
        # 1. Scraping & OGP画像取得
        res = requests.get(current_url, timeout=15)
        res.encoding = res.apparent_encoding
        soup = BeautifulSoup(res.text, 'html.parser')
        
        og_image = soup.find("meta", property="og:image") or soup.find("meta", attrs={"name": "og:image"})
        image_url = og_image["content"] if og_image else None
        image_html = f'<div style="text-align:center; margin-bottom:25px;"><img src="{image_url}" style="width:100%; max-width:700px; border-radius:12px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);"></div>' if image_url else ""
        
        raw_title = soup.title.string.split('|')[0].strip() if soup.title else "Latest Tech News"
        body_container = soup.find('article') or soup.find('div', class_='entry-content') or soup.body
        page_content = body_container.get_text(strip=True)[:4000]

        # 関連商品取得
        rel_prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
        maker = rel_prod.name.split()[0] if rel_prod else "不明"
        
        prompt = prompt_temp.replace("{maker}", maker)
        prompt = prompt.replace("{name}", rel_prod.name if rel_prod else "最新PC/ソフトウェア")
        prompt = prompt.replace("{price}", str(rel_prod.price) if rel_prod else "要確認")
        prompt = prompt.replace("{description}", page_content)

        # 2. AI生成
        ai_text = None
        for item in ACTIVE_KEYS:
            try:
                r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={item['key']}", 
                                  json={"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": 0.5}}, timeout=90)
                ai_text = r.json()['candidates'][0]['content']['parts'][0]['text']
                ai_text = ai_text.replace('```html', '').replace('```', '').strip()

                # --- デバッグ表示用（コンソール出力） ---
                self.stdout.write(self.style.HTTP_INFO("\n" + "="*60))
                self.stdout.write(self.style.HTTP_INFO("🤖 AI GENERATED CONTENT (RAW)"))
                self.stdout.write(self.style.HTTP_INFO("="*60))
                print(ai_text)
                self.stdout.write(self.style.HTTP_INFO("="*60 + "\n"))
                # ---------------------------------------

                break
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Key No.{item['index']} Error: {e}"))
                continue
        
        if not ai_text: return

        # 3. コンテンツ解析と整形
        # 要約データのパース
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', ai_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        summary_items = "".join([f'<li style="margin-bottom:5px;">{line.split(": ", 1)[1]}</li>' for line in summary_raw.splitlines() if ": " in line])
        summary_box = f'<div style="background:#f8fafc; border:1px solid #e2e8f0; padding:20px; border-radius:8px; margin-bottom:30px;"><strong style="color:#1e293b; display:block; margin-bottom:10px;">📌 本記事の重要ポイント</strong><ul style="margin:0; padding-left:20px; color:#475569;">{summary_items}</ul></div>'

        # 本文の抽出
        clean_text = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', ai_text, flags=re.DOTALL)
        clean_text = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', clean_text, flags=re.DOTALL).strip()
        
        lines = [l for l in clean_text.splitlines() if l.strip()]
        final_title = lines[0].strip()
        main_html_body = "\n".join(lines[1:]).strip()

        # おすすめ商品リンク
        rel_html = ""
        if rel_prod:
            rel_html = f'<div style="background:linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); padding:25px; margin:40px 0; border-radius:12px; border:1px solid #bfdbfe; text-align:center;">' \
                       f'<span style="background:#2563eb; color:white; padding:4px 12px; border-radius:20px; font-size:0.8em; font-weight:bold;">PICK UP</span>' \
                       f'<h4 style="margin-top:15px; color:#1e3a8a;">{rel_prod.name}</h4>' \
                       f'<a href="{rel_prod.url}" style="display:inline-block; margin-top:10px; padding:12px 30px; background:#2563eb; color:white; text-decoration:none; border-radius:6px; font-weight:bold;">この製品の公式ページを見る</a></div>'

        # 最終HTMLの組み立て
        full_html = f"{image_html}{summary_box}{main_html_body}{rel_html}" \
                    f'<p style="margin-top:40px; font-size:0.8em; color:#94a3b8; border-top:1px solid #f1f5f9; padding-top:20px;">' \
                    f'参照元：<a href="{current_url}" style="color:#94a3b8;">{raw_title} (PC Watch)</a></p>'

        # 4. 配信実行
        targets = [
            ('Livedoor', LD_URL, LD_USER, LD_API_KEY, True),
            ('Hatena', HT_URL, HT_ID, HT_API_KEY, False)
        ]

        for name, url, user, key, is_ld in targets:
            if target_opt in ['all', name.lower()]:
                if self.post_to_atompub(url, user, key, final_title, full_html, is_livedoor=is_ld):
                    self.stdout.write(self.style.SUCCESS(f"✅ {name}投稿成功"))

        if target_opt in ['all', 'seesaa']:
            if self.post_to_seesaa(final_title, full_html):
                self.stdout.write(self.style.SUCCESS("✅ Seesaa投稿成功"))

        with open(history_file, "a", encoding='utf-8') as f:
            f.write(f"{datetime.now()}\t{current_url}\t{final_title}\n")