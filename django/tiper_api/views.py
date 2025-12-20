# django/tiper_api/views.py

from django.http import HttpResponse, JsonResponse # ★ JsonResponseをインポート

def home(request):
    """
    Djangoのルートパス (Nginxによって/django/から転送されたリクエスト) のためのビュー
    """
    return HttpResponse("<h1>Django API Server is Running!</h1><p>Access /django/admin to log in.</p>")

# ★★★ /api/ ルートエンドポイント用ビューの追加 ★★★
def api_root(request):
    """
    /api/ へのリクエストのためのルートエンドポイント
    """
    return JsonResponse({"message": "Tiper API Gateway Root", "status": "OK", "version": "v1 (Django)"})
# ★★★★★★★★★★★★★★★★★★★★★★★★★★★★