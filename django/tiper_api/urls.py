# ./django/tiper_api/urls.py

from django.contrib import admin
from django.urls import path, include 
from .views import home # api_root は api/urls.py 側で処理するので不要

urlpatterns = [
    path('', home, name='home'),
    path('admin/', admin.site.urls),
    
    # 💡 1つにまとめます。api/ 以下のすべてのルーティングを api.urls に任せます
    path('api/', include('api.urls')), 
]