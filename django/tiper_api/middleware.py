# -*- coding: utf-8 -*-
# tiper_api/middleware.py

class MultiDomainProjectMiddleware:
    """
    🛡️ SHIN-VPS v3.9 プロジェクト自動判別 Middleware
    ホスト名、プロキシヘッダー、リファラーからプロジェクトを特定し、
    request.project_id に格納します。
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. 直接のホスト名を取得 (例: bicstation-host:8083, api.tiper.live)
        host = request.get_host().lower()

        # 2. プロキシ(Traefik/Nginx)経由の元のホスト名を確認
        forwarded_host = request.META.get('HTTP_X_FORWARDED_HOST', '').lower()
        
        # 3. ブラウザのリファラーを確認 (API単体呼び出し時に有効)
        referer = request.META.get('HTTP_REFERER', '').lower()

        # 判定対象の文字列を統合
        identity = f"{host}|{forwarded_host}|{referer}"

        # --- 🚀 高精度プロジェクト判定ロジック ---
        if 'bicstation' in identity:
            request.project_id = 'bicstation'
        
        elif 'avflash' in identity:
            request.project_id = 'avflash'
        
        elif 'saving' in identity or 'bic-saving' in identity:
            request.project_id = 'saving'
        
        elif 'tiper' in identity:
            request.project_id = 'tiper'
        
        # 管理画面用 (localhostなど) または判定不能時
        else:
            # 開発環境や管理画面ログイン時は 'tiper' か 'default' を選択
            request.project_id = 'tiper' 

        # デバッグ用: コンソールにどのプロジェクトとして判定されたか出す (不要なら削除可)
        # print(f"[DEBUG] Target: {identity} -> Detected: {request.project_id}")

        return self.get_response(request)