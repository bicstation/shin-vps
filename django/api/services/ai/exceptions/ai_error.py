# =========================================================
# FILE:
# api/services/ai/exceptions/ai_error.py
# =========================================================


class AIError(Exception):

    def __init__(

        self,

        message="AI Error",

    ):

        super().__init__(
            message
        )

        self.message = (
            message
        )

    def __str__(self):

        return str(
            self.message
        )