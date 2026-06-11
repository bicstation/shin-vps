# =========================================================
# FILE:
# api/services/feed/semantic/builders/semantic_runtime_builder.py
# =========================================================

class SemanticRuntimeBuilder:

    # =====================================================
    # BUILD
    # =====================================================

    def build(

        self,

        semantic_payload,

    ):

        runtime = {

            "semantic_labels": [],

            "workflow_tags": [],

            "runtime_profiles": [],

        }

        # ==========================================
        # AI PC
        # ==========================================

        if semantic_payload.get(
            "is_ai_pc"
        ):

            runtime[
                "semantic_labels"
            ].append(
                "AI対応"
            )

            runtime[
                "workflow_tags"
            ].extend([
                "ai",
                "copilot",
            ])

        # ==========================================
        # TARGET SEGMENT
        # ==========================================

        target_segment = (
            semantic_payload.get(
                "target_segment"
            )
        )

        if target_segment == "general":

            runtime[
                "semantic_labels"
            ].append(
                "日常利用"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "general_user"
            )

        elif target_segment == "business":

            runtime[
                "semantic_labels"
            ].append(
                "ビジネス向け"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "business_user"
            )

        elif target_segment == "creator":

            runtime[
                "semantic_labels"
            ].append(
                "クリエイター向け"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "creator"
            )

        elif target_segment == "gaming":

            runtime[
                "semantic_labels"
            ].append(
                "ゲーミング"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "gamer"
            )

        elif target_segment == "premium":

            runtime[
                "semantic_labels"
            ].append(
                "プレミアム"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "premium_user"
            )

        elif target_segment == "enthusiast":

            runtime[
                "semantic_labels"
            ].append(
                "ハイエンド"
            )

            runtime[
                "runtime_profiles"
            ].append(
                "enthusiast"
            )

        # ==========================================
        # USAGE TAGS
        # ==========================================

        usage_tags = (
            semantic_payload.get(
                "usage_tags",
                [],
            )
        )

        mapping = {

            "office": [
                "office_work",
                "document",
            ],

            "home": [
                "web",
                "streaming",
            ],

            "gaming": [
                "gaming",
            ],

            "creator": [
                "editing",
                "creative",
            ],

            "business": [
                "business",
            ],

            "ai": [
                "ai",
            ],

            "mobile": [
                "mobile",
            ],

        }

        for tag in usage_tags:

            for workflow in mapping.get(
                tag,
                [],
            ):

                if workflow not in runtime[
                    "workflow_tags"
                ]:

                    runtime[
                        "workflow_tags"
                    ].append(
                        workflow
                    )

        # ==========================================
        # UNIQUE
        # ==========================================

        runtime[
            "semantic_labels"
        ] = list(
            dict.fromkeys(
                runtime[
                    "semantic_labels"
                ]
            )
        )

        runtime[
            "workflow_tags"
        ] = list(
            dict.fromkeys(
                runtime[
                    "workflow_tags"
                ]
            )
        )

        runtime[
            "runtime_profiles"
        ] = list(
            dict.fromkeys(
                runtime[
                    "runtime_profiles"
                ]
            )
        )

        return runtime