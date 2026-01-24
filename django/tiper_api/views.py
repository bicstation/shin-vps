# django/tiper_api/views.py

from django.http import HttpResponse, JsonResponse

def home(request):
    """
    Djangoのルートパス用ビュー
    """
    return HttpResponse("<h1>Django API Server is Running!</h1><p>Access /django/admin to log in.</p>")

def api_root(request):
    """
    /api/ へのリクエストのためのルートエンドポイント
    プロジェクト全体のAPIマップを返す（実際の詳細は api/views.py が担当）
    """
    return JsonResponse({
        "message": "Tiper API Gateway Root", 
        "status": "OK", 
        "version": "v1 (Django)",
        "endpoints": {
            "ranking": "/api/pc-products/ranking/",
            "products": "/api/pc-products/",
            "status": "/api/status/"
        }
    })

# ※ pc_product_ranking_api 関数は、django/api/views.py の 
# PCProductRankingView が担当するため、ここからは削除しても問題ありません。