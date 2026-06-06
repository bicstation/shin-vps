from django.core.management.base import BaseCommand

from api.utils.semantic.authority.loader import (
    load_semantic_master,
)


class Command(BaseCommand):

    help = "Semantic Authority Guardian"

    def handle(self, *args, **options):

        self.errors = []
        self.warnings = []
        self.infos = []

        self.semantic_master = (
            load_semantic_master()
        )

        print()
        print("=" * 60)
        print("SEMANTIC AUTHORITY AUDIT")
        print("=" * 60)

        self.audit_alias_integrity()

        self.audit_attribute_integrity()

        self.audit_group_integrity()

        self.audit_workflow_integrity()

        self.audit_hierarchy_integrity()

        self.audit_normalization_integrity()

        self.audit_negative_alias_integrity()

        self.audit_orphans()

        self.build_health_report()

    # ==================================================
    # ALIAS
    # ==================================================

    def audit_alias_integrity(self):

        print()
        print(
            "[AUDIT] Alias Integrity"
        )

        aliases = (
            self.semantic_master.get(
                "aliases",
                []
            )
        )

        attributes = (
            self.semantic_master.get(
                "attributes",
                []
            )
        )

        attribute_slugs = set()

        # ==========================================
        # ATTRIBUTE INDEX
        # ==========================================

        for row in attributes:

            slug = str(
                row.get(
                    "attribute_slug",
                    ""
                )
            ).strip()

            if slug:

                attribute_slugs.add(
                    slug
                )

        # ==========================================
        # VALIDATE
        # ==========================================

        errors = 0

        for row in aliases:

            attribute_slug = str(
                row.get(
                    "attribute_slug",
                    ""
                )
            ).strip()

            if not attribute_slug:

                continue

            if attribute_slug not in attribute_slugs:

                errors += 1

                self.errors.append({

                    "type":
                        "missing_attribute",

                    "attribute":
                        attribute_slug,
                })

                print()

                print(
                    "[ERROR]"
                )

                print(
                    f"Alias points to missing attribute: "
                    f"{attribute_slug}"
                )

        print()

        print(
            f"Alias Count : {len(aliases)}"
        )

        print(
            f"Errors      : {errors}"
        )
    
    # ==================================================
    # ATTRIBUTE
    # ==================================================
       
    def audit_attribute_integrity(self):

        print()
        print(
            "[AUDIT] Attribute Integrity"
        )

        attributes = (
            self.semantic_master.get(
                "attributes",
                []
            )
        )

        group_mappings = (
            self.semantic_master.get(
                "group_mappings",
                []
            )
        )

        attribute_slugs = set()

        mapped_attributes = set()

        # =========================
        # ATTRIBUTE INDEX
        # =========================

        for row in attributes:

            slug = str(
                row.get(
                    "slug",
                    ""
                )
            ).strip()

            if slug:

                attribute_slugs.add(
                    slug
                )

        # =========================
        # MAPPINGS
        # =========================

        for row in group_mappings:

            slug = str(
                row.get(
                    "attribute_slug",
                    ""
                )
            ).strip()

            if slug:

                mapped_attributes.add(
                    slug
                )

        for row in group_mappings:

            print(
                row["attribute_slug"]
            )

            print("↓")

            print(
                row["group_slug"]
            )

            print()

        # =========================
        # MISSING
        # =========================

        missing = sorted(

            attribute_slugs
            -
            mapped_attributes

        )

        for slug in missing:

            self.warnings.append({

                "type":
                    "attribute_without_group",

                "attribute":
                    slug,
            })

            print()

            print(
                "[WARNING]"
            )

            print(
                f"Attribute has no group mapping: "
                f"{slug}"
            )

        print()

        print(
            f"Attribute Count : "
            f"{len(attribute_slugs)}"
        )

        print(
            f"Mapped          : "
            f"{len(mapped_attributes)}"
        )

        print(
            f"Missing         : "
            f"{len(missing)}"
        )
    
    

    # ==================================================
    # GROUP
    # ==================================================

    def audit_group_integrity(self):

        print()

        print(
            "[AUDIT] Group Integrity"
        )

    def report_group_inventory(self):

        groups = self.semantic_master.get(
            "groups",
            []
        )

        group_mappings = self.semantic_master.get(
            "group_mappings",
            []
        )

        counts = {}

        for row in group_mappings:

            group_slug = row.get(
                "group_slug",
                ""
            )

            counts[group_slug] = (
                counts.get(
                    group_slug,
                    0
                ) + 1
            )

        print()
        print("=" * 60)
        print("GROUP INVENTORY")
        print("=" * 60)

        for group in groups:

            slug = group.get(
                "group_slug",
                ""
            )

            print(
                f"{slug} : "
                f"{counts.get(slug,0)}"
            )
            
    # ==================================================
    # WORKFLOW
    # ==================================================

    def audit_workflow_integrity(self):

        print()

        print(
            "[AUDIT] Workflow Integrity"
        )

    # ==================================================
    # HIERARCHY
    # ==================================================

    def audit_hierarchy_integrity(self):

        print()

        print(
            "[AUDIT] Hierarchy Integrity"
        )

    # ==================================================
    # NORMALIZATION
    # ==================================================

    def audit_normalization_integrity(self):

        print()

        print(
            "[AUDIT] Normalization Integrity"
        )

    # ==================================================
    # NEGATIVE ALIAS
    # ==================================================

    def audit_negative_alias_integrity(self):

        print()

        print(
            "[AUDIT] Negative Alias Integrity"
        )

    # ==================================================
    # ORPHANS
    # ==================================================

    def audit_orphans(self):

        print()

        print(
            "[AUDIT] Orphan Detection"
        )

    # ==================================================
    # HEALTH
    # ==================================================

    def build_health_report(self):

        print()

        print("=" * 60)

        print(
            "HEALTH REPORT"
        )

        print("=" * 60)

        print(
            f"ERRORS   : {len(self.errors)}"
        )

        print(
            f"WARNINGS : {len(self.warnings)}"
        )