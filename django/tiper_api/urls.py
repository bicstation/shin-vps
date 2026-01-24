# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include 
from .views import home, api_root # プロジェクトレベルのビューをインポート

urlpatterns = [
    # Django のトップページ
    path('', home, name='home'),
    
    # 管理画面 (admin)
    path('admin/', admin.site.urls),
    
    # APIルート (/api/) のメッセージ表示用
    path('api/', api_root, name='api_root'),
    
    # /api/ 以下を個別の URL 設定ファイルに委譲する
    # ※ api/urls.py が存在することを確認してください
    path('api/', include('api.urls')), 
]