# ============================================================================
# SHIN SATELLITE OPS｜Single Post Runtime
# ============================================================================
# Purpose:
# Minimal livedoor posting orchestration
# ============================================================================
import random
from datetime import datetime
from satellite_ops.runtime.bootstrap.django_env import *
from satellite_ops.dispatch.drivers.livedoor_driver import ( LivedoorDriver, )
from satellite_ops.dispatch.renderers.html_renderer import ( HTMLRenderer, )
# from satellite_ops.topics.builders.ai_gpu_builder import ( build_ai_gpu_paragraphs, )
from satellite_ops.topics.pools.ai_gpu_topics import ( get_random_topic, )
from satellite_ops.feeds.rss_fetcher import ( fetch_rss_titles, )
from satellite_ops.feeds.rss_filter import ( filter_ai_topics, )
from satellite_ops.topics.router.builder_router import ( select_builder, )
from satellite_ops.logs.post_logger import ( log_post, )
from satellite_ops.topics.saturation.topic_saturation import ( is_topic_saturated,)
from satellite_ops.observatory.entropy.keyword_entropy import ( analyze_keyword_entropy,)
from satellite_ops.feeds.article_fetcher import ( fetch_article_text, )
from satellite_ops.feeds.rss_registry import ( RSS_FEEDS,)
from satellite_ops.feeds.rss_summarizer import ( summarize_article_text, )
# ----------------------------------------------------------------------------
#  RSS Topic
# ----------------------------------------------------------------------------

# rss_topics = fetch_rss_titles("https://news.yahoo.co.jp/rss/topics/it.xml")

all_topics = []

for feed in RSS_FEEDS:
    print( f"\n📡 Fetching: {feed['name']}")
    topics = fetch_rss_titles(feed["url"])

    all_topics.extend(topics)

rss_topics = filter_ai_topics(all_topics)

print("\n📡 RAW RSS Topics\n")

for topic in rss_topics:
    print(topic)

rss_topics = filter_ai_topics(rss_topics)

print("\n🧠 FILTERED RSS Topics\n")

for topic in rss_topics:
    print(topic)

print("\n📡 RSS Topics\n")

for topic in rss_topics:
    print(topic)


# ----------------------------------------------------------------------------
# Mock Topic
# ----------------------------------------------------------------------------
   
available_topics = [
topic
for topic in rss_topics
    if not is_topic_saturated(
        topic["title"]
    )
]

if available_topics:
    TOPIC = random.choice( available_topics )

else:
    print( "⚠ All topics saturated." )
    TOPIC = get_random_topic()

article_text = fetch_article_text(TOPIC.get("link", ""))

print("\n📰 Article Preview\n")

print(article_text[:500])


summary_paragraphs = summarize_article_text(article_text)

print("\n🧠 Summary Preview\n")

for paragraph in summary_paragraphs:
    print(f"- {paragraph}")


CURRENT_HOUR = datetime.now().hour

# ----------------------------------------------------------------------------
# Paragraphs
# ----------------------------------------------------------------------------

paragraphs = select_builder(
    topic=TOPIC,
    hour=CURRENT_HOUR,
)

# ----------------------------------------------------------------------------
# Renderer
# ----------------------------------------------------------------------------

renderer = HTMLRenderer()


# ----------------------------------------------------------------------------
# CTA
# ----------------------------------------------------------------------------

cta_html = renderer.load_cta(
"/home/maya/shin-dev/shin-vps/satellite_ops/cta/templates/bicstation_default.html"
)

# ----------------------------------------------------------------------------
# Render HTML
# ----------------------------------------------------------------------------


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

log_post("bicstation", TOPIC)

entropy = analyze_keyword_entropy()
print("\n📊 Keyword Entropy")

for keyword, count in entropy.items():
    print(f"{keyword}: {count}")

print("✅ Single satellite post completed.")
