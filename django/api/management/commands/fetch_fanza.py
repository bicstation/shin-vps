# C:\dev\SHIN-VPS\django\api\management\commands\fetch_fanza.py

import requests
import json
import time
import logging
import urllib.parse
from datetime import datetime

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

# 共通モジュールからのインポートを修正
from api.constants import API_CONFIG 
from api.utils import bulk_insert_or_update # 正しい関数名でインポート
from api.models import RawApiData


# ロガーのセットアップ
logger = logging.getLogger('fetch_fanza')

# FANZA APIの設定
FANZA_CONFIG = API_CONFIG.get('FANZA')
API_SOURCE = 'FANZA'

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

        for floor_config in FANZA_CONFIG['FLOORS']:
            service = floor_config['service']
            floor = floor_config['floor']
            self.stdout.write(self.style.NOTICE(f'\n--- サービス: {service}, フロア: {floor} のデータ取得開始 ---'))
            
            # API検索パラメーターの準備
            params = FANZA_CONFIG['PARAMS'].copy()
            params['service'] = service
            params['floor'] = floor
            params['api_id'] = FANZA_CONFIG['API_ID']
            # .envで定義されたAFFILIATE_IDを使用
            params['affiliate_id'] = FANZA_CONFIG['AFFILIATE_ID'] 

            offset = 1 # 1から開始
            page_count = 0
            
            try:
                # 最初の取得で総アイテム数を確認
                self.stdout.write(f'FANZA API からデータを取得中 (サービス: {service}, フロア: {floor}, offset: {offset})...')
                response = requests.get(FANZA_CONFIG['BASE_URL'], params={**params, 'offset': offset})
                response.raise_for_status() # HTTPエラーを確認
                
                data = response.json()
                result = data.get('result', {})
                total_count = int(result.get('total_count', 0))
                
                self.stdout.write(f'このフロア ({floor}) で利用可能な総アイテム数: {total_count} 件')

                # 総アイテム数またはページ制限に応じてループ
                while offset <= total_count and page_count < limit_floors:
                    if offset != 1:
                        # 2回目以降の取得
                        time.sleep(1) # API負荷軽減のため待機

                        self.stdout.write(f'FANZA API からデータを取得中 (サービス: {service}, フロア: {floor}, offset: {offset})...')
                        response = requests.get(FANZA_CONFIG['BASE_URL'], params={**params, 'offset': offset})
                        response.raise_for_status()
                        data = response.json()
                        result = data.get('result', {})


                    # --------------------------------------------------------
                    # DB保存処理 (RawApiDataバッチの準備と保存)
                    # --------------------------------------------------------
                    raw_data_batch = []
                    # APIから取得したレスポンスJSON全体を raw_json_data に格納
                    # RawApiDataのユニークキー: api_source + api_product_id。
                    # FANZAのAPIでは、API全体レスポンスの 'floor-offset' をユニークキーとする
                    api_product_id_key = f"{floor}-{offset}" 
                    
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
                    
                    self.stdout.write(f'{len(result.get("items", []))} 件の商品データを取得しました。データベースに保存します。')

                    # 次のオフセットとページカウンターの更新
                    offset += FANZA_CONFIG['PARAMS']['hits']
                    page_count += 1

            except requests.exceptions.HTTPError as e:
                logger.error(f"HTTPエラーが発生しました: {e}. レスポンス: {response.text}")
            except Exception as e:
                # DB保存エラーがここに来る
                logger.error(f"DB保存中にエラーが発生しました: {e}")
            
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
            # api.utilsからインポートした bulk_insert_or_update を呼び出す
            bulk_insert_or_update(model_name='RawApiData', batch=batch)
            return len(batch)
        except Exception as e:
            logger.error(f"DB保存エラー: {e}")
            raise # エラーを再度スローして外側のtry/exceptで捕捉させる