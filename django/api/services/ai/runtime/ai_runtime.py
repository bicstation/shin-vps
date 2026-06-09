# =========================================================
# FILE:
# api/services/ai/runtime/ai_runtime.py
# =========================================================

import os


class AIRuntime:

    # =====================================================
    # API KEYS
    # =====================================================

    @classmethod
    def api_keys(cls):

        return [

            key

            for key in [

                os.getenv(
                    "GEMINI_API_KEY_1"
                ),

                os.getenv(
                    "GEMINI_API_KEY_2"
                ),

                os.getenv(
                    "GEMINI_API_KEY_3"
                ),

                os.getenv(
                    "GEMINI_API_KEY_4"
                ),

                os.getenv(
                    "GEMINI_API_KEY_5"
                ),

                os.getenv(
                    "GEMINI_API_KEY_6"
                ),

                os.getenv(
                    "GEMINI_API_KEY_7"
                ),

                os.getenv(
                    "GEMINI_API_KEY_8"
                ),

                os.getenv(
                    "GEMINI_API_KEY_9"
                ),

                os.getenv(
                    "GEMINI_API_KEY_10"
                ),

            ]

            if key

        ]

    # =====================================================
    # ACTIVE KEY COUNT
    # =====================================================

    @classmethod
    def active_key_count(cls):

        return len(

            cls.api_keys()

        )

    # =====================================================
    # MAX WORKERS
    # =====================================================

    @classmethod
    def max_workers(cls):

        return min(

            8,

            cls.active_key_count(),

        )

    # =====================================================
    # RETRY
    # =====================================================

    @classmethod
    def max_retries(cls):

        return 3

    # =====================================================
    # TIMEOUT
    # =====================================================

    @classmethod
    def timeout(cls):

        return 100

    # =====================================================
    # STATUS
    # =====================================================

    @classmethod
    def status(cls):

        return {

            "active_keys":
                cls.active_key_count(),

            "max_workers":
                cls.max_workers(),

            "max_retries":
                cls.max_retries(),

            "timeout":
                cls.timeout(),

        }