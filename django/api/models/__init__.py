# -*- coding: utf-8 -*-
# api/models/__init__.py

from .raw_and_entities import RawApiData, Maker, Label, Genre, Actress, Director, Series, EntityBase

# ✅ ここを修正！ AdultAttribute を追加
from .adult_products import AdultProduct, AdultAttribute 

from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 💡 PC製品用モデルと、属性モデル、価格履歴モデルをインポート
from .pc_products import PCProduct, PCAttribute, PriceHistory

from .users import User