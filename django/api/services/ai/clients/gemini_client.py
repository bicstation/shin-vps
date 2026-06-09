# =========================================================
# FILE:
# api/services/ai/clients/gemini_client.py
# =========================================================

import json
import os
import time

import requests


class GeminiClient:

    MODEL_ID = (
        # "gemini-2.5-flash-lite"
        "gemma-4-31b-it"
    )

    MAX_RETRIES = 3

    TIMEOUT = 100
    
    
    def __init__(
        self,
        model_name=None,
    ):

        self.model_name = (
            model_name
            or self.MODEL_ID
        )
    
        self.api_keys = [

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

        self.api_keys = [

            key
            for key in self.api_keys
            if key
        ]

        self.key_index = 0

    # =====================================================
    # NEXT KEY
    # =====================================================

    def next_key(self):

        if not self.api_keys:

            raise Exception(
                "Gemini API Key Not Found"
            )

        key = self.api_keys[
            self.key_index
        ]

        self.key_index = (

            self.key_index + 1

        ) % len(
            self.api_keys
        )

        return key

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

        api_key = self.next_key()

        api_url = (
            f"https://generativelanguage.googleapis.com/"
            f"v1beta/models/"
            f"{self.model_name}:generateContent"
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
                "temperature":
                    0,
                "responseMimeType":
                    response_mime_type,
            },
        }

        attempt = 0

        while attempt < self.MAX_RETRIES:

            try:
                response = requests.post(
                    api_url,
                    json=payload,
                    timeout=self.TIMEOUT,
                )

                # =====================================
                # RATE LIMIT
                # =====================================
                if response.status_code == 429:

                    try:

                        error_json = response.json()

                    except Exception:

                        error_json = {}

                    print(
                        "\n"
                        "==================================================\n"
                        "🚨 GEMINI RATE LIMIT\n"
                        "==================================================\n"
                        f"MODEL      : {self.model_name}\n"
                        f"STATUS     : {response.status_code}\n"
                        f"RETRY      : {attempt + 1}/{self.MMAX_RETRIES}\n"
                        # f"PRODUCT    : {product_id}\n"
                        f"RESPONSE   :\n"
                        f"{json.dumps(error_json, indent=2, ensure_ascii=False)}\n"
                        "==================================================\n"
                    )

                if (
                    response.status_code
                    == 429
                ):

                    attempt += 1

                    retry_seconds = (
                        self.extract_retry_delay(
                            response
                        )
                    )

                    print(

                        f"[GEMINI] "
                        f"429 Retry "
                        f"{attempt}/"
                        f"{self.MAX_RETRIES} "
                        f"wait="
                        f"{retry_seconds}s"

                    )

                    time.sleep(
                        retry_seconds
                    )

                    continue

                response.raise_for_status()

                result = (
                    response.json()
                )

                # print(
                #     json.dumps(
                #         result,
                #         indent=2,
                #         ensure_ascii=False
                #     )[:3000]
                # )

                if (

                    "candidates"
                    not in result

                ):

                    raise Exception(

                        "Gemini Response "
                        "Missing Candidates"

                    )

                return {

                    "response": result,

                    "attempts": attempt + 1,

                    "model": self.model_name,

                    "api_key_index": self.key_index,

                }

            except Exception as e:

                attempt += 1

                if (

                    attempt
                    >= self.MAX_RETRIES

                ):

                    raise

                print(

                    f"[GEMINI] Retry "
                    f"{attempt}: {e}"

                )

                time.sleep(5)

        return None

    # =====================================================
    # RETRY DELAY
    # =====================================================

    def extract_retry_delay(

        self,

        response,

    ):

        try:

            data = (
                response.json()
            )

            details = (

                data

                .get(
                    "error",
                    {}
                )

                .get(
                    "details",
                    []
                )

            )

            for item in details:

                retry_delay = (
                    item.get(
                        "retryDelay"
                    )
                )

                if retry_delay:

                    return int(

                        retry_delay

                        .replace(
                            "s",
                            ""
                        )

                    )

        except Exception:

            pass

        return 30