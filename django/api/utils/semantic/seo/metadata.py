# =========================================================
# SHIN CORE LINX｜Semantic SEO Metadata Runtime
# /api/utils/semantic/seo/metadata.py
# =========================================================


# =========================================================
# Generate Semantic Metadata
# =========================================================

def generate_semantic_metadata(
    attribute
):

    slug = attribute.slug

    name = attribute.name

    attr_type = attribute.attr_type


    # =====================================================
    # Default
    # =====================================================

    title = f"{name}おすすめランキング"

    description = (
        f"{name}の人気PC・おすすめモデルを"
        f"比較できるランキングページです。"
    )


    # =====================================================
    # Usage
    # =====================================================

    if attr_type == "usage":

        title = (
            f"{name}向けおすすめPCランキング"
        )

        description = (
            f"{name}用途におすすめな"
            f"高性能PCを比較できます。"
        )


    # =====================================================
    # GPU
    # =====================================================

    elif attr_type == "gpu":

        title = (
            f"{name}搭載PCおすすめランキング"
        )

        description = (
            f"{name}を搭載した"
            f"高性能PC・ゲーミングPCを"
            f"比較できます。"
        )


    # =====================================================
    # CPU
    # =====================================================

    elif attr_type == "cpu":

        title = (
            f"{name}搭載おすすめPCランキング"
        )

        description = (
            f"{name}を搭載した"
            f"人気PCを比較できます。"
        )


    return {

        "title": title,

        "description": description,

        "canonical": (
            f"/ranking/{slug}/"
        ),
    }