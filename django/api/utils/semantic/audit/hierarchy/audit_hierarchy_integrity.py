def audit_hierarchy_integrity(

    semantic_master,

    result,

):

    hierarchy = (
        semantic_master.get(
            "group_hierarchy",
            []
        )
    )

    groups = (
        semantic_master.get(
            "groups",
            []
        )
    )

    group_slugs = set()

    for row in groups:

        slug = str(
            row.get(
                "group_slug",
                ""
            )
        ).strip()

        if slug:

            group_slugs.add(
                slug
            )

    errors = 0

    # ==========================================
    # Parent / Child Exists
    # ==========================================

    for row in hierarchy:

        parent = str(
            row.get(
                "parent_group",
                ""
            )
        ).strip()

        child = str(
            row.get(
                "child_group",
                ""
            )
        ).strip()

        if parent and parent not in group_slugs:

            errors += 1

            result.add_error({

                "type":
                    "missing_parent_group",

                "group":
                    parent,

            })

        if child and child not in group_slugs:

            errors += 1

            result.add_error({

                "type":
                    "missing_child_group",

                "group":
                    child,

            })

    # ==========================================
    # Circular Reference
    # ==========================================

    graph = {}

    for row in hierarchy:

        parent = str(
            row.get(
                "parent_group",
                ""
            )
        ).strip()

        child = str(
            row.get(
                "child_group",
                ""
            )
        ).strip()

        if not parent or not child:

            continue

        graph.setdefault(
            parent,
            set()
        ).add(
            child
        )

    visited = set()

    stack = set()

    def dfs(node):

        if node in stack:

            return True

        if node in visited:

            return False

        visited.add(
            node
        )

        stack.add(
            node
        )

        for child in graph.get(
            node,
            []
        ):

            if dfs(child):

                return True

        stack.remove(
            node
        )

        return False

    circular_found = False

    for node in graph:

        if dfs(node):

            circular_found = True

            break

    if circular_found:

        errors += 1

        result.add_error({

            "type":
                "circular_hierarchy",

        })

    result.set_metric(

        "hierarchy_count",

        len(
            hierarchy
        ),

    )

    result.set_metric(

        "hierarchy_errors",

        errors,

    )

    result.add_info({

        "audit":
            "hierarchy_integrity",

        "relationships":
            len(
                hierarchy
            ),

        "errors":
            errors,

    })