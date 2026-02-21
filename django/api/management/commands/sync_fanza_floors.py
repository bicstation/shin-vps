# -*- coding: utf-8 -*-
import json
import time
import random
import re
import os
import google.generativeai as genai
from django.core.management.base import BaseCommand
from api.management.commands.fanza_api_utils import FanzaAPIClient
from api.models import FanzaFloorMaster
from django.db import models

class Command(BaseCommand):
    help = 'FANZA/DMM階層同期 ＆ AIプロンプト自動生成 ＆ 結果一覧表示'

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.api_keys = self._get_api_keys()
        self.current_key_index = 0

    def _get_api_keys(self):
        keys = []
        main_key = os.getenv('GEMINI_API_KEY')
        if main_key: keys.append(main_key)
        for i in range(1, 6):
            key = os.getenv(f'GEMINI_API_KEY_{i}')
            if key: keys.append(key)
        if not keys:
            raise ValueError("環境変数に GEMINI_API_KEY が設定されていません。")
        return keys

    def get_next_model(self):
        key = self.api_keys[self.current_key_index]
        genai.configure(api_key=key)
        model = genai.GenerativeModel('models/gemma-3-27b-it')
        active_idx = self.current_key_index
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        return model, active_idx

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_HEADING("--- [STEP 1] 階層データ同期開始 ---"))
        client = FanzaAPIClient()
        
        try:
            floors = client.get_flattened_floors()
            if not floors:
                self.stdout.write(self.style.WARNING("APIからデータが取得できませんでした。"))
                return

            for item in floors:
                is_adult_site = (item['site_code'].upper() == 'FANZA')
                FanzaFloorMaster.objects.update_or_create(
                    floor_code=item['floor_code'],
                    defaults={
                        'site_code': item['site_code'],
                        'site_name': item['site_name'],
                        'service_code': item['service_code'],
                        'service_name': item['service_name'],
                        'floor_name': item['floor_name'],
                        'is_adult': is_adult_site,
                    }
                )
            self.stdout.write(self.style.SUCCESS(f"マスタ同期完了: {len(floors)}件"))

            self.stdout.write(self.style.MIGRATE_HEADING("\n--- [STEP 2] AIプロンプト自動生成 (Gemma 3 27B) ---"))
            targets = FanzaFloorMaster.objects.filter(
                models.Q(ai_system_prompt__isnull=True) | models.Q(ai_system_prompt=""),
                is_active=True
            )
            
            if targets.exists():
                for floor in targets:
                    self.process_floor_ai_config(floor)
            else:
                self.stdout.write(self.style.SUCCESS("✅ 全てのフロアに設定済みです。"))

            # --- [STEP 3] カラム内容の最終一覧表示 ---
            self.display_summary_table()

            self.stdout.write(self.style.SUCCESS("\n🎉 全ての工程が正常に終了しました。"))

        except Exception as e:
            self.stdout.write(self.style.ERROR(f"致命的なエラーが発生しました: {str(e)}"))

    def process_floor_ai_config(self, floor, max_retries=3):
        retry_count = 0
        meta_prompt = f"""
        あなたはECサイトのメタデータ設計者です。
        以下のカテゴリに属する商品の魅力を引き出す紹介文をAIで生成するために、
        そのAIに与えるべき『システム指示文(System Prompt)』と『キーワード』を提案してください。

        カテゴリ: {floor.site_name} > {floor.floor_name}
        アダルト(R18)属性: {"あり" if floor.is_adult else "なし"}

        必ず以下のJSON形式でのみ回答してください。
        {{
            "system_prompt": "120文字以内のAIへの役割指示文",
            "keywords": "重要キーワード5つ（カンマ区切り）"
        }}
        """

        while retry_count < max_retries:
            try:
                model, key_idx = self.get_next_model()
                self.stdout.write(f"🤖 解析中 (Key Index:{key_idx}): {floor.floor_name}")
                response = model.generate_content(meta_prompt)
                json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
                if not json_match: raise ValueError("JSON抽出失敗")
                
                res_data = json.loads(json_match.group())
                floor.ai_system_prompt = res_data.get('system_prompt')
                floor.ai_tone_keywords = res_data.get('keywords')
                floor.save()
                self.stdout.write(self.style.SUCCESS(f"  └ ✅ 成功"))
                return
            except Exception as e:
                retry_count += 1
                time.sleep(2 ** retry_count)

    def display_summary_table(self):
        """DBのカラム内容を一覧表示する"""
        self.stdout.write(self.style.MIGRATE_HEADING("\n--- [STEP 3] 設定済みカラム一覧 (Summary) ---"))
        
        # ヘッダーの描画
        header = f"{'Floor Name':<15} | {'Adult':<5} | {'Keywords':<30} | {'System Prompt'}"
        self.stdout.write(self.style.SUCCESS(header))
        self.stdout.write("-" * 100)

        # データの描画
        all_floors = FanzaFloorMaster.objects.filter(is_active=True).order_by('is_adult', 'floor_name')
        for f in all_floors:
            adult_label = "YES" if f.is_adult else "NO"
            keywords = (f.ai_tone_keywords[:28] + "..") if f.ai_tone_keywords and len(f.ai_tone_keywords) > 28 else (f.ai_tone_keywords or "N/A")
            prompt = (f.ai_system_prompt[:45] + "..") if f.ai_system_prompt and len(f.ai_system_prompt) > 45 else (f.ai_system_prompt or "N/A")
            
            line = f"{f.floor_name:<15} | {adult_label:<5} | {keywords:<30} | {prompt}"
            self.stdout.write(line)