# C:\dev\SHIN-VPS\django\api\management\commands\fetch_fanza.py (再々修正版)

import requests
import json
import time
import logging
import urllib.parse
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.conf import settings # API_CONFIG を settings から読み込む

# 共通モジュールからのインポート
from api.utils.db_bulk_ops import bulk_insert_or_update
from api.models import RawApiData


# ロガーのセットアップ
logger = logging.getLogger('fetch_fanza')

# FANZA APIの設定を settings から取得
FANZA_CONFIG = settings.API_CONFIG.get('FANZA', {})
API_SOURCE = 'FANZA'

# FANZA APIのサービスの定義
DEFAULT_FANZA_FLOORS = [
    {'service': 'digital', 'floor': 'videoa', 'hits': 100},
    {'service': 'digital', 'floor': 'videoc', 'hits': 100},
]

# APIリクエストの共通パラメーター
DEFAULT_PARAMS = {
    'site': 'FANZA', 
    'hits': 100, 
    'sort': 'date', # 新しい順
    'output': 'json',
    'callback': '___json_dmm', # JSONP回避用
}

# 設定が存在しない場合のフォールバック
FLOOR_CONFIGS = FANZA_CONFIG.get('FLOORS', DEFAULT_FANZA_FLOORS)
BASE_URL = FANZA_CONFIG.get('API_URL', 'https://api.dmm.com/affiliate/v3/ItemList')
COMMON_PARAMS = FANZA_CONFIG.get('PARAMS', DEFAULT_PARAMS)


# ====================================================
# JSONPラッパーを除去してJSONオブジェクトを返すヘルパー関数
# ====================================================
def clean_jsonp_response(response_text, callback_name):
    """
    JSONPレスポンスからコールバック関数ラッパーを除去し、JSONをデコードする。
    """
    start = f'{callback_name}('
    end = ');'
    
    # JSONPラッパーが存在する場合
    if response_text.startswith(start) and response_text.endswith(end):
        # ラッパーを除去し、内部のJSON文字列を取得
        json_string = response_text[len(start):-len(end)]
        return json.loads(json_string)
    
    # 標準のJSONレスポンスの場合（念のため）
    return json.loads(response_text)


class Command(BaseCommand):
    help = 'FANZA APIからデータを取得し、RawApiDataテーブルに保存します。'

    def add_arguments(self, parser):
        parser.add_argument(
            '--limit-floors',
            type=int,
            default=2,
            help='フロアごとの最大取得ページ数 (1ページあたり100件)。',
        )

    def handle(self, *args, **options):
        """メインの処理ロジック"""
        self.stdout.write(self.style.NOTICE('--- FANZA API データ取得開始 ---'))
        
        limit_floors = options['limit_floors']
        total_saved_count = 0
        
        CALLBACK_NAME = COMMON_PARAMS.get('callback', '___json_dmm') 


        for floor_config in FLOOR_CONFIGS:
            service = floor_config['service']
            floor = floor_config['floor']
            self.stdout.write(self.style.NOTICE(f'\n--- サービス: {service}, フロア: {floor} のデータ取得開始 ---'))
            
            # API検索パラメーターの準備
            params = COMMON_PARAMS.copy()
            params['service'] = service
            params['floor'] = floor
            
            # ★★★ 修正箇所: settings.API_CONFIG から認証情報を取得する ★★★
            # FANZA_CONFIG は settings.API_CONFIG.get('FANZA', {}) で既に定義済み
            params['api_id'] = FANZA_CONFIG.get('API_ID') 
            params['affiliate_id'] = FANZA_CONFIG.get('API_KEY')
            # --------------------------------------------------------
            
            # 認証情報が設定されているか確認 (必須)
            if not params['api_id'] or not params['affiliate_id']:
                logger.error("FANZA API ID または AFFILIATE ID が設定されていません。処理をスキップします。")
                self.stdout.write(self.style.ERROR(f'--- サービス: {service}, フロア: {floor} は認証情報不足によりスキップされました ---'))
                continue
            
            # ヒット数（ページあたりの件数）をフロア設定またはデフォルトから取得
            hits = floor_config.get('hits', COMMON_PARAMS['hits'])
            params['hits'] = hits

            offset = 1 # 1から開始
            page_count = 0
            
            try:
                # 最初の取得で総アイテム数を確認
                self.stdout.write(f'FANZA API からデータを取得中 (サービス: {service}, フロア: {floor}, offset: {offset})...')
                response = requests.get(BASE_URL, params={**params, 'offset': offset})
                response.raise_for_status() # HTTPエラーを確認
                
                # JSONP対応のヘルパー関数を使用
                data = clean_jsonp_response(response.text, CALLBACK_NAME)
                result = data.get('result', {})
                
                # API認証失敗のケースをここで再度チェック
                if result.get('status') == 400 and result.get('message') == 'BAD REQUEST':
                     raise requests.exceptions.HTTPError(f"API認証失敗: {result.get('errors')}")

                total_count = int(result.get('total_count', 0))
                
                self.stdout.write(f'このフロア ({floor}) で利用可能な総アイテム数: {total_count} 件')

                # 総アイテム数またはページ制限に応じてループ
                while offset <= total_count and page_count < limit_floors:
                    # 最初のページは既に取得済み
                    if offset != 1: 
                        # 2回目以降の取得
                        time.sleep(1) # API負荷軽減のため待機

                        self.stdout.write(f'FANZA API からデータを取得中 (サービス: {service}, フロア: {floor}, offset: {offset})...')
                        response = requests.get(BASE_URL, params={**params, 'offset': offset})
                        response.raise_for_status()
                        
                        # JSONP対応のヘルパー関数を使用
                        data = clean_jsonp_response(response.text, CALLBACK_NAME)
                        result = data.get('result', {})

                    # --------------------------------------------------------
                    # DB保存処理 (RawApiDataバッチの準備と保存)
                    # --------------------------------------------------------
                    raw_data_batch = []
                    
                    # API全体レスポンスの 'floor-offset' をユニークキーとする
                    api_product_id_key = f"{floor}-{offset}" 
                    
                    # APIから取得したレスポンスJSON全体を raw_json_data に格納
                    raw_data_batch.append({
                        'api_source': API_SOURCE,
                        'api_product_id': api_product_id_key, 
                        'raw_json_data': json.dumps(data),
                        'api_service': service,
                        'api_floor': floor,
                        'updated_at': timezone.now(),
                        'created_at': timezone.now(),
                    })
                    
                    saved_count = self._save_raw_data_batch(raw_data_batch) # 保存ヘルパーを呼び出す
                    total_saved_count += saved_count
                    
                    self.stdout.write(f'{len(result.get("items", []))} 件の商品データを取得しました。データベースに保存しました。')

                    # 次のオフセットとページカウンターの更新
                    offset += hits
                    page_count += 1

            except requests.exceptions.HTTPError as e:
                # HTTPエラーの場合は、エラーメッセージと共にレスポンス内容もログ出力
                logger.error(f"HTTPエラーが発生しました: {e}. レスポンス: {response.text}")
            except Exception as e:
                # その他のエラー (JSONデコードエラーなど)
                logger.error(f"データ処理中にエラーが発生しました: {e}")
            
            self.stdout.write(self.style.NOTICE(f'--- サービス: {service}, フロア: {floor} のデータ取得完了 (合計: {total_saved_count} 件) ---'))

        self.stdout.write(self.style.SUCCESS('✅ 全フロアのデータ取得と保存が完了しました。'))
        self.stdout.write(f'合計保存された RawApiData レコード数: {total_saved_count} 件')


    def _save_raw_data_batch(self, batch):
        """
        RawApiDataをバルク挿入・更新する。
        """
        if not batch:
            return 0
        
        try:
            bulk_insert_or_update(batch=batch)
            return len(batch)
        except Exception as e:
            logger.error(f"DB保存エラー: {e}")
            raise # エラーを再度スローし、handle()メソッド外側のtry/exceptで捕捉させる