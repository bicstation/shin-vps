# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/management/commands/ai_adult_from_db.py
import os, re, json, random, requests, urllib.parse, time, hashlib, base64, xmlrpc.client
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
from django.core.management.base import BaseCommand
# モデル名はプロジェクトに合わせて調整してください（例: AdultProduct）
from api.models.pc_products import PCProduct 
from django.db.models import Q as DjangoQ 
from django.utils.timezone import now

# === APIキー設定 (10個) ===
def get_active_keys():
    keys = []
    for i in range(1, 11):
        k = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if k: keys.append(k)
    return keys

ACTIVE_KEYS = get_active_keys()
MAX_WORKERS = min(len(ACTIVE_KEYS), 4) if ACTIVE_KEYS else 1

# === ブログ設定 (アダルト用) ===
# 1. Livedoorブログ
LD_USER = "pbic"
LD_BLOG_NAME = "pbic-bcorjo9q" 
LD_API_KEY = "a4lnDJzzXU" # 前回の成功キーを反映
LD_URL = f"https://livedoor.blogcms.jp/atom/blog/{LD_BLOG_NAME}/article"

# 2. WordPress A (bic-erog.com)
WP_A_URL = "https://blog.bic-erog.com/xmlrpc.php"
WP_A_USER = "bicstation"
WP_A_PW = "a0H2 McUX 3XK6 apzh JZ82 SzTm"

# 3. WordPress B (adult-search.xyz)
WP_B_URL = "https://blog.adult-search.xyz/xmlrpc.php"
WP_B_USER = "bicstation"
WP_B_PW = "OBlD Yz2v lR8F wswY zwaW cF43"

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))

class Command(BaseCommand):
    help = 'DBからアダルト作品を読み込みGemma 3でレビュー生成＆投稿'

    def add_arguments(self, parser):
        parser.add_argument('--maker', type=str, help='メーカー指定')
        parser.add_argument('--limit', type=int, default=1, help='投稿件数')
        parser.add_argument('--target', type=str, default='all', help='対象指定')

    def handle(self, *args, **options):
        if not ACTIVE_KEYS:
            self.stdout.write(self.style.ERROR("❌ APIキー未設定"))
            return

        limit = options.get('limit', 1)
        targets = [t.strip().lower() for t in options.get('target', 'all').split(',')]

        # DBから未投稿かつアクティブな作品を取得
        query = DjangoQ(is_active=True, is_posted=False)
        if options.get('maker'):
            query &= DjangoQ(maker__iexact=options.get('maker'))
        
        products = list(PCProduct.objects.filter(query).exclude(stock_status="受注停止中")[:limit])

        if not products:
            self.stdout.write(self.style.WARNING("🔎 投稿対象がありません。"))
            return

        self.stdout.write(self.style.SUCCESS(f"🔞 アダルトDB投稿開始: {len(products)}件 / モデル: gemma-3-27b-it"))

        with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
            future_to_product = {}
            for i, product in enumerate(products):
                delay = i * 10 
                future = executor.submit(self.process_dispatch_task, product, delay, targets)
                future_to_product[future] = product

            for future in as_completed(future_to_product):
                try:
                    future.result()
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ システム例外: {str(e)}"))

    # --- 認証 & AtomPub (Livedoor) ---
    def generate_wsse(self, user_id, api_key):
        created = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        nonce_binary = os.urandom(16)
        nonce_base64 = base64.b64encode(nonce_binary).decode('utf-8')
        sha1_input = nonce_binary + created.encode('utf-8') + api_key.encode('utf-8')
        digest_base64 = base64.b64encode(hashlib.sha1(sha1_input).digest()).decode('utf-8')
        return (f'UsernameToken Username="{user_id}", PasswordDigest="{digest_base64}", '
                f'Nonce="{nonce_base64}", Created="{created}"')

    def post_to_livedoor(self, title, content_html):
        wsse = self.generate_wsse(LD_USER, LD_API_KEY)
        headers = {'X-WSSE': wsse, 'Authorization': 'WSSE profile="UsernameToken"', 'Content-Type': 'application/atom+xml;type=entry'}
        xml = f"""<?xml version="1.0" encoding="utf-8"?>
<entry xmlns="http://www.w3.org/2005/Atom">
  <title>{title}</title>
  <content type="text/html"><![CDATA[{content_html}]]></content>
  <app:control xmlns:app="http://www.w3.org/2007/app"><app:draft>no</app:draft></app:control>
</entry>""".encode('utf-8')
        try:
            res = requests.post(LD_URL, data=xml, headers=headers, timeout=30)
            return res.status_code in [200, 201]
        except: return False

    # --- WordPress (XML-RPC) ---
    def post_to_wordpress(self, url, user, pw, title, content_html):
        try:
            server = xmlrpc.client.ServerProxy(url)
            post_data = {'title': title, 'description': content_html, 'post_status': 'publish', 'mt_allow_comments': 1}
            server.metaWeblog.newPost('1', user, pw, post_data, True)
            return True
        except: return False

    # --- Gemma 3 生成 ---
    def generate_with_gemma_retry(self, prompt, prod_id):
        keys = list(ACTIVE_KEYS)
        random.shuffle(keys)
        for key in keys:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
            try:
                r = requests.post(url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=90)
                return r.json()['candidates'][0]['content']['parts'][0]['text']
            except: continue
        return None

    def process_dispatch_task(self, product, delay, targets):
        if delay > 0: time.sleep(delay)

        # アダルト用プロンプトの読み込み
        PROMPT_FILE = os.path.join(CURRENT_DIR, "prompt", "ai_prompt_adult.txt")
        with open(PROMPT_FILE, 'r', encoding='utf-8') as f:
            prompt_base = f.read()
        
        prompt = prompt_base.format(
            maker=product.maker, name=product.name,
            price=f"{product.price:,}", description=product.description or ""
        )

        ai_raw = self.generate_with_gemma_retry(prompt, product.id)
        if not ai_raw: return

        # [TITLE] や [SPEC_JSON] を抽出
        title_match = re.search(r'\[TITLE\](.*?)\[/TITLE\]', ai_raw, re.DOTALL)
        spec_match = re.search(r'\[SPEC_JSON\](.*?)\[/SPEC_JSON\]', ai_raw, re.DOTALL)
        
        final_title = title_match.group(1).strip() if title_match else f"【新作】{product.name}"
        main_body = re.sub(r'\[.*?\]', '', ai_raw, flags=re.DOTALL).strip()
        main_body = main_body.replace('```html', '').replace('```', '').strip()

        # DB保存ロジック（アダルト評価項目に置換）
        if 'all' in targets or 'db' in targets:
            try:
                if spec_match:
                    sd = json.loads(spec_match.group(1).strip())
                    # CPU/GPU等の代わりに エロ度(ero), ルックス(looks), 興奮度(excitement)等
                    product.score_cpu = int(sd.get('score_ero', 0))
                    product.score_gpu = int(sd.get('score_looks', 0))
                    product.score_cost = int(sd.get('score_cost', 0))
                product.ai_content = main_body
                product.is_posted = True
                product.save()
            except: pass

        # HTML構成
        image_html = f'<div style="text-align:center; margin-bottom:20px;"><img src="{product.image_url}" style="max-width:100%; border-radius:10px; box-shadow:0 4px 15px rgba(0,0,0,0.3);"></div>'
        affiliate_html = f'<div style="text-align:center; margin-top:30px;"><a href="{product.url}" style="background:linear-gradient(to bottom, #ff4500, #ff0000); color:white; padding:15px 35px; text-decoration:none; border-radius:50px; font-weight:bold; font-size:1.2em; display:inline-block;">🔞 今すぐ本編をチェックする</a></div>'
        
        full_html = f"{image_html}<div style='line-height:1.8;'>{main_body.replace(chr(10), '<br>')}</div>{affiliate_html}"

        # 投稿実行
        results = []
        if 'all' in targets or 'livedoor' in targets:
            results.append(("Livedoor", self.post_to_livedoor(final_title, full_html)))
        
        if 'all' in targets or 'wp_a' in targets:
            results.append(("WP_A(bic-erog)", self.post_to_wordpress(WP_A_URL, WP_A_USER, WP_A_PW, final_title, full_html)))

        if 'all' in targets or 'wp_b' in targets:
            results.append(("WP_B(adult-search)", self.post_to_wordpress(WP_B_URL, WP_B_USER, WP_B_PW, final_title, full_html)))

        for name, success in results:
            msg = self.style.SUCCESS(f" ✅ {name}成功") if success else self.style.ERROR(f" ❌ {name}失敗")
            self.stdout.write(msg)