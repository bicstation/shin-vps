# -*- coding: utf-8 -*-

# api/management/commands/audit_slug_metadata.py

from django.core.management.base import (
BaseCommand,
)

from api.services.semantic.v2.authority.authority_runtime import (
build_authority_runtime,
)

from api.services.semantic.v2.traversal.traversal_builder import (
build_traversal_runtime,
)

# ==========================================================

# COMMAND

# ==========================================================

class Command(BaseCommand):


    help = (
        "Semantic Slug Metadata Integrity Audit"
    )

    # ======================================================
    # HANDLE
    # ======================================================

    def handle(

        self,

        *args,

        **options,

    ):

        authority = (
            build_authority_runtime()
        )

        metadata_slugs = {

            row["slug"]

            for row in authority.get(
                "slug_metadata",
                []
            )
        }

        # --------------------------------------------------
        # GROUP MAPPINGS
        # --------------------------------------------------

        missing_group_mappings = {

            slug

            for row in authority.get(
                "group_mappings",
                []
            )

            for slug in (
                row["group_slug"],
                row["attribute_slug"],
            )

            if slug not in metadata_slugs
        }

        # --------------------------------------------------
        # WORKFLOW MAPPINGS
        # --------------------------------------------------

        missing_workflow_mappings = {

            row["workflow_slug"]

            for row in authority.get(
                "workflow_mappings",
                []
            )

            if (
                row["workflow_slug"]
                not in metadata_slugs
            )
        }

        # --------------------------------------------------
        # ALIASES
        # --------------------------------------------------

        missing_aliases = {

            row["slug"]

            for row in authority.get(
                "aliases",
                []
            )

            if (
                row["slug"]
                not in metadata_slugs
            )
        }

        # --------------------------------------------------
        # TRAVERSAL
        # --------------------------------------------------

        traversal = (
            build_traversal_runtime()
        )

        missing_traversal = {

            slug

            for product in traversal.get(
                "products",
                []
            )

            for slug in product.get(
                "matched_groups",
                []
            )

            if slug not in metadata_slugs
        }

        # --------------------------------------------------
        # REPORT
        # --------------------------------------------------

        print()
        print("=" * 60)
        print("SLUG METADATA AUDIT")
        print("=" * 60)
        print()

        self._print_section(
            "GROUP MAPPINGS",
            missing_group_mappings,
        )

        self._print_section(
            "WORKFLOW MAPPINGS",
            missing_workflow_mappings,
        )

        self._print_section(
            "ALIASES",
            missing_aliases,
        )

        self._print_section(
            "TRAVERSAL",
            missing_traversal,
        )

        total_missing = (

            len(
                missing_group_mappings
            )

            +

            len(
                missing_workflow_mappings
            )

            +

            len(
                missing_aliases
            )

            +

            len(
                missing_traversal
            )
        )

        print("-" * 60)

        print(
            "TOTAL MISSING:",
            total_missing
        )

        print("-" * 60)

        if total_missing == 0:

            print()
            print(
                "AUDIT PASSED"
            )

        else:

            print()
            print(
                "AUDIT FAILED"
            )

        print()

    # ======================================================
    # HELPERS
    # ======================================================

    def _print_section(

        self,

        title,

        missing,

    ):

        print(title)

        if not missing:

            print("OK")
            print()
            return

        for slug in sorted(missing):

            print(
                "-",
                slug
            )

        print()

        print(
            "COUNT:",
            len(missing)
        )

        print()

