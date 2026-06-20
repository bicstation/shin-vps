# -*- coding: utf-8 -*-
# api/services/semantic/v2/intent/unknown_logger.py

import json
from pathlib import Path
from datetime import datetime


# ==========================================================
# LOG FILE
# ==========================================================

# BASE_DIR = Path(
#     __file__
# ).resolve().parents[6]
INTENT_DIR = Path(
    __file__
).resolve().parent

# LOG_DIR = (
#     BASE_DIR
#     / "logs"
# )
LOG_DIR = (
    INTENT_DIR
    / "logs"
)

LOG_FILE = (
    LOG_DIR
    / "unknown_intents.jsonl"
)


# ==========================================================
# LOG UNKNOWN TERM
# ==========================================================

def log_unknown_term(

    term,

    message=None,

):

    if not term:
        return

    LOG_DIR.mkdir(
        parents=True,
        exist_ok=True,
    )

    payload = {

        "timestamp":

            datetime.utcnow()
            .isoformat(),

        "term":
            term,

        "message":
            message,
    }

    with open(

        LOG_FILE,

        "a",

        encoding="utf-8",

    ) as fp:

        fp.write(

            json.dumps(

                payload,

                ensure_ascii=False,

            )

            + "\n"
        )