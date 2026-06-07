# =========================================================
# FILE:
# api/services/ai/exceptions/parse_error.py
# =========================================================

from api.services.ai.exceptions.ai_error import (
    AIError,
)


class ParseError(AIError):

    def __init__(

        self,

        message="Parse Error",

    ):

        super().__init__(
            message
        )