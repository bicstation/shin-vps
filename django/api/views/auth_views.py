# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/auth_views.py

import logging
from django.contrib.auth import authenticate, get_user_model
from django.views.decorators.csrf import csrf_exempt

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

# 🔥 JWT
from rest_framework_simplejwt.tokens import RefreshToken

# Serializer
from api.serializers import UserSerializer

logger = logging.getLogger(__name__)
User = get_user_model()

# ==========================================================
# 🛠️ サイトグループ判定
# ==========================================================
def get_current_site_group(request):
    site_type = getattr(request, 'site_type', 'station')
    return 'adult' if site_type == 'adult' else 'general'

# ==========================================================
# 👤 ユーザー登録
# ==========================================================
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):

    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')

    current_group = get_current_site_group(request)
    origin_domain = request.get_host()

    if not username or not password or not email:
        return Response(
            {"detail": "ユーザー名、メールアドレス、パスワードは必須です。"},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {"detail": "このユーザー名は既に存在します。"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            site_group=current_group,
            origin_domain=origin_domain
        )

        serializer = UserSerializer(user)

        return Response({
            "message": f"Successfully registered to {current_group}",
            "user": serializer.data
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(str(e))
        return Response({"detail": str(e)}, status=400)

# ==========================================================
# 🔐 ログイン（JWT版）
# ==========================================================
@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
@authentication_classes([])
def login_view(request):

    username = request.data.get('username')
    password = request.data.get('password')

    current_group = get_current_site_group(request)

    logger.info(f"Login attempt: {username} ({current_group})")

    # ✅ 正しい認証（ここ超重要）
    user = authenticate(request, username=username, password=password)

    if user is None:
        return Response({
            "status": "error",
            "error": "ユーザー名またはパスワードが正しくありません"
        }, status=401)

    # 🔥 グループチェック（必要なら有効化）
    # user_group = getattr(user, 'site_group', 'general')
    # if user_group != current_group:
    #     return Response({
    #         "status": "error",
    #         "error": "このサイトでは利用できません"
    #     }, status=403)

    # ==========================================================
    # 🔥 JWT生成（ここが核心）
    # ==========================================================
    refresh = RefreshToken.for_user(user)

    serializer = UserSerializer(user, context={'request': request})

    return Response({
        "status": "success",
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": serializer.data
    })

# ==========================================================
# 🚪 ログアウト（JWTは削除不要）
# ==========================================================
@api_view(['POST'])
def logout_view(request):
    return Response({
        "status": "success"
    })

# ==========================================================
# 👤 ユーザー取得・更新
# ==========================================================
@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_view(request):

    user = request.user

    if request.method == 'GET':
        serializer = UserSerializer(user, context={'request': request})
        return Response(serializer.data)

    elif request.method == 'PATCH':
        serializer = UserSerializer(
            user,
            data=request.data,
            partial=True,
            context={'request': request}
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=400)