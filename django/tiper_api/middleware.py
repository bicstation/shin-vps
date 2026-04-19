# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/tiper_api/middleware.py

class MultiDomainProjectMiddleware:
    """
    🛡️ SHIN-VPS v3.9 プロジェクト自動判別 Middleware
    ホスト名、プロキシヘッダー、リファラーからプロジェクトを特定し、
    request.project_id および request.site_type に格納します。
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # 1. 直接のホスト名を取得 (例: bicstation-host:8083, api.tiper.live)
        host = request.get_host().lower()

        # 2. プロキシ(Traefik/Nginx)経由の元のホスト名を確認
        forward_host = request.META.get('HTTP_X_FORWARDED_HOST', '').lower()
        
        # 3. ブラウザのリファラーを確認 (API単体呼び出し時に有効)
        referer = request.META.get('HTTP_REFERER', '').lower()

        # 判定対象の文字列を統合
        identity = f"{host}|{forward_host}|{referer}"

        # --- 🚀 高精度プロジェクト・サイト種別 判定ロジック ---
        # 💡 project_id: プロジェクト識別用
        # 💡 site_type: auth_views.py の get_current_site_group が参照する識別子

        if 'bicstation' in identity:
            request.project_id = 'bicstation'
            request.site_type = 'station'  # 一般サイト (generalグループ)

        elif 'avflash' in identity:
            request.project_id = 'avflash'
            request.site_type = 'adult'    # アダルトサイト (adultグループ)

        elif 'saving' in identity or 'bic-saving' in identity:
            request.project_id = 'saving'
            request.site_type = 'saving'   # 節約サイト (generalグループ扱い)

        elif 'tiper' in identity:
            request.project_id = 'tiper'
            request.site_type = 'station'  # 本家 tiper (generalグループ)

        # 管理画面用 (localhostなど) または判定不能時
        else:
            # 開発環境や管理画面ログイン時はデフォルトを設定
            request.project_id = 'bicstation'
            request.site_type = 'station'

        # デバッグ用ログ (ログイン失敗時に確認するために一時的に有効化を推奨)
        print(f"--- [MIDDLEWARE DEBUG] ---")
        print(f"Identity: {identity}")
        print(f"Detected Project: {request.project_id}")
        print(f"Detected Site Type: {request.site_type}")

        return self.get_response(request)