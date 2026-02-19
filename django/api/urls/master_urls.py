# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/urls/master_urls.py

from django.urls import path
from api.views import master_views

app_name = 'master'

urlpatterns = [
    path('actresses/', master_views.ActressListAPIView.as_view(), name='actress_list'),
    path('genres/', master_views.GenreListAPIView.as_view(), name='genre_list'),
    path('makers/', master_views.MakerListAPIView.as_view(), name='maker_list'),
    path('labels/', master_views.LabelListAPIView.as_view(), name='label_list'),
    path('directors/', master_views.DirectorListAPIView.as_view(), name='director_list'),
    path('series/', master_views.SeriesListAPIView.as_view(), name='series_list'),
    path('authors/', master_views.AuthorListAPIView.as_view(), name='author_list'),
    
    # 🚀 階層構造 & 作品カウント取得エンドポイントを追加
    path('nav-list/', master_views.AdultNavListView.as_view(), name='nav_list'),
]