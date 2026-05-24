# =========================================================
# SHIN CORE LINX
# auto_map_attributes_v2.py
# semantic orchestration stabilized edition
# =========================================================

from django.core.management.base import (
    BaseCommand
)

from django.db import transaction

from api.models import (

    PCProduct,

    PCAttribute,
)

from api.utils.semantic.runtime import (
    compile_semantic_runtime,
)

from api.utils.semantic.runtime.runtime_log import (
    runtime_log,
)

from api.utils.semantic.mapping.detect_memory import (
    detect_memory_attr,
)

from api.utils.semantic.mapping.detect_storage import (
    detect_storage_attr,
)

from api.utils.semantic.mapping.detect_features import (
    detect_pc_feature,
)

from api.utils.semantic.mapping.detect_usage import (
    detect_usage,
)


# =========================================================
# HELPERS
# =========================================================

def attach_attribute(

    product,

    slug,
):

    try:

        attr = PCAttribute.objects.get(
            slug=slug
        )

        product.attributes.add(
            attr
        )

    except PCAttribute.DoesNotExist:

        runtime_log(

            True,

            "ATTRIBUTE NOT FOUND",

            slug,
        )


# =========================================================
# COMMAND
# =========================================================

class Command(BaseCommand):

    help = (
        "Auto map semantic attributes V2"
    )

    # =====================================================
    # HANDLE
    # =====================================================

    def handle(

        self,

        *args,

        **options,
    ):

        # =================================================
        # START
        # =================================================

        runtime_log(

            True,

            "AUTO MAP ATTRIBUTES V2",

            "START",
        )

        queryset = (
            PCProduct.objects.all()
        )

        total = queryset.count()

        # =================================================
        # EMPTY
        # =================================================

        if total == 0:

            runtime_log(

                True,

                "NO PRODUCTS",
            )

            return

        # =================================================
        # LOOP
        # =================================================

        for index, product in enumerate(

            queryset,

            start=1,
        ):

            progress_label = (
                f"[{index}/{total}]"
            )

            try:

                # =========================================
                # START
                # =========================================

                runtime_log(

                    True,

                    f"{progress_label} PRODUCT",

                    product.name,
                )

                # =========================================
                # RUNTIME
                # =========================================

                semantic_result = (
                    compile_semantic_runtime(

                        product=product,

                        trace_runtime=False,

                        progress_label=progress_label,
                    )
                )

                # =========================================
                # SEMANTIC PAYLOAD
                # =========================================

                workflow_tags = (
                    semantic_result.get(
                        "workflow_tags",
                        []
                    )
                )

                runtime_profiles = (
                    semantic_result.get(
                        "runtime_profiles",
                        []
                    )
                )

                semantic_labels = (
                    semantic_result.get(
                        "semantic_labels",
                        []
                    )
                )

                specs = semantic_result.get(
                    "specs",
                    {}
                )

                # =========================================
                # COMPACT LOG
                # =========================================

                runtime_log(

                    True,

                    f"{progress_label} SEMANTIC",

                    {

                        "workflow":
                            workflow_tags,

                        "profiles":
                            runtime_profiles,

                        "labels":
                            semantic_labels,
                    },
                )

                # =========================================
                # DETECT ATTRIBUTES
                # =========================================

                detected_slugs = set()

                # =========================================
                # MEMORY
                # =========================================

                detected_slugs.update(

                    detect_memory_attr(
                        specs
                    )
                )

                # =========================================
                # STORAGE
                # =========================================

                detected_slugs.update(

                    detect_storage_attr(
                        specs
                    )
                )

                # =========================================
                # FEATURES
                # =========================================

                detected_slugs.update(

                    detect_pc_feature(
                        specs
                    )
                )

                # =========================================
                # USAGE
                # =========================================

                detected_slugs.update(

                    detect_usage(
                        workflow_tags
                    )
                )

                # =========================================
                # WORKFLOW TAGS
                # =========================================

                detected_slugs.update(
                    workflow_tags
                )

                # =========================================
                # SAVE
                # =========================================

                with transaction.atomic():

                    product.workflow_tags = (
                        workflow_tags
                    )

                    product.runtime_profiles = (
                        runtime_profiles
                    )

                    product.semantic_labels = (
                        semantic_labels
                    )

                    product.semantic_runtime = (
                        semantic_result
                    )

                    product.semantic_runtime_compiled = True

                    product.save()

                    # =====================================
                    # ATTRIBUTE RESET
                    # =====================================

                    product.attributes.clear()

                    # =====================================
                    # ATTACH ATTRIBUTES
                    # =====================================

                    for slug in detected_slugs:

                        attach_attribute(

                            product,

                            slug,
                        )

                # =========================================
                # DONE
                # =========================================

                runtime_log(

                    True,

                    f"{progress_label} DONE",

                    {

                        "product":
                            product.name,

                        "attributes":
                            len(
                                detected_slugs
                            ),
                    },
                )

            except Exception as e:

                runtime_log(

                    True,

                    f"{progress_label} ERROR",

                    str(e),
                )

        # =================================================
        # COMPLETED
        # =================================================

        runtime_log(

            True,

            "AUTO MAP ATTRIBUTES V2",

            "COMPLETED",
        )