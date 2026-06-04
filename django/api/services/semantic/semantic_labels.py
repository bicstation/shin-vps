# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/semantic_labels.py

"""
SHIN CORE LINX
Semantic Human Label Runtime

structured runtime
↓
workflow semantics
↓
human-readable exploration labels
"""

# ==========================================================
# WORKFLOW LABELS
# ==========================================================

WORKFLOW_LABELS = {

    # ======================================================
    # Gaming
    # ======================================================
    "gaming": [

        "🎮 FPSゲームを快適に楽しめる",

        "⚡ 高速ゲーミング体験",

        "🔥 競技ゲーム向け",
    ],

    # ======================================================
    # Creator
    # ======================================================
    "creator": [

        "🎬 動画編集ワークフロー向け",

        "🎨 クリエイティブ作業に強い",

        "📸 配信・編集を快適化",
    ],

    # ======================================================
    # AI
    # ======================================================
    "ai": [

        "🧠 AI生成ワークフロー向け",

        "🚀 次世代AI時代に対応",

        "🤖 ローカルAI実行に強い",
    ],

    # ======================================================
    # Business
    # ======================================================
    "business": [

        "💼 日常業務を快適化",

        "📈 ビジネス用途向け",

        "🧑‍💻 オフィス作業に強い",
    ],

    # ======================================================
    # Mobility
    # ======================================================
    "mobility": [

        "✈ 持ち運びしやすい",

        "☕ カフェ作業向け",

        "🎒 モバイルワーク向け",
    ],

    # ======================================================
    # Streaming
    # ======================================================
    "streaming": [

        "📡 配信ワークフロー向け",

        "🎥 ライブ配信に強い",

        "🎙 ストリーミング向け",
    ],

    # ======================================================
    # Immersive
    # ======================================================
    "immersive": [

        "🌈 没入感の高い映像体験",

        "🎥 映像コンテンツ向け",

        "🖥 美しい表示体験",
    ],
}


# ==========================================================
# DISPLAY LABELS
# ==========================================================

DISPLAY_LABELS = {

    # ======================================================
    # QD-OLED
    # ======================================================
    "QD-OLED": [

        "🌈 QD-OLED映像が美しい",

        "🖥 深い没入感を実現",
    ],

    # ======================================================
    # OLED
    # ======================================================
    "OLED": [

        "🌑 黒表現が美しい",

        "🎥 映像視聴との相性が良い",
    ],

    # ======================================================
    # IPS
    # ======================================================
    "IPS": [

        "🎨 色表現が自然",

        "🖼 写真・映像向け",
    ],

    # ======================================================
    # VA
    # ======================================================
    "VA": [

        "📺 コントラスト重視",

        "🌌 暗部表現が強い",
    ],
}


# ==========================================================
# GPU LABELS
# ==========================================================

GPU_SERIES_LABELS = {

    "5090": [

        "🔥 最上級GPUクラス",

        "🧠 AI生成にも強い",
    ],

    "5080": [

        "⚡ ハイエンドGPU",

        "🎮 高解像度ゲーム向け",
    ],

    "4090": [

        "🚀 超高性能GPU",

        "🎬 重い制作作業にも強い",
    ],

    "5070": [

        "🎮 最新ゲーム向け",
    ],

    "4070": [

        "⚖ バランス性能が高い",
    ],
}


# ==========================================================
# UTIL
# ==========================================================

def safe_int(value):

    try:
        return int(value)

    except:
        return 0


def unique_labels(labels):

    seen = set()

    result = []

    for label in labels:

        if not label:
            continue

        if label in seen:
            continue

        seen.add(label)

        result.append(label)

    return result


# ==========================================================
# PRODUCT TYPE LABELS
# ==========================================================

def build_product_type_labels(runtime):

    labels = []

    product_type = runtime.get(
        "product_type"
    )

    # ------------------------------------------------------
    # Gaming
    # ------------------------------------------------------

    if product_type == "gaming_pc":

        labels.append(
            "🎮 ゲーミングPC"
        )

    # ------------------------------------------------------
    # Creator
    # ------------------------------------------------------

    elif product_type == "creator_pc":

        labels.append(
            "🎬 クリエイターPC"
        )

    # ------------------------------------------------------
    # AI
    # ------------------------------------------------------

    elif product_type == "ai_workstation":

        labels.append(
            "🧠 AIワークステーション"
        )

    # ------------------------------------------------------
    # Mobility
    # ------------------------------------------------------

    elif product_type == "mobility_pc":

        labels.append(
            "✈ モバイルPC"
        )

    # ------------------------------------------------------
    # Immersive Monitor
    # ------------------------------------------------------

    elif product_type == "immersive_monitor":

        labels.append(
            "🌈 高没入ディスプレイ"
        )

    # ------------------------------------------------------
    # Creator Monitor
    # ------------------------------------------------------

    elif product_type == "creator_monitor":

        labels.append(
            "🎨 クリエイター向けモニター"
        )

    return labels


# ==========================================================
# WORKFLOW LABELS
# ==========================================================

def build_workflow_labels(runtime):

    labels = []

    workflows = runtime.get(
        "workflows",
        []
    )

    for workflow in workflows:

        workflow_name = workflow.get(
            "workflow"
        )

        workflow_labels = WORKFLOW_LABELS.get(
            workflow_name,
            []
        )

        if workflow_labels:

            labels.append(
                workflow_labels[0]
            )

    return labels


# ==========================================================
# DISPLAY LABELS
# ==========================================================

def build_display_labels(runtime):

    labels = []

    display_type = runtime.get(
        "display_type"
    )

    if not display_type:
        return labels

    display_labels = DISPLAY_LABELS.get(
        display_type,
        []
    )

    labels.extend(
        display_labels[:2]
    )

    return labels


# ==========================================================
# REFRESH RATE LABELS
# ==========================================================

def build_refresh_rate_labels(runtime):

    labels = []

    refresh_rate = safe_int(

        runtime.get(
            "refresh_rate"
        )
    )

    if refresh_rate <= 0:
        return labels

    # ------------------------------------------------------
    # Competitive
    # ------------------------------------------------------

    if refresh_rate >= 360:

        labels.append(
            "⚡ 360Hz超高速表示"
        )

    elif refresh_rate >= 240:

        labels.append(
            "🎮 240Hz高リフレッシュ"
        )

    elif refresh_rate >= 144:

        labels.append(
            "🕹 滑らかな高リフレッシュ"
        )

    return labels


# ==========================================================
# MEMORY LABELS
# ==========================================================

def build_memory_labels(runtime):

    labels = []

    memory_gb = safe_int(

        runtime.get(
            "memory_gb"
        )
    )

    if memory_gb <= 0:
        return labels

    # ------------------------------------------------------
    # Large Memory
    # ------------------------------------------------------

    if memory_gb >= 64:

        labels.append(
            "🧠 超大容量メモリ"
        )

    elif memory_gb >= 32:

        labels.append(
            "🎬 マルチ作業に強い"
        )

    elif memory_gb >= 16:

        labels.append(
            "💼 日常作業が快適"
        )

    return labels


# ==========================================================
# STORAGE LABELS
# ==========================================================

def build_storage_labels(runtime):

    labels = []

    storage_gb = safe_int(

        runtime.get(
            "storage_gb"
        )
    )

    if storage_gb <= 0:
        return labels

    # ------------------------------------------------------
    # Large Storage
    # ------------------------------------------------------

    if storage_gb >= 4000:

        labels.append(
            "📦 超巨大ストレージ"
        )

    elif storage_gb >= 2000:

        labels.append(
            "🎞 大量データ保存向け"
        )

    elif storage_gb >= 1000:

        labels.append(
            "⚡ 高速SSDで快適"
        )

    return labels


# ==========================================================
# GPU LABELS
# ==========================================================

def build_gpu_labels(runtime):

    labels = []

    gpu_model = runtime.get(
        "gpu_model"
    )

    if not gpu_model:
        return labels

    gpu_model = str(
        gpu_model
    ).upper()

    # ------------------------------------------------------
    # RTX
    # ------------------------------------------------------

    if "RTX" in gpu_model:

        labels.append(
            "🎮 RTXグラフィックス搭載"
        )

    # ------------------------------------------------------
    # GPU Series
    # ------------------------------------------------------

    for series, series_labels in (

        GPU_SERIES_LABELS.items()

    ):

        if series in gpu_model:

            labels.extend(
                series_labels[:1]
            )

    return labels


# ==========================================================
# AI LABELS
# ==========================================================

def build_ai_labels(runtime):

    labels = []

    cpu_model = runtime.get(
        "cpu_model"
    )

    if not cpu_model:
        return labels

    cpu_model = str(
        cpu_model
    ).lower()

    # ------------------------------------------------------
    # AI CPUs
    # ------------------------------------------------------

    if "core ultra" in cpu_model:

        labels.append(
            "🧠 AI時代向けCPU"
        )

    if "ryzen ai" in cpu_model:

        labels.append(
            "🚀 Ryzen AI対応"
        )

    if "snapdragon x" in cpu_model:

        labels.append(
            "📱 次世代モバイルAI"
        )

    return labels


# ==========================================================
# PRIORITY SORT
# ==========================================================

def prioritize_labels(labels):

    """
    Human UX Priority
    """

    priority_keywords = [

        "AI",
        "RTX",
        "動画編集",
        "FPS",
        "OLED",
        "240Hz",
        "360Hz",
        "ゲーミング",
    ]

    def score_label(label):

        score = 0

        for keyword in priority_keywords:

            if keyword in label:

                score += 1

        return score

    return sorted(

        labels,

        key=score_label,

        reverse=True
    )


# ==========================================================
# MAIN
# ==========================================================

def build_semantic_labels(runtime):

    labels = []

    # ======================================================
    # Product Type
    # ======================================================

    labels.extend(
        build_product_type_labels(
            runtime
        )
    )

    # ======================================================
    # Workflow
    # ======================================================

    labels.extend(
        build_workflow_labels(
            runtime
        )
    )

    # ======================================================
    # Display
    # ======================================================

    labels.extend(
        build_display_labels(
            runtime
        )
    )

    # ======================================================
    # Refresh Rate
    # ======================================================

    labels.extend(
        build_refresh_rate_labels(
            runtime
        )
    )

    # ======================================================
    # Memory
    # ======================================================

    labels.extend(
        build_memory_labels(
            runtime
        )
    )

    # ======================================================
    # Storage
    # ======================================================

    labels.extend(
        build_storage_labels(
            runtime
        )
    )

    # ======================================================
    # GPU
    # ======================================================

    labels.extend(
        build_gpu_labels(
            runtime
        )
    )

    # ======================================================
    # AI CPU
    # ======================================================

    labels.extend(
        build_ai_labels(
            runtime
        )
    )

    # ======================================================
    # Unique
    # ======================================================

    labels = unique_labels(
        labels
    )

    # ======================================================
    # Priority Sort
    # ======================================================

    labels = prioritize_labels(
        labels
    )

    # ======================================================
    # Final Limit
    # ======================================================

    return labels[:6]