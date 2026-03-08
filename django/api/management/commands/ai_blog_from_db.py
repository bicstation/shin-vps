# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/management/commands/ai_blog_from_db.py
import os, re, json, random, requests, urllib.parse, time, hashlib, base64, xmlrpc.client
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
from api.models.pc_products import PCProduct 
from django.db.models import Q as DjangoQ 
from django.utils.timezone import now

# === Google API インポート ===
from googleapiclient.discovery import build
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

# === APIキー設定 (10個) ===
def get_active_keys():
    keys = []
    for i in range(1, 11):
        k = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if k: keys.append(k)
    return keys

ACTIVE_KEYS = get_active_keys()
MAX_WORKERS = min(len(ACTIVE_KEYS), 4) if ACTIVE_KEYS else 1

# === パス・定数設定 ===
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BLOGGER_TOKEN_FILE = os.path.join(CURRENT_DIR, 'bs_json', 'token.json')
BLOGGER_SCOPES = ['https://www.googleapis.com/auth/blogger']

# ブログ設定 (Livedoorは news用コードの成功設定を反映)
LD_USER = "pbic" 
LD_BLOG_NAME = "pbic-bcorjo9q" 
LD_API_KEY = "n9T6n0czGX"
LD_URL = f"https://livedoor.blogcms.jp/atom/blog/{LD_BLOG_NAME}/article"

HT_ID, HT_BLOG_DOMAIN, HT_API_KEY = "bicstation", "bicstation.hatenablog.com", "se0o5znod6"
HT_URL = f"https://blog.hatena.ne.jp/{HT_ID}/{HT_BLOG_DOMAIN}/atom/entry"

SS_RPC_URL, SS_USER, SS_PW, SS_BLOG_ID = "https://blog.seesaa.jp/rpc", "bicstation@gmail.com", "1492nabe", "7242363"

class Command(BaseCommand):
    help = 'Gemma 3 (27b) を使用して4大ブログへ同時投稿する'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')
        parser.add_argument('--target', type=str, default='all', help='対象指定')

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ APIキーが未設定です。"))
            return

        limit = options.get('limit', 1)
        targets = [t.strip().lower() for t in options.get('target', 'all').split(',')]

        query = DjangoQ(is_active=True, is_posted=False)
        if options.get('maker'):
            query &= DjangoQ(maker__iexact=options.get('maker'))
        
        products = list(PCProduct.objects.filter(query).exclude(stock_status="受注停止中")[:limit])

        if not products:
            self.stdout.write(self.style.WARNING("🔎 投稿対象の商品がありません。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🚀 開始: {len(products)}件 / モデル: gemma-3-27b-it / キー: {len(ACTIVE_KEYS)}個"))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                delay = i * 15 
                future = executor.submit(self.process_dispatch_task, product, delay, targets)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ システム例外: {str(e)}"))

    # --- 認証・投稿メソッド ---
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
        # Livedoor特有の認証ヘッダーを追加
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

    def post_to_blogger(self, title, content_html):
        try:
            if not os.path.exists(BLOGGER_TOKEN_FILE): return False
            creds = Credentials.from_authorized_user_file(BLOGGER_TOKEN_FILE, BLOGGER_SCOPES)
            if creds and creds.expired and creds.refresh_token: creds.refresh(Request())
            service = build('blogger', 'v3', credentials=creds)
            blogs = service.blogs().listByUser(userId='self').execute()
            blog_id = blogs['items'][0]['id']
            body = {'kind': 'blogger#post', 'title': title, 'content': content_html}
            service.posts().insert(blogId=blog_id, body=body).execute()
            return True
        except: return False

    # --- Gemma 3 生成 (リトライ機能) ---
    def generate_with_gemma_retry(self, prompt, product_id):
        random_keys = list(ACTIVE_KEYS)
        random.shuffle(random_keys)
        
        for idx, key in enumerate(random_keys):
            api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
            try:
                self.stdout.write(f"  💎 Gemma 3 試行中 (Key {idx+1}/10): {product_id}")
                response = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=90)
                res_json = response.json()
                if 'candidates' in res_json:
                    return res_json['candidates'][0]['content']['parts'][0]['text']
            except Exception as e:
                self.stdout.write(self.style.WARNING(f"  ⚠️ 通信エラー: {str(e)}"))
            time.sleep(2)
        return None

    def process_dispatch_task(self, product, delay, targets):
        if delay > 0: time.sleep(delay)

        PROMPT_FILE = os.path.join(CURRENT_DIR, "prompt", "ai_prompt.txt")
        with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
            prompt = f.read().format(
                maker=product.maker, name=product.name,
                price=f"{product.price:,}", description=product.description or ""
            )

        ai_raw_text = self.generate_with_gemma_retry(prompt, product.unique_id)
        if not ai_raw_text: return

        # パース
        spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', ai_raw_text, re.DOTALL)
        summary_match = re.search(r'\[SUMMARY_DATA\](.*?)\[/SUMMARY_DATA\]', ai_raw_text, re.DOTALL)
        summary_raw = summary_match.group(1).strip() if summary_match else ""
        main_body = re.sub(r'\[SPEC_JSON\].*?\[/SPEC_JSON\]', '', ai_raw_text, flags=re.DOTALL)
        main_body = re.sub(r'\[SUMMARY_DATA\].*?\[/SUMMARY_DATA\]', '', main_body, flags=re.DOTALL)
        main_body = re.sub(r'```(html|json)?', '', main_body).replace('```', '').strip()

        # DB保存
        if 'all' in targets or 'db' in targets:
            try:
                if spec_match:
                    sd = json.loads(spec_match.group(1).strip())
                    scores = [int(sd.get(k, 0)) for k in ['score_cpu', 'score_gpu', 'score_cost', 'score_portable', 'score_ai']]
                    product.score_cpu, product.score_gpu, product.score_cost, product.score_portable, product.score_ai = scores
                    product.spec_score = int(sum(scores) / 5)
                product.ai_summary, product.ai_content = summary_raw, f"### 🚀 主要ポイント\n{summary_raw}\n\n{main_body}"
                product.is_posted, product.last_spec_parsed_at = True, now()
                product.save()
                self.stdout.write(self.style.SUCCESS(f"💾 DB更新完了: {product.unique_id}"))
            except: pass

        # HTML構築
        main_html = main_body.replace('\n', '<br>')
        affiliate_url = f"https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=3697471&pid=892455531&vc_url={urllib.parse.quote(product.url)}"
        summary_html = "".join([f"<li>{l.strip()}</li>" for l in summary_raw.splitlines() if l.strip()])
        content_html = f'<div style="background:#f0f7ff; padding:20px; border-radius:10px;"><h3>🚀 注目スペック</h3><ul>{summary_html}</ul></div><p>{main_html}</p><div style="text-align:center;"><img src="{product.image_url}" style="width:200px;"><br><h4>{product.name}</h4><p><b>{product.price:,}円</b></p><a href="{affiliate_url}" target="_blank" style="background:#ef4444; color:white; padding:10px 20px; text-decoration:none; border-radius:5px;">詳細を確認する</a></div>'

        # 投稿タスク (Livedoorを True 指定)
        tasks = [
            ('livedoor', lambda: self.post_to_atompub(LD_URL, LD_USER, LD_API_KEY, f"【性能】{product.name} レビュー", content_html, is_livedoor=True)),
            ('hatena', lambda: self.post_to_atompub(HT_URL, HT_ID, HT_API_KEY, f"【検証】{product.name} 分析", content_html, is_livedoor=False)),
            ('seesaa', lambda: self.post_to_seesaa(f"【爆速】{product.name} 解説", content_html)),
            ('blogger', lambda: self.post_to_blogger(f"【最新】{product.name} まとめ", content_html)),
        ]

        for name, func in tasks:
            if 'all' in targets or name in targets:
                if func(): self.stdout.write(self.style.SUCCESS(f" ✅ {name.capitalize()}成功"))
                else: self.stdout.write(self.style.ERROR(f" ❌ {name.capitalize()}失敗"))