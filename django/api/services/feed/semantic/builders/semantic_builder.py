# =========================================================
# FILE:
# api/services/feed/semantic/builders/semantic_builder.py
# =========================================================

from api.services.feed.semantic.rules.semantic_rules import SEMANTIC_RULES


class SemanticBuilder:

    def build(self, product):

        search_text = (
            f"{product.name or ''}\n{product.description or ''}"
        ).lower()

        payload = {
            "product_type": None,
            "target_segment": None,
            "usage_tags": [],
            "is_ai_pc": False,
        }

        for rule in SEMANTIC_RULES:

            if self.match_rule(rule, product.maker, search_text):
                self.apply_rule(payload, rule)

        return payload

    # =====================================================
    # MATCH RULE
    # =====================================================

    def match_rule(self, rule, maker, text):

        rule_maker = rule.get("maker", "*")

        if rule_maker not in ("*", maker):
            return False

        return any(
            keyword.lower() in text
            for keyword in rule.get("match", [])
        )

    # =====================================================
    # APPLY RULE
    # =====================================================

    def apply_rule(self, payload, rule):

        if rule.get("product_type"):
            payload["product_type"] = rule["product_type"]

        if rule.get("target_segment"):
            payload["target_segment"] = rule["target_segment"]

        payload["is_ai_pc"] |= rule.get("is_ai_pc", False)

        for tag in rule.get("usage_tags", []):

            if tag not in payload["usage_tags"]:
                payload["usage_tags"].append(tag)