# /home/maya/shin-vps/django/api/urls/finder_urls.py

from django.urls import path
from api.views.finder_view import finder_recommend

urlpatterns = [
    path('recommend/', finder_recommend),
]