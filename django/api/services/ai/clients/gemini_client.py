# =========================================================
# FILE:
# api/services/ai/clients/gemini_client.py
# =========================================================

import time
import requests

from api.services.ai.runtime.ai_runtime import ( AIRuntime,)
from api.services.ai.runtime.key_rotator import ( KeyRotator, )

class GeminiClient:

    # =====================================================
    # INIT
    # =====================================================

    def __init__(
        self,
        model_name,
    ):

        self.model_name = model_name

    # =====================================================
    # GENERATE
    # =====================================================

    def generate(
        self,
        prompt,
        response_mime_type=(
            "application/json"
        ),
    ):

        started = time.time()

        while True:

            api_key, key_no = (
                KeyRotator.next_key()
            )

            try:

                result = self.request(

                    api_key=api_key,
                    prompt=prompt,
                    response_mime_type=(
                        response_mime_type
                    ),

                )

                elapsed = round(

                    time.time()
                    - started,
                    2,

                )

                return {

                    "response":
                        result,

                    "elapsed":
                        elapsed,

                    "model":
                        self.model_name,

                    "api_key_index":
                        key_no,

                }

            except Exception as e:
                   
                self.stdout.write(
                    self.style.ERROR(

                        f"❌ "
                        f"{product.unique_id} "
                        f"{type(e).__name__} "
                        f"{str(e)}"

                    )
                )

                KeyRotator.cooldown(
                    key_no
                )

    # =====================================================
    # REQUEST
    # =====================================================

    def request(

        self,

        api_key,

        prompt,

        response_mime_type,

    ):

        api_url = (

            "https://generativelanguage.googleapis.com/"
            f"v1beta/models/"
            f"{self.model_name}"
            f":generateContent"
            f"?key={api_key}"

        )

        payload = {

            "contents": [

                {

                    "parts": [

                        {

                            "text":
                                prompt

                        }

                    ]

                }

            ],

            "generationConfig": {

                "temperature": 0,

                "responseMimeType":
                    response_mime_type,

            },

        }

        response = requests.post(

            api_url,

            json=payload,

            timeout=(
                AIRuntime.timeout()
            ),

        )

        # =====================================
        # AUTH
        # =====================================

        if response.status_code == 401:

            raise Exception(
                "AUTH FAILED"
            )

        if response.status_code == 403:

            raise Exception(
                "PERMISSION DENIED"
            )

        # =====================================
        # RATE LIMIT
        # =====================================

        if response.status_code == 429:

            raise Exception(
                "RATE LIMIT"
            )

        response.raise_for_status()

        result = (
            response.json()
        )
        
        print('~~~~~~~~~~~~~RESUKT JSON~~~~~~~~~~~~~')
        print(result)
        print('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~')
        
        if (

            "candidates"
            not in result

        ):

            raise Exception(
                "MISSING CANDIDATES"
            )

        return result