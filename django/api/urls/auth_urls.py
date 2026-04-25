# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/auth_urls.py

from django.urls import path
from api.views import auth_views

app_name = 'auth'

urlpatterns = [
    path('login/', auth_views.login_view, name='login'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('register/', auth_views.register_view, name='register'),
    path('me/', auth_views.get_user_view, name='me'),
]