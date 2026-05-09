from api.models import PCAttribute


# =========================================================
# Semantic Attribute Matcher
# =========================================================
def match_attribute(text, attr_type):

    # =====================================================
    # Empty Safe
    # =====================================================
    if not text:
        return None

    # =====================================================
    # Normalize Input
    # =====================================================
    text = str(text).strip().lower()

    if not text:
        return None

    # =====================================================
    # Load Attributes
    # =====================================================
    attrs = (
        PCAttribute.objects
        .filter(
            attr_type=attr_type,
            # is_active=True
        )
        .order_by("-order")
    )

    # =====================================================
    # Keyword Match
    # =====================================================
    for attr in attrs:

        keywords = (
            attr.search_keywords or ""
        ).split(",")

        for kw in keywords:

            # ---------------------------------------------
            # Normalize Keyword
            # ---------------------------------------------
            kw = (
                kw.strip()
                .lower()
            )

            if not kw:
                continue

            # ---------------------------------------------
            # Match
            # ---------------------------------------------
            if kw in text:
                return attr

    # =====================================================
    # No Match
    # =====================================================
    return None