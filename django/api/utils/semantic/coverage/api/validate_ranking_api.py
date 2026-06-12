# =========================================================
# FILE:
# api/utils/semantic/coverage/api/validate_ranking_api.py
# =========================================================

import requests


def validate_ranking_api(

    coverage,

    base_url,

):

    try:

        response = requests.get(

            f"{base_url}/api/general/semantic/ranking/",

            timeout=10,

        )

        if response.status_code == 200:

            coverage.api = "PASS"

        else:

            coverage.api = "FAIL"

            coverage.notes.append(

                f"ranking_api_{response.status_code}"

            )

    except Exception as e:

        coverage.api = "FAIL"

        coverage.notes.append(

            f"ranking_api_error:{str(e)}"

        )