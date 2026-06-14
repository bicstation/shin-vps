# =========================================================
# FILE:
# api/utils/semantic/coverage/api/validate_related_api.py
# =========================================================

import requests


def validate_related_api(

    coverage,

    base_url,

):

    try:

        response = requests.get(

            f"{base_url}/api/pc/1/related/",

            timeout=10,

        )

        if response.status_code == 200:

            coverage.api = "PASS"

        else:

            coverage.api = "FAIL"

            coverage.notes.append(

                f"related_api_{response.status_code}"

            )

    except Exception as e:

        coverage.api = "FAIL"

        coverage.notes.append(

            f"related_api_error:{str(e)}"

        )