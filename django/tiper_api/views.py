# -*- coding: utf-8 -*-
# django/tiper_api/views.py

from django.http import HttpResponse
from django.urls import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response

def home(request):
    """
    Djangoのルートパス (/) 用のビュー
    Nginxから転送された際のランディングページ
    """
    return HttpResponse("<h1>Django API Server is Running!</h1><p>Access /django/admin to log in.</p>")

# 💡 [重要] Django REST Framework のデコレータを使用して、
# ブラウザから見やすい API Root 画面を生成します。
@api_view(['GET'])
def api_root(request, format=None):
    """
    /api/ へのリクエストのためのルートエンドポイント。
    主要なAPIへのリンクを動的に生成して返します。
    """
    # 既存の api/urls.py 内にある name を 'api:...' 形式で逆引きします。
    # 逆引きに失敗すると 500 エラーになるため、try-except で囲むとより安全ですが、
    # 開発時はエラーが出たほうがミスに気づきやすいためこのままでOKです。
    return Response({
        "message": "Tiper API Gateway Root",
        "status": "OK",
        "version": "v1 (Django)",
        "endpoints": {
            # 🚀 階層ナビゲーション (今回追加したもの)
            "navigation_floors": reverse('api:floor_navigation', request=request, format=format),
            
            # 🛡️ 統合アダルト共通ゲートウェイ
            "unified_products": reverse('api:unified_adult_products', request=request, format=format),
            
            # 🏷️ マスターデータ
            "actresses": reverse('api:actress_list', request=request, format=format),
            "genres": reverse('api:genre_list', request=request, format=format),
            
            # 💻 PC製品
            "pc_products": reverse('api:pc_product_list', request=request, format=format),
            
            # 💰 Linkshare
            "linkshare": reverse('api:linkshare_product_list', request=request, format=format),
            
            # 🔍 システム状態
            "system_status": reverse('api:status_check', request=request, format=format),
        }
    })