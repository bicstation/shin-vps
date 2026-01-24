# -*- coding: utf-8 -*-
# api/models/__init__.py

from .raw_and_entities import RawApiData, Maker, Label, Genre, Actress, Director, Series, EntityBase

# 分割した新しいファイルから個別にインポート
from .adult_products import AdultProduct
from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 💡 PC製品用モデルと、属性モデル、価格履歴モデルをインポート
from .pc_products import PCProduct, PCAttribute, PriceHistory

# 🚀 【追記】ランキング推移・統計用モデルを追加
from .pc_stats import ProductDailyStats