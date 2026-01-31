# -*- coding: utf-8 -*-
import logging

logger = logging.getLogger(__name__)

class DomainDiscoveryMiddleware:
    """
    本番ドメインとローカルパスを1対1で対応させ、サイト種別を判定するミドルウェア。
    
    対応表:
    bicstation.com  <--> localhost:8083/bicstation
    bic-saving.com  <--> localhost:8083/saving
    tiper.live      <--> localhost:8083/tiper
    avflash.xyz     <--> localhost:8083/avflash
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ホスト名(ドメイン)とURLパスを取得
        host = request.get_host().split(':')[0].lower()
        path = request.path_info.lower()

        # 1. サイト判定の対応マッピング定義
        # domains: 本番環境でのキーワード
        # paths: ローカル環境でのパスの開始文字列
        site_configs = {
            'saving': {
                'domains': ['bic-saving', 'saving'],
                'paths': ['/saving'],
                'name': 'Bic Saving'
            },
            'station': {
                'domains': ['bicstation', 'station'],
                'paths': ['/bicstation'],
                'name': 'Bic Station'
            },
            'adult': {
                'domains': ['tiper', 'avflash', 'adult'],
                'paths': ['/tiper', '/avflash'],
                'name': 'Adult Portal'
            }
        }

        # 2. 判定ロジック
        # デフォルトを 'station' に設定
        identified_type = 'station'
        identified_name = 'Bic Station'

        for site_type, config in site_configs.items():
            # A. 本番ドメイン判定 (ホスト名にキーワードが含まれるか)
            if any(dom_kw in host for dom_kw in config['domains']):
                identified_type = site_type
                identified_name = config['name']
                break
            
            # B. ローカルパス判定 (パスが指定の文字列で始まるか)
            if any(path.startswith(path_kw) for path_kw in config['paths']):
                identified_type = site_type
                identified_name = config['name']
                break

        # 3. requestオブジェクトに属性をセット (ViewやSerializerで利用可能にする)
        request.site_type = identified_type
        request.site_name = identified_name

        # 必要に応じてログ出力（デバッグ時のみ推奨）
        # logger.debug(f"[DomainDiscovery] Host: {host}, Path: {path} -> Identified: {identified_type}")

        response = self.get_response(request)
        return response