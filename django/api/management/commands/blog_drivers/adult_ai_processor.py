# -*- coding: utf-8 -*-
import re, random, requests, time

class AdultAIProcessor:
    def __init__(self, api_keys, template):
        self.api_keys = api_keys
        self.template = template

    def generate_blog_content(self, data, b_type):
        """アダルトコンテンツ専用のAI生成処理"""
        
        # 1. プロンプトの組み立て (PC版の maker/name 等の縛りを撤廃)
        # .format() ではなく .replace() を使うことで、テンプレートに項目がなくてもエラーになりません
        prompt = self.template.replace("{url}", data.get('url', '')) \
                             .replace("{title}", data.get('title', '')) \
                             .replace("{body}", data.get('body', '')) \
                             .replace("{blog_name}", b_type)

        # 安全フィルターを考慮した微調整
        prompt += f"\n\n※この原稿は「{b_type}」というブログ向けに、読者の興奮を誘う艶やかな表現で出力してください。"

        # 2. API実行 (Gemma-3 27B IT 固定)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        for key in shuffled_keys:
            try:
                # 💎 Gemma-3 27B IT モデルを指定
                api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b-it:generateContent?key={key}"
                
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "safetySettings": [
                        {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                        {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
                    ]
                }
                
                res = requests.post(api_url, json=payload, timeout=60)
                if res.status_code == 200:
                    res_json = res.json()
                    text = self._find_text_recursive(res_json)
                    if text:
                        # 不要なマークダウンコードブロックを除去
                        clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                        return self.extract_tags(clean_text, data['title'])
                else:
                    print(f"  🔑 Key NG (Status: {res.status_code})")
            except Exception as e:
                print(f"  ⚠️ APIエラー: {str(e)}")
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
        """AIが生成したテキストから [TITLE_GENERAL] 等のタグを解析"""
        def get_tag(tag):
            # 前後のアスタリスク等も考慮した柔軟な正規表現
            pattern = rf'\[\*{{0,3}}{tag}\*{{0,3}}\]\s*(.*?)\s*\[/\*{{0,3}}{tag}\*{{0,3}}\]'
            m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
            return m.group(1).strip() if m else None

        return {
            'title_g': get_tag("TITLE_GENERAL") or default_title, 
            'cont_g': get_tag("CONTENT_GENERAL") or text, 
            'summary': get_tag("SUMMARY_BOX") or "",
            'raw_text': text
        }