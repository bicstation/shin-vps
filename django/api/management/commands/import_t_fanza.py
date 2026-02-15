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
    help = 'DMM/FANZA APIから全フロアを巡回し、リトライ機能を備えた状態で構造維持保存します。'

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
            default=5,
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
        
        # 1. フロアメニューの取得（リトライ付き）
        menu_list = []
        max_menu_retries = 3
        for i in range(max_menu_retries):
            try:
                menu_list = client.get_dynamic_menu()
                if options['floor_limit']:
                    menu_list = menu_list[:options['floor_limit']]
                break
            except Exception as e:
                wait_time = (i + 1) * 5
                self.stdout.write(self.style.WARNING(f"メニュー取得失敗 (試行 {i+1}/{max_menu_retries}): {e}. {wait_time}秒後に再試行..."))
                time.sleep(wait_time)
        
        if not menu_list:
            self.stdout.write(self.style.ERROR("全試行に失敗。メニューが取得できないため終了します。"))
            return

        self.stdout.write(f"合計 {len(menu_list)} 個のフロアを巡回対象に設定しました。\n")

        total_saved_all = 0

        # 2. フロアごとの巡回
        for target in menu_list:
            service = target['service']
            floor = target['floor']
            site_label = 'FANZA' if 'FANZA' in target['site_name'] else 'DMM'
            
            self.stdout.write(self.style.MIGRATE_LABEL(f"\n>> ターゲット開始: [{site_label}] {target['label']}"))
            
            for p in range(limit_pages):
                current_page = start_page + p
                current_offset = ((current_page - 1) * hits_per_page) + 1
                
                if current_offset > 50000:
                    self.stdout.write(self.style.WARNING(f"   - Offset上限(50,000)到達のため切り上げ"))
                    break

                # 3. 各ページ取得のリトライループ
                max_page_retries = 5
                success = False
                
                for retry_count in range(max_page_retries):
                    try:
                        self.stdout.write(f"   - {current_page}ページ目 (offset: {current_offset}) 取得中... (試行 {retry_count+1})")
                        
                        data = client.fetch_item_list(
                            site=target['site'],
                            service=service,
                            floor=floor,
                            hits=hits_per_page,
                            offset=current_offset,
                            sort='date'
                        )
                        
                        # 4. JSONレスポンスの検証
                        if not data or 'result' not in data:
                            raise ValueError("不完全なレスポンスを受信しました")

                        result = data.get('result', {})
                        items = result.get('items', [])
                        
                        if not items:
                            self.stdout.write(f"   - ページ空のためフロア終了。")
                            success = True # これ以上データがないのでこのフロアは成功扱いで抜ける
                            p = limit_pages # 外側のページループも終了させる
                            break

                        # 5. Rawデータ保存
                        current_time = timezone.now()
                        unique_batch_id = f"FANZA-{floor}-{current_offset}-{int(current_time.timestamp())}"

                        raw_data_batch = [{
                            'api_source': site_label,
                            'api_product_id': unique_batch_id,
                            'raw_json_data': json.dumps(data, ensure_ascii=False),
                            'api_service': service,
                            'api_floor': floor,
                            'migrated': False,
                            'updated_at': current_time,
                            'created_at': current_time,
                        }]

                        bulk_insert_or_update(batch=raw_data_batch)
                        
                        saved_count = len(items)
                        total_saved_all += saved_count
                        self.stdout.write(self.style.SUCCESS(f"     ✅ 保存完了: {saved_count}件"))
                        
                        success = True
                        break # 成功したのでリトライループを抜ける

                    except Exception as e:
                        wait = (2 ** retry_count) + 1 # 指数バックオフ: 2, 3, 5, 9, 17秒...
                        self.stdout.write(self.style.ERROR(f"     ❌ エラー: {e}. {wait}秒後にリトライ..."))
                        time.sleep(wait)

                if not success:
                    self.stdout.write(self.style.ERROR(f"   - {current_page}ページ目は最大リトライを超過。スキップします。"))

                # 負荷軽減インターバル
                time.sleep(1.5)

        self.stdout.write(self.style.SUCCESS(f"\n✅ 全フロア巡回完了！ 合計 {total_saved_all} 件のデータを保存しました。"))