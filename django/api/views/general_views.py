# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/views/general_views.py

from rest_framework import generics, filters, pagination, views, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.db.models import Count
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.http import Http404
from urllib.parse import unquote

# 💡 必要なモデルをインポート
from api.models import (
    PCProduct, PCAttribute, PriceHistory, LinkshareProduct,
    Actress, Genre, Maker, Label, Director, Series, Author,
    FanzaFloorMaster
)

# 💡 インポート先の修正
# 1. PC系および共通シリアライザー (general_serializers.py から)
from api.serializers.general_serializers import (
    PCProductSerializer, 
    LinkshareProductSerializer
)

# 2. アダルト系マスタ・階層シリアライザー (adult_serializers.py から)
from api.serializers.adult_serializers import (
    ActressSerializer, GenreSerializer, MakerSerializer, 
    LabelSerializer, DirectorSerializer, SeriesSerializer, AuthorSerializer,
    FanzaFloorMasterSerializer
)

# --------------------------------------------------------------------------
# 0. ページネーション & 基底クラス
# --------------------------------------------------------------------------

class PCProductLimitOffsetPagination(pagination.LimitOffsetPagination):
    """
    Next.jsの ?offset=x&limit=y に対応するためのページネーション
    """
    default_limit = 10
    max_limit = 100

class MasterEntityListView(generics.ListAPIView):
    """
    マスタデータ（女優・ジャンル等）取得の共通ベースクラス。
    """
    permission_classes = [AllowAny]
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'slug', 'ruby']
    ordering = ['name']

# --------------------------------------------------------------------------
# 1. 共通マスタデータ View 実装
# --------------------------------------------------------------------------

class ActressListAPIView(MasterEntityListView):
    queryset = Actress.objects.all().order_by('-product_count', 'name')
    serializer_class = ActressSerializer

class GenreListAPIView(MasterEntityListView):
    queryset = Genre.objects.all().order_by('-product_count', 'name')
    serializer_class = GenreSerializer

class MakerListAPIView(MasterEntityListView):
    queryset = Maker.objects.all().order_by('-product_count', 'name')
    serializer_class = MakerSerializer

class LabelListAPIView(MasterEntityListView):
    queryset = Label.objects.all().order_by('-product_count', 'name')
    serializer_class = LabelSerializer

class DirectorListAPIView(MasterEntityListView):
    queryset = Director.objects.all().order_by('-product_count', 'name')
    serializer_class = DirectorSerializer

class SeriesListAPIView(MasterEntityListView):
    queryset = Series.objects.all().order_by('-product_count', 'name')
    serializer_class = SeriesSerializer

class AuthorListAPIView(MasterEntityListView):
    queryset = Author.objects.all().order_by('-product_count', 'name')
    serializer_class = AuthorSerializer


# --------------------------------------------------------------------------
# 2. 🏆 PC製品ランキング View (完全版)
# --------------------------------------------------------------------------

class PCProductRankingView(generics.ListAPIView):
    """
    PC製品のランキング一覧を返す。
    Next.jsからの /ranking/ および /popularity-ranking/ の両方に対応。
    """
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        # 基本セット：有効かつスペックスコアがあるもの
        queryset = PCProduct.objects.filter(is_active=True, spec_score__gt=0)
        
        # 💡 [タクティカル修正] リクエストURLから「注目度」か「売上」かを判定
        path = self.request.path
        is_popularity = 'popularity-ranking' in path
        
        site_type = getattr(self.request, 'site_type', 'station')

        # A. 注目度ランキング (popularity-ranking) の場合
        if is_popularity:
            # 現状は「更新が新しい＝注目」としてソート。必要に応じてクリック数等に変更可能
            return queryset.order_by('-updated_at', '-spec_score')[:20]

        # B. 通常ランキング (ranking) の場合
        # savingサイトならコスパ順、それ以外（station等）はスペック順
        if site_type == 'saving':
            return queryset.order_by('-score_cost', '-spec_score')[:20]
        
        return queryset.order_by('-spec_score', '-updated_at')[:20]

# --------------------------------------------------------------------------
# 3. 💻 PC・ソフトウェア製品一覧 (PCProduct)
# --------------------------------------------------------------------------

class PCProductListAPIView(generics.ListAPIView):
    """
    PC製品の一覧取得・詳細フィルタリング・検索
    """
    serializer_class = PCProductSerializer
    pagination_class = PCProductLimitOffsetPagination
    permission_classes = [AllowAny]
    
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter, filters.SearchFilter]
    filterset_fields = [
        'site_prefix', 'unified_genre', 'stock_status', 
        'is_posted', 'is_ai_pc', 'is_download',
        'cpu_socket', 'motherboard_chipset', 'ram_type',
        'license_term', 'edition'
    ]
    
    search_fields = [
        'name', 'cpu_model', 'gpu_model', 'os_support',
        'edition', 'description', 'ai_content'
    ]
    
    ordering_fields = [
        'price', 'updated_at', 'created_at', 'memory_gb', 
        'spec_score', 'score_cpu', 'score_gpu', 'score_cost', 
        'score_portable', 'score_ai', 'npu_tops', 'power_recommendation'
    ]

    def get_queryset(self):
        queryset = PCProduct.objects.filter(is_active=True).prefetch_related('attributes')
        
        maker = self.request.query_params.get('maker')
        attribute_slug = self.request.query_params.get('attribute')
        
        if maker:
            queryset = queryset.filter(maker__iexact=unquote(maker))
        if attribute_slug:
            queryset = queryset.filter(attributes__slug=unquote(attribute_slug))
        
        site_type = getattr(self.request, 'site_type', 'station')
        if site_type == 'saving':
            return queryset.order_by('stock_status', '-score_cost', '-updated_at')
        
        return queryset.order_by('-updated_at', 'id')

# --------------------------------------------------------------------------
# 4. 🔍 製品詳細 (PCProductDetail)
# --------------------------------------------------------------------------

class PCProductDetailAPIView(generics.RetrieveAPIView):
    queryset = PCProduct.objects.all().prefetch_related('attributes')
    serializer_class = PCProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'unique_id'
    lookup_url_kwarg = 'unique_id'

    def get_object(self):
        unique_id = self.kwargs.get(self.lookup_url_kwarg)
        if unique_id == 'ranking':
            raise Http404("Invalid ID: 'ranking' is a reserved keyword.")
        return super().get_object()

# --------------------------------------------------------------------------
# 5. 🛠️ PC統計・履歴・メーカー API
# --------------------------------------------------------------------------

class PCProductMakerListView(APIView):
    permission_classes = [AllowAny]
    def get(self, request):
        genre = request.query_params.get('genre')
        qs = PCProduct.objects.filter(is_active=True).exclude(maker__isnull=True).exclude(maker='')
        if genre:
            qs = qs.filter(unified_genre=genre)
        maker_counts = qs.values('maker').annotate(count=Count('id')).order_by('maker')
        return Response(list(maker_counts))

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_sidebar_stats(request):
    attrs = PCAttribute.objects.annotate(
        product_count=Count('products')
    ).filter(product_count__gt=0).order_by('attr_type', 'order', 'name')
    
    sidebar_data = {}
    for attr in attrs:
        type_display = attr.get_attr_type_display()
        if type_display and ". " in type_display:
            type_display = type_display.split(". ", 1)[1]
        if type_display not in sidebar_data:
            sidebar_data[type_display] = []
        sidebar_data[type_display].append({
            'id': attr.id, 'name': attr.name, 'slug': attr.slug, 'count': attr.product_count
        })
    return Response(sidebar_data)

@api_view(['GET'])
@permission_classes([AllowAny])
def pc_product_price_history(request, unique_id):
    decoded_id = unquote(unique_id)
    if decoded_id == 'ranking':
        raise Http404()
    product = get_object_or_404(PCProduct, unique_id=decoded_id)
    history = PriceHistory.objects.filter(product=product).order_by('recorded_at')[:30]
    return Response({
        "name": product.name,
        "labels": [h.recorded_at.strftime('%Y/%m/%d') for h in history],
        "prices": [h.price for h in history]
    })

# --------------------------------------------------------------------------
# 6. Linkshare商品 Views
# --------------------------------------------------------------------------

class LinkshareProductListAPIView(generics.ListAPIView): 
    queryset = LinkshareProduct.objects.all().order_by('-updated_at')
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['product_name', 'sku']

class LinkshareProductDetailAPIView(generics.RetrieveAPIView): 
    queryset = LinkshareProduct.objects.all()
    serializer_class = LinkshareProductSerializer
    permission_classes = [AllowAny]
    lookup_field = 'sku'

# --------------------------------------------------------------------------
# 7. 🗺️ 階層ナビゲーション (Floor Master)
# --------------------------------------------------------------------------

class FanzaFloorNavigationAPIView(views.APIView):
    """
    Next.jsのサイドメニューを動的に生成するためのエンドポイント。
    FanzaFloorMasterSerializer を使用して正規化された階層データを返却。
    """
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        # サービス・フロア階層をすべて取得
        floors = FanzaFloorMaster.objects.filter(is_active=True).order_by('site_code', 'service_code', 'id')
        
        # アダルト用シリアライザーを使用
        serializer = FanzaFloorMasterSerializer(floors, many=True)
        
        return Response({
            "officialHierarchy": serializer.data
        }, status=status.HTTP_200)

# --- ファイルの末尾に、行頭（スペースなし）から貼り付けてください ---

# --- ファイルの末尾に、行頭（スペースなし）から貼り付けてください ---

import json
import requests
from django.http import StreamingHttpResponse
from django.shortcuts import get_object_or_404
from urllib.parse import unquote
from rest_framework import views
from rest_framework.permissions import AllowAny

# 💡 ヒント: PCProductが別ファイルにある場合はインポートが必要ですが、
# 同ファイル内にある前提、または既存のviews.pyの末尾ならそのままでOKです。

class PCProductMaidStreamView(views.APIView):
    """
    指定された製品(unique_id)に対して、Ollama(Gemma 3)を使用して
    リアルタイムにメイド接客文を生成・ストリーミングするView
    """
    permission_classes = [AllowAny]

    def get(self, request, unique_id):
        # 1. データベースから製品情報を取得（URLデコード済み）
        product = get_object_or_404(PCProduct, unique_id=unquote(unique_id))
        
        # 2. AIへの指示文（プロンプト）
        prompt = f"""
あなたはアキバのPCショップ「BIC STATION」の看板娘です。
以下のPCの魅力を、メイドさんらしく情熱的に10行以内で語ってください。
語尾は「〜だよ」「〜かな」。最後は必ず猫の鳴き声「ニャン！」で締めて。

【商品名】: {product.name}
【価格】: {product.price}円
【CPUスコア】: {product.score_cpu}/100
【特徴】: {"AI PC対応！最新のNPU搭載だよ" if product.is_ai_pc else "質実剛健で使いやすいよ"}
"""

        # 3. ストリーミング生成用の内部関数
        def stream_generator():
            # ブラウザへの初期レスポンス
            yield "……あ、お客様！今おすすめのポイントをまとめますね！少々お待ちを……🐾\n\n"

            # 💡 修正ポイント: 先ほど curl で成功した「確実なルート」を使用
            url = "http://172.17.0.1:11434/api/generate"
            
            # 💡 修正ポイント: 余計な空白が入らないよう strip() を追加
            payload = {
                "model": "gemma3:4b",
                "prompt": prompt.strip(),
                "stream": True
            }
            
            try:
                # 💡 修正ポイント: requestsのタイムアウトを適切に設定
                response = requests.post(
                    url, 
                    json=payload, 
                    stream=True, 
                    timeout=(5, 60) # (接続タイムアウト, 読み取りタイムアウト)
                )
                
                if response.status_code != 200:
                    yield f"【Ollama Error】ステータス: {response.status_code} ニャン…\n"
                    yield f"詳細: {response.text[:100]}"
                    return

                # 逐次トークンを取得して返却
                for line in response.iter_lines():
                    if line:
                        chunk = json.loads(line.decode('utf-8'))
                        token = chunk.get('response', '')
                        
                        if token:
                            yield token
                        
                        if chunk.get('done'):
                            break
                            
            except requests.exceptions.ConnectionError:
                yield "\n\n【通信エラー】Ollamaの門が閉まっているみたいニャ… sudo systemctl restart ollama を試してほしいニャ！"
            except Exception as e:
                yield f"\n\n【システムエラー】予期せぬエラーが発生したニャ… {str(e)}"

        # 4. ストリーミングレスポンスを返却
        return StreamingHttpResponse(
            stream_generator(), 
            content_type='text/plain; charset=utf-8'
        )