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
    help = 'DUGA APIから指定された範囲のデータを構造を維持して一括取得します。'

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
        # 設定の読み込み
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
        hits_per_page = 100  # DUGA APIの最大値

        self.stdout.write(self.style.SUCCESS(f"📡 DUGA巡回開始: {start_page}ページ目から{limit_pages}ページ分を取得"))

        # セッション設定（リトライロジック含む）
        session = requests.Session()
        retries = Retry(total=5, backoff_factor=1, status_forcelist=[500, 502, 503, 504])
        session.mount("https://", HTTPAdapter(max_retries=retries))

        total_saved_count = 0

        # 指定ページ数分ループ
        for p in range(limit_pages):
            current_page = start_page + p
            # DUGAのoffsetは1から始まる (1ページ目=1, 2ページ目=101...)
            offset = ((current_page - 1) * hits_per_page) + 1

            params = {
                'version': '1.2',
                'appid': DUGA_API_ID,
                'agentid': DUGA_API_KEY,
                'bannerid': '01',
                'hits': hits_per_page,
                'offset': offset,
                'format': 'json',
                'sort': 'new',
                'adult': '1'
            }

            try:
                self.stdout.write(f"取得中... {current_page}ページ目 (offset: {offset})")
                response = session.get(DUGA_API_URL, params=params, timeout=30)
                response.raise_for_status()
                data = response.json()

                items = data.get('items', [])
                if not items:
                    self.stdout.write(self.style.WARNING("データが空になりました。終了します。"))
                    break

                # 💡 DUGAの「タグ」や「コンテキスト」を死守するため
                # レスポンス全体をまるごと1つのRawデータとして保存
                # IDにはフロア名がないため、DUGAというソース名とページ位置で一意にする
                current_time = timezone.now()
                unique_batch_id = f"DUGA-{offset}-{int(current_time.timestamp())}"

                raw_data_batch = [{
                    'api_source': 'DUGA',
                    'api_product_id': unique_batch_id,
                    'raw_json_data': json.dumps(data, ensure_ascii=False), # 👈 これでタグも構造も死守
                    'api_service': 'duga', # DUGAはサービス固定
                    'api_floor': 'video', # ビデオメイン
                    'migrated': False,
                    'updated_at': current_time,
                    'created_at': current_time,
                }]

                # DB保存
                bulk_insert_or_update(raw_data_batch)
                
                total_saved_count += len(items)
                self.stdout.write(self.style.SUCCESS(f"   - 保存完了: {len(items)}件"))

                # 負荷軽減
                time.sleep(1.5)

            except Exception as e:
                self.stderr.write(self.style.ERROR(f"エラー発生 ({current_page}ページ目): {e}"))
                break

        self.stdout.write(self.style.SUCCESS(f"\n✅ 完了！ 合計 {total_saved_count} 件(DUGAパケット)を保存しました。"))