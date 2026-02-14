# -*- coding: utf-8 -*-
import json
import time
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from .fanza_api_utils import FanzaAPIClient
from api.utils.raw_data_manager import bulk_insert_or_update

logger = logging.getLogger('adult.fetch_fanza')

class Command(BaseCommand):
    help = 'DMM/FANZA APIから全フロアを巡回し、指定ページ数（最大500P）を構造維持したまま保存します。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start_page',
            type=int,
            default=1,
            help='取得を開始するページ番号（1〜500）',
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=5, # デフォルトで5ページ（500件）分くらいは回すように設定
            help='各フロアで何ページ分取得するか（1ページ100件）',
        )
        parser.add_argument(
            '--floor_limit',
            type=int,
            default=None,
            help='巡回するフロア数に上限を設ける場合に使用（テスト用）',
        )

    def handle(self, *args, **options):
        client = FanzaAPIClient()
        start_page = options['start_page']
        limit_pages = options['pages']
        hits_per_page = 100 

        self.stdout.write(self.style.SUCCESS(f"📡 起動: {start_page}ページ目から {limit_pages}ページ分を各フロアで取得します"))
        
        try:
            # 全フロアの動的メニュー（サービス・フロアのリスト）を取得
            menu_list = client.get_dynamic_menu()
            if options['floor_limit']:
                menu_list = menu_list[:options['floor_limit']]
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"メニュー取得失敗: {e}"))
            return

        self.stdout.write(f"合計 {len(menu_list)} 個のフロアを巡回対象に設定しました。\n")

        total_saved_all = 0

        for target in menu_list:
            service = target['service']
            floor = target['floor']
            site_label = 'FANZA' if 'FANZA' in target['site_name'] else 'DMM'
            
            self.stdout.write(self.style.MIGRATE_LABEL(f"\n>> ターゲット開始: [{site_label}] {target['label']}"))
            
            # 各フロアごとに offset を計算してループ
            for p in range(limit_pages):
                current_page = start_page + p
                current_offset = ((current_page - 1) * hits_per_page) + 1
                
                # APIの物理限界 50,000件（500ページ相当）を超えたら強制終了
                if current_offset > 50000:
                    self.stdout.write(self.style.WARNING(f"   - Offset上限(50,000)に達したため {target['label']} を切り上げます。"))
                    break

                try:
                    # 💡 構造（タグ情報含む全体）を維持して取得
                    data = client.fetch_item_list(
                        site=target['site'],
                        service=service,
                        floor=floor,
                        hits=hits_per_page,
                        offset=current_offset,
                        sort='date'
                    )
                    
                    result = data.get('result', {})
                    items = result.get('items', [])
                    
                    if not items:
                        self.stdout.write(f"   - {current_page}ページ目: データ空のため終了。")
                        break

                    # 💡 重複判定用のIDを「場所」と「時間」で一意にする
                    # これにより、あとで「いつの時点のどのページか」を特定して解析できる
                    unique_batch_id = f"{floor}-{current_offset}-{int(timezone.now().timestamp())}"

                    raw_data_batch = [{
                        'api_source': site_label,
                        'api_product_id': unique_batch_id,
                        'raw_json_data': json.dumps(data, ensure_ascii=False), # 丸ごと保存（タグを死守）
                        'api_service': service,
                        'api_floor': floor,
                        'migrated': False,
                        'updated_at': timezone.now(),
                    }]

                    # 生データ保存実行
                    bulk_insert_or_update(batch=raw_data_batch)
                    
                    saved_count = len(items)
                    total_saved_all += saved_count
                    self.stdout.write(f"   - {current_page}ページ目: {saved_count}件取得保存完了")

                    # インターバル（BAN対策）
                    time.sleep(1.5)

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"   - {current_page}ページ目でエラー発生: {e}"))
                    continue # エラーが起きても次のページ/フロアへ

        self.stdout.write(self.style.SUCCESS(f"\n✅ 全フロア巡回完了！ 合計 {total_saved_all} 件のデータを構造を保ったまま格納しました。"))