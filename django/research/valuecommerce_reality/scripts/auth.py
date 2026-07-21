# /home/maya/shin-vps/django/research/valuecommerce_reality/scripts/auth.py

from __future__ import annotations

import base64

import requests

from config import (
    VALUECOMMERCE_ACCEPT,
    VALUECOMMERCE_AUTH_URL,
    VALUECOMMERCE_CLIENT_KEY,
    VALUECOMMERCE_CLIENT_SECRET,
    VALUECOMMERCE_GRANT_TYPE,
    VALUECOMMERCE_TIMEOUT,
)


def create_signature() -> str:
    """
    Create Base64 signature from Client Key and Client Secret.
    """

    raw = (
        f"{VALUECOMMERCE_CLIENT_KEY}"
        f"|"
        f"{VALUECOMMERCE_CLIENT_SECRET}"
    )

    return base64.b64encode(
        raw.encode("utf-8")
    ).decode("utf-8")


def get_token() -> str:
    """
    Request OAuth Bearer Token.

    Returns
    -------
    str
        OAuth Bearer Token
    """

    headers = {
        "Authorization": (
            f"Bearer {create_signature()}"
        ),
        "Accept": VALUECOMMERCE_ACCEPT,
    }

    params = {
        "grant_type": VALUECOMMERCE_GRANT_TYPE,
    }

    response = requests.get(
        VALUECOMMERCE_AUTH_URL,
        headers=headers,
        params=params,
        timeout=VALUECOMMERCE_TIMEOUT,
    )

    response.raise_for_status()

    payload = response.json()

    return payload["resultSet"]["rowData"]["bearer_token"]


def main() -> None:
    """
    OAuth Reality Test.
    """

    token = get_token()

    print(token)


if __name__ == "__main__":
    main()