# =========================================================
# FILE:
# api/services/feed/services/pc_import_service.py
# =========================================================

from django.utils import timezone

from acquisition.integration.pipeline import (
    IntegrationPipeline,
)

from api.models.pc_products import PCProduct
from api.services.feed.normalizers.pc_feed_normalizer import (
    PCFeedNormalizer,
)
from api.services.feed.parsers.linkshare_feed_parser import (
    LinkshareFeedParser,
)
from api.services.feed.semantic.builders.semantic_builder import (
    SemanticBuilder,
)
from api.services.feed.semantic.builders.semantic_runtime_builder import (
    SemanticRuntimeBuilder,
)


class PCImportService:

    # =====================================================
    # INIT
    # =====================================================

    def __init__(self):

        self.parser = LinkshareFeedParser()
        self.normalizer = PCFeedNormalizer()

        #
        # Acquisition Integration Pipeline
        #

        self.pipeline = IntegrationPipeline()

        #
        # Semantic Runtime
        #

        self.semantic_builder = SemanticBuilder()
        self.runtime_builder = SemanticRuntimeBuilder()

    # =====================================================
    # IMPORT
    # =====================================================

    def import_product(

        self,
        source,
        maker,
        prefix,

    ):

        parsed = (
            self.parser.parse(
                source
            )
        )

        normalized = (
            self.normalizer.normalize(
                source,
                parsed,
            )
        )

        #
        # Acquisition Pipeline
        #

        payload = (

            self.pipeline.build_payload(

                normalized=normalized,
                maker=maker,
                prefix=prefix,

            )

        )
        # =====================================================
        # DEBUG :: PRICE TRACE
        # =====================================================

        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: PIPELINE")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"unique_id        : {payload.get('unique_id')}")
        print(f"product_no       : {payload.get('product_no')}")
        print(f"name             : {payload.get('name')}")
        print(f"price            : {payload.get('price')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()
        

        # =====================================================
        # Semantic Runtime
        # =====================================================

        semantic_payload = (

            self.semantic_builder.build(

                type(
                    "SemanticObject",
                    (),
                    payload,
                )()

            )

        )
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: AFTER SEMANTIC")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"payload.price    : {payload.get('price')}")
        print(f"semantic.price   : {semantic_payload.get('price', '<none>')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()
        
        

        payload.update(
            semantic_payload
        )
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: AFTER UPDATE(SEMANTIC)")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"payload.price    : {payload.get('price')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()

        runtime_payload = (

            self.runtime_builder.build(
                semantic_payload
            )

        )
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: AFTER RUNTIME")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"payload.price    : {payload.get('price')}")
        print(f"runtime.price    : {runtime_payload.get('price', '<none>')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()

        payload.update(
            runtime_payload
        )
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: AFTER UPDATE(RUNTIME)")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"payload.price    : {payload.get('price')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()

        payload["semantic_runtime"] = {

            "product_type":
                semantic_payload.get(
                    "product_type"
                ),

            "target_segment":
                semantic_payload.get(
                    "target_segment"
                ),

            "is_ai_pc":
                semantic_payload.get(
                    "is_ai_pc"
                ),

            "semantic_labels":
                runtime_payload.get(
                    "semantic_labels",
                    [],
                ),

            "workflow_tags":
                runtime_payload.get(
                    "workflow_tags",
                    [],
                ),

            "runtime_profiles":
                runtime_payload.get(
                    "runtime_profiles",
                    [],
                ),

        }

        payload["semantic_schema_version"] = 1

        payload["semantic_updated_at"] = (
            timezone.now()
        )

        # Semantic Runtime は compile_semantic_runtime が正式生成する
        # payload["semantic_runtime_compiled"] = True

        payload["affiliate_updated_at"] = timezone.now()

        # =====================================================
        # Persist
        # =====================================================
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: BEFORE SAVE")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"unique_id        : {payload.get('unique_id')}")
        print(f"product_no       : {payload.get('product_no')}")
        print(f"price            : {payload.get('price')}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()

        obj, created = (

            PCProduct.objects.update_or_create(

                unique_id=payload[
                    "unique_id"
                ],

                defaults=payload,

            )

        )
        
        print()
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print("💰 PRICE TRACE :: AFTER SAVE")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print(f"payload.price    : {payload.get('price')}")
        print(f"model.price      : {obj.price}")
        print(f"created          : {created}")
        print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        print()

        return {

            "created":
                created,

            "product":
                obj,

            "payload":
                payload,

        }

    # =====================================================
    # BULK IMPORT
    # =====================================================

    def import_queryset(

        self,
        queryset,
        maker,
        prefix,

    ):

        created_count = 0
        updated_count = 0
        error_count = 0

        for source in queryset.iterator():

            try:

                result = (

                    self.import_product(

                        source=source,
                        maker=maker,
                        prefix=prefix,

                    )

                )

                if result["created"]:
                    created_count += 1
                else:
                    updated_count += 1

            except Exception:

                error_count += 1

        return {

            "created":
                created_count,

            "updated":
                updated_count,

            "errors":
                error_count,

        }