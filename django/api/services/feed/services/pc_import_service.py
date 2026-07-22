# =========================================================
# FILE:
# api/services/feed/services/pc_import_service.py
# =========================================================

from django.utils import timezone
from api.models.pc_products import PCProduct
from api.services.feed.parsers.linkshare_feed_parser import ( LinkshareFeedParser,)
from api.services.feed.normalizers.pc_feed_normalizer import ( PCFeedNormalizer, )
from api.services.feed.builders.pc_product_builder import ( PCProductBuilder, )
from api.services.feed.semantic.builders.semantic_builder import ( SemanticBuilder,)
from api.services.feed.semantic.builders.semantic_runtime_builder import ( SemanticRuntimeBuilder,)


class PCImportService:

    # =====================================================
    # INIT
    # =====================================================


    def __init__(self):

        self.parser = ( LinkshareFeedParser()  )
        self.normalizer = ( PCFeedNormalizer() )
        self.builder = ( PCProductBuilder() )
        self.semantic_builder = ( SemanticBuilder() )
        self.runtime_builder = ( SemanticRuntimeBuilder() )

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

        payload = (

            self.builder.build(
                normalized=normalized,
                maker=maker,
                prefix=prefix,
            )
        )
        
        # print(payload)
        
        semantic_payload = (

            self.semantic_builder.build(
                type(
                    "SemanticObject",
                    (),
                    payload,
                )()

            )

        )

        payload.update(
            semantic_payload
        )
        
        runtime_payload = (
            self.runtime_builder.build(
                semantic_payload
            )

        )

        payload.update(
            runtime_payload
        )
        
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

        obj, created = (

            PCProduct.objects.update_or_create(

                unique_id=payload[
                    "unique_id"
                ],

                defaults=payload,

            )

        )

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