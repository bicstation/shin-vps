# /home/maya/shin-vps/django/visualization/generators/projection/projection_loader.py

# /home/maya/shin-vps/django/visualization/generators/projection/projection_loader.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Projection Loader

============================================================

Reality

        ↓

Projection Source

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from api.models import Product

# --------------------------------------------------
# Load Products
# --------------------------------------------------

def load_products():

    """
    Projection対象となる全商品を取得する
    """

    return Product.objects.all()


# --------------------------------------------------
# Load Product
# --------------------------------------------------

def load_product(

    unique_id,

):

    """
    単一商品の取得
    """

    return (

        Product.objects
        .filter(
            unique_id=unique_id,
        )
        .first()

    )


# --------------------------------------------------
# Load Active Products
# --------------------------------------------------

def load_active_products():

    """
    有効商品のみ取得
    """

    return (

        Product.objects
        .filter(
            is_active=True,
        )

    )


# --------------------------------------------------
# Load Products By Brand
# --------------------------------------------------

def load_products_by_brand(

    brand,

):

    """
    ブランド別商品取得
    """

    return (

        Product.objects
        .filter(
            brand=brand,
        )

    )


# --------------------------------------------------
# Load Products By Category
# --------------------------------------------------

def load_products_by_category(

    category,

):

    """
    カテゴリ別商品取得
    """

    return (

        Product.objects
        .filter(
            category=category,
        )

    )