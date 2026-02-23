# -*- coding: utf-8 -*-
import os
import time
import json
import re
import requests
import google.generativeai as genai
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import Actress, AdultActressProfile

class Command(BaseCommand):
    help = 'FANZA API同期 + Gemma 3 によるURLスカウト＆SEO紹介文自動生成'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # 10個のAPIキーを環境変数から読み込み
        self.api_keys = []
        for i in range(10):
            key = os.getenv(f"GEMINI_API_KEY_{i}")
            if not key and i == 0:
                key = os.getenv("GEMINI_API_KEY")
            if key:
                self.api_keys.append(key)
        
        self.key_index = 0
        self.ai_enriched_count = 0

    def scout_data_with_ai(self, actress_name):
        """
        Gemma 3 を使用して、外部リンクとSEO紹介文を同時に生成する。
        10個のキーをローテーションして制限を回避。
        """
        if not self.api_keys:
            return {}, None

        current_key = self.api_keys[self.key_index]
        genai.configure(api_key=current_key)
        # 次回のためにインデックスを更新
        self.key_index = (self.key_index + 1) % len(self.api_keys)

        # 最新のハイパワーモデルを指定
        model = genai.GenerativeModel('gemma-3-27b-it')
        
        # URL特定と紹介文作成を依頼する統合プロンプト
        prompt = f"""
        Actress Name: {actress_name}
        Task: 
        1. Identify URLs for: Official X (Twitter), Wikipedia, Official Website.
        2. Create a catchy SEO-friendly description (around 150 characters) in Japanese.
           Include her charm, style, or vibe. End with "公式SNSや詳細情報も掲載中".

        Output: Strictly JSON format only. No preamble.
        Format:
        {{
          "links": {{
            "x_url": "URL",
            "wiki_url": "URL",
            "official_url": "URL"
          }},
          "ai_description": "生成した紹介文"
        }}
        """

        try:
            response = model.generate_content(prompt)
            raw_text = response.text.strip()
            
            # JSON部分を抽出
            json_match = re.search(r'(\{.*\}|\[.*\])', raw_text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group(1))
                links = data.get('links', {})
                # 有効なリンク（httpが含まれるもの）のみ抽出
                valid_links = {k: v for k, v in links.items() if v and v != "null" and "http" in str(v)}
                description = data.get('ai_description')
                return valid_links, description
            return {}, None
        except Exception as e:
            if "429" in str(e):
                self.stdout.write(self.style.WARNING(f"  ⚠️ Rate limit hit (Key Index: {self.key_index})"))
            else:
                self.stdout.write(self.style.ERROR(f"  🚫 AI Error: {str(e)}"))
            return {}, None

    def handle(self, *args, **options):
        # --- API接続設定 ---
        api_id = os.getenv("FANZA_API_ID", "GkGxcxhcMKUgQGWzPnp9")
        affiliate_id = os.getenv("FANZA_AFFILIATE_ID", "bicbic-990")
        base_url = "https://api.dmm.com/affiliate/v3/ActressSearch"
        
        offset, hits, total_count = 1, 100, 1
        processed_count, linked_count, error_count = 0, 0, 0

        self.stdout.write(self.style.SUCCESS(f'🚀 ミッション開始: FANZA同期 + AI SEO強化 (Keys:{len(self.api_keys)})'))

        while offset <= total_count:
            params = {
                "api_id": api_id, "affiliate_id": affiliate_id,
                "hits": hits, "offset": offset, "sort": "id", "output": "json"
            }

            try:
                response = requests.get(base_url, params=params)
                response.raise_for_status()
                data = response.json()
                result = data.get('result', {})
                total_count = int(result.get('total_count', 0))
                actresses_data = result.get('actress', [])

                if not actresses_data:
                    break

                for act in actresses_data:
                    processed_count += 1
                    act_name = act.get('name')
                    api_val = str(act.get('id'))
                    
                    # 1. 既存マスター女優との紐付け確認
                    master = Actress.objects.filter(name=act_name).first()

                    try:
                        # 2. 基本スペックの構築
                        profile_defaults = {
                            'master_actress': master,
                            'name': act_name,
                            'ruby': act.get('ruby'),
                            'bust': act.get('bust') or None,
                            'cup': act.get('cup'),
                            'waist': act.get('waist') or None,
                            'hip': act.get('hip') or None,
                            'height': act.get('height') or None,
                            'birthday': act.get('birthday') if act.get('birthday') and act.get('birthday') != '0000-00-00' else None,
                            'blood_type': act.get('blood_type'),
                            'prefectures': act.get('prefectures'),
                            'hobby': act.get('hobby'),
                            'image_url_small': act.get('imageURL', {}).get('small'),
                            'image_url_large': act.get('imageURL', {}).get('large'),
                            'last_synced_at': timezone.now()
                        }

                        # 既存データの取得
                        profile_obj = AdultActressProfile.objects.filter(actress_id=api_val).first()

                        # 3. AI強化判定（精鋭スカウト）
                        if master:
                            linked_count += 1
                            # スコアまたは作品数でターゲットを絞り込む
                            score = getattr(profile_obj, 'ai_power_score', 0) or 0
                            p_count = getattr(master, 'product_count', 0) or 0
                            
                            # 既存リンクと紹介文の確認
                            current_links = getattr(profile_obj, 'external_links', {}) or {}
                            if not isinstance(current_links, dict): current_links = {}
                            current_desc = getattr(profile_obj, 'ai_description', "")

                            # 条件：精鋭であり、かつ「SNSリンクがない」または「紹介文がまだない」
                            if (score > 0 or p_count > 100) and (not current_links.get('x_url') or not current_desc):
                                self.stdout.write(self.style.HTTP_INFO(f"  💎 精鋭ヒット: {act_name} (Works:{p_count})"))
                                
                                # AIからURLと紹介文をセットで取得
                                new_links, new_desc = self.scout_data_with_ai(act_name)
                                
                                if new_links:
                                    current_links.update(new_links)
                                    profile_defaults['external_links'] = current_links
                                if new_desc:
                                    profile_defaults['ai_description'] = new_desc
                                
                                if new_links or new_desc:
                                    self.ai_enriched_count += 1
                                    self.stdout.write(f"    ✅ AI強化完了 (リンク/紹介文)")
                                    time.sleep(0.4) # APIキー分散のため適切なウェイト

                        # 4. データベース保存（作成または更新）
                        AdultActressProfile.objects.update_or_create(
                            actress_id=api_val, 
                            defaults=profile_defaults
                        )

                    except Exception as e:
                        error_count += 1
                        continue

                # 各ページの進捗報告
                self.stdout.write(
                    self.style.SUCCESS(
                        f"PROGRESS: {processed_count}/{total_count} "
                        f"(Linked: {linked_count}, AI-Enriched: {self.ai_enriched_count}, Errors: {error_count})"
                    )
                )
                offset += hits
                time.sleep(0.1) # FANZA API負荷軽減

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"🚫 通信エラー: {str(e)}"))
                break

        self.stdout.write(self.style.SUCCESS(f'✨ ミッション完了! 今回のAI強化数: {self.ai_enriched_count}'))