# -*- coding: utf-8 -*-
# tiper_api/middleware.py

class MultiDomainProjectMiddleware:
    """
    🛡️ ホスト名からプロジェクト(bicstation, avflash等)を自動判別し、
    request.project_id に格納するミドルウェア。
    これにより、View側で ?project= パラメータがなくても自動フィルタリングが可能になります。
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # ホスト名を取得 (例: bicstation.com)
        host = request.get_host().lower()
        
        # ドメインに応じたプロジェクトIDの割り当て
        if 'bicstation' in host:
            request.project_id = 'bicstation'
        elif 'avflash' in host:
            request.project_id = 'avflash'
        elif 'saving' in host or 'bic-saving' in host:
            request.project_id = 'saving'
        elif 'tiper' in host:
            request.project_id = 'tiper'
        else:
            request.project_id = 'default'

        return self.get_response(request)