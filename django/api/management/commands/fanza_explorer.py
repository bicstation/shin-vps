# -*- coding: utf-8 -*-
import os
import json
import time
import requests
import re
from django.core.management.base import BaseCommand
from api.models import FanzaFloorMaster
from .fanza_api_utils import FanzaAPIClient

class Command(BaseCommand):
    help = 'FANZA API構造の取得・デバッグ、およびGemmaによるプロンプト全自動最適化ツール'

    def add_arguments(self, parser):
        # 既存の dump-samples 機能
        parser.add_argument(
            '--dump-samples',
            action='store_true',
            dest='dump_samples',
            help='全フロアから1件ずつ取得し、統合JSONとAI報告用テキストを生成します',
        )
        # 今回追加する 全自動更新機能
        parser.add_argument(
            '--auto-update',
            action='store_true',
            dest='auto_update',
            help='Gemma APIを使用して、全フロアのDBプロンプトを直接自動更新します',
        )

    def handle(self, *args, **options):
        client = FanzaAPIClient()
        base_dir = os.path.dirname(__file__)
        sample_root = os.path.join(base_dir, 'api_samples')

        # ディレクトリ準備（既存ロジック維持）
        if not os.path.exists(sample_root):
            os.makedirs(sample_root, exist_ok=True)
            try:
                os.chmod(sample_root, 0o777)
            except OSError:
                pass

        self.stdout.write(self.style.SUCCESS("📡 最新のフロア情報を取得中..."))
        try:
            menu_list = client.get_dynamic_menu()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"エラー: {e}"))
            return

        # 実行分岐
        if options.get('auto_update'):
            # 【新機能】AIによるDBの直接更新
            self._execute_full_automation(client, menu_list)
        elif options.get('dump_samples'):
            # 【既存機能】ファイルへのダンプ出力
            self._execute_mega_dump(client, menu_list, sample_root)
        else:
            # 【既存機能】対話型デバッグモード
            self._run_interactive_mode(client, menu_list, sample_root)

    def _execute_full_automation(self, client, menu_list):
        """AIが構造を解析し、DBのFanzaFloorMasterを直接書き換える"""
        total = len(menu_list)
        api_key = os.getenv("GEMINI_API_KEY")

        if not api_key:
            self.stdout.write(self.style.ERROR("❌ GEMINI_API_KEY が設定されていません。"))
            return

        self.stdout.write(self.style.WARNING(f"🚀 全 {total} フロアのAIプロンプト自動最適化を開始します..."))

        for i, m in enumerate(menu_list):
            floor_name = m['floor_name']
            floor_id = m['floor']
            self.stdout.write(f"[{i+1}/{total}] {floor_name} を解析中...")

            try:
                # APIからサンプル取得
                res = client.fetch_item_list(site=m['site'], service=m['service'], floor=m['floor'], hits=1)
                if not res or 'result' not in res or not res['result'].get('items'):
                    continue

                sample = res['result']['items'][0]
                
                # AIに渡すメタ情報
                structure = {
                    "keys": list(sample.get('iteminfo', {}).keys()),
                    "video": bool(sample.get('sampleMovieURL')),
                    "title": sample.get('title')
                }

                # Gemmaでプロンプト生成
                new_prompt = self._ask_ai_for_prompt(floor_name, m['service_name'], structure, api_key)

                if new_prompt:
                    # DB更新
                    FanzaFloorMaster.objects.update_or_create(
                        floor_id=floor_id,
                        defaults={
                            'floor_name': floor_name,
                            'ai_system_prompt': new_prompt,
                            'ai_tone_keywords': ",".join(structure['keys'][:5])
                        }
                    )
                    self.stdout.write(self.style.SUCCESS(f"  ✅ 最適化完了"))
                
                time.sleep(0.5) # レート制限考慮

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"  ❌ 失敗: {e}"))

    def _ask_ai_for_prompt(self, floor_name, service_name, structure, api_key):
        """Gemma APIを叩いてプロンプトを生成する内部メソッド"""
        meta_prompt = f"FANZAの「{service_name} {floor_name}」用AI解析プロンプトを作成せよ。項目:{structure['keys']}。指示文のみ返せ。"
        endpoint = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
        try:
            resp = requests.post(endpoint, json={"contents": [{"parts": [{"text": meta_prompt}]}]}, timeout=20)
            return resp.json()['candidates'][0]['content']['parts'][0]['text'].strip()
        except: return None

    def _execute_mega_dump(self, client, menu_list, sample_root):
        """【既存機能】全フロアを巡回し、JSONとAI報告用テキストを生成する"""
        total = len(menu_list)
        combined_data = {"metadata": {"total": total, "at": time.strftime("%Y-%m-%d %H:%M:%S")}, "floors": {}}
        ai_report = ["### API Structure Report ###\n"]

        for i, m in enumerate(menu_list):
            floor_key = f"{m['site']}_{m['service']}_{m['floor']}"
            self.stdout.write(f"[{i+1}/{total}] {m['floor_name']} ダンプ中...")
            try:
                res = client.fetch_item_list(site=m['site'], service=m['service'], floor=m['floor'], hits=1)
                if res and 'result' in res and res['result'].get('items'):
                    sample = res['result']['items'][0]
                    combined_data["floors"][floor_key] = {"info": m, "sample": sample}
                    ai_report.append(f"【{m['floor_name']}】\nKeys: {list(sample.get('iteminfo', {}).keys())}\n---")
                time.sleep(0.3)
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"エラー: {e}"))

        # ファイル保存
        with open(os.path.join(sample_root, "all_floors_sample.json"), 'w', encoding='utf-8') as f:
            json.dump(combined_data, f, indent=2, ensure_ascii=False)
        with open(os.path.join(sample_root, "ai_copy_paste_me.txt"), 'w', encoding='utf-8') as f:
            f.write("\n".join(ai_report))
        self.stdout.write(self.style.SUCCESS("✨ ダンプ完了"))

    def _run_interactive_mode(self, client, menu_list, sample_root):
        """【既存機能】対話型デバッグモード"""
        while True:
            self.stdout.write("\n=== FANZAメニュー (Debug Mode) ===")
            for i, m in enumerate(menu_list):
                self.stdout.write(f"[{i:3}] {m['site_name']} > {m['floor_name']}")
            choice = input("\n番号を選択 (qで終了): ")
            if choice.lower() == 'q': break
            try:
                selected = menu_list[int(choice)]
                res = client.fetch_item_list(site=selected['site'], service=selected['service'], floor=selected['floor'], hits=5)
                self.stdout.write(json.dumps(res, indent=2, ensure_ascii=False))
            except: continue