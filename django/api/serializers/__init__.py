# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/serializers/__init__.py

# 👤 認証系 (register, login, user_profile)
from .auth_serializers import UserSerializer

# 💻 PC・ソフトウェア・共通マスタ系 (PCProduct, Actress, Genre, etc.)
# 💡 master_serializers は general_serializers に統合済みのためコメントアウトでOK
# from .master_serializers import * from .general_serializers import *

# 🔞 アダルト・統合ゲートウェイ系 (AdultProduct, FanzaProduct, Navigation)
from .adult_serializers import *

# 💡 ここが足りなかったためにエラーになっていました
from .general_serializers import (
    PriceHistorySerializer,
    LinkshareProductSerializer,
    PCProductSerializer
)
from .bs_device_serializers import (
    BSCarrierSerializer,
    BSMobilePlanSerializer,
    BSDeviceSerializer,
    BSDeviceColorSerializer,
    BSDevicePriceSerializer
)