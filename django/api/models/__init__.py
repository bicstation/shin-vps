# -*- coding: utf-8 -*-
# api/models/__init__.py

from .raw_and_entities import RawApiData, Maker, Label, Genre, Actress, Director, Series, EntityBase

# 分割した新しいファイルから個別にインポート
from .adult_products import AdultProduct
from .linkshare_products import LinkshareProduct
from .linkshare_api_product import LinkshareApiProduct
from .bc_linkshare_products import BcLinkshareProduct

# 💡 PC製品用モデルと、属性モデル、価格履歴モデルをインポート
# ここに含めることで makemigrations が正常に動作します
from .pc_products import PCProduct, PCAttribute, PriceHistory

from .users import User  # users.pyからUserクラスを読み込む