# -*- coding: utf-8 -*-
import os
import json
from django.core.management.base import BaseCommand
from .fanza_api_utils import FanzaAPIClient

class Command(BaseCommand):
    help = 'FANZA/DMM APIから動的にフロアを選択してJSONを確認・保存するツール'

    def handle(self, *args, **options):
        client = FanzaAPIClient()
        base_dir = os.path.dirname(__file__)
        sample_root = os.path.join(base_dir, 'api_samples')

        if not os.path.exists(sample_root):
            os.makedirs(sample_root)
            os.chmod(sample_root, 0o777)

        self.stdout.write(self.style.SUCCESS("📡 最新のフロア情報を取得中..."))
        
        try:
            # get_dynamic_menu() は get_flattened_floors() を呼び出します
            menu_list = client.get_dynamic_menu()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"エラー: フロアリストの取得に失敗しました。{e}"))
            return

        # 1. メニューの表示
        self.stdout.write("\n=== FANZA/DMM サービスメニュー ===")
        for i, m in enumerate(menu_list):
            # 🚀 修正ポイント: 'label' キーが存在しないため、取得したデータから動的にラベルを作成します
            label = f"[{m['site_name']}] {m['service_name']} > {m['floor_name']}"
            self.stdout.write(f"[{i:2}] {label}")

        # 2. ユーザー入力
        try:
            choice = input("\n表示したいメニューの番号を入力してください (qで終了): ")
            if choice.lower() == 'q':
                return
            
            selected = menu_list[int(choice)]
        except (ValueError, IndexError):
            self.stdout.write(self.style.ERROR("無効な番号です。"))
            return

        # 💡 表示用ラベルを再定義
        display_label = f"[{selected['site_name']}] {selected['service_name']} > {selected['floor_name']}"

        # 3. ItemListの取得
        self.stdout.write(self.style.WARNING(f"\n{display_label} のデータを取得します..."))
        try:
            items_json = client.fetch_item_list(
                site=selected['site'],
                service=selected['service'],
                floor=selected['floor'],
                hits=10
            )
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"エラー: 商品リストの取得に失敗しました。{e}"))
            return

        # 4. 結果表示
        formatted_json = json.dumps(items_json, indent=2, ensure_ascii=False)
        self.stdout.write(formatted_json)

        # 5. 指定のルール「フロア名_サービス名」で保存
        save_choice = input("\nこの結果を api_samples に保存しますか？ (y/n): ")
        if save_choice.lower() == 'y':
            # サイト名でディレクトリを分ける (DMM.com / FANZA)
            site_dir = os.path.join(sample_root, selected['site_name'])

            if not os.path.exists(site_dir):
                os.makedirs(site_dir)
                os.chmod(site_dir, 0o777)

            # --- 修正ポイント：ファイル名を フロア_サービス.json に ---
            file_name = f"{selected['floor']}_{selected['service']}.json"
            file_path = os.path.join(site_dir, file_name)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(formatted_json)
            
            # 書き込み権限を付与
            os.chmod(file_path, 0o666)
            
            self.stdout.write(self.style.SUCCESS(f"✅ 保存完了: {file_path}"))

        input("\n処理完了。Enterで戻ります。")