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
from django.utils import timezone # タイムゾーン対応の現在時刻を取得するために追加

# リトライのためのモジュール
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# 移植したユーティリティ関数
from api.utils.db_bulk_ops import bulk_insert_or_update

# --- 設定情報 (settings.pyへ移行を推奨) ---
API_SOURCE = 'DUGA'
# データベースにまとめて保存するバッチサイズ
DB_BATCH_SIZE = 100

# ロギング設定 (Djangoのロギング設定を利用)
logger = logging.getLogger(f'fetch_{API_SOURCE.lower()}')
logger.setLevel(logging.INFO) # settings.pyのLOGGING設定が優先されます

# --- リトライ設定 ---
RETRY_SETTINGS = Retry(
    total=5,
    backoff_factor=1,
    status_forcelist=[500, 502, 503, 504],
    allowed_methods=["GET"]
)
adapter = HTTPAdapter(max_retries=RETRY_SETTINGS)

# リトライアダプターをマウントしたセッション
http_session = requests.Session()
http_session.mount("http://", adapter)
http_session.mount("https://", adapter)


# --- ヘルパー関数 ---
def get_api_config(source):
    """
    settings.pyからAPI設定を取得する (settings.pyにAPI_CONFIGを定義することを前提)
    """
    try:
        # API_CONFIGがsettingsにあることを前提とする
        return settings.API_CONFIG[source]
    except AttributeError:
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

    # ★リファクタリング★: requests.Request/prepare() を削除し、セッションのgetを直接使用
    response = http_session.get(DUGA_API_URL, params=params)
    
    # ログ出力は成功時のみ
    logger.info(f"リクエストURL: {response.url}")

    response.raise_for_status()

    # レスポンスがJSONであるため、response.json()をそのまま使用
    return response.json()

def process_api_items(items):
    """
    APIから取得したアイテムをデータベース保存用のフォーマットに変換する。
    """
    processed_batch = []
    if items:
        logger.info(f"{len(items)} 件の商品データを処理中...")

    current_time = timezone.now()
    
    for item_wrapper in items:
        # DUGA APIは item の中に実際のデータがある
        if 'item' in item_wrapper and isinstance(item_wrapper['item'], dict):
            item = item_wrapper['item']
            
            # API Product ID が存在しない場合はスキップ (必須フィールドのため)
            if 'productid' not in item:
                logger.warning("productid がないアイテムをスキップします。")
                continue
                
            # raw_json_data は JSONField に保存するため、文字列に変換
            raw_json_to_save = json.dumps(item, ensure_ascii=False)

            processed_batch.append({
                # RawApiData モデルのフィールド名と一致させる
                'api_source': API_SOURCE,
                'api_product_id': item.get('productid'), # ユニークキーとして使用
                'raw_json_data': raw_json_to_save,
                'api_service': item.get('service_code', None), # DUGAのサービスコード/フロアコードを格納
                'api_floor': item.get('floor_code', None),
                'updated_at': current_time,
                'created_at': current_time,
            })
    return processed_batch


class Command(BaseCommand):
    help = 'DUGA APIからデータを取得し、データベースに格納します。'

    def handle(self, *args, **options):
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
            # 取得件数が上限に達するか、利用可能な全アイテムを取得し終えるまでループ
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
                
                if data is None: 
                    break

                # 'count' フィールドから総アイテム数を取得 (最初のページでのみ重要)
                if total_items_available == float('inf') and 'count' in data:
                    total_items_available = int(data['count'])
                    self.stdout.write(f"DUGA APIでの利用可能な総アイテム数: {total_items_available} 件")

                items = data.get('items', [])
                if not items:
                    self.stdout.write("取得件数が0件になりました。データ取得を終了します。")
                    break

                processed_items = process_api_items(items)
                current_batch.extend(processed_items)
                total_fetched_items += len(items)

                # バッチサイズに達したら保存
                if len(current_batch) >= DB_BATCH_SIZE:
                    self.stdout.write(f"バッチサイズに達しました。{len(current_batch)} 件のデータをデータベースに保存中...")
                    # 修正済み: 'model_name' 引数を削除
                    bulk_insert_or_update(current_batch) 
                    current_batch = []

                # 次のオフセットの計算
                offset += len(items)
                time.sleep(1) # API負荷軽減のため待機

            # ループ終了後の残りのバッチを保存
            if current_batch:
                self.stdout.write(f"\n残りの {len(current_batch)} 件のデータをデータベースに保存中...")
                # 修正済み: 'model_name' 引数を削除
                bulk_insert_or_update(current_batch)

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"予期せぬエラーが発生しました: {e}"))
            
        finally:
            self.stdout.write(f"\n--- {API_SOURCE} API データ取得完了 ---")
            self.stdout.write(f"合計取得・処理件数: {total_fetched_items} 件")