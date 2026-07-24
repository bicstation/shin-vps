# =========================================================
# FILE:
# api/services/ai/clients/gemini_client.py
# =========================================================

import re
import time
import requests

from api.services.ai.runtime.ai_runtime import AIRuntime
from api.services.ai.runtime.key_rotator import KeyRotator


class RateLimitException(Exception):

    def __init__(self, retry_seconds):
        self.retry_seconds = retry_seconds
        super().__init__(f"RATE LIMIT ({retry_seconds:.3f}s)")


class GeminiClient:

    # =====================================================
    # INIT
    # =====================================================

    def __init__(self, model_name):
        self.model_name = model_name

    # =====================================================
    # GENERATE
    # =====================================================

    def generate(
        self,
        prompt,
        response_mime_type="application/json",
    ):

        started = time.time()
        attempts = 0

        while True:

            if (
                time.time() - started
                >= AIRuntime.max_wait_seconds()
            ):
                raise Exception(
                    f"GEMINI TIMEOUT ({AIRuntime.max_wait_seconds()}s)"
                )

            try:

                api_key, key_no = KeyRotator.next_key()
                attempts += 1

                print(
                    f"\n🚀 Attempt {attempts}"
                    f" | KEY={key_no}"
                    f" | MODEL={self.model_name}"
                )

                result = self.request(
                    api_key=api_key,
                    prompt=prompt,
                    response_mime_type=response_mime_type,
                )

                elapsed = round(
                    time.time() - started,
                    2,
                )

                print(
                    f"✅ SUCCESS"
                    f" | KEY={key_no}"
                    f" | {elapsed} sec"
                )

                return {
                    "response": result,
                    "elapsed": elapsed,
                    "model": self.model_name,
                    "api_key_index": key_no,
                }

            except RateLimitException as e:

                print(
                    f"❌ RATE LIMIT"
                    f" | KEY={key_no}"
                    f" | WAIT={e.retry_seconds:.3f}s"
                )

                try:
                    KeyRotator.cooldown(key_no, e.retry_seconds,)
                except Exception:
                    pass

                print(
                    f"⏳ Sleeping {e.retry_seconds:.3f}s..."
                )

                time.sleep(e.retry_seconds)
                
            except Exception as e:

                if str(e) == "All Gemini Keys Busy":
                    time.sleep(1)
                    continue

                print(
                    f"❌ {type(e).__name__}"
                    f" | KEY={key_no}"
                    f" | {e}"
                )

                try:
                    KeyRotator.cooldown(key_no,AIRuntime.cooldown_seconds(),)
                except Exception:
                    pass

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
            f"v1beta/models/{self.model_name}"
            f":generateContent?key={api_key}"
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
                "responseMimeType": response_mime_type,
            },
        }

        response = requests.post(
            api_url,
            json=payload,
            timeout=AIRuntime.timeout(),
        )

        if response.status_code == 401:
            raise Exception("AUTH FAILED")

        if response.status_code == 403:
            raise Exception("PERMISSION DENIED")

        if response.status_code == 429:

            retry_seconds = AIRuntime.cooldown_seconds()

            try:

                body = response.json()

                print("\n========== 429 ==========")
                print(f"KEY     : {api_key[:8]}...")
                print("Headers :", dict(response.headers))
                print("Body    :", body)
                print("=========================\n")

                message = body.get("error", {}).get("message", "")

                m = re.search(
                    r"Please retry in ([0-9.]+)(ms|s)",
                    message,
                )

                if m:

                    value = float(m.group(1))
                    unit = m.group(2)

                    retry_seconds = (
                        value / 1000
                        if unit == "ms"
                        else value
                    )

                else:

                    for detail in body.get("error", {}).get("details", []):

                        if detail.get("@type", "").endswith("RetryInfo"):

                            retry = detail.get("retryDelay", "")

                            if retry.endswith("ms"):
                                retry_seconds = float(retry[:-2]) / 1000

                            elif retry.endswith("s"):
                                retry_seconds = float(retry[:-1])

                            break

            except Exception:
                pass

            raise RateLimitException(retry_seconds)

        response.raise_for_status()

        result = response.json()
        
        print("\n========== RAW RESPONSE ==========")
        print(result)
        print("==================================\n")

        if "candidates" not in result:
            raise Exception("MISSING CANDIDATES")

        return result