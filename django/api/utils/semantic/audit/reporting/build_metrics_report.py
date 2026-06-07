# =========================================================
# FILE:
# audit/reporting/build_metrics_report.py
# =========================================================


def build_metrics_report(

    result,

):

    print()

    print(
        "=" * 60
    )

    print(
        "METRICS REPORT"
    )

    print(
        "=" * 60
    )

    print()

    metrics = (
        result.metrics
    )

    # =====================================================
    # ALIAS
    # =====================================================

    if "alias_count" in metrics:

        print(
            f"Alias Count         : "
            f"{metrics['alias_count']}"
        )

    if "alias_errors" in metrics:

        print(
            f"Alias Errors        : "
            f"{metrics['alias_errors']}"
        )

    print()

    # =====================================================
    # ATTRIBUTE
    # =====================================================

    if "attribute_count" in metrics:

        print(
            f"Attribute Count     : "
            f"{metrics['attribute_count']}"
        )

    if "mapped_attributes" in metrics:

        print(
            f"Mapped Attributes   : "
            f"{metrics['mapped_attributes']}"
        )

    if "missing_attributes" in metrics:

        print(
            f"Missing Attributes  : "
            f"{metrics['missing_attributes']}"
        )

    print()

    # =====================================================
    # GROUP
    # =====================================================

    if "group_count" in metrics:

        print(
            f"Group Count         : "
            f"{metrics['group_count']}"
        )

    if "group_errors" in metrics:

        print(
            f"Group Errors        : "
            f"{metrics['group_errors']}"
        )

    print()

    # =====================================================
    # WORKFLOW
    # =====================================================

    if "workflow_mapping_count" in metrics:

        print(
            f"Workflow Mappings   : "
            f"{metrics['workflow_mapping_count']}"
        )

    if "workflow_errors" in metrics:

        print(
            f"Workflow Errors     : "
            f"{metrics['workflow_errors']}"
        )

    print()