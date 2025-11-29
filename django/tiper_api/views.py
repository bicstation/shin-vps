# django/tiper_api/views.py

from django.http import HttpResponse

def home(request):
    """
    Djangoのルートパス (Nginxによって/django/から転送されたリクエスト) のためのビュー
    """
    return HttpResponse("<h1>Django API Server is Running!</h1><p>Access /django/admin to log in.</p>")