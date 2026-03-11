# -*- coding: utf-8 -*-
import re, random, requests, time
from api.models.pc_products import PCProduct

class AIProcessor:
    def __init__(self, api_keys, template):
        self.api_keys = api_keys
        self.template = template

    def generate_blog_content(self, data, b_type):
        """AIを呼び出してブログ原稿を生成するメイン処理"""
        # 1. 関連製品の取得
        try:
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            maker_val = prod.name.split() if prod and prod.name else "不明"
        except:
            prod = None
            maker_val = "不明"

        # 2. プロンプトの組み立て
        prompt = self.template.format(
            current_url=data['url'], 
            description=data['body'], 
            maker=maker_val, 
            name=prod.name if prod else "PC関連製品", 
            price=prod.price if prod else "要確認"
        )
        prompt += f"\n\n※この原稿は「{b_type}」ブログ向けに出力してください。"

        # 3. API実行 (リトライロジック含む)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        for key in shuffled_keys:
            try:
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
                res = requests.post(api_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=60)
                if res.status_code == 200:
                    text = self._find_text_recursive(res.json())
                    if text:
                        # 不要なマークダウンコードブロックを除去
                        clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                        return self.extract_tags(clean_text, data['title'])
            except:
                continue
        return None

    def _find_text_recursive(self, obj):
        """Google APIのレスポンスからテキスト部分を抽出"""
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
        """AIが生成したテキストから独自タグを解析して辞書形式にする"""
        def get_tag(tag):
            pattern = rf'\[\*{{0,3}}{tag}\*{{0,3}}\]\s*(.*?)\s*\[/\*{{0,3}}{tag}\*{{0,3}}\]'
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else None

        return {
            'title_h': get_tag("TITLE_HATENA") or default_title, 
            'title_g': get_tag("TITLE_GENERAL") or default_title, 
            'cont_h': get_tag("CONTENT_HATENA") or text, 
            'cont_g': get_tag("CONTENT_GENERAL") or text, 
            'summary': get_tag("SUMMARY_BOX") or "",
            'raw_text': text
        }