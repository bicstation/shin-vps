# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/__init__.py

"""
Bic-v2 API Serializers Definition
各モジュールで定義されたシリアライザーを統合し、外部（Views）から参照可能にします。
"""

# 👤 1. 認証・ユーザー系
from .auth_serializers import UserSerializer

# 💻 2. 一般・PC・アフィリエイト・マスタ系
# 💡 明示的インポートでエラーが出たため、ワイルドカードで安全に読み込みます
from .general_serializers import *

# 🔞 3. アダルト・統合ゲートウェイ系
from .adult_serializers import *

# 📱 4. Bic-saving（通信・スマホ節約）系
from .bs_device_serializers import *

# 📝 5. 【NEW】統合配信コンテンツ管理（Article）
from .article_serializer import ArticleSerializer

# ==============================================================================
# 💡 メモ: 
# ImportError (cannot import name 'MakerSerializer' 等) が発生した場合は、
# general_serializers.py 内のクラス名が正しいか、または定義されているか確認してください。
# 現状は '*' を使うことで、存在するクラスのみを安全に公開しています。
# ==============================================================================