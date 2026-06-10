# =========================================================
# FILE:
# api/services/ai/runtime/ai_runtime.py
# =========================================================

import os
from api.services.ai.constants.models import (
    GEMINI_FLASH,
    GEMMA_41B,
)

class AIRuntime:
    
    # =====================================================
    # GEMINI API KEY数
    # =====================================================

    GEMINI_KEY_COUNT = 10

    # =====================================================
    # 並列実行ワーカー数
    # =====================================================

    MAX_WORKERS = 2

    # =====================================================
    # リトライ回数
    # =====================================================

    MAX_RETRIES = 3

    # =====================================================
    # API通信タイムアウト（秒）
    # =====================================================

    TIMEOUT = 60

    # =====================================================
    # 1キーあたりの1分間リクエスト上限
    # =====================================================

    RPM_PER_KEY = 10

    # =====================================================
    # 429発生後のクールダウン時間（秒）
    # =====================================================

    COOLDOWN_SECONDS = 60
    
    
    # =====================================================
    # DEFAULT MODELS
    # =====================================================

    DEFAULT_SPEC_MODEL = (
        GEMINI_FLASH
    )

    DEFAULT_SUMMARY_MODEL = (
        GEMMA_41B
    )

    DEFAULT_COMPARISON_MODEL = (
        GEMMA_41B
    )

    # =====================================================
    # API KEYS
    # =====================================================

    @classmethod
    def api_keys(cls):

        return [

            os.getenv(
                f"GEMINI_API_KEY_{i}"
            )

            for i in range(
                1,
                cls.GEMINI_KEY_COUNT + 1
            )

            if os.getenv(
                f"GEMINI_API_KEY_{i}"
            )

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
            cls.MAX_WORKERS,
            cls.active_key_count(),
        )

    # =====================================================
    # MAX RETRIES
    # =====================================================

    @classmethod
    def max_retries(cls):

        return cls.MAX_RETRIES

    # =====================================================
    # TIMEOUT
    # =====================================================

    @classmethod
    def timeout(cls):

        return cls.TIMEOUT

    # =====================================================
    # RPM
    # =====================================================

    @classmethod
    def rpm_per_key(cls):

        return cls.RPM_PER_KEY

    # =====================================================
    # COOLDOWN
    # =====================================================

    @classmethod
    def cooldown_seconds(cls):

        return cls.COOLDOWN_SECONDS

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

            "rpm_per_key":
                cls.rpm_per_key(),

            "cooldown_seconds":
                cls.cooldown_seconds(),

        }