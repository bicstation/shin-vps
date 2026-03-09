# -*- coding: utf-8 -*-
import os, re, json, random, requests, feedparser, urllib.parse, time, hashlib, base64, traceback
import xmlrpc.client
import socket
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

# === APIキー・配信先設定 ===
def get_all_keys():
    keys = []
    for i in range(1, 11):
        val = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if val: keys.append({"index": i, "key": val})
    return keys

# --- ライブドアブログ設定 ---
LD_USER = "pbic"
LD_BLOG_NAME = "pbic"
LD_API_KEY = "a4lnDJzzXU"           # 記事投稿用 (AtomPub)
LD_FILE_PW = "jZ8ZL9cl4q96fmO0YB4MUNMYFGoRfLQO" # 画像保存用 (File Manager API)
LD_URL = f"https://livedoor.blogcms.jp/atompub/{LD_BLOG_NAME}/article"
LD_IMAGE_URL = f"https://livedoor.blogcms.jp/atompub/{LD_BLOG_NAME}/image"

# --- WordPress / FC2 設定 ---
CONFIG_RPC = {
    'wp_a': {'url': "https://blog.bic-erog.com/xmlrpc.php", 'user': "bicstation", 'pw': "a0H2 McUX 3XK6 apzh JZ82 SzTm", 'blog_id': '1'},
    'wp_b': {'url': "https://blog.adult-search.xyz/xmlrpc.php", 'user': "bicstation", 'pw': "OBlD Yz2v lR8F wswY zwaW cF43", 'blog_id': '1'},
    'fc2_a': {'url': "http://blog.fc2.com/xmlrpc.php", 'user': "tiperlive", 'pw': "1492Nabe", 'blog_id': "tiperlive"},
    'fc2_b': {'url': "http://blog.fc2.com/xmlrpc.php", 'user': "tiper", 'pw': "3EAH4JthsGEnvNa", 'blog_id': "tiper"}
}

# === RSSジャンルリスト ===
RSS_SOURCES = {
    "DVD新着": "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=date/",
    "DVD予約": "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
    "アニメ新着": "https://www.dmm.co.jp/digital/anime/-/list/=/rss=create/sort=date/",
    "ブック新着": "https://www.dmm.co.jp/dc/book/-/list/=/rss=create/sort=date/",
    "おもちゃ総合": "https://www.dmm.co.jp/mono/goods/-/list/=/rss=create/sort=date/",
    "オナホール": "https://www.dmm.co.jp/mono/goods/-/list/=/article=keyword/id=1012/rss=create/",
}

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

class Command(BaseCommand):
    help = '全機能維持＋投稿制限エラー回避＋アイキャッチ紐付け強制強化版'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1)
        parser.add_argument('--target', type=str, default='all')

    def get_now(self):
        return datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    def handle(self, *args, **options):
        limit = options.get('limit', 1)
        target_opt = options.get('target', 'all').lower()
        PROMPT_FILE = os.path.join(CURRENT_DIR, "prompt", "ai_prompt_adult.txt")
        HISTORY_FILE = os.path.join(CURRENT_DIR, "post_history_adult.txt")
        ACTIVE_KEYS = get_all_keys()
        
        if not os.path.exists(PROMPT_FILE): return
        with open(PROMPT_FILE, "r", encoding='utf-8') as f: PROMPT_TEMPLATE = f.read()

        self.stdout.write(self.style.MIGRATE_LABEL(f"[{self.get_now()}] 🚀 処理開始"))

        for _ in range(limit):
            posted_urls = []
            if os.path.exists(HISTORY_FILE):
                with open(HISTORY_FILE, "r", encoding='utf-8') as f:
                    posted_urls = [line.split('\t')[1].strip() for line in f if len(line.split('\t')) > 1]

            target_entry, selected_genre = None, ""
            for i in range(15):
                genre_name, rss_url = random.choice(list(RSS_SOURCES.items()))
                try:
                    res = requests.get(rss_url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=20)
                    feed = feedparser.parse(res.text)
                    new_entries = [e for e in feed.entries if e.link.strip() not in posted_urls]
                    if new_entries:
                        target_entry, selected_genre = random.choice(new_entries[:10]), genre_name
                        break
                except: continue

            if target_entry:
                self.process_task(target_entry, PROMPT_TEMPLATE, HISTORY_FILE, target_opt, selected_genre, ACTIVE_KEYS)
                if limit > 1: time.sleep(15)

        self.stdout.write(self.style.MIGRATE_LABEL(f"[{self.get_now()}] ✨ 全行程完了"))

    def ask_ai(self, keys, prompt):
        random.shuffle(keys)
        for item in keys:
            try:
                r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={item['key']}", 
                    json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                if r.status_code == 200:
                    return r.json()['candidates'][0]['content']['parts'][0]['text'].replace('```html', '').replace('```', '').strip()
            except: continue
        return None

    def post_image_to_livedoor(self, img_url):
        try:
            img_res = requests.get(img_url, timeout=20)
            if img_res.status_code != 200: return img_url
            wsse = self.generate_wsse(LD_USER, LD_FILE_PW)
            headers = {'X-WSSE': wsse, 'Authorization': 'WSSE profile="UsernameToken"', 'Content-Type': 'image/jpeg'}
            r = requests.post(LD_IMAGE_URL, data=img_res.content, headers=headers, timeout=40)
            if r.status_code in [200, 201]:
                soup = BeautifulSoup(r.text, 'xml')
                return soup.find('content').get('src')
        except: pass
        return img_url

    def post_to_livedoor(self, title, content_html, tags, origin_img_url):
        try:
            final_img_url = self.post_image_to_livedoor(origin_img_url)
            image_tag_new = f'<div style="text-align:center; margin-bottom:20px;"><img src="{final_img_url}" class="pict" style="max-width:100%;"></div>'
            content_html = content_html.replace(f'__IMG_TAG_PLACEHOLDER__', image_tag_new)
            
            wsse = self.generate_wsse(LD_USER, LD_API_KEY)
            headers = {'X-WSSE': wsse, 'Authorization': 'WSSE profile="UsernameToken"', 'Content-Type': 'application/atom+xml;type=entry'}
            cat_xml = "".join([f'<category term="{c}" />' for c in tags[:3]])
            xml_body = f'<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><title>{title}</title><content type="text/html"><![CDATA[{content_html}]]></content>{cat_xml}</entry>'.encode('utf-8')
            r = requests.post(LD_URL, data=xml_body, headers=headers, timeout=40)
            return r.status_code in [200, 201]
        except: return False

    def post_to_xmlrpc(self, target_key, title, content_html, categories, tags, img_url):
        conf = CONFIG_RPC[target_key]
        server = xmlrpc.client.ServerProxy(conf['url'], allow_none=True)
        thumbnail_id = None
        
        try:
            # --- 画像アップロード & ID取得 ---
            if img_url:
                try:
                    img_res = requests.get(img_url, timeout=20)
                    if img_res.status_code == 200:
                        up_res = server.wp.uploadFile(conf['blog_id'], conf['user'], conf['pw'], {
                            'name': f"t_{int(time.time())}.jpg", 'type': 'image/jpeg',
                            'bits': xmlrpc.client.Binary(img_res.content), 'overwrite': True
                        })
                        # IDを確実に数値(int)として保持
                        if 'id' in up_res:
                            thumbnail_id = int(up_res['id'])
                except: pass

            # 本文内のプレースホルダ置換
            image_tag_std = f'<div style="text-align:center; margin-bottom:20px;"><img src="{img_url}" style="max-width:100%;"></div>'
            content_html = content_html.replace(f'__IMG_TAG_PLACEHOLDER__', image_tag_std)

            post_data = {
                'title': title, 
                'description': content_html, 
                'post_status': 'publish', 
                'categories': categories, 
                'mt_keywords': tags
            }
            
            # --- アイキャッチ紐付け強化 ---
            if thumbnail_id:
                post_data['post_thumbnail'] = thumbnail_id
                # カスタムフィールドにも強制書き込み（Lightning/Cocoon対応）
                post_data['custom_fields'] = [
                    {'key': '_thumbnail_id', 'value': thumbnail_id},
                    {'key': 'vk_post_options_image_value', 'value': thumbnail_id}
                ]
            
            server.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], post_data, True)
            return True

        except xmlrpc.client.Fault as e:
            # FC2の「1日10件制限」などのFaultエラーをキャッチしてスキップ
            self.stdout.write(self.style.WARNING(f"[{target_key.upper()}] サーバー側制限によりスキップ: {e.faultString}"))
            return False
        except Exception:
            return False

    def generate_wsse(self, user_id, api_password):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce_binary = os.urandom(16)
        nonce_base64 = base64.b64encode(nonce_binary).decode('utf-8')
        sha1_input = nonce_binary + created.encode('utf-8') + api_password.encode('utf-8')
        digest_base64 = base64.b64encode(hashlib.sha1(sha1_input).digest()).decode('utf-8')
        return f'UsernameToken Username="{user_id}", PasswordDigest="{digest_base64}", Nonce="{nonce_base64}", Created="{created}"'

    def process_task(self, entry, prompt_temp, history_file, target_opt, genre_label, keys):
        try:
            img_url = entry.get('package', '') 
            content_html = entry.get('content_encoded', '') or entry.get('description', '')
            soup = BeautifulSoup(content_html, 'html.parser')
            if not img_url:
                img_tag = soup.find('img')
                if img_tag: img_url = img_tag.get('src', '')
            if img_url: img_url = re.sub(r'(pt|ps|-1)\.jpg$', 'pl.jpg', img_url)
            
            clean_desc = soup.get_text(separator=' ', strip=True)
            extracted_tags = [a.get_text() for a in soup.find_all('a') if 'article=' in a.get('href', '')] or [genre_label]

            terms = {"おもちゃ": ("このアイテム", "アイテム詳細・購入はこちら"), "ブック": ("このコミック", "収録内容・試し読みはこちら"), "アニメ": ("この新作アニメ", "配信・サンプル動画をチェック")}
            item_term, btn_label = next((v for k, v in terms.items() if k in genre_label), ("このビデオ", "動画詳細・サンプル視聴はこちら"))

            self.stdout.write(f"[{self.get_now()}] 📦 素材抽出完了: {entry.title[:25]}...")

            all_targets = ['livedoor'] + list(CONFIG_RPC.keys())
            site_styles = {'livedoor': "SNS煽り系短文", 'wp_a': f"コンシェルジュ風。{item_term}解説", 'wp_b': f"熱狂マニア風。{item_term}熱弁", 'fc2_a': "まとめサイト風", 'fc2_b': "断定購入推奨"}

            for t in all_targets:
                if target_opt != 'all' and target_opt != t: continue
                
                ai_text = self.ask_ai(keys, f"{prompt_temp}\n対象: {item_term}\nスタイル: {site_styles.get(t)}\n元ネタ: {clean_desc}")
                if not ai_text: continue

                title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', ai_text, re.DOTALL)
                final_title = title_match.group(1).strip() if title_match else f"【{genre_label}】{entry.title}"
                main_body = re.sub(r'\[TITLE\].*?\[/TITLE\]', '', ai_text, flags=re.DOTALL).strip()

                btn_html = f'<div style="text-align:center; margin-top:25px;"><a href="{entry.link}" style="background:#ff4500; color:#fff; padding:15px 35px; text-decoration:none; border-radius:50px; font-weight:bold; display:inline-block;">▶ {btn_label}</a></div>'
                full_html_base = f"__IMG_TAG_PLACEHOLDER__\n{main_body}\n{btn_html}"

                success = False
                if t == 'livedoor':
                    success = self.post_to_livedoor(final_title, full_html_base, extracted_tags, img_url)
                else:
                    success = self.post_to_xmlrpc(t, final_title, full_html_base, [genre_label], extracted_tags, img_url)

                if success: 
                    self.stdout.write(self.style.SUCCESS(f"[{self.get_now()}] ✅ {t.upper()} 完了"))
                
                time.sleep(2)

            with open(history_file, "a", encoding='utf-8') as f: 
                f.write(f"{self.get_now()}\t{entry.link}\t{entry.title}\n")
        except: 
            self.stdout.write(self.style.ERROR(f"[{self.get_now()}] 💥 処理スキップ: {traceback.format_exc()}"))