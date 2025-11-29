# api/management/commands/fetch_duga.py

import os
import sys
import requests
import json
import time
import logging

# Djangoのコア機能
from django.core.management.base import BaseCommand
from django.conf import settings # settings.pyから設定を取得するために必要

# リトライのためのモジュール
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 移植したユーティリティ関数
from api.utils import bulk_insert_or_update

# --- 設定情報 (settings.pyへ移行を推奨) ---
API_SOURCE = 'DUGA'
# データベースにまとめて保存するバッチサイズ
DB_BATCH_SIZE = 100

# ロギング設定 (Djangoのロギング設定を利用することが推奨されますが、ここでは既存のスタイルを維持)
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
# ハンドラーを定義しないと、Djangoのデフォルト設定が使用されますが、
# 既存のロギングスタイルを再現するために、BaseCommandのstdoutを使用します。

# --- リトライ設定 ---
RETRY_SETTINGS = Retry(
    total=5,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=RETRY_SETTINGS)

http_session = requests.Session()
http_session.mount("http://", adapter)
http_session.mount("https://", adapter)


# --- ヘルパー関数 ---
def get_api_config(source):
    """
    settings.pyからAPI設定を取得する (settings.pyにAPI_CONFIGを定義することを前提)
    """
    try:
        return settings.API_CONFIG[source]
    except AttributeError:
        # settings.py に API_CONFIG がない場合のフォールバック (テスト用)
        raise EnvironmentError("settings.pyにAPI_CONFIGが定義されていません。")
    except KeyError:
        raise EnvironmentError(f"設定ファイルに {source} のAPI設定が見つかりません。")

def fetch_data_from_api(offset):
    """
    DUGA APIからデータを取得する。
    """
    try:
        config = get_api_config(API_SOURCE)
        DUGA_API_ID = config['API_ID']
        DUGA_AFFILIATE_ID = config['API_KEY']
        DUGA_API_URL = config['API_URL']
    except EnvironmentError as e:
        logger.error(str(e))
        return None

    params = {
        'version': '1.2',
        'appid': DUGA_API_ID,
        'agentid': DUGA_AFFILIATE_ID,
        'bannerid': '01',
        'hits': 100,
        'offset': offset,
        'format': 'json',
        'sort': 'new',
        'adult': '1'
    }

    logger.info(f"APIからデータを取得中 (offset: {offset})...")

    req = requests.Request('GET', DUGA_API_URL, params=params)
    prepared_request = req.prepare()

    logger.info(f"リクエストURL: {prepared_request.url}")

    response = http_session.get(prepared_request.url)
    response.raise_for_status()

    return response.json()

def process_api_items(items):
    """
    APIから取得したアイテムをデータベース保存用のフォーマットに変換する。
    """
    processed_batch = []
    if items:
        logger.info(f"{len(items)} 件の商品データを取得しました。")

    for item_wrapper in items:
        if 'item' in item_wrapper and isinstance(item_wrapper['item'], dict):
            item = item_wrapper['item']
            # raw_json_data は JSONField に保存するため、文字列に変換
            raw_json_to_save = json.dumps(item, ensure_ascii=False)

            processed_batch.append({
                # RawApiData モデルのフィールド名と一致させる
                'api_source': API_SOURCE,
                'api_product_id': item.get('productid', ''),
                'raw_json_data': raw_json_to_save,
                'api_service': item.get('service_code', None),
                'api_floor': item.get('floor_code', None),
            })
    return processed_batch


class Command(BaseCommand):
    help = 'DUGA APIからデータを取得し、データベースに格納します。'

    def handle(self, *args, **options):
        # 既存のロギングを再現するため、stdoutを使用
        self.stdout.write(f"--- {API_SOURCE} API データ取得開始 ---")

        try:
            config = get_api_config(API_SOURCE)
            MAX_TOTAL_ITEMS = config['TOTAL_LIMIT']
        except EnvironmentError as e:
            self.stderr.write(self.style.ERROR(str(e)))
            return

        self.stdout.write(f"最大 {MAX_TOTAL_ITEMS} 件のデータを取得します。")

        total_fetched_items = 0
        offset = 1
        total_items_available = float('inf')
        current_batch = []

        try:
            while total_fetched_items < MAX_TOTAL_ITEMS and offset <= total_items_available:
                try:
                    data = fetch_data_from_api(offset)
                except requests.exceptions.RequestException as e:
                    self.stderr.write(self.style.ERROR(f"APIリクエストに失敗しました: {e}"))
                    self.stderr.write(self.style.ERROR("リトライ回数を超過しました。処理を終了します。"))
                    break
                except json.JSONDecodeError as e:
                    self.stderr.write(self.style.ERROR(f"JSONデコードエラー: {e}"))
                    break
                
                if data is None: # 設定エラーなどでデータ取得関数がNoneを返した場合
                    break

                if 'count' in data:
                    total_items_available = int(data['count'])

                items = data.get('items', [])
                if not items:
                    self.stdout.write("取得件数が0件になりました。データ取得を終了します。")
                    break

                processed_items = process_api_items(items)
                current_batch.extend(processed_items)
                total_fetched_items += len(items)

                if len(current_batch) >= DB_BATCH_SIZE:
                    self.stdout.write(f"バッチサイズに達しました。{len(current_batch)} 件のデータをデータベースに保存中...")
                    # 'raw_api_data' という文字列は、bulk_insert_or_update 関数内でモデルにマッピングされます
                    bulk_insert_or_update('raw_api_data', current_batch) 
                    current_batch = []

                offset += len(items)
                time.sleep(1)

            if current_batch:
                self.stdout.write(f"\n残りの {len(current_batch)} 件のデータをデータベースに保存中...")
                bulk_insert_or_update('raw_api_data', current_batch)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"予期せぬエラーが発生しました: {e}"))
            
        finally:
            self.stdout.write(f"\n--- {API_SOURCE} API データ取得完了 ---")
            self.stdout.write(f"合計取得・処理件数: {total_fetched_items} 件")