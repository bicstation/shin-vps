# =========================================================
# FILE:
# coverage/api/validate_discovery_api.py
# =========================================================

import requests


def validate_discovery_api(

    coverage,

    base_url,

):

    try:

        response = requests.get(

            f"{base_url}/api/general/semantic/discovery/",

            timeout=10,

        )

        if response.status_code == 200:

            coverage.api = "PASS"

        else:

            coverage.api = "FAIL"

            coverage.notes.append(

                f"discovery_api_{response.status_code}"

            )

    except Exception as e:

        coverage.api = "FAIL"

        coverage.notes.append(

            f"discovery_api_error:{e}"

        )