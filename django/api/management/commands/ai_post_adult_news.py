# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/management/commands/ai_post_adult_news.py
import os, re, json, random, requests, feedparser, urllib.parse, time, hashlib, base64
import xmlrpc.client
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils.timezone import now

# === APIキー取得設定 (10個のリトライ用) ===
def get_all_keys():
    keys = []
    for i in range(1, 11):
        val = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if val: keys.append({"index": i, "key": val})
    return keys

ACTIVE_KEYS = get_all_keys()

# === アダルト用配信先設定 ===
# 1. Livedoorブログ
LD_ADULT_USER = "pbic"
LD_ADULT_API_KEY = "a4lnDJzzXU"
LD_ADULT_URL = "https://livedoor.blogcms.jp/atompub/pbic/article"

# 2. WordPressサイト A (bic0erog.com)
WP_A_URL = "https://blog.bic0erog.com/xmlrpc.php"
WP_A_USER = "bicstation"
WP_A_PW = "a0H2 McUX 3XK6 apzh JZ82 SzTm"

# 3. WordPressサイト B (adult-search.xyz)
WP_B_URL = "https://blog.adult-search.xyz/xmlrpc.php"
WP_B_USER = "bicstation"
WP_B_PW = "OBlD Yz2v lR8F wswY zwaW cF43"

# === パス設定 ===
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

class Command(BaseCommand):
    help = 'Gemma 3 を使用してFANZA新着情報をブログへ同時投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')
        parser.add_argument('--target', type=str, default='all', help='対象(all/livedoor/wp_a/wp_b)')

    def handle(self, *args, **options):
        PROMPT_FILE = os.path.join(CURRENT_DIR, "prompt", "ai_prompt_adult.txt")
        HISTORY_FILE = os.path.join(CURRENT_DIR, "post_history_adult.txt")
        
        if not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR(f"❌ プロンプトファイルなし: {PROMPT_FILE}"))
            return

        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

        # === RSS取得 (User-Agentでブロック回避) ===
        # rss_url = "https://www.dmm.co.jp/mono/dvd/-/index/=/nav=none/rss=1/"
        # headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        # === RSS取得 (ご提示いただいた正確なURLに修正) ===
        rss_url = "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=date/"
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}
        
        try:
            res = requests.get(rss_url, headers=headers, timeout=20)
            res.raise_for_status()
            feed = feedparser.parse(res.text)
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ RSS取得失敗: {e}"))
            return

        if not feed.entries:
            self.stdout.write(self.style.ERROR("❌ RSSエントリが空です"))
            return

        # 指定件数分をランダムに抽出
        selected_entries = random.sample(feed.entries, min(options['limit'], len(feed.entries)))
        self.stdout.write(self.style.SUCCESS(f"🔞 アダルト配信開始 (Gemma 3) - {now()}"))

        for entry in selected_entries:
            self.process_task(entry, PROMPT_TEMPLATE, HISTORY_FILE, options.get('target'))

    # --- 認証 & 投稿関数 (Livedoor) ---
    def generate_wsse(self, user_id, api_key):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce_binary = os.urandom(16)
        nonce_base64 = base64.b64encode(nonce_binary).decode('utf-8')
        sha1_input = nonce_binary + created.encode('utf-8') + api_key.encode('utf-8')
        digest_base64 = base64.b64encode(hashlib.sha1(sha1_input).digest()).decode('utf-8')
        return (f'UsernameToken Username="{user_id}", PasswordDigest="{digest_base64}", '
                f'Nonce="{nonce_base64}", Created="{created}"')

    def post_to_livedoor(self, title, content_html):
        wsse = self.generate_wsse(LD_ADULT_USER, LD_ADULT_API_KEY)
        headers = {'X-WSSE': wsse, 'Authorization': 'WSSE profile="UsernameToken"', 'Content-Type': 'application/atom+xml;type=entry'}
        xml = f"""<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{title}</title>
  <content type="text/html"><![CDATA[{content_html}]]></content>
  <app:control xmlns:app="http://www.w3.org/2007/app"><app:draft>no</app:draft></app:control>
</entry>""".encode('utf-8')
        try:
            res = requests.post(LD_ADULT_URL, data=xml, headers=headers, timeout=30)
            return res.status_code in [200, 201]
        except: return False

    # --- WordPress投稿関数 ---
    def post_to_wordpress(self, rpc_url, user, pw, title, content_html):
        try:
            server = xmlrpc.client.ServerProxy(rpc_url)
            post_data = {'title': title, 'description': content_html, 'post_status': 'publish', 'mt_allow_comments': 1}
            server.metaWeblog.newPost('1', user, pw, post_data, True)
            return True
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ WP Error ({rpc_url}): {e}"))
            return False

    # --- メインタスク処理 (RSS詳細解析 + AI生成) ---
    def process_task(self, entry, prompt_temp, history_file, target_opt):
        # RSSから詳細データを抽出
        raw_title = entry.title
        link = entry.link
        content_encoded = entry.get('content_encoded', '') or entry.get('description', '')
        soup_content = BeautifulSoup(content_encoded, 'html.parser')

        # 画像URL取得
        img_tag = soup_content.find('img')
        image_url = img_tag['src'] if img_tag else ""
        
        # あらすじ・メタ情報抽出
        clean_text = soup_content.get_text(separator='\n', strip=True)
        
        # AIプロンプトの組み立て
        prompt = prompt_temp.replace("{description}", clean_text)
        
        ai_text = None
        for item in ACTIVE_KEYS:
            try:
                self.stdout.write(f"  💎 Gemma 3 試行中 (Key {item['index']})...")
                r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={item['key']}", 
                                  json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=90)
                ai_text = r.json()['candidates'][0]['content']['parts'][0]['text']
                ai_text = ai_text.replace('```html', '').replace('```', '').strip()
                break
            except: continue
        
        if not ai_text: return

        # タイトルと本文の分離
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', ai_text, re.DOTALL)
        final_title = title_match.group(1).strip() if title_match else f"【新作】{raw_title}"
        main_body = re.sub(r'\[TITLE\].*?\[/TITLE\]', '', ai_text, flags=re.DOTALL).strip()

        # HTML構成
        image_html = f'<div style="text-align:center; margin-bottom:20px;"><img src="{image_url}" style="max-width:100%; border-radius:10px;"></div>'
        affiliate_html = f'<div style="text-align:center; margin-top:30px;"><a href="{link}" style="background:#ff4500; color:white; padding:15px 30px; text-decoration:none; border-radius:50px; font-weight:bold;">▶ この作品の詳細を見る</a></div>'
        
        full_html = f"{image_html}{main_body}{affiliate_html}"

        # 各サイトへ配信
        if target_opt in ['all', 'livedoor']:
            if self.post_to_livedoor(final_title, full_html): self.stdout.write(self.style.SUCCESS(" ✅ Livedoor成功"))
        
        for wp_name, wp_url, wp_u, wp_p in [('WP_A', WP_A_URL, WP_A_USER, WP_A_PW), ('WP_B', WP_B_URL, WP_B_USER, WP_B_PW)]:
            if target_opt in ['all', wp_name.lower()]:
                if self.post_to_wordpress(wp_url, wp_u, wp_p, final_title, full_html):
                    self.stdout.write(self.style.SUCCESS(f" ✅ {wp_name}成功"))

        # 履歴保存
        with open(history_file, "a", encoding='utf-8') as f:
            f.write(f"{datetime.now()}\t{link}\t{final_title}\n")