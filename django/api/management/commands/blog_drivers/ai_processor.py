# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/management/commands/blog_drivers/ai_processor.py
"""
AI Processor v6.6.0: Generic Gemma 3 Engine
- モデル固定: gemma-3-27b-it
- エラーハンドリング: 指数バックオフ (1s, 2s, 4s, 8s, 16s) 
- 汎用設計: 外部テンプレートとコンテキスト注入によるマルチジャンル対応
- 安全なタグ抽出とテンプレート残骸の自動除去
"""

import re
import random
import requests
import time
import json
from api.models.pc_products import PCProduct

class AIProcessor:
    def __init__(self, api_keys, template):
        """
        初期化
        api_keys: Google APIキーのリスト
        template: [TAG]構造を含む出力フォーマットの文字列
        """
        self.api_keys = api_keys
        self.template = template
        self.target_model = "gemma-3-27b-it"

    def generate_blog_content(self, data, b_type):
        """
        Gemma 3 汎用生成エンジン
        data: 入力データ辞書 (target_title, focus, series_title, ep_no 等)
        b_type: 動作モード (series_*, news, general, etc.)
        """
        # 1. コンテキスト構築 (PCジャンル以外の汎用性も考慮しつつ製品情報を取得)
        try:
            prod = PCProduct.objects.filter(is_active=True).order_by('?').first()
            prod_info = {
                "name": prod.name if prod else "推奨コンポーネント",
                "price": f"{prod.price:,}円" if prod and prod.price else "要確認",
                "maker": prod.maker if prod else "主要メーカー"
            }
        except:
            prod_info = {"name": "対象リソース", "price": "ASK", "maker": "Standard"}

        is_series = str(b_type).startswith("series_")
        source_title = data.get('target_title', data.get('title', '無題のトピック'))
        source_body = data.get('focus', data.get('body', '内容詳細なし'))
        
        # 2. ロール（ペルソナ）と命令の動的分岐
        # ※ ここを外部設定ファイル化することで、アダルトや一般ブログへの完全な切り替えが可能
        if is_series:
            role_instruction = (
                f"あなたは伝説的アーキテクトだ。連載『{data.get('series_title', '物理要塞')}』の執筆を行っている。\n"
                f"今回は第{data.get('ep_no', '?')}話として、「{source_title}」の深淵を論理的に記述せよ。"
            )
            main_label = "[解析対象]"
        else:
            # 汎用/ニュースモード
            role_instruction = (
                f"あなたは専門メディアの編集長だ。「{source_title}」について、"
                f"深い洞察に基づいたプロフェッショナルな記事を執筆せよ。"
            )
            main_label = "[ソースデータ]"

        # 3. Gemma 3 最適化プロンプト（指示の厳格化）
        enforced_prompt = (
            f"{role_instruction}\n\n"
            f"【絶対遵守ルール】\n"
            f"1. 文体は「だ・である」調を基本とする。プロフェッショナルな矜持を感じさせる力強い表現を用いよ。\n"
            f"2. {main_label}の情報を核とし、以下の[補足データ]を論理的な裏付けとして組み込め。\n"
            f"3. テンプレート内の {{{{...}}}} タグは、文脈に沿った具体的な用語やデータに必ず置換せよ。不明な場合は専門知識から推論せよ。\n"
            f"4. 挨拶、前置き、メタ発言（「了解しました」等）は厳禁。指定されたタグ構成のみを出力せよ。\n\n"
            f"{main_label}:\n{source_body}\n\n"
            f"[補足データ]:\n名称: {prod_info['name']}\n価格帯: {prod_info['price']}\n提供: {prod_info['maker']}\n\n"
            f"【出力フォーマット】:\n{self.template}"
        )

        payload = {
            "contents": [{"parts": [{"text": enforced_prompt}]}],
            "generationConfig": {
                "temperature": 0.75, # 創造性と論理性のバランス
                "topP": 0.95,
                "maxOutputTokens": 8192,
                "responseMimeType": "text/plain"
            }
        }

        # 4. API実行 (複数キー巡回 + 指数バックオフ)
        shuffled_keys = self.api_keys[:]
        random.shuffle(shuffled_keys)
        
        for key in shuffled_keys:
            for i in range(5): # 最大5回リトライ
                try:
                    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.target_model}:generateContent?key={key}"
                    res = requests.post(api_url, json=payload, timeout=120)
                    
                    if res.status_code == 200:
                        res_json = res.json()
                        text = self._find_text_recursive(res_json)
                        if text:
                            # プレフィックスの徹底除去
                            text = re.sub(r'^(承知いたしました|はい、|提供された|了解しました|Master Architect).*?\n', '', text, flags=re.IGNORECASE | re.MULTILINE)
                            clean_text = re.sub(r'```[a-z]*\n|```', '', text).strip()
                            return self.extract_tags(clean_text, source_title)
                    
                    elif res.status_code == 429:
                        # 指数バックオフ: 1s, 2s, 4s, 8s, 16s
                        wait = (2 ** i)
                        time.sleep(wait)
                        continue
                    
                    elif res.status_code in [500, 502, 503, 504]:
                        time.sleep(5)
                        continue
                    
                    else:
                        # 400系エラーなどはキーを切り替える
                        break 

                except Exception as e:
                    time.sleep(1)
                    continue

        return None

    def _find_text_recursive(self, obj):
        """JSONレスポンスから'text'フィールドを再帰的に探索"""
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
        出力テキストから[タグ]を抽出し、クリーンアップする
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
        
        # フォールバック: タグ抽出失敗時
        if not res['cont_g'] or len(res['cont_g']) < 50:
            clean_body = re.sub(r'\[/?.*?\]', '', text).strip()
            res['cont_g'] = res['cont_h'] = clean_body
            
        # 最終クリーンアップ: テンプレート残骸 {{...}} の除去と空白の整理
        for key in ['title_h', 'title_g', 'cont_h', 'cont_g', 'summary']:
            if res[key]:
                # テンプレートタグ {{...}} を完全に削除
                res[key] = re.sub(r'\{\{.*?\}\}', '', res[key])
                # 不要な空白と改行の整理
                res[key] = re.sub(r'[ \t]+', ' ', res[key])
                res[key] = res[key].replace('\n\n\n', '\n\n').strip()
        
        return res