# ============================================================================
# SHIN SATELLITE OPS｜Minimal Single Blog Runtime
# ============================================================================
# Purpose:
# Lightweight persona-filtered posting runtime
# ============================================================================

import random

from satellite_ops.registry.blogs.blog_loader import (
    load_blog,
)

from satellite_ops.registry.rss.rss_loader import (
    load_rss_by_categories,
)

from satellite_ops.runtime.fetch.rss_fetcher import (
    fetch_rss_titles,
)

from satellite_ops.runtime.rewrite.rewrite_runtime import (
    rewrite_lightly,
)

# from satellite_ops.runtime.rewrite.satellite_title_generator import (
#     generate_satellite_title,
# )

from satellite_ops.dispatch.renderers.paragraph_renderer import (
    build_paragraphs,
)

from satellite_ops.dispatch.renderers.html_renderer import (
    HTMLRenderer,
)

from satellite_ops.runtime.media.html_image_embedder import (
    insert_image,
)

from satellite_ops.dispatch.drivers.livedoor_driver import (
    LivedoorDriver,
)

# ============================================================================
# RSS Runtime Core
# ============================================================================

from satellite_ops.runtime.rss.normalizer import (
    normalize_article,
)

from satellite_ops.runtime.rss.sanitation.noise_filter import (
    filter_noise,
)

# ============================================================================
# Runtime Config
# ============================================================================

# BLOG_NAME = "bicstation"
BLOG_NAME = "pc-compass"

ENABLE_REAL_POST = True

# ============================================================================
# Runtime Start
# ============================================================================

print("\n🛰 SHIN SATELLITE OPS\n")

# ============================================================================
# Load Blog
# ============================================================================

blog = load_blog(
    BLOG_NAME
)

print("📌 Blog")
print(blog)

# ============================================================================
# Load RSS Sources
# ============================================================================

rss_sources = load_rss_by_categories(
    blog["allowed_categories"]
)

if not rss_sources:

    print("❌ No RSS sources found.")
    exit()

# ============================================================================
# RSS Source Observability
# ============================================================================

print("\n📡 Available RSS Sources\n")

for rss in rss_sources:

    print(

        rss.get(
            "source_name",
            "UnknownSource",
        ),

        "=>",

        rss.get(
            "rss_url",
            "",
        )
    )

# ============================================================================
# Select RSS Source
# ============================================================================

rss_source = next(

    (

        x

        for x in rss_sources

        if "ascii.jp" in (

            x.get(
                "rss_url",
                "",
            ).lower()
        )
    ),

    None,
)

# ============================================================================
# Validation
# ============================================================================

if not rss_source:

    print(
        "\n⚠ Impress RSS source not found\n"
    )

    exit()

print("\n📡 Selected RSS")

print(
    rss_source.get(
        "source_name",
        "UnknownSource",
    )
)

print("\n📡 Selected RSS")
print(rss_source["source_name"])

# ============================================================================
# Fetch RSS Topics
# ============================================================================

rss_topics = fetch_rss_titles(
    rss_source["rss_url"]
)

if not rss_topics:

    print("❌ RSS fetch failed.")
    exit()

# ============================================================================
# Select Topic
# ============================================================================

TOPIC = random.choice(
    rss_topics
)

print("\n📰 Selected Topic\n")
print(TOPIC)

ARTICLE_LINK = TOPIC.get(
    "link",
    "",
)

if not ARTICLE_LINK:

    print("❌ Empty article link.")
    exit()

# ============================================================================
# Normalize Article
# ============================================================================

print("\n🧩 RSS Normalization Runtime\n")

normalized = normalize_article(
    TOPIC
)

print("\n🧩 Parser Runtime\n")

print(
    normalized.get(
        "parser",
        "UnknownParser",
    )
)

print("\n🖼 Extractor Runtime\n")

print(
    normalized.get(
        "extractor",
        "UnknownExtractor",
    )
)

article_text = normalized.get(
    "body",
    "",
)

image_url = normalized.get(
    "image_url",
    "",
)

normalized_title = normalized.get(
    "title",
    "",
)

print("\n📰 Source Runtime\n")

print(
    normalized.get(
        "source_name",
        "UnknownSource",
    )
)

print(
    normalized.get(
        "url",
        "",
    )
)

# ============================================================================
# Runtime Status
# ============================================================================

print("✅ Article normalized")

if image_url:

    print("✅ Image normalized")
    print(image_url)

else:

    print("⚠ No normalized image")

# ============================================================================
# Validation
# ============================================================================

if not article_text:

    print("❌ Article normalization failed.")
    exit()

# ============================================================================
# Noise Cleanup
# ============================================================================

article_text = filter_noise(
    article_text
)

# ============================================================================
# Preview
# ============================================================================

print("\n📰 Article Preview\n")

print(
    article_text[:500]
)

# ============================================================================
# Lightweight Rewrite
# ============================================================================

print("\n🧠 Lightweight Rewrite\n")

REWRITTEN_TEXT = rewrite_lightly(

    article_text[:4000],

    blog["persona"],
)

if not REWRITTEN_TEXT:

    REWRITTEN_TEXT = article_text

print(
    REWRITTEN_TEXT[:1000]
)


# ============================================================================
# Rewrite Observability
# ============================================================================

print("\n🧠 Rewrite Observability\n")

print(
    "Length:",
    len(REWRITTEN_TEXT),
)

print(
    "Paragraphs:",
    REWRITTEN_TEXT.count("\n\n") + 1,
)

# ============================================================================
# Title Stabilization
# ============================================================================

SATELLITE_TITLE = (
    normalized_title
    .replace("　", " ")
    .strip()
)

print("\n🧠 Stabilized Title\n")

print(
    SATELLITE_TITLE
)

# ============================================================================
# Paragraph Build
# ============================================================================

paragraphs = build_paragraphs(
    REWRITTEN_TEXT
)

# ============================================================================
# HTML Renderer
# ============================================================================

renderer = HTMLRenderer()

html = renderer.render_article(

    title=SATELLITE_TITLE,

    paragraphs=paragraphs,

    persona=blog["persona"],

    cta_html="",

    source_url=normalized.get(
        "url",
        "",
    ),

    source_name=normalized.get(
        "source_name",
        "",
    ),
)

# ============================================================================
# Insert External Image
# ============================================================================

html = insert_image(
    html,
    image_url,
)

# ============================================================================
# HTML Preview
# ============================================================================

print("\n🧠 HTML Preview\n")

print(
    html[:2000]
)

# ============================================================================
# Real Dispatch Validation
# ============================================================================

if ENABLE_REAL_POST:

    print("\n🚀 Livedoor Dispatch Runtime\n")

    driver = LivedoorDriver(
        blog
    )

    success = driver.post(

        title=SATELLITE_TITLE,

        body=html,

        image_url=None,
    )

    if success:

        print("✅ Livedoor Post Success")

    else:

        print("❌ Livedoor Post Failed")

# ============================================================================
# Runtime Complete
# ============================================================================

print("\n✅ Runtime Complete\n")