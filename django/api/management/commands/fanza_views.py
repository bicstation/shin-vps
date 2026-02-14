# django/api/views/fanza_views.py (例)
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .fanza_api_utils import FanzaAPIClient

@api_view(['GET'])
def get_fanza_menu_structure(request):
    """
    explorer.pyと同じ仕組みで最新のフロア構成を返す
    """
    client = FanzaAPIClient()
    menu_list = client.get_dynamic_menu() 
    # menu_list は [{'label': 'ビデオ', 'service': 'digital', 'floor': 'videoa', ...}, ...] という形式
    return Response(menu_list)