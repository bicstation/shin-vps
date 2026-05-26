# ============================================================================
# SHIN SATELLITE OPS｜Light Rewrite Generator
# ============================================================================
# Purpose:
# Lightweight human atmosphere rewrite runtime
#
# Philosophy:
# - NOT article generation
# - NOT semantic authority
# - NOT autonomous opinion
# - ONLY atmosphere translation
# - Preserve original meaning
# - Reduce RSS repost feeling

# ============================================================================

def generate_light_rewrite(article_text=""):


if not article_text:
    return []

text = article_text.strip()

rewritten = []

# ------------------------------------------------------------------------
# AI / Local AI
# ------------------------------------------------------------------------

if "ローカルAI" in text:
    rewritten.append(
        "最近はローカルAI活用を試す動きも広がっています。"
    )

if "生成AI" in text:
    rewritten.append(
        "生成AIを日常用途へ活用する流れも続いています。"
    )

# ------------------------------------------------------------------------
# Video / Creator Workflow
# ------------------------------------------------------------------------

if "動画" in text:
    rewritten.append(
        "動画整理や高画質化へAIを活用する事例も増えています。"
    )

if "4K" in text:
    rewritten.append(
        "低解像度映像を高画質化する用途にも注目が集まっています。"
    )

# ------------------------------------------------------------------------
# GPU / NVIDIA
# ------------------------------------------------------------------------

if "NVIDIA" in text:
    rewritten.append(
        "AI開発向けGPU需要の拡大も続いています。"
    )

if "GPU" in text:
    rewritten.append(
        "AIインフラ需要の高まりも話題となっています。"
    )

# ------------------------------------------------------------------------
# AI Risk / Social Context
# ------------------------------------------------------------------------

if "通報" in text:
    rewritten.append(
        "生成AIと社会判断を巡る議論も広がっています。"
    )

if "偽動画" in text:
    rewritten.append(
        "AI生成コンテンツの信頼性にも関心が集まっています。"
    )

if "捏造" in text:
    rewritten.append(
        "AIによる情報生成の課題も議論されています。"
    )

# ------------------------------------------------------------------------
# Fallback
# ------------------------------------------------------------------------

if not rewritten:

    rewritten.append(
        "AI活用を巡るさまざまな動きが続いています。"
    )

return rewritten[:3]

