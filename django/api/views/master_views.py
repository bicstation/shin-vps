# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/master_views.py

from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.text import slugify
from django.db.models import Count
from api.models import (
    Genre, Maker, Actress, Label, Director, Series, Author, 
    AdultProduct, FanzaFloorMaster
)

# 💡 分割したシリアライザーからインポート
from api.serializers.adult_serializers import (
    GenreSerializer, 
    MakerSerializer, 
    ActressSerializer, 
    LabelSerializer,
    DirectorSerializer,
    SeriesSerializer,
    AuthorSerializer
)

# --------------------------------------------------------------------------
# 1. 🏆 マスターデータ取得 View
# --------------------------------------------------------------------------

class BaseMasterListView(generics.ListAPIView):
    """
    💡 マスターデータ取得の基底クラス
    AI解析スコアや製品カウントに基づいたフィルタリングを標準装備
    """
    def get_queryset(self):
        # 0件のものを表示したくないロジック
        # AdultProductモデルの関連名に合わせて調整
        return self.model.objects.annotate(
            total_products=Count('products') if hasattr(self.model, 'products') else Count('adultproduct')
        ).filter(total_products__gt=0).order_by('-total_products')

class GenreListAPIView(BaseMasterListView):
    model = Genre
    queryset = Genre.objects.all()
    serializer_class = GenreSerializer

class MakerListAPIView(BaseMasterListView):
    model = Maker
    queryset = Maker.objects.all()
    serializer_class = MakerSerializer

class ActressListAPIView(BaseMasterListView):
    model = Actress
    queryset = Actress.objects.all()
    serializer_class = ActressSerializer

class LabelListAPIView(BaseMasterListView):
    model = Label
    queryset = Label.objects.all()
    serializer_class = LabelSerializer

class DirectorListAPIView(BaseMasterListView):
    model = Director
    queryset = Director.objects.all()
    serializer_class = DirectorSerializer

class SeriesListAPIView(BaseMasterListView):
    model = Series
    queryset = Series.objects.all()
    serializer_class = SeriesSerializer

class AuthorListAPIView(BaseMasterListView):
    model = Author
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer

# --------------------------------------------------------------------------
# 🚀 2. 名寄せロジック (インポートコマンド等から呼び出す)
# --------------------------------------------------------------------------

def get_or_create_normalized_entity(model, name, raw_source=None):
    """
    💡 名寄せ関数: 
    名前の表記揺れを吸収し、DBに1つしかない状態を維持する
    """
    if not name:
        return None
    
    # 1. 正規化 (トリミング)
    clean_name = name.strip()
    
    # 2. 既存チェック (大文字小文字を区別しない一致)
    instance = model.objects.filter(name__iexact=clean_name).first()
    
    if not instance:
        # なければ作成
        # スラッグ重複回避のためユニークな値を生成
        base_slug = slugify(clean_name) or "unnamed"
        try:
            instance = model.objects.create(
                name=clean_name,
                slug=f"{base_slug}-{raw_source.lower()}" if raw_source else base_slug
            )
        except Exception:
            # 万が一スラッグが衝突した場合のフォールバック
            import uuid
            instance = model.objects.create(
                name=clean_name,
                slug=f"{base_slug}-{str(uuid.uuid4())[:4]}"
            )
    
    return instance

# --------------------------------------------------------------------------
# 🛰️ 3. 🚀 ナビゲーション階層 & 作品数集計 View
# --------------------------------------------------------------------------

class AdultNavListView(APIView):
    """
    DMM/FANZAの階層構造に、DB内の実件数(product_count)をリアルタイムに付与して返す
    """
    def get(self, request, *args, **kwargs):
        try:
            # 1. データベースから一括集計
            # 💡 モデルのフィールド名 (api_service, floor_code) に合わせて修正
            # floor_master フィールドが NULL でも集計できるように文字列ベースで行います
            stats = AdultProduct.objects.values('api_service', 'floor_code').annotate(
                total=Count('id')
            )
            # { (api_service, floor_code): count } のマップを作成
            count_map = { (s['api_service'], s['floor_code']): s['total'] for s in stats }

            # 2. 階層構造の構築
            nav_tree = {}
            
            # サイト(DMM.com / FANZA)ごとにループ
            sites = FanzaFloorMaster.objects.values('site_name', 'site_code').distinct()
            
            if not sites.exists():
                return Response({
                    "status": "EMPTY",
                    "message": "FanzaFloorMasterにデータがありません。同期を先に実行してください。",
                    "data": {}
                })

            for site in sites:
                site_key = site['site_name'] or "Unknown Site"
                site_code = site['site_code']
                
                services_in_site = {}
                total_site_count = 0
                
                # サービス(動画, 電子書籍など)ごとにループ
                services_qs = FanzaFloorMaster.objects.filter(site_code=site_code).values('service_name', 'service_code').distinct()
                for svc in services_qs:
                    svc_name = svc['service_name'] or "Unknown Service"
                    svc_code = svc['service_code'] # モデルの api_service に相当
                    floors_data = []
                    total_svc_count = 0
                    
                    # フロア(ビデオ, 素人など)ごとにループ
                    floors_qs = FanzaFloorMaster.objects.filter(site_code=site_code, service_code=svc_code)
                    for flr in floors_qs:
                        # 🚀 修正ポイント: 文字列のキー (svc_code, flr.floor_code) でカウントを取得
                        p_count = count_map.get((svc_code, flr.floor_code), 0)
                        
                        floors_data.append({
                            "code": flr.floor_code,
                            "name": flr.floor_name,
                            "product_count": p_count
                        })
                        total_svc_count += p_count
                    
                    services_in_site[svc_name] = {
                        "code": svc_code,
                        "name": svc_name,
                        "product_count": total_svc_count,
                        "floors": floors_data
                    }
                    total_site_count += total_svc_count

                nav_tree[site_key] = {
                    "code": site_code,
                    "name": site_key,
                    "product_count": total_site_count,
                    "services": services_in_site
                }

            return Response({
                "status": "NAV_SYNC_COMPLETE",
                "data": nav_tree
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # サーバーエラー時のデバッグ情報を出力
            import traceback
            print(traceback.format_exc())
            return Response({
                "status": "SERVER_ERROR",
                "error": str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)