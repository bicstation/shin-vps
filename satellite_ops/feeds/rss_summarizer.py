# ============================================================================

# SHIN SATELLITE OPS｜RSS Summarizer

# ============================================================================

import re

def summarize_article_text(article_text,max_sentences=3,):

    if not article_text:
        return []

    # ------------------------------------------------------------------------
    # Cleanup
    # ------------------------------------------------------------------------

    cleaned = re.sub(
        r"\s+",
        " ",
        article_text,
    )

    # ------------------------------------------------------------------------
    # Sentence Split
    # ------------------------------------------------------------------------

    sentences = re.split(
        r"[。.!?]",
        cleaned,
    )

    # ------------------------------------------------------------------------
    # Filter
    # ------------------------------------------------------------------------

    results = []

    for sentence in sentences:
        sentence = sentence.strip()

        if len(sentence) < 30:
            continue

        results.append(sentence)

        if len(results) >= max_sentences:
            break

    return results
