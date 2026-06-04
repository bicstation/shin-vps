# ============================================================================
# SHIN SATELLITE OPS｜Topic Saturation
# ============================================================================

from pathlib import Path
from datetime import datetime, timedelta

LOG_PATH = "satellite_ops/logs/post_history.log"

def is_topic_saturated(topic_title,hours=24,):

    path = Path(LOG_PATH)

    if not path.exists():
        return False

    now = datetime.now()

    with open(path, "r", encoding="utf-8") as f:

        lines = f.readlines()
    
    if is_semantically_similar(
        topic_title,
        lines,
        ):
        return True   

    for line in reversed(lines):

        if topic_title not in line:
            continue

        try:

            timestamp_str = (
                line.split("]")[0]
                .replace("[", "")
                .strip()
            )

            post_time = datetime.strptime(
                timestamp_str,
                "%Y-%m-%d %H:%M:%S"
            )

            delta = now - post_time

            if delta < timedelta(hours=hours):
                return True

        except Exception:
            continue

    return False


def is_semantically_similar(topic_title,logs,):

    keywords = set(
        topic_title.lower().split()
    )

    for line in logs:

        line_lower = line.lower()

        overlap = sum(
            1
            for keyword in keywords
            if keyword in line_lower
        )

        if overlap >= 2:
            return True

    return False

