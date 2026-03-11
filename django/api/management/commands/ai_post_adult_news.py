import os, re, random, requests, feedparser, time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from django.core.management.base import BaseCommand
from django.db import connection
from api.management.commands.blog_drivers.data_mapper import ArticleMapper

RSS_SOURCES = {
    "DVD新着": "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=date/",
    "DVD予約": "https://www.dmm.co.jp/mono/dvd/-/list/=/rss=create/sort=p_date/",
}

def get_all_keys():
    keys = []
    for i in range(1, 11):
        val = os.getenv(f"GEMINI_API_KEY_{i}") or os.getenv(f"GEMINI_API_KEY{i}")
        if val: keys.append({"index": i, "key": val})
    return keys

class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument("--limit", type=int, default=2)

    def handle(self, *args, **options):
        limit = options.get("limit", 2)
        ACTIVE_KEYS = get_all_keys()
        PROMPT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prompt", "ai_prompt_adult.txt")
        
        with open(PROMPT_FILE, "r", encoding="utf-8") as f:
            prompt_temp = f.read()

        all_entries = []
        for name, url in RSS_SOURCES.items():
            try:
                res = requests.get(url, timeout=20)
                feed = feedparser.parse(res.text)
                all_entries.extend(feed.entries)
            except: continue
        
        # 重複削除
        seen = set()
        unique_entries = []
        for e in all_entries:
            if e.link not in seen:
                seen.add(e.link)
                unique_entries.append(e)

        target_entries = random.sample(unique_entries, min(len(unique_entries), limit))
        self.stdout.write(f"🚀 並列エンジン起動: {len(target_entries)} 記事の独立生成を開始...")

        with ThreadPoolExecutor(max_workers=5) as executor:
            for entry in target_entries:
                executor.submit(self.process_article, entry, ACTIVE_KEYS, prompt_temp)

    def process_article(self, entry, keys, prompt_temp):
        # 画像抽出の精度を上げる (src="の後、"またはスペースまで)
        desc = getattr(entry, "summary", "") or getattr(entry, "description", "")
        img_match = re.search(r"src=\"(https://pics.dmm.co.jp/[^\s\"]+)\"", desc)
        main_img = img_match.group(1) if img_match else "" # 取れない場合は空文字（Nullではない）

        targets = ["livedoor", "wp_a", "wp_b", "fc2_a", "fc2_b"]
        for t in targets:
            try:
                ai_res = self.ask_ai(keys, prompt_temp, entry.title)
                if not ai_res: continue

                title_match = re.search(r"\[TITLE\](.*?)\[/TITLE\]", ai_res, re.DOTALL)
                final_title = title_match.group(1).strip() if title_match else entry.title
                final_content = ai_res.replace(title_match.group(0), "").strip() if title_match else ai_res

                # 明示的にDB接続を閉じて再接続（スレッドセーフ）
                connection.close() 
                ArticleMapper.save_post_result(
                    t, 
                    {"title_g": final_title, "cont_g": final_content, "main_image_url": main_img},
                    {"title": entry.title, "url": entry.link}, 
                    True
                )
                print(f" ✅ {t.upper()} 成功: {final_title[:20]}...")
            except Exception as e:
                print(f" ❌ {t.upper()} 失敗: {str(e)}")

    def ask_ai(self, keys, prompt_temp, raw_title):
        # 入力そのものから強すぎる単語を伏せる
        clean_input = raw_title.replace("オナニー", "秘密の戯れ").replace("性行為", "愛の交わり").replace("なめくじ", "ぬらりとした")
        full_prompt = f"{prompt_temp}\n\n対象: {raw_title}\nスタイル: ブログ個別最適化\n元ネタ: {clean_input}"
        
        random.shuffle(keys)
        for key_item in keys:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key_item['key']}"
                payload = {
                    "contents": [{"parts": [{"text": full_prompt}]}],
                    "safetySettings": [{"category": c, "threshold": "BLOCK_NONE"} for c in ["HARM_CATEGORY_SEXUALLY_EXPLICIT", "HARM_CATEGORY_HATE_SPEECH", "HARM_CATEGORY_HARASSMENT", "HARM_CATEGORY_DANGEROUS_CONTENT"]]
                }
                r = requests.post(url, json=payload, timeout=60)
                if r.status_code == 200:
                    text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                    return text.replace("```html", "").replace("```", "").strip()
            except: continue
        return None
