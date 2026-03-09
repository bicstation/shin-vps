# -*- coding: utf-8 -*-
import os, re, json, random, requests, feedparser, urllib.parse, time, hashlib, base64, traceback
import xmlrpc.client
from datetime import datetime
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand

# === APIキー取得設定 ===
def get_all_keys():
    keys = []
    for i in range(1, 11):
        val = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if val: keys.append({"index": i, "key": val})
    return keys

# === 配信先ブログ設定 ===
LD_USER = "pbic" 
LD_BLOG_NAME = "pbic" 
LD_API_KEY = "a4lnDJzzXU" # 最新のAPIパスワードに更新済み
LD_URL = f"https://livedoor.blogcms.jp/atompub/{LD_BLOG_NAME}/article"

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
    "アニメ予約": "https://www.dmm.co.jp/digital/anime/-/list/=/rss=create/sort=p_date/",
    "ブック新着": "https://www.dmm.co.jp/dc/book/-/list/=/rss=create/sort=date/",
    "おもちゃ総合": "https://www.dmm.co.jp/mono/goods/-/list/=/rss=create/sort=date/",
    "オナホール": "https://www.dmm.co.jp/mono/goods/-/list/=/article=keyword/id=1012/rss=create/",
}

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

class Command(BaseCommand):
    help = 'デバッグ強化版：Livedoor & XML-RPC(WP/FC2) 配信管理'

    def add_arguments(self, parser):
        parser.add_argument('--limit', type=int, default=1)
        parser.add_argument('--target', type=str, default='all')

    def handle(self, *args, **options):
        limit = options.get('limit', 1)
        target_opt = options.get('target', 'all').lower()
        PROMPT_FILE = os.path.join(CURRENT_DIR, "prompt", "ai_prompt_adult.txt")
        HISTORY_FILE = os.path.join(CURRENT_DIR, "post_history_adult.txt")
        ACTIVE_KEYS = get_all_keys()
        
        if not os.path.exists(PROMPT_FILE):
            self.stdout.write(self.style.ERROR(f"Prompt file not found: {PROMPT_FILE}"))
            return

        with open(PROMPT_FILE, "r", encoding='utf-8') as f:
            PROMPT_TEMPLATE = f.read()

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
                        target_entry = random.choice(new_entries[:10])
                        selected_genre = genre_name
                        break
                except: continue

            if target_entry:
                self.process_task(target_entry, PROMPT_TEMPLATE, HISTORY_FILE, target_opt, selected_genre, ACTIVE_KEYS)
                if limit > 1: time.sleep(5)

    def generate_wsse(self, user_id, api_key):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce_binary = os.urandom(16)
        nonce_base64 = base64.b64encode(nonce_binary).decode('utf-8')
        sha1_input = nonce_binary + created.encode('utf-8') + api_key.encode('utf-8')
        digest_base64 = base64.b64encode(hashlib.sha1(sha1_input).digest()).decode('utf-8')
        return (f'UsernameToken Username="{user_id}", PasswordDigest="{digest_base64}", '
                f'Nonce="{nonce_base64}", Created="{created}"')

    def post_to_livedoor(self, title, content_html, tags):
        wsse = self.generate_wsse(LD_USER, LD_API_KEY)
        headers = {'X-WSSE': wsse, 'Authorization': 'WSSE profile="UsernameToken"', 'Content-Type': 'application/atom+xml;type=entry'}
        cat_xml = "".join([f'<category term="{c}" />' for c in tags[:3]])
        xml_body = f'<?xml version="1.0" encoding="utf-8"?><entry xmlns="http://www.w3.org/2005/Atom"><title>{title}</title><content type="text/html"><![CDATA[{content_html}]]></content>{cat_xml}</entry>'.encode('utf-8')
        
        r = requests.post(LD_URL, data=xml_body, headers=headers, timeout=30)
        if r.status_code in [200, 201]: return True
        else:
            self.stdout.write(self.style.WARNING(f" LIVEDOOR Error [{r.status_code}]: {r.text[:100]}"))
            return False

    def post_to_xmlrpc(self, target_key, title, content_html, categories, tags):
        conf = CONFIG_RPC[target_key]
        server = xmlrpc.client.ServerProxy(conf['url'], timeout=30)
        post_data = {'title': title, 'description': content_html, 'post_status': 'publish', 'categories': categories, 'mt_keywords': tags}
        server.metaWeblog.newPost(conf['blog_id'], conf['user'], conf['pw'], post_data, True)
        return True

    def process_task(self, entry, prompt_temp, history_file, target_opt, genre_label, keys):
        try:
            # 1. 画像・タグ抽出
            img_url = entry.get('package', '') 
            content_html = entry.get('content_encoded', '') or entry.get('description', '')
            soup = BeautifulSoup(content_html, 'html.parser')
            if not img_url:
                img_tag = soup.find('img')
                if img_tag: img_url = img_tag.get('src', '')
            if img_url: img_url = re.sub(r'(pt|ps|-1)\.jpg$', 'pl.jpg', img_url)
            extracted_tags = [a.get_text() for a in soup.find_all('a') if 'article=' in a.get('href', '')]
            if not extracted_tags: extracted_tags = [genre_label, "FANZA"]

            # 2. AI生成
            ai_text = None
            clean_desc = soup.get_text(separator=' ', strip=True)
            random.shuffle(keys)
            for item in keys:
                try:
                    r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={item['key']}", 
                        json={"contents": [{"parts": [{"text": prompt_temp.replace("{description}", clean_desc)}]}]}, timeout=60)
                    if r.status_code == 200:
                        ai_text = r.json()['candidates'][0]['content']['parts'][0]['text'].replace('```html', '').replace('```', '').strip()
                        break
                except: continue
            if not ai_text:
                self.stdout.write(self.style.ERROR(" ❌ AI生成に失敗したためスキップ"))
                return

            title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', ai_text, re.DOTALL)
            final_title = title_match.group(1).strip() if title_match else f"【{genre_label}】{entry.title}"
            main_body = re.sub(r'\[TITLE\].*?\[/TITLE\]', '', ai_text, flags=re.DOTALL).strip()

            # 3. HTML整形
            image_html = f'<div style="text-align:center; margin-bottom:20px;"><img src="{img_url}" style="max-width:100%;"></div>' if img_url else ""
            btn_html = f'<div style="text-align:center; margin-top:25px;"><a href="{entry.link}" style="background:#ff4500; color:#fff; padding:15px 35px; text-decoration:none; border-radius:50px; font-weight:bold; display:inline-block;">▶ 商品詳細・サンプルをチェック</a></div>'
            full_html = f"{image_html}\n{main_body}\n{btn_html}"

            # 4. ライブドア配信
            if target_opt in ['all', 'livedoor']:
                try:
                    if self.post_to_livedoor(final_title, full_html, extracted_tags):
                        self.stdout.write(self.style.SUCCESS(" ✅ LIVEDOOR 完了"))
                    else:
                        self.stdout.write(self.style.ERROR(" ❌ LIVEDOOR 失敗"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f" ❌ LIVEDOOR 致命的エラー: {e}"))

            # 5. XML-RPC 配信 (WP/FC2) - 個別に例外処理を行い、一つが落ちても次へ行くように修正
            for t in CONFIG_RPC.keys():
                if target_opt in ['all', t]:
                    try:
                        if self.post_to_xmlrpc(t, final_title, full_html, [genre_label], extracted_tags):
                            self.stdout.write(self.style.SUCCESS(f" ✅ {t.upper()} 完了"))
                        else:
                            self.stdout.write(self.style.ERROR(f" ❌ {t.upper()} 失敗（応答不正）"))
                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f" ❌ {t.upper()} 通信エラー: {str(e)[:50]}"))

            # 履歴保存
            with open(history_file, "a", encoding='utf-8') as f:
                f.write(f"{datetime.now()}\t{entry.link}\t{final_title}\n")

        except Exception as e:
            self.stdout.write(self.style.ERROR(f" 💥 処理全体でエラーが発生: {traceback.format_exc()}"))