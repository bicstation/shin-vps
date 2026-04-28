"""
Bic-v2 API Serializers Definition
各モジュールで定義されたシリアライザーを統合し、外部（Views）から参照可能にします。
"""

# 👤 1. 認証・ユーザー系
from .auth_serializers import UserSerializer

# 💻 2. 一般・PC・アフィリエイト・マスタ系
from .general_serializers import *

# 🔞 3. アダルト・統合ゲートウェイ系
from .adult_serializers import *

# 📱 4. Bic-saving（通信・スマホ節約）系
from .bs_device_serializers import *

# 📝 5. 統合配信コンテンツ管理（Article / ContentHub）
from .article_serializer import ArticleSerializer
from .contenthub_serializer import ContentHubSerializer, ContentHubListSerializer

# ==============================================================================
# 6. 統合プロダクト（表示用・ランキング基盤）
# ==============================================================================
from .product_serializer import ProductSerializer