# -*- coding: utf-8 -*-
import re, random, requests, time, json
from api.models.pc_products import PCProduct

class AIProcessor:
    def __init__(self, api_keys, template):
        self.api_keys = api_keys
        self.template = template

    def generate_blog_content(self, data, b_type):
        """Gemma 3 27B を強制執行モードで呼び出す"""
        try:
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            prod_name = prod.name if prod else "PC関連最新ガジェット"
            prod_price = prod.price if prod else "要確認"
        except:
            prod_name = "PC関連製品"
            prod_price = "要確認"

        # 🚀 徹底した役割固定
        prompt = self.template.format(
            current_url=data['url'], 
            description=data['body'], 
            maker="主要メーカー", 
            name=prod_name, 
            price=prod_price
        )
        
        # 3. API実行 (リトライ)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        for key in shuffled_keys:
            try:
                # 🧪 モデルIDを確実に指定
                model_id = "gemma-3-27b-it"
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={key}"
                
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.1,    # 👈 低くすることで「お節介」を封じ、命令に忠実にする
                        "topP": 0.95,
                        "maxOutputTokens": 8192,
                        "responseMimeType": "text/plain"
                    }
                }
                
                res = requests.post(api_url, json=payload, timeout=90) # 2000文字書くのでタイムアウトを延長
                
                if res.status_code == 200:
                    res_json = res.json()
                    text = self._find_text_recursive(res_json)
                    if text:
                        # 🧹 文頭の「承知しました」系ゴミを物理的に削除する正規表現
                        text = re.sub(r'^(承知いたしました|はい、|どのような|具体的に).*?(\[|#)', r'\2', text, flags=re.DOTALL)
                        clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                        return self.extract_tags(clean_text, data['title'])
                else:
                    print(f"DEBUG: API Error {res.status_code} - {res.text}")
            except Exception as e:
                print(f"DEBUG: Request Exception - {e}")
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
            # タグの間に空白や改行があっても抜けるように調整
            pattern = rf'\[{tag}\](.*?)\[/{tag}\]'
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else None

        # 各セクションを抽出
        res = {
            'title_h': get_tag("TITLE_HATENA") or default_title, 
            'title_g': get_tag("TITLE_GENERAL") or default_title, 
            'cont_h': get_tag("CONTENT_HATENA"), 
            'cont_g': get_tag("CONTENT_GENERAL"), 
            'summary': get_tag("SUMMARY_BOX") or "",
            'raw_text': text
        }
        
        # コンテンツが空の場合は、生テキストをフォールバックとして入れる
        if not res['cont_h']: res['cont_h'] = text
        if not res['cont_g']: res['cont_g'] = text
        
        return res
