# -*- coding: utf-8 -*-
# django/tiper_api/views.py

from django.http import HttpResponse
from rest_framework.reverse import reverse
from rest_framework.decorators import api_view
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

def home(request):
    return HttpResponse("<h1>Django API Server is Running!</h1><p>Access /django/admin to log in.</p>")

@api_view(['GET'])
def api_root(request, format=None):
    """
    主要な全APIエンドポイントを網羅したルート
    """
    
    def safe_reverse(viewname):
        """URL逆引きに失敗してもエラーにせず、Noneを返す安全なラッパー"""
        try:
            return reverse(viewname, request=request, format=format)
        except Exception:
            # 開発時に分かりやすいよう、あえてメッセージを残す仕様を継続
            return f"URL name '{viewname}' not found"

    return Response({
        "message": "Tiper API Gateway - Managed Root",
        "status": "OK",
        "version": "v1.3 (Integrated)",
        "endpoints": {
            # 🚀 1. 統合・横断検索（Next.js メイン利用）
            "unified_gateway": {
                "all_products": safe_reverse('api:unified_adult_products'),
                "navigation": safe_reverse('api:floor_navigation'),
                "ranking": safe_reverse('api:adult_product_ranking'),
                "analysis": safe_reverse('api:platform_market_analysis'),
            },

            # 🔞 2. マスターデータ（タクソノミー）
            "taxonomy": {
                "actresses": safe_reverse('api:actress_list'),
                "genres": safe_reverse('api:genre_list'),
                "makers": safe_reverse('api:maker_list'),
                "labels": safe_reverse('api:label_list'),
                "taxonomy_index": safe_reverse('api:adult_taxonomy_index'),
            },

            # 💻 3. PC・ガジェット関連
            "pc_gadget_resources": {
                "pc_products": safe_reverse('api:pc_product_list'),
                "pc_ranking": safe_reverse('api:pc_product_ranking'),
                "linkshare_products": safe_reverse('api:linkshare_product_list'),
            },

            # 🛠 4. システム・認証
            "system": {
                "status": safe_reverse('api:status_check'),
                "auth_me": safe_reverse('api:api_user_me'),
            }
        }
    })