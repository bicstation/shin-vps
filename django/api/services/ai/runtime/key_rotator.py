import time
import threading

from api.services.ai.runtime.ai_runtime import (
    AIRuntime,
)


class KeyRotator:

    _lock = threading.Lock()

    _index = 0

    KEYS = AIRuntime.api_keys()

    _usage = {}

    # =====================================
    # INITIALIZE
    # =====================================

    for i in range(len(KEYS)):

        _usage[i + 1] = {

            "count": 0,

            "window_start":
                time.time(),

            "cooldown_until":
                0,

        }

    # =====================================
    # NEXT KEY
    # =====================================

    @classmethod
    def next_key(cls):

        with cls._lock:

            now = time.time()

            total = len(cls.KEYS)

            for _ in range(total):

                idx = cls._index

                key_no = idx + 1

                cls._index = (
                    cls._index + 1
                ) % total

                usage = (
                    cls._usage[key_no]
                )

                # ====================
                # WINDOW RESET
                # ====================

                if (

                    now
                    - usage["window_start"]

                    >=

                    60

                ):

                    usage["count"] = 0

                    usage["window_start"] = (
                        now
                    )

                # ====================
                # COOLDOWN
                # ====================

                if (

                    usage[
                        "cooldown_until"
                    ]

                    >

                    now

                ):

                    continue

                # ====================
                # RPM LIMIT
                # ====================

                if (

                    usage["count"]

                    >=

                    AIRuntime.rpm_per_key()

                ):

                    continue

                usage["count"] += 1

                return (

                    cls.KEYS[idx],

                    key_no,

                )

            raise Exception(

                "All Gemini Keys Busy"

            )

    # =====================================
    # COOLDOWN
    # =====================================

    @classmethod
    def cooldown(

        cls,
        key_no,
        seconds,

    ):

        with cls._lock:
            
            
            cls._usage[
                key_no
            ][
                "cooldown_until"
            ] = (

                time.time()

                +

                seconds

            )

