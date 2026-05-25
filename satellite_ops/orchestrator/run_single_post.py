# ============================================================================
# SHIN SATELLITE OPS｜Single Post Runtime
# ============================================================================
# Purpose:
# Minimal livedoor posting orchestration
# ============================================================================

from satellite_ops.runtime.bootstrap.django_env import *

from satellite_ops.dispatch.drivers.livedoor_driver import (
LivedoorDriver,
)

from satellite_ops.dispatch.renderers.html_renderer import (
HTMLRenderer,
)

# ----------------------------------------------------------------------------
# Mock Topic
# ----------------------------------------------------------------------------

TOPIC = {
"title": "最近AI用途でGPUノートPC需要が増加",


"summary": (
    "ローカルAIや動画編集用途で、"
    "高VRAM搭載ノートへの注目が高まっている。"
),


}

# ----------------------------------------------------------------------------
# Paragraphs
# ----------------------------------------------------------------------------

paragraphs = [


"最近はローカルAI用途でGPUノートPCを検討する人が増えてきました。",

"特に画像生成やローカルLLM用途では、VRAM容量を重視するケースが増えています。",

"以前はデスクトップ中心でしたが、最近は外出先でもAI作業をしたい需要が高まっている印象です。",

"詳細比較や関連モデルは、Bicstation 側で確認すると分かりやすいでしょう。",


]

# ----------------------------------------------------------------------------
# Renderer
# ----------------------------------------------------------------------------

renderer = HTMLRenderer()

# ----------------------------------------------------------------------------
# Quote
# ----------------------------------------------------------------------------

# quote = renderer.load_random_quote(
# "/home/maya/shin-dev/shin-vps/satellite_ops/personas/bicstation/quotes.txt"
# )

# ----------------------------------------------------------------------------
# CTA
# ----------------------------------------------------------------------------

cta_html = renderer.load_cta(
"/home/maya/shin-dev/shin-vps/satellite_ops/cta/templates/bicstation_default.html"
)

# ----------------------------------------------------------------------------
# Render HTML
# ----------------------------------------------------------------------------

# html = renderer.render_article(
# title=TOPIC["title"],
# paragraphs=paragraphs,
# quote=quote,
# cta_html=cta_html,
# )
html = renderer.render_article(
title=TOPIC["title"],
paragraphs=paragraphs,
persona="bicstation",
cta_html=cta_html,
)

# ----------------------------------------------------------------------------
# Driver Config
# ----------------------------------------------------------------------------

driver_config = {


"url": "https://livedoor.blogcms.jp/atompub/pbic_station2/article",
"user": "pbic_station2",
"api_key": "AIeQNTcr2V",


}

# ----------------------------------------------------------------------------
# Driver
# ----------------------------------------------------------------------------

driver = LivedoorDriver(driver_config)

# ----------------------------------------------------------------------------
# Dispatch
# ----------------------------------------------------------------------------

driver.post(
title=TOPIC["title"],
body=html,
)

print("✅ Single satellite post completed.")
