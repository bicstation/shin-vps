# -*- coding: utf-8 -*-
# /home/maya/dev/shin-vps/django/api/models/__init__.py

from .raw_and_entities import RawApiData, Maker, Label, Genre, Actress, Director, Series, EntityBase

# 分割した新しいファイルから個別にインポート
from .adult_products import AdultProduct
from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 💡 PC製品用モデルと、属性モデル、価格履歴モデルをインポート
# 👤 実際のコードは pc_products.py 内に User と ProductComment があるため、ここからインポートします
from .pc_products import (
    PCProduct, 
    PCAttribute, 
    PriceHistory, 
    User,            # 👤 追加: カスタムユーザーモデル
    ProductComment   # 💬 追加: 製品コメントモデル
)

# 🚀 ランキング推移・統計用モデルを追加
from .pc_stats import ProductDailyStats