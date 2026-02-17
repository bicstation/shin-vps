# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/auth_views.py

import logging
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# 💡 api/serializers.py に定義されている UserSerializer を使用
from api.serializers import UserSerializer

# ロガー設定
logger = logging.getLogger(__name__)
User = get_user_model()

# --------------------------------------------------------------------------
# 🛠️ 内部ユーティリティ
# --------------------------------------------------------------------------

def get_current_site_group(request):
    """
    ミドルウェアが判定した site_type に基づき、
    ユーザーが所属すべきグループ ('general' または 'adult') を返す内部関数。
    """
    # ミドルウェアで付与された site_type を取得（デフォルトは station = general）
    site_type = getattr(request, 'site_type', 'station')
    
    # adult系ドメイン・パスの場合は 'adult' グループ、それ以外（station/saving）は 'general'
    if site_type == 'adult':
        return 'adult'
    else:
        return 'general'

# --------------------------------------------------------------------------
# 👤 ユーザー認証 View
# --------------------------------------------------------------------------

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    ユーザー登録。アクセス元のドメイン/パスに基づき、
    自動的に 'general' または 'adult' のグループ属性を付与する。
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # ミドルウェアの判定から所属グループを自動決定（セキュリティ上、クライアントの申告は無視）
    current_group = get_current_site_group(request)
    origin_domain = request.get_host()

    # 必須入力チェック
    if not username or not password or not email:
        return Response(
            {"detail": "ユーザー名、メールアドレス、パスワードは必須です。"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    # ユーザー名の重複チェック
    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "このユーザー名は既に存在します。"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Userモデルのカスタムフィールド site_group, origin_domain を利用
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            site_group=current_group,
            origin_domain=origin_domain
        )
        
        serializer = UserSerializer(user)
        logger.info(f"New {current_group} user created: {username} via {origin_domain}")
        
        return Response({
            "message": f"Successfully registered to {current_group} group.",
            "user": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_view(request):
    """
    ログイン処理。認証後、ユーザーの所属グループ(site_group)が
    現在のアクセス環境と一致するかを厳密にチェックする。
    """
    username = request.data.get('username')
    password = request.data.get('password')
    
    # 現在のドメインが要求するグループ（サイト種別）を取得
    current_group = get_current_site_group(request)
    
    logger.info(f"Login attempt for user: {username} on group: {current_group}")
    
    # 1. ユーザー名とパスワードの認証
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        # 2. 💡 重要：グループの一致検証
        user_site_group = getattr(user, 'site_group', 'general')
        
        if user_site_group != current_group:
            logger.warning(
                f"Cross-site login blocked: User '{username}' (Group:{user_site_group}) "
                f"tried to login on {current_group} site."
            )
            return Response({
                "status": "error",
                "hasAccess": False,
                "error": "このアカウントは現在のサイトでは利用できません（グループが異なります）。"
            }, status=status.HTTP_403_FORBIDDEN)

        # 3. セッションにログイン情報を記録
        login(request, user)
        
        # UserSerializerにcontextを渡し、Next.js側で必要な画像URL等を完全修飾可能にする
        serializer = UserSerializer(user, context={'request': request})
        
        return Response({
            "status": "success",
            "hasAccess": True,
            "user": serializer.data
        })
    else:
        logger.warning(f"Failed login attempt for user: {username}")
        return Response({
            "status": "error",
            "hasAccess": False,
            "error": "ユーザー名またはパスワードが正しくありません。"
        }, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
def logout_view(request):
    """
    ログアウト処理。
    """
    logout(request)
    return Response({
        "message": "Successfully logged out", 
        "status": "success"
    })


@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_view(request):
    """
    ログイン中のユーザー情報取得および更新。
    """
    user = request.user
    
    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)
        
    elif request.method == 'PATCH':
        # partial=True により、変更したいフィールドのみ送信すればOK（例：メールだけ更新等）
        serializer = UserSerializer(user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)