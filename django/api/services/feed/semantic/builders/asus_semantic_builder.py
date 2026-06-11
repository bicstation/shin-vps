# =========================================================
# FILE:
# api/services/feed/semantic/builders/asus_semantic_builder.py
# =========================================================

from api.services.feed.semantic.rules.semantic_rules import (
    SEMANTIC_RULES,
)


class AsusSemanticBuilder:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        product,

    ):

        name = str(
            product.name or ""
        ).lower()

        description = str(
            product.description or ""
        ).lower()

        search_text = (
            f"{name}\n{description}"
        )

        payload = {

            "product_type":
                None,

            "target_segment":
                None,

            "usage_tags":
                [],

            "is_ai_pc":
                False,

        }

        for rule in SEMANTIC_RULES:

            if not self.match_rule(

                rule=rule,

                maker=product.maker,

                text=search_text,

            ):
                continue

            self.apply_rule(

                payload=payload,

                rule=rule,

            )

        return payload

    # =====================================================
    # MATCH RULE
    # =====================================================

    def match_rule(

        self,

        rule,

        maker,

        text,

    ):

        rule_maker = (
            rule.get(
                "maker"
            )
        )

        if (

            rule_maker != "*"

            and

            rule_maker != maker

        ):

            return False

        for keyword in (

            rule.get(
                "match",
                [],
            )

        ):

            if keyword.lower() in text:

                return True

        return False

    # =====================================================
    # APPLY RULE
    # =====================================================

    def apply_rule(

        self,

        payload,

        rule,

    ):

        if rule.get(
            "product_type"
        ):

            payload[
                "product_type"
            ] = rule[
                "product_type"
            ]

        if rule.get(
            "target_segment"
        ):

            payload[
                "target_segment"
            ] = rule[
                "target_segment"
            ]

        if rule.get(
            "is_ai_pc"
        ):

            payload[
                "is_ai_pc"
            ] = True

        for tag in (

            rule.get(
                "usage_tags",
                [],
            )

        ):

            if tag not in payload[
                "usage_tags"
            ]:

                payload[
                    "usage_tags"
                ].append(
                    tag
                )