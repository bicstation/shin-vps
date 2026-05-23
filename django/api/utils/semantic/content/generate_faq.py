# =========================================================
# SHIN CORE LINX
# semantic/content/generate_faq.py
# =========================================================


# =========================================================
# HELPERS
# =========================================================

def has_workflow(
    workflow_tags,
    tag,
):

    return tag in workflow_tags


# =========================================================
# AI FAQ
# =========================================================

def build_ai_faq(
    workflow_tags,
):

    faq = []

    if has_workflow(

        workflow_tags,
        "ai_workflow"

    ):

        faq.append({

            "question":
                "このPCは生成AI用途に向いていますか？",

            "answer":
                "RTX GPU や大容量メモリを搭載している場合、"
                "Stable Diffusion やローカルLLM用途に適しています。"
        })

    if has_workflow(

        workflow_tags,
        "local_llm"

    ):

        faq.append({

            "question":
                "ローカルLLMを動かせますか？",

            "answer":
                "workflow_tags に local_llm が含まれる場合、"
                "ローカルAI実行向けとして解析されています。"
        })

    return faq


# =========================================================
# GAMING FAQ
# =========================================================

def build_gaming_faq(
    workflow_tags,
):

    faq = []

    if has_workflow(

        workflow_tags,
        "gaming_ready"

    ):

        faq.append({

            "question":
                "ゲーム用途にも使えますか？",

            "answer":
                "gaming_ready 以上の workflow が付与されている場合、"
                "ゲーミング用途にも適しています。"
        })

    if has_workflow(

        workflow_tags,
        "high_refresh_gaming"

    ):

        faq.append({

            "question":
                "高リフレッシュレート表示に対応していますか？",

            "answer":
                "高Hzディスプレイを搭載している場合、"
                "competitive gaming 向けとして解析されます。"
        })

    return faq


# =========================================================
# CREATOR FAQ
# =========================================================

def build_creator_faq(
    workflow_tags,
):

    faq = []

    if has_workflow(

        workflow_tags,
        "creator_workstation"

    ):

        faq.append({

            "question":
                "動画編集やクリエイティブ用途に向いていますか？",

            "answer":
                "creator_workstation workflow が付与されている場合、"
                "動画編集や制作用途向けとして解析されています。"
        })

    if has_workflow(

        workflow_tags,
        "3d_rendering"

    ):

        faq.append({

            "question":
                "3Dレンダリング用途でも使用できますか？",

            "answer":
                "高性能GPUと十分なメモリを搭載している場合、"
                "3D制作向け workflow が付与されます。"
        })

    return faq


# =========================================================
# GENERAL FAQ
# =========================================================

def build_general_faq():

    return [

        {

            "question":
                "SHIN CORE LINX semantic runtimeとは何ですか？",

            "answer":
                "SHIN CORE LINX は、"
                "PCスペックだけでなく用途・workflow・AI適性を"
                "semantic runtime として解析するシステムです。"
        }
    ]


# =========================================================
# MAIN
# =========================================================

def generate_faq(
    workflow_tags,
):

    faq = []

    # =====================================================
    # AI
    # =====================================================

    faq.extend(

        build_ai_faq(
            workflow_tags
        )
    )

    # =====================================================
    # GAMING
    # =====================================================

    faq.extend(

        build_gaming_faq(
            workflow_tags
        )
    )

    # =====================================================
    # CREATOR
    # =====================================================

    faq.extend(

        build_creator_faq(
            workflow_tags
        )
    )

    # =====================================================
    # GENERAL
    # =====================================================

    faq.extend(

        build_general_faq()
    )

    # =====================================================
    # RETURN
    # =====================================================

    return faq