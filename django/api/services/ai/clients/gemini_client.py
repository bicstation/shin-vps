# =========================================================
# FILE:
# api/services/ai/clients/gemini_client.py
# =========================================================

import time

import requests

from api.services.ai.runtime.key_rotator import (
    KeyRotator,
)


class GeminiClient:

    MODEL_ID = (
        "gemini-2.5-flash"
    )

    TIMEOUT = 100

    # =====================================================
    # INIT
    # =====================================================

    def __init__(

        self,

        model_name=None,

    ):

        self.model_name = (

            model_name
            or self.MODEL_ID

        )

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
        
        if not KeyRotator.KEYS:

            raise Exception(
                "Gemini API Keys Not Configured"
            )

        started = time.time()

        tried_keys = set()

        while (

            len(tried_keys)
            <
            len(KeyRotator.KEYS)

        ):

            api_key, key_no = (
                KeyRotator.next_key()
            )

            if key_no in tried_keys:
                continue

            tried_keys.add(
                key_no
            )

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
                                "text": prompt
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

            try:

                response = requests.post(

                    api_url,

                    json=payload,

                    timeout=self.TIMEOUT,

                )

                # =====================================
                # AUTH
                # =====================================

                if response.status_code == 401:

                    print(
                        f"[GEMINI] "
                        f"KEY={key_no} "
                        f"AUTH FAILED"
                    )

                    continue

                if response.status_code == 403:

                    print(
                        f"[GEMINI] "
                        f"KEY={key_no} "
                        f"PERMISSION DENIED"
                    )

                    continue

                # =====================================
                # RATE LIMIT
                # =====================================

                if response.status_code == 429:

                    print(
                        f"[GEMINI] "
                        f"429 "
                        f"KEY={key_no} "
                        f"SWITCH"
                    )

                    continue

                response.raise_for_status()

                result = (
                    response.json()
                )
                
                if (

                    "candidates"
                    not in result

                ):

                    print(
                        f"[GEMINI] "
                        f"KEY={key_no} "
                        f"MISSING CANDIDATES"
                    )

                    continue

                elapsed = round(

                    time.time()
                    - started,

                    2,

                )

                return {

                    "response":
                        result,

                    "attempts":
                        len(
                            tried_keys
                        ),

                    "elapsed":
                        elapsed,

                    "model":
                        self.model_name,

                    "api_key_index":
                        key_no,

                }
            
            except Exception as e:

                print(
                    f"[GEMINI] "
                    f"KEY={key_no} "
                    f"FAILED: {str(e)}"
                )

                continue

        raise Exception(
            "All Gemini Keys Failed"
        )