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
            return f"URL name '{viewname}' not found"

    return Response({
        "message": "Tiper API Gateway - Managed Root",
        "status": "OK",
        "version": "v1.2 (Django)",
        "endpoints": {
            # 🚀 1. 統合・横断検索
            "unified_search": {
                "products": safe_reverse('api:unified_adult_products'),
                "navigation": safe_reverse('api:floor_navigation'),
            },

            # 🔞 2. アダルト専用リソース
            "adult_resources": {
                # アンダースコア版とハイフン版の両方を試せるよう安全に記述
                "adult_products": safe_reverse('api:adult_product_list'), 
                "fanza_products": safe_reverse('api:fanza_product_list'),
                "actresses": safe_reverse('api:actress_list'),
                "genres": safe_reverse('api:genre_list'),
                "makers": safe_reverse('api:maker_list'),
                "labels": safe_reverse('api:label_list'),
            },

            # 💻 3. PC・ガジェット関連
            "pc_gadget_resources": {
                "pc_products": safe_reverse('api:pc_product_list'),
                "linkshare_products": safe_reverse('api:linkshare_product_list'),
            },

            # 🛠 4. システム
            "system": {
                "status": safe_reverse('api:status_check'),
                "raw_data": safe_reverse('api:raw_api_data_list'),
            }
        }
    })