def audit_orphans(

    semantic_master,

    result,

):

    aliases = (
        semantic_master.get(
            "aliases",
            []
        )
    )

    attributes = (
        semantic_master.get(
            "attributes",
            []
        )
    )

    groups = (
        semantic_master.get(
            "groups",
            []
        )
    )

    group_mappings = (
        semantic_master.get(
            "group_mappings",
            []
        )
    )

    workflow_mappings = (
        semantic_master.get(
            "workflow_mappings",
            []
        )
    )

    hierarchy = (
        semantic_master.get(
            "group_hierarchy",
            []
        )
    )

    # =====================================================
    # INDEX
    # =====================================================

    alias_targets = set()

    for row in aliases:

        slug = str(
            row.get(
                "slug",
                ""
            )
        ).strip()

        if slug:

            alias_targets.add(
                slug
            )

    mapped_attributes = set()

    for row in group_mappings:

        attribute = str(
            row.get(
                "attribute_slug",
                ""
            )
        ).strip()

        if attribute:

            mapped_attributes.add(
                attribute
            )

    workflow_groups = set()

    for row in workflow_mappings:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if group_slug:

            workflow_groups.add(
                group_slug
            )

    universe_groups = set()

    for row in hierarchy:

        child = str(
            row.get(
                "child_group",
                ""
            )
        ).strip()

        if child:

            universe_groups.add(
                child
            )

    warnings = 0

    # =====================================================
    # ORPHAN ATTRIBUTE
    # =====================================================

    for row in attributes:

        slug = str(
            row.get(
                "slug",
                ""
            )
        ).strip()

        if not slug:

            continue

        if slug not in mapped_attributes:

            warnings += 1

            result.add_warning({

                "type":
                    "orphan_attribute",

                "attribute":
                    slug,

            })

    # =====================================================
    # ORPHAN GROUP
    # =====================================================

    for row in groups:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if not group_slug:

            continue

        if group_slug not in workflow_groups:

            warnings += 1

            result.add_warning({

                "type":
                    "orphan_group",

                "group":
                    group_slug,

            })

    # =====================================================
    # ORPHAN UNIVERSE
    # =====================================================

    for row in groups:

        group_slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        parent_group = str(
            row.get(
                "parent_group",
                ""
            )
        ).strip()

        if not group_slug:

            continue

        if not parent_group:

            continue

        if group_slug not in universe_groups:

            warnings += 1

            result.add_warning({

                "type":
                    "orphan_universe",

                "group":
                    group_slug,

            })

    # =====================================================
    # METRICS
    # =====================================================

    result.set_metric(

        "orphan_warnings",

        warnings,

    )

    result.add_info({

        "audit":
            "orphans",

        "warnings":
            warnings,

    })