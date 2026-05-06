from api.models import PCAttribute


def match_attribute(text, attr_type):

    if not text:
        return None

    text = text.lower()

    attrs = PCAttribute.objects.filter(
        attr_type=attr_type,
        # is_active=True
    ).order_by("-order")

    for attr in attrs:

        keywords = (attr.search_keywords or "").split(",")

        for kw in keywords:

            kw = kw.strip().lower()

            if not kw:
                continue

            if kw in text:
                return attr

    return None