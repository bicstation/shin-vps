# -*- coding: utf-8 -*-
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.decorators.csrf import csrf_exempt
import logging
from api.serializers import UserSerializer

logger = logging.getLogger(__name__)
User = get_user_model()

@csrf_exempt
@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    site_group = request.data.get('site_group', 'general')
    origin_domain = request.data.get('origin_domain', '')

    if not username or not password or not email:
        return Response({"detail": "ユーザー名、メールアドレス、パスワードは必須です。"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({"detail": "このユーザー名は既に存在します。"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            site_group=site_group,
            origin_domain=origin_domain
        )
        serializer = UserSerializer(user)
        logger.info(f"New user created: {username}")
        return Response({
            "message": "User registered successfully",
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
    username = request.data.get('username')
    password = request.data.get('password')
    
    logger.info(f"Login attempt for user: {username}")
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        login(request, user)
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
        }, status=401)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return Response({"message": "Successfully logged out", "status": "success"})

@api_view(['GET', 'PATCH'])
@permission_classes([IsAuthenticated])
def get_user_view(request):
    user = request.user
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    elif request.method == 'PATCH':
        serializer = UserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)