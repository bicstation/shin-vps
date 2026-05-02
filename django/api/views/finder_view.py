# /home/maya/shin-vps/django/api/views/finder_view.py

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

import traceback

from api.services.finder_engine import recommend_product


# =========================
# デバッグ切り替え
# =========================
DEBUG_MODE = True  # 本番では False


# =========================
# 画像URL生成（超重要）
# =========================
def build_image_url(product, request):
    """
    画像URLを安全に生成する
    - ローカル画像優先
    - 外部URL fallback
    - docker内部URLを排除
    """

    base_url = f"{request.scheme}://{request.get_host()}"

    try:
        # -------------------------
        # ローカル画像
        # -------------------------
        if product.image_local:
            return f"{base_url}/media/{product.image_local}"

        # -------------------------
        # サムネイルURL
        # -------------------------
        if product.thumbnail_url:
            return product.thumbnail_url.replace(
                "http://django-v3:8000",
                base_url
            )

        # -------------------------
        # 外部画像
        # -------------------------
        if product.image_source:
            return product.image_source

    except Exception:
        pass

    return ""


@api_view(['POST'])
@permission_classes([AllowAny])
def finder_recommend(request):
    """
    PC Finder API
    3つの入力から最適な1台を返す
    """

    # -------------------------
    # 入力取得（デフォルト付き）
    # -------------------------
    use = request.data.get('use') or 'light'
    level = request.data.get('level') or 'low'
    priority = request.data.get('priority') or 'price'

    # -------------------------
    # バリデーション
    # -------------------------
    valid_use = ['light', 'work', 'gaming']
    valid_level = ['low', 'high']
    valid_priority = ['price', 'performance']

    if use not in valid_use:
        return Response({"error": f"Invalid use: {use}"}, status=400)

    if level not in valid_level:
        return Response({"error": f"Invalid level: {level}"}, status=400)

    if priority not in valid_priority:
        return Response({"error": f"Invalid priority: {priority}"}, status=400)

    # -------------------------
    # コア処理
    # -------------------------
    try:
        product, reasons = recommend_product(use, level, priority)

    except Exception as e:
        traceback.print_exc()

        if DEBUG_MODE:
            return Response({
                "error": str(e),
                "type": str(type(e)),
                "use": use,
                "level": level,
                "priority": priority,
            }, status=500)

        return Response({
            "error": "Internal server error"
        }, status=500)

    # -------------------------
    # データなし
    # -------------------------
    if not product:
        return Response({
            "error": "No product found",
            "input": {
                "use": use,
                "level": level,
                "priority": priority
            }
        }, status=404)

    # -------------------------
    # URL安全取得
    # -------------------------
    product_url = getattr(product, "affiliate_url", None) or ""

    # -------------------------
    # 画像URL生成
    # -------------------------
    image_url = build_image_url(product, request)

    # -------------------------
    # 正常レスポンス
    # -------------------------
    return Response({
        "product": {
            "id": product.id,
            "title": product.title or "",
            "url": product_url,
            "price": product.price or 0,
            "image": image_url,
        },
        "reasons": reasons or [],
        "debug": {
            "use": use,
            "level": level,
            "priority": priority,
        } if DEBUG_MODE else None
    })