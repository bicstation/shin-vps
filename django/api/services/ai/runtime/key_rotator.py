import os
import threading


class KeyRotator:

    _lock = threading.Lock()

    _index = 0

    KEYS = [

        os.getenv(f"GEMINI_API_KEY_{i}")

        for i in range(1, 11)

    ]

    KEYS = [

        k
        for k in KEYS
        if k

    ]

    @classmethod
    def next_key(cls):

        with cls._lock:

            idx = cls._index

            cls._index = (

                cls._index + 1

            ) % len(cls.KEYS)

        return (

            cls.KEYS[idx],
            idx + 1,

        )