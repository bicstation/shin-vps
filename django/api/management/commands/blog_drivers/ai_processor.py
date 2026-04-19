# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/blog_drivers/ai_processor.py
import re, random, requests, time, json
from api.models.pc_products import PCProduct

class AIProcessor:
    def __init__(self, api_keys, template):
        self.api_keys = api_keys
        self.template = template

    def generate_blog_content(self, data, b_type):
        """
        Gemma 4 エンジン: RSSニュースを核に、BIC-STATION独自の視点でコラムを生成。
        APIクォータ制限を回避しつつ、最高品質の出力を維持する。
        """
        try:
            # 執筆のスパイスとしてランダムに現行製品を1つピックアップ
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            prod_info = {
                "name": prod.name if prod else "最新デバイス",
                "price": f"{prod.price:,}円" if prod and prod.price else "オープン価格",
                "maker": prod.maker if prod else "主要ベンダー"
            }
        except:
            prod_info = {"name": "IT機器", "price": "要確認", "maker": "メーカー"}

        # テンプレート内の変数を、AIが理解しやすい「参考データ」として定義
        # ※AIには「これらの変数タグを見つけたら、提供したデータに基づいて置換せよ」と命じる
        target_context = (
            f"【参考データ】\n"
            f"ニュースURL: {data['url']}\n"
            f"元記事タイトル: {data['title']}\n"
            f"注目製品名: {prod_info['name']}\n"
            f"参考価格: {prod_info['price']}\n"
            f"メーカー: {prod_info['maker']}\n"
        )

        # 指示の強制力を極大化した Gemma 4 専用プロンプト
        enforced_prompt = (
            f"あなたは自作PCメディア『BIC-STATION』の編集長だ。以下の[ニュース内容]と[参考データ]を元に、"
            f"読者の知的好奇心を刺激する鋭いコラムを執筆せよ。\n\n"
            f"【絶対遵守ルール】\n"
            f"1. ニュース内容（{data['title']}）を主役とし、PC製品紹介はあくまで関連トピックに留めること。\n"
            f"2. 文体は「だ・である」調。カタログの丸写しは厳禁。独自の分析を加えろ。\n"
            f"3. 出力形式に含まれる {{{{...}}}} などのタグは、すべて[参考データ]の内容で置換して出力せよ。\n"
            f"4. 置換すべきデータがないタグは、不自然に残さず削除せよ。\n"
            f"5. 「承知いたしました」等の挨拶は不要。タグ([TITLE_GENERAL]等)で囲った本文のみを出力せよ。\n\n"
            f"[ニュース内容]:\n{data['body']}\n\n"
            f"{target_context}\n\n"
            f"【出力構成案】:\n{self.template}"
        )

        payload = {
            "contents": [{"parts": [{"text": enforced_prompt}]}],
            "generationConfig": {
                "temperature": 0.6,  # 執筆のキレ（創造性）を出すために0.6へ調整
                "topP": 0.9,
                "maxOutputTokens": 8192,
                "responseMimeType": "text/plain"
            }
        }

        # API実行 (モデルの優先順位を Gemma 4 / Gemini 1.5 Pro 世代へ)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        target_models = ["gemini-1.5-pro-latest", "gemini-1.5-flash"]
        
        for attempt_model in target_models:
            wait_time = 5 
            for key in shuffled_keys:
                try:
                    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{attempt_model}:generateContent?key={key}"
                    res = requests.post(api_url, json=payload, timeout=120) 
                    
                    if res.status_code == 200:
                        res_json = res.json()
                        text = self._find_text_recursive(res_json)
                        if text:
                            # 掃除開始
                            text = re.sub(r'^(承知いたしました|はい、|提供された|ニュースに基づき).*?\n', '', text, flags=re.IGNORECASE | re.MULTILINE)
                            clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                            return self.extract_tags(clean_text, data['title'])
                    
                    elif res.status_code == 429:
                        time.sleep(wait_time)
                        wait_time = min(wait_time * 2, 60)
                        continue
                    elif res.status_code in [500, 503, 504]:
                        time.sleep(10)
                        continue
                except Exception:
                    continue

        return None

    def _find_text_recursive(self, obj):
        if isinstance(obj, dict):
            if 'text' in obj: return obj['text']
            for v in obj.values():
                found = self._find_text_recursive(v)
                if found: return found
        elif isinstance(obj, list):
            for item in obj:
                found = self._find_text_recursive(item)
                if found: return found
        return None

    def extract_tags(self, text, default_title):
        """
        出力されたテキストから指定のタグを抽出し、
        中括弧ゴミの除去を含む最終クリーンアップを行う。
        """
        def get_tag(tag):
            pattern = rf'\[{tag}\](.*?)\[/{tag}\]'
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else None

        res = {
            'title_h': get_tag("TITLE_HATENA") or get_tag("TITLE_GENERAL") or default_title, 
            'title_g': get_tag("TITLE_GENERAL") or get_tag("TITLE_HATENA") or default_title, 
            'cont_h': get_tag("CONTENT_HATENA") or get_tag("CONTENT_GENERAL"), 
            'cont_g': get_tag("CONTENT_GENERAL") or get_tag("CONTENT_HATENA"), 
            'summary': get_tag("SUMMARY_BOX") or "",
            'raw_text': text
        }
        
        # フォールバック処理（タグが全く取れなかった場合）
        if not res['cont_g'] or len(res['cont_g']) < 50:
            clean_body = re.sub(r'\[/?.*?\]', '', text).strip()
            res['cont_g'] = res['cont_h'] = clean_body
            
        # 🧹 --- 最終クリーンアップ: テンプレートタグの物理的削除 --- 🧹
        for key in ['title_h', 'title_g', 'cont_h', 'cont_g', 'summary']:
            if res[key]:
                # 1. {{...}} または {...} の形式を根こそぎ削除
                res[key] = re.sub(r'\{{1,2}.*?\}{1,2}', '', res[key])
                # 2. 連続した空白、タブ、不自然な改行の補正
                res[key] = re.sub(r'[ \t]+', ' ', res[key])
                res[key] = res[key].replace('\n\n\n', '\n\n').strip()
        
        return res