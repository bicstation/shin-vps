# -*- coding: utf-8 -*-
# api/services/semantic/v2/presentation/presentation_runtime.py

# ==========================================================
# IMPORT
# ==========================================================

from api.services.semantic.v2.authority.slug_metadata import (
    get_slug,
)


# ==========================================================
# SLUG PRESENTATION
# ==========================================================

def build_slug_presentation(

    slug,

    default_title,

    default_subtitle,

    default_description,

):

    metadata = {}

    if slug:

        metadata = (
            get_slug(slug)
            or {}
        )

    return {

        # --------------------------------------------------
        # Identity
        # --------------------------------------------------

        "slug":
            metadata.get(
                "slug",
                slug,
            ),

        "name":
            metadata.get(
                "name",
                "",
            ),

        # --------------------------------------------------
        # Presentation
        # --------------------------------------------------

        "title":
            metadata.get(
                "title",
                default_title,
            ),

        "subtitle":
            metadata.get(
                "subtitle",
                default_subtitle,
            ),

        "description":
            metadata.get(
                "description",
                default_description,
            ),

        # --------------------------------------------------
        # SEO
        # --------------------------------------------------

        "seo_title":
            metadata.get(
                "seo_title",
                "",
            ),

        "seo_description":
            metadata.get(
                "seo_description",
                "",
            ),

        "canonical_path":
            metadata.get(
                "canonical_path",
                "",
            ),

        "schema_type":
            metadata.get(
                "schema_type",
                "",
            ),

        # --------------------------------------------------
        # Presentation Theme
        # --------------------------------------------------

        "icon_key":
            metadata.get(
                "icon_key",
                "",
            ),

        "theme_key":
            metadata.get(
                "theme_key",
                "",
            ),

        "color_key":
            metadata.get(
                "color_key",
                "",
            ),

        # --------------------------------------------------
        # OGP
        # --------------------------------------------------

        "og_title":
            metadata.get(
                "og_title",
                "",
            ),

        "og_description":
            metadata.get(
                "og_description",
                "",
            ),

        "og_image":
            metadata.get(
                "og_image",
                "",
            ),

        # --------------------------------------------------
        # Runtime
        # --------------------------------------------------

        "priority":
            metadata.get(
                "priority",
                "",
            ),

        "visibility":
            metadata.get(
                "visibility",
                "",
            ),

        "is_adult":
            metadata.get(
                "is_adult",
                "0",
            ),
    }


# ==========================================================
# TOP
# ==========================================================

def build_top_presentation():

    return {

        "title":
            "SHIN CORE LINX",

        "subtitle":
            "あなたに最適なPCを見つける",

        "description":
            (
                "AI・ゲーミング・ビジネス・クリエイティブなど"
                "目的に合わせたPC選びをサポートします。"
            ),
    }


# ==========================================================
# DISCOVERY
# ==========================================================

def build_discovery_presentation(

    slug=None,

):

    return build_slug_presentation(

        slug=slug,

        default_title=
            "PCを探す",

        default_subtitle=
            "目的から最適なカテゴリーを選ぶ",

        default_description=
            (
                "用途や目的に応じたカテゴリから"
                "最適なPCを探すことができます。"
            ),
    )



# ==========================================================
# RANKING
# ==========================================================

def build_ranking_presentation(

    group_slug=None,

):

    return build_slug_presentation(

        slug=group_slug,

        default_title=
            "PCランキング",

        default_subtitle=
            "目的に合わせたおすすめPC",

        default_description=
            (
                "用途ごとにおすすめのPCを"
                "ランキング形式で比較できます。"
            ),
    )


# ==========================================================
# FINDER
# ==========================================================

def build_finder_presentation():

    return {

        "title":
            "PCファインダー",

        "subtitle":
            "条件から最適なPCを見つける",

        "description":
            (
                "予算や用途などの条件から"
                "あなたに合ったPCを探せます。"
            ),
    }


# ==========================================================
# PRODUCT
# ==========================================================

def build_product_presentation():

    return {

        "title":
            "製品詳細",

        "subtitle":
            "製品情報を詳しく確認",

        "description":
            (
                "スペックや価格、特徴など"
                "製品の詳細情報を確認できます。"
            ),
    }


# ==========================================================
# RELATED
# ==========================================================

def build_related_presentation():

    return {

        "title":
            "関連製品",

        "subtitle":
            "似ているPCを比較する",

        "description":
            (
                "近い特徴を持つPCを比較し"
                "より最適な製品を見つけられます。"
            ),
    }


# ==========================================================
# INVENTORY
# ==========================================================

def build_inventory_presentation():

    return {

        "title":
            "PC商品一覧",

        "subtitle":
            "公開中のPCを一覧から探す",

        "description":
            (
                "公開中のPCをメーカー・価格・スペックなどから"
                "一覧で比較できます。"
            ),
    }



