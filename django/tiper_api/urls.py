# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include 
from .views import home, api_root # ★ プロジェクトレベルのビュー (home, api_root) のみインポート

urlpatterns = [
    # Django のトップページと管理画面
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # ★ /api/ 以下は、すべて 'api.urls' に委譲する (Include)
    path('api/', include('api.urls')), 
]