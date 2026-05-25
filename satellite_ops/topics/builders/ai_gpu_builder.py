# ============================================================================
# SHIN SATELLITE OPS｜AI GPU Topic Builder
# ============================================================================

import random
from satellite_ops.cta.variants.bicstation_cta import ( get_bicstation_cta_lines, )

def build_ai_gpu_paragraphs(topic, hour=None):

    # ------------------------------------------------------------------------
    # Intro Variations
    # ------------------------------------------------------------------------

    intro_variations = [

        "最近はローカルAI用途でGPUノートPCを検討する人が増えてきました。",
        "画像生成AIブーム以降、GPU搭載ノートPCへの注目がかなり高まっています。",
        "最近はAI学習用途でノートPCを探す人が本当に増えた印象があります。",
    ]

    # ------------------------------------------------------------------------
    # VRAM Variations
    # ------------------------------------------------------------------------

    vram_variations = [

        "特に画像生成やローカルLLM用途では、VRAM容量を重視するケースが増えています。",
        "最近は『VRAM不足が怖い』という理由でGPU選びを慎重にする人も増えています。",
        "Stable Diffusion やローカルLLM用途では、VRAM容量がかなり重要視されています。",
    ]

    # ------------------------------------------------------------------------
    # Mobility Variations
    # ------------------------------------------------------------------------

    mobility_variations = [

        "以前はデスクトップ中心でしたが、最近は外出先でもAI作業をしたい需要が高まっている印象です。",
        "最近はカフェや出先でもAI開発をしたい人が増えており、モバイルGPU環境への需要が強まっています。",
        "持ち運びながらAI検証をしたいニーズも増えてきており、GPUノート市場が活気づいています。",
    ]


    # ------------------------------------------------------------------------
    # Night Variations
    # ------------------------------------------------------------------------

    night_variations = [

        "深夜帯になると、ついGPU構成を眺め続けてしまいます。",
        "夜になると『もう少しVRAM欲しいな…』と考え始める人も多いかもしれません。",
        "深夜のGPU比較は危険です。気付くと上位モデルを見始めています。",
    ]

    # ------------------------------------------------------------------------
    # Temporal Paragraph
    # ------------------------------------------------------------------------

    temporal_paragraph = None

    if hour is not None:

        if hour >= 22:

            temporal_paragraph = random.choice(
                night_variations
            )

    # ------------------------------------------------------------------------
    # Final Paragraphs
    # ------------------------------------------------------------------------

    paragraphs = []

    if temporal_paragraph:
        paragraphs.append(temporal_paragraph)

    paragraphs.extend([

        random.choice(intro_variations),
        random.choice(vram_variations),
        random.choice(mobility_variations),
        # random.choice(closing_variations),
        get_bicstation_cta_lines(),

    ])

    return paragraphs