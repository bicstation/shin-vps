# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/tiper_api/urls.py


from django.contrib import admin
from django.urls import path, include, re_path 
from django.conf import settings
from django.conf.urls.static import static
from .views import home

urlpatterns = [
    path('api/', include('api.urls')),
    path('admin/', admin.site.urls),
    path('', home, name='home'),
]

# 👇 mediaを先に
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# 👇 frontendは最後に1回だけ
urlpatterns += [
    re_path(r'^(?!api/|admin/|static/|media/).*$', home, name='frontend'),
]