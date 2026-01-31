# ./django/tiper_api/urls.py

from django.contrib import admin
# ↓ path の後ろに re_path を追加してください
from django.urls import path, include, re_path 
from .views import home, api_root 

urlpatterns = [
    # Django のトップページと管理画面
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # /api/ 以下は、すべて 'api.urls' に委譲する (Include)
    path('api/', include('api.urls')), 
    
    path('bicstation/api/', include('api.urls')),
    path('saving/api/', include('api.urls')),
    path('tiper/api/', include('api.urls')),
    path('avflash/api/', include('api.urls')),
    
    # 💡 正規表現を使うため、上に re_path のインポートが必要でした
    re_path(r'^.*$', home, name='frontend'), 
]