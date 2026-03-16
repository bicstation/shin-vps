# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/management/commands/import_t_fanza.py

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
    help = 'DMM/FANZA APIから全フロアを巡回し、指定されたソース（fanza/dmm）ごとに生データを保存します。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--site',
            type=str,
            default='all',
            choices=['fanza', 'dmm', 'all'],
            help='取得対象のサイトを指定 (fanza, dmm, all)'
        )
        parser.add_argument(
            '--start_page',
            type=int,
            default=1,
            help='取得を開始するページ番号（1〜500）'
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=5,
            help='各フロアで何ページ分取得するか（1ページ100件）'
        )
        parser.add_argument(
            '--floor_limit',
            type=int,
            default=None,
            help='巡回するフロア数に上限を設ける場合に使用（テスト用）'
        )

    def handle(self, *args, **options):
        client = FanzaAPIClient()
        site_filter = options['site'].lower()
        start_page = options['start_page']
        limit_pages = options['pages']
        hits_per_page = 100 

        self.stdout.write(self.style.SUCCESS(f"📡 起動: ターゲット={site_filter}, {start_page}ページ目から {limit_pages}ページ分を取得"))
        
        # 1. フロアメニューの取得
        all_menu = []
        try:
            all_menu = client.get_dynamic_menu()
            # 💡 デバッグ：APIが返してきたサイト種別を把握する
            found_sites = set([str(m.get('site', '')) for m in all_menu])
            self.stdout.write(f"🔍 APIから取得したメニューのサイト一覧: {found_sites}")
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"メニュー取得失敗: {e}"))
            return

        # 🚀 サイト指定に基づいてメニューをフィルタリング（判定を少し柔軟に修正）
        menu_list = []
        for item in all_menu:
            raw_site = str(item.get('site', '')).upper()
            
            # FANZA判定
            if site_filter in ['fanza', 'all'] and 'FANZA' in raw_site:
                item['db_site_label'] = 'fanza'
                menu_list.append(item)
            # DMM判定（DMM.COM以外の表記も考慮）
            elif site_filter in ['dmm', 'all'] and 'DMM' in raw_site:
                item['db_site_label'] = 'dmm'
                menu_list.append(item)

        if options['floor_limit']:
            menu_list = menu_list[:options['floor_limit']]

        if not menu_list:
            self.stdout.write(self.style.ERROR(f"対象サイト [{site_filter}] のメニューが見つかりませんでした。"))
            return

        self.stdout.write(f"📊 合計 {len(menu_list)} 個のフロアを巡回対象に設定しました。\n")

        total_saved_all = 0

        # 2. フロアごとの巡回
        for target in menu_list:
            raw_site_code = target.get('site')      # API用 (FANZA or DMM.com)
            site_label = target.get('db_site_label', 'unknown') # DB保存用 (fanza or dmm)
            
            service = str(target.get('service', '')).strip()
            floor = str(target.get('floor', '')).strip()
            floor_name = target.get('floor_name', 'Unknown Floor')
            
            self.stdout.write(self.style.MIGRATE_LABEL(f"\n>> ターゲット開始: [{site_label.upper()}] {floor_name} (floor: {floor}, service: {service})"))
            
            for p in range(limit_pages):
                current_page = start_page + p
                current_offset = ((current_page - 1) * hits_per_page) + 1
                
                if current_offset > 50000: break

                max_page_retries = 3
                success = False
                floor_empty = False
                
                for retry_count in range(max_page_retries):
                    try:
                        self.stdout.write(f"   - {current_page}ページ目 取得中...")
                        
                        data = client.fetch_item_list(
                            site=raw_site_code,
                            service=service,
                            floor=floor,
                            hits=hits_per_page,
                            offset=current_offset,
                            sort='date'
                        )
                        
                        if not data or 'result' not in data:
                            raise ValueError("APIレスポンスの構造が不正です")

                        items = data.get('result', {}).get('items', [])
                        
                        if not items:
                            self.stdout.write(self.style.HTTP_INFO(f"   - データなし。フロア終了。"))
                            floor_empty = True
                            break

                        # 💡 保存直前のデバッグログ
                        current_time = timezone.now()
                        unique_batch_id = f"{site_label}-{floor}-{current_offset}"
                        
                        self.stdout.write(f"     🛠 保存準備中: source={site_label}, service={service}, floor={floor}")

                        # DBフィールド名に注意（api_source, api_service, api_floor がモデルにある前提）
                        raw_data_batch = [{
                            'api_source': site_label,      # 管理画面の「APIソース」
                            'api_product_id': unique_batch_id,
                            'raw_json_data': json.dumps(data, ensure_ascii=False),
                            'api_service': service,        # 管理画面の「APIサービスコード」
                            'api_floor': floor,            # フロアコードを明示的に保存
                            'migrated': False,
                            'updated_at': current_time,
                            'created_at': current_time,
                        }]

                        # 保存実行
                        bulk_insert_or_update(batch=raw_data_batch)
                        
                        saved_count = len(items)
                        total_saved_all += saved_count
                        self.stdout.write(self.style.SUCCESS(f"     ✅ 保存成功: {site_label} / {floor_name} ({saved_count}件)"))
                        
                        success = True
                        break

                    except Exception as e:
                        self.stdout.write(self.style.ERROR(f"     ❌ エラー発生: {str(e)}"))
                        if retry_count < max_page_retries - 1:
                            time.sleep(2)
                        else:
                            floor_empty = True

                if floor_empty or not success:
                    break

                time.sleep(1.2)

        self.stdout.write(self.style.SUCCESS(f"\n✨ 処理完了！ 合計 {total_saved_all} 件の商品Rawデータを蓄積しました。"))