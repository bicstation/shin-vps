# -*- coding: utf-8 -*-
import json
import time
import logging
import requests
from django.core.management.base import BaseCommand
from django.conf import settings
from django.utils import timezone
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 共通の保存ロジック
from api.utils.raw_data_manager import bulk_insert_or_update

logger = logging.getLogger('adult.fetch_duga')

class Command(BaseCommand):
    help = 'DUGA APIから指定された範囲のデータを構造を維持して一括取得し、小文字に正規化して保存します。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--start_page',
            type=int,
            default=1,
            help='取得を開始するページ番号 (1ページ100件計算)',
        )
        parser.add_argument(
            '--pages',
            type=int,
            default=1,
            help='何ページ分取得するか',
        )

    def handle(self, *args, **options):
        # 1. 設定の読み込み
        try:
            config = settings.API_CONFIG['DUGA']
            DUGA_API_ID = config['API_ID']
            DUGA_API_KEY = config['API_KEY']
            DUGA_API_URL = config['API_URL']
        except (AttributeError, KeyError):
            self.stderr.write(self.style.ERROR("settings.pyにDUGAのAPI設定が見つかりません。"))
            return

        start_page = options['start_page']
        limit_pages = options['pages']
        hits_per_page = 100

        self.stdout.write(self.style.SUCCESS(f"📡 DUGA巡回開始: {start_page}ページ目から{limit_pages}ページ分を取得"))

        # 2. セッション設定 (リトライロジック含む)
        session = requests.Session()
        retries = Retry(
            total=5, 
            backoff_factor=3, 
            status_forcelist=[429, 500, 502, 503, 504],
            raise_on_status=False 
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        total_saved_count = 0

        # 3. 指定ページ数分ループ
        for p in range(limit_pages):
            current_page = start_page + p
            offset = ((current_page - 1) * hits_per_page) + 1

            params = {
                'version': '1.2',
                'appid': DUGA_API_ID,
                'agentid': DUGA_API_KEY,
                'bannerid': '10',
                'hits': hits_per_page,
                'offset': offset,
                'format': 'json',
                'sort': 'release',
                'adult': '1'
            }

            try:
                self.stdout.write(f"\n--- {current_page}ページ目 (offset: {offset}) ---")
                
                response = session.get(DUGA_API_URL, params=params, headers=headers, timeout=30)
                
                if response.status_code != 200:
                    self.stderr.write(self.style.ERROR(f"HTTPエラー: {response.status_code}"))
                    time.sleep(10)
                    continue

                # 4. JSONパース
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    self.stderr.write(self.style.ERROR(f"JSONパースエラー: 有効なJSONが返却されませんでした。"))
                    continue

                if 'items' not in data:
                    self.stderr.write(self.style.ERROR(f"APIレスポンス異常: 'items'キーが見つかりません。"))
                    continue

                items = data.get('items', [])
                if not items:
                    self.stdout.write(self.style.WARNING("データが空になりました。終了します。"))
                    break

                # 5. Rawデータ保存用パケット作成
                current_time = timezone.now()
                
                # 🚀 根本解決: api_source を確実に小文字 'duga' に固定
                # 取得元が大文字であっても、保存直前に lower() を通すことで表記揺れを物理的に排除します。
                site_label = 'duga'.lower()

                # IDの整合性 (接頭辞も小文字に統一)
                unique_batch_id = f"{site_label}-{offset}-{int(current_time.timestamp())}"

                raw_data_batch = [{
                    'api_source': site_label, # 必ず 'duga'
                    'api_product_id': unique_batch_id,
                    'raw_json_data': json.dumps(data, ensure_ascii=False),
                    # 🚀 根本解決: サービス・フロア名も小文字に統一
                    'api_service': 'video'.lower(),
                    'api_floor': 'video'.lower(),
                    'migrated': False,
                    'updated_at': current_time,
                    'created_at': current_time,
                }]

                # 6. DB保存 (bulk_insert_or_update 内で重複チェックが行われます)
                bulk_insert_or_update(raw_data_batch)
                
                total_saved_count += len(items)
                self.stdout.write(self.style.SUCCESS(f"✅ 保存完了: {len(items)}件 (api_source: {site_label})"))

                # サーバー負荷軽減のためのスリープ
                time.sleep(2.0)

            except requests.exceptions.RequestException as e:
                self.stderr.write(self.style.ERROR(f"通信エラー発生: {e}"))
                time.sleep(10)
                continue
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"予期せぬエラー: {e}"))
                break

        self.stdout.write(self.style.SUCCESS(f"\n🚀 完了！ 合計 {total_saved_count} 件のアイテムを含む生データを '{site_label}' として保存しました。"))