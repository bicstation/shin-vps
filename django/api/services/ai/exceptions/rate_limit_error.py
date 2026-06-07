# =========================================================
# FILE:
# api/services/ai/exceptions/rate_limit_error.py
# =========================================================

from api.services.ai.exceptions.ai_error import (
    AIError,
)


class RateLimitError(AIError):

    def __init__(

        self,

        message="Rate Limit Exceeded",

        retry_after=None,

    ):

        super().__init__(
            message
        )

        self.retry_after = (
            retry_after
        )