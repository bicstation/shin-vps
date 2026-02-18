# -*- coding: utf-8 -*-
import json
import time
import logging
from django.core.management.base import BaseCommand
from django.utils import timezone
from .fanza_api_utils import FanzaAPIClient
from api.utils.raw_data_manager import bulk_insert_or_update

# ロガー設定
logger = logging.getLogger('adult.fetch_fanza')

class Command(BaseCommand):
    help = 'DMM/FANZA APIから全フロアを巡回し、構造を維持したまま生データを保存します。'

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

        self.stdout.write(self.style.SUCCESS(f"📡 起動: {start_page}ページ目から {limit_pages}ページ分を取得します"))
        
        # 1. フロアメニューの取得
        menu_list = []
        max_menu_retries = 3
        for i in range(max_menu_retries):
            try:
                # client.py 側の get_dynamic_menu を使用
                menu_list = client.get_dynamic_menu()
                if options['floor_limit']:
                    menu_list = menu_list[:options['floor_limit']]
                break
            except Exception as e:
                wait_time = (i + 1) * 5
                self.stdout.write(self.style.WARNING(f"メニュー取得失敗 (試行 {i+1}/{max_menu_retries}): {e}. {wait_time}秒後に再試行..."))
                time.sleep(wait_time)
        
        if not menu_list:
            self.stdout.write(self.style.ERROR("メニューが取得できないため終了します。"))
            return

        self.stdout.write(f"合計 {len(menu_list)} 個のフロアを巡回対象に設定しました。\n")

        total_saved_all = 0

        # 2. フロアごとの巡回
        for target in menu_list:
            # --- サイト・サービス・フロアのクレンジング ---
            # APIリクエスト用には target['site'] (FANZA/DMM.com) をそのまま使う
            raw_site_code = target.get('site', '')
            
            # DB保存用ラベル (fanza/dmm)
            site_label = 'fanza' if 'FANZA' in str(raw_site_code).upper() else 'dmm'
            
            service = str(target.get('service', '')).strip()
            floor = str(target.get('floor', '')).strip()
            floor_name = target.get('floor_name', 'Unknown Floor')
            
            self.stdout.write(self.style.MIGRATE_LABEL(f"\n>> ターゲット開始: [{raw_site_code}] {floor_name} ({floor})"))
            
            # フロア内ページループ
            for p in range(limit_pages):
                current_page = start_page + p
                current_offset = ((current_page - 1) * hits_per_page) + 1
                
                if current_offset > 50000:
                    self.stdout.write(self.style.WARNING(f"   - Offset上限(50,000)到達のため切り上げ"))
                    break

                # 3. 各ページ取得のリトライループ
                max_page_retries = 3 # ページリトライは3回に短縮
                success = False
                floor_empty = False
                
                for retry_count in range(max_page_retries):
                    try:
                        self.stdout.write(f"   - {current_page}ページ目 (offset: {current_offset}) 取得中... (試行 {retry_count+1})")
                        
                        # クライアント経由でAPIリクエスト（site='FANZA' や 'DMM.com' が渡る）
                        data = client.fetch_item_list(
                            site=raw_site_code,
                            service=service,
                            floor=floor,
                            hits=hits_per_page,
                            offset=current_offset,
                            sort='date'
                        )
                        
                        if not data or 'result' not in data:
                            raise ValueError("不完全なレスポンスを受信しました")

                        result = data.get('result', {})
                        items = result.get('items', [])
                        
                        # 🚀 商品がない場合は、このフロアの巡回を即終了して次のフロアへ
                        if not items:
                            self.stdout.write(self.style.HTTP_INFO(f"   - 商品データなし。このフロアをスキップして次へ移動します。"))
                            floor_empty = True
                            break

                        # データの作成・保存
                        current_time = timezone.now()
                        # IDは「サイト-フロア-オフセット」でユニーク性を確保
                        unique_batch_id = f"{site_label}-{floor}-{current_offset}"

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

                        # DBへバルクインサート（既存は更新）
                        bulk_insert_or_update(batch=raw_data_batch)
                        
                        saved_count = len(items)
                        total_saved_all += saved_count
                        self.stdout.write(self.style.SUCCESS(f"     ✅ 保存完了: {saved_count}件"))
                        
                        success = True
                        break # リトライループ脱出

                    except Exception as e:
                        # 通信エラー等の場合
                        wait = (retry_count + 1) * 2
                        self.stdout.write(self.style.ERROR(f"     ❌ 通信エラー: {e}"))
                        if retry_count < max_page_retries - 1:
                            self.stdout.write(f"     {wait}秒後にリトライ...")
                            time.sleep(wait)
                        else:
                            self.stdout.write(self.style.ERROR(f"     リトライ上限到達。このフロアを切り上げます。"))
                            floor_empty = True # エラーが続く場合もフロアを抜ける

                # 🚀 商品なし(floor_empty)か、リトライ失敗時は、ページループを抜けて次のフロアへ
                if floor_empty or not success:
                    break

                # 負荷軽減のための待機
                time.sleep(1.2)

        self.stdout.write(self.style.SUCCESS(f"\n✅ 全フロア巡回完了！ 合計 {total_saved_all} 件のデータを保存しました。"))