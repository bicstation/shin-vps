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
    help = 'DMM/FANZA APIから動的に全フロアを最新順に巡回し、RawApiDataに保存します。ページ指定が可能です。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start_page',
            type=int,
            default=1,
            help='取得を開始するページ番号 (1ページ100件計算)。',
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='開始ページから何ページ分取得するか。',
        )

    def handle(self, *args, **options):
        client = FanzaAPIClient()
        start_page = options['start_page']
        limit_pages = options['pages']
        hits_per_page = 100  # API効率を最大化するため100固定

        self.stdout.write(self.style.SUCCESS(f"📡 設定: {start_page}ページ目から{limit_pages}ページ分を取得 (1ページ100件)"))
        
        try:
            # get_dynamic_menu() で DMM/FANZA の全フロアを取得
            menu_list = client.get_dynamic_menu()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"メニュー取得失敗: {e}"))
            return

        self.stdout.write(f"合計 {len(menu_list)} 個のフロアが見つかりました。巡回を開始します。\n")

        total_saved_all = 0

        for target in menu_list:
            site_label = target['site_name']
            service = target['service']
            floor = target['floor']
            label = target['label']
            
            self.stdout.write(self.style.MIGRATE_LABEL(f">> 巡回中: [{site_label}] {label} ({service}/{floor})"))
            
            # 開始ページから初期 offset を計算 (例: 1ページ目=1, 2ページ目=101)
            current_offset = ((start_page - 1) * hits_per_page) + 1
            
            for p in range(limit_pages):
                # API仕様上の最大 offset 50,000 を超える場合は終了
                if current_offset > 50000:
                    self.stdout.write(self.style.WARNING(f"   - offsetが上限(50,000)に達したため、このフロアを終了します。"))
                    break

                try:
                    # fetch_item_list を利用して最新順(sort='date')でデータを取得
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
                        self.stdout.write(f"   - {start_page + p}ページ目: データが見つかりません。")
                        break

                    # RawApiData への保存（一括保存用のバッチ作成）
                    # サイトコードから source 名を正規化
                    source_name = 'FANZA' if 'FANZA' in target['site_name'] else 'DMM'

                    raw_data_batch = [{
                        'api_source': source_name,
                        'api_product_id': f"{floor}-{current_offset}-{int(timezone.now().timestamp())}",
                        'raw_json_data': json.dumps(data, ensure_ascii=False),
                        'api_service': service,
                        'api_floor': floor,
                        'migrated': False,
                        'updated_at': timezone.now(),
                        'created_at': timezone.now(),
                    }]

                    bulk_insert_or_update(batch=raw_data_batch)
                    
                    saved_count = len(items)
                    total_saved_all += saved_count
                    self.stdout.write(f"   - {start_page + p}ページ目: {saved_count}件取得 (offset: {current_offset})")

                    # 次のページの offset へ進める
                    current_offset += hits_per_page
                    
                    # API負荷軽減のための待機
                    time.sleep(1.2)

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"   - エラー: {e}"))
                    break

        self.stdout.write(self.style.SUCCESS(f"\n✅ 巡回完了！ 合計 {total_saved_all} 件の生データを保存しました。"))