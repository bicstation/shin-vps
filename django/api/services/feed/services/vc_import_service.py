# =========================================================
# FILE:
# api/services/feed/services/vc_import_service.py
# =========================================================

from types import SimpleNamespace
from django.utils import timezone

from api.models.pc_products import PCProduct
from api.services.feed.normalizers.pc_feed_normalizer import PCFeedNormalizer
from api.services.feed.builders.pc_product_builder import PCProductBuilder
from api.services.feed.semantic.builders.semantic_builder import AsusSemanticBuilder
from api.services.feed.semantic.builders.semantic_runtime_builder import SemanticRuntimeBuilder


class ValueCommerceImportService:

    def __init__(self):
        self.normalizer = PCFeedNormalizer()
        self.builder = PCProductBuilder()
        self.semantic_builder = AsusSemanticBuilder()
        self.runtime_builder = SemanticRuntimeBuilder()

    def import_contract(self, contract):

        data = contract["data"]
        options = contract["import_options"]

        identity = data.get("identity", {})
        commerce = data.get("commerce", {})
        raw = data.get("raw", {})

        source = SimpleNamespace(

            sku=identity.get("sku") or raw.get("productCode") or raw.get("modelCode") or "",
            jan=identity.get("jan") or raw.get("janCode") or "",
            maker=identity.get("maker") or raw.get("brand_name") or "",
            brand=identity.get("brand") or raw.get("brand_name") or "",
            model=identity.get("model") or raw.get("modelCode") or "",
            product_name=identity.get("name") or raw.get("title") or "",

            image_url=commerce.get("image_url") or raw.get("imageFree", {}).get("url", ""),
            product_url=commerce.get("product_url") or raw.get("guid") or "",
            affiliate_url=commerce.get("affiliate_url") or raw.get("link") or "",

            price=commerce.get("price") or raw.get("price") or 0,
            currency="JPY",
            availability=commerce.get("availability") or raw.get("stock") or "",

            description=raw.get("description", ""),
            category=raw.get("category", ""),
            raw_json=raw,
        )

        normalized = self.normalizer.normalize(source, data)

        payload = self.builder.build(
            normalized=normalized,
            maker=options["maker"],
            prefix=options["prefix"],
        )

        semantic_payload = self.semantic_builder.build(
            type("SemanticObject", (), payload)()
        )

        payload.update(semantic_payload)

        runtime_payload = self.runtime_builder.build(semantic_payload)
        payload.update(runtime_payload)

        payload["semantic_runtime"] = {
            "product_type": semantic_payload.get("product_type"),
            "target_segment": semantic_payload.get("target_segment"),
            "is_ai_pc": semantic_payload.get("is_ai_pc"),
            "semantic_labels": runtime_payload.get("semantic_labels", []),
            "workflow_tags": runtime_payload.get("workflow_tags", []),
            "runtime_profiles": runtime_payload.get("runtime_profiles", []),
        }

        payload["semantic_schema_version"] = 1
        payload["semantic_updated_at"] = timezone.now()
        payload["affiliate_updated_at"] = timezone.now()

        obj, created = PCProduct.objects.update_or_create(
            unique_id=payload["unique_id"],
            defaults=payload,
        )

        return {
            "created": created,
            "product": obj,
            "payload": payload,
        }