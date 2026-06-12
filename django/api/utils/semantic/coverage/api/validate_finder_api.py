# =========================================================
# FILE:
# api/utils/semantic/coverage/api/validate_finder_api.py
# =========================================================

import requests


def validate_finder_api(

    coverage,

    base_url,

):

    try:

        response = requests.get(

            f"{base_url}/api/general/finder/",

            timeout=10,

        )

        if response.status_code == 200:

            coverage.api = "PASS"

        else:

            coverage.api = "FAIL"

            coverage.notes.append(

                f"finder_api_{response.status_code}"

            )

    except Exception as e:

        coverage.api = "FAIL"

        coverage.notes.append(

            f"finder_api_error:{str(e)}"

        )