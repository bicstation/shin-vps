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
        AIモデルに対してRSS内容を「絶対的な主役」として認識させ、
        かつAPIエラー（503/429）に対して強力なリトライ体制を敷く。
        """
        try:
            # 補足情報の取得
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            prod_name = prod.name if prod else "最新ガジェット"
            prod_price = prod.price if prod else "最新価格を確認"
        except:
            prod_name = "IT製品"
            prod_price = "要確認"

        # テンプレート置換 (入力段階の置換)
        prompt_content = self.template.replace("{{current_url}}", data['url']) \
                                     .replace("{{description}}", data['body']) \
                                     .replace("{{maker}}", "主要メーカー") \
                                     .replace("{{name}}", prod_name) \
                                     .replace("{{price}}", str(prod_price)) \
                                     .replace("{{original_title}}", data['title'])

        # 指示の強制力を最大化したプロンプト
        enforced_prompt = (
            f"【最優先命令】以下の[ニュース内容]に基づき、指定された形式でブログ記事を書いてください。\n"
            f"無関係なPC製品（HP製品やRyzen等）をメインテーマに据えることは厳禁です。\n\n"
            f"[ニュース内容]:\nタイトル: {data['title']}\n本文: {data['body']}\n\n"
            f"【構成指示】:\n{prompt_content}"
        )

        payload = {
            "contents": [{"parts": [{"text": enforced_prompt}]}],
            "generationConfig": {
                "temperature": 0.2, 
                "topP": 0.95,
                "maxOutputTokens": 8192,
                "responseMimeType": "text/plain"
            }
        }

        # API実行 (強力なキーローテーションとリトライ)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        target_models = ["gemma-3-27b-it", "gemini-1.5-flash"]
        
        for attempt_model in target_models:
            wait_time = 5 

            for key in shuffled_keys:
                try:
                    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{attempt_model}:generateContent?key={key}"
                    res = requests.post(api_url, json=payload, timeout=120) 
                    
                    if res.status_code == 200:
                        text = self._find_text_recursive(res.json())
                        if text:
                            # 🧹 文頭の挨拶ゴミを削除
                            text = re.sub(r'^(承知いたしました|はい、|提供された|ニュースに基づき).*?\n', '', text, flags=re.IGNORECASE)
                            clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                            return self.extract_tags(clean_text, data['title'])
                    
                    elif res.status_code == 429:
                        time.sleep(wait_time)
                        wait_time = min(wait_time * 2, 60)
                        continue
                    elif res.status_code == 503:
                        time.sleep(10)
                        continue
                    else:
                        continue 
                except Exception as e:
                    time.sleep(2)
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
        
        # タグ抽出失敗時のフォールバック処理
        if not res['cont_g'] or len(res['cont_g']) < 50:
            clean_body = re.sub(r'\[/?.*?\]', '', text).strip()
            res['cont_g'] = res['cont_h'] = clean_body
            
        # 🧹 --- ゴミ掃除ロジック追加セクション --- 🧹
        # {{maker}} や {price} のような中括弧ゴミを根こそぎ削除
        # 1. {{...}} の形式を削除
        # 2. {...} の形式を削除
        for key in ['title_h', 'title_g', 'cont_h', 'cont_g', 'summary']:
            if res[key]:
                # 中括弧とその中身を削除（例: {maker} や {{price}}）
                res[key] = re.sub(r'\{{1,2}.*?\}{1,2}', '', res[key])
                # 連続した空白や改行を整える
                res[key] = res[key].replace('  ', ' ').strip()
        
        return res