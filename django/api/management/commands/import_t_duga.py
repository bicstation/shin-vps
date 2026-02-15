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
        # 1. 設定の読み込み
        try:
            config = settings.API_CONFIG['DUGA']
            DUGA_API_ID = config['API_ID']   # API認証ID
            DUGA_API_KEY = config['API_KEY'] # アフィリエイトID (agentid)
            DUGA_API_URL = config['API_URL'] # https://pub.duga.jp/api/search
        except (AttributeError, KeyError):
            self.stderr.write(self.style.ERROR("settings.pyにDUGAのAPI設定が見つかりません。"))
            return

        start_page = options['start_page']
        limit_pages = options['pages']
        hits_per_page = 100

        self.stdout.write(self.style.SUCCESS(f"📡 DUGA巡回開始: {start_page}ページ目から{limit_pages}ページ分を取得"))

        # 2. セッション設定
        session = requests.Session()
        retries = Retry(
            total=5, 
            backoff_factor=3, 
            status_forcelist=[429, 500, 502, 503, 504],
            raise_on_status=False 
        )
        session.mount("https://", HTTPAdapter(max_retries=retries))

        # ブラウザを装うヘッダー
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }

        total_saved_count = 0

        # 3. 指定ページ数分ループ
        for p in range(limit_pages):
            current_page = start_page + p
            offset = ((current_page - 1) * hits_per_page) + 1

            # DUGA V1.2 仕様に基づいたパラメータ
            params = {
                'version': '1.2',
                'appid': DUGA_API_ID,
                'agentid': DUGA_API_KEY,
                'bannerid': '10',
                'hits': hits_per_page,
                'offset': offset,
                'format': 'json',
                'sort': 'release',
                # 'category': 'video',
                'adult': '1'
            }

            try:
                self.stdout.write(f"\n--- {current_page}ページ目 (offset: {offset}) ---")
                
                # リクエスト実行
                response = session.get(DUGA_API_URL, params=params, headers=headers, timeout=30)
                
                # 【デバッグ用】実際にリクエストしたURLを表示
                self.stdout.write(self.style.WARNING(f"DEBUG URL: {response.url}"))
                
                # ステータスコードチェック
                if response.status_code != 200:
                    self.stderr.write(self.style.ERROR(f"HTTPエラー: {response.status_code}"))
                    self.stderr.write(f"Response Content: {response.text[:500]}")
                    time.sleep(10)
                    continue

                # 4. JSONパース
                try:
                    data = response.json()
                except json.JSONDecodeError:
                    self.stderr.write(self.style.ERROR(f"JSONパースエラー: HTMLが返却されました。認証IDやURLを確認してください。"))
                    self.stderr.write(f"Content (先頭200文字): {response.text[:200]}")
                    continue

                # DUGA APIは正常時でも内部エラーを返す場合があるためチェック
                if 'items' not in data:
                    self.stderr.write(self.style.ERROR(f"APIレスポンス異常: 'items'キーが見つかりません。"))
                    self.stderr.write(f"Data: {json.dumps(data, ensure_ascii=False)[:300]}")
                    continue

                items = data.get('items', [])
                if not items:
                    self.stdout.write(self.style.WARNING("データが空になりました。終了します。"))
                    break

                # 5. Rawデータ保存用パケット作成
                current_time = timezone.now()
                unique_batch_id = f"DUGA-{offset}-{int(current_time.timestamp())}"

                raw_data_batch = [{
                    'api_source': 'DUGA',
                    'api_product_id': unique_batch_id,
                    'raw_json_data': json.dumps(data, ensure_ascii=False),
                    'api_service': 'duga',
                    'api_floor': 'video',
                    'migrated': False,
                    'updated_at': current_time,
                    'created_at': current_time,
                }]

                # DB保存
                bulk_insert_or_update(raw_data_batch)
                
                total_saved_count += len(items)
                self.stdout.write(self.style.SUCCESS(f"✅ 保存完了: {len(items)}件"))

                # 負荷軽減 (DUGAは短時間の連続アクセスに厳しいため長めに設定)
                time.sleep(2.0)

            except requests.exceptions.RequestException as e:
                self.stderr.write(self.style.ERROR(f"通信エラー発生: {e}"))
                time.sleep(10)
                continue
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"予期せぬエラー: {e}"))
                break

        self.stdout.write(self.style.SUCCESS(f"\n🚀 完了！ 合計 {total_saved_count} 件（DUGA形式）を保存しました。"))