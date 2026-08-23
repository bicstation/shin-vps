#!/usr/bin/env python3

import json
import base64

from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

GMAIL_DIR = BASE_DIR.parent

OUTPUT_DIR = (
    BASE_DIR
    /
    "output"
)

TOKEN_PATH = (
    GMAIL_DIR
    /
    "token.json"
)

CREDENTIALS_PATH = (
    GMAIL_DIR
    /
    "credentials.json"
)


# =========================================================
# GMAIL
# =========================================================

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]


SENDER = (
    "support@valuecommerce.ne.jp"
)


TARGET_SUBJECT_MARKER = (
    "アフィリエイター様限定"
)


# =========================================================
# SERVICE
# =========================================================

def build_service():

    credentials = (
        Credentials
        .from_authorized_user_file(
            TOKEN_PATH,
            SCOPES,
        )
    )


    return build(
        "gmail",
        "v1",
        credentials=credentials,
    )


# =========================================================
# HEADER
# =========================================================

def extract_headers(
    payload,
):

    headers = {}


    for header in payload.get(
        "headers",
        [],
    ):

        headers[
            header["name"]
        ] = header["value"]


    return headers


# =========================================================
# SEARCH
# =========================================================

def search_target_mail(
    service,
):

    result = (
        service
        .users()
        .messages()
        .list(
            userId="me",
            q=f"from:{SENDER}",
            maxResults=100,
        )
        .execute()
    )


    messages = result.get(
        "messages",
        [],
    )


    for message in messages:

        metadata = (
            service
            .users()
            .messages()
            .get(
                userId="me",
                id=message[
                    "id"
                ],
                format="metadata",
                metadataHeaders=[
                    "Subject",
                ],
            )
            .execute()
        )


        headers = extract_headers(
            metadata.get(
                "payload",
                {},
            )
        )


        subject = headers.get(
            "Subject",
            "",
        )


        if (
            TARGET_SUBJECT_MARKER
            in subject
        ):

            return message


    raise RuntimeError(
        "Lenovo affiliate mail not found"
    )


# =========================================================
# FETCH
# =========================================================

def fetch_message(
    service,
    message_id,
):

    return (
        service
        .users()
        .messages()
        .get(
            userId="me",
            id=message_id,
            format="full",
        )
        .execute()
    )


# =========================================================
# BODY
# =========================================================

def decode_body(
    body,
):

    data = body.get(
        "data",
        "",
    )


    if not data:

        return ""


    return (
        base64
        .urlsafe_b64decode(
            data
        )
        .decode(
            "utf-8",
            errors="ignore",
        )
    )


def extract_content(
    payload,
):

    text = ""

    html = ""


    if payload.get(
        "parts"
    ):

        for part in payload[
            "parts"
        ]:

            child_text, child_html = (
                extract_content(
                    part
                )
            )


            text += child_text

            html += child_html


    else:

        content = decode_body(
            payload.get(
                "body",
                {},
            )
        )


        if payload.get(
            "mimeType"
        ) == "text/html":

            html += content

        else:

            text += content


    return (
        text,
        html,
    )


# =========================================================
# SAVE OBSERVATION
# =========================================================

def save_observation(
    message,
    raw,
):

    headers = extract_headers(
        raw[
            "payload"
        ]
    )


    text, html = (
        extract_content(
            raw[
                "payload"
            ]
        )
    )


    output_dir = (
        OUTPUT_DIR
        /
        message[
            "id"
        ]
    )


    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )


    with open(
        output_dir / "raw.json",
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            raw,
            f,
            ensure_ascii=False,
            indent=2,
        )


    with open(
        output_dir / "body.html",
        "w",
        encoding="utf-8",
    ) as f:

        f.write(
            html
        )


    observation = {

        "identity": {

            "message_id":
                message[
                    "id"
                ],

        },

        "headers":
            headers,

        "content": {

            "text":
                text,

            "html":
                html,

        },

    }


    observation_path = (
        output_dir
        /
        "observation.json"
    )


    with open(
        observation_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            observation,
            f,
            ensure_ascii=False,
            indent=2,
        )


    return output_dir


# =========================================================
# RUNTIME
# =========================================================

def run():

    print()

    print("=" * 80)

    print(
        "LENOVO GMAIL ACQUIRE"
    )

    print("=" * 80)


    service = build_service()


    message = search_target_mail(
        service
    )


    raw = fetch_message(
        service,
        message[
            "id"
        ],
    )


    headers = extract_headers(
        raw[
            "payload"
        ]
    )


    subject = headers.get(
        "Subject",
        "",
    )


    output_dir = save_observation(
        message,
        raw,
    )


    print()

    print(
        "○ TARGET FOUND"
    )


    print(
        "SUBJECT:",
        subject,
    )


    print(
        "MESSAGE:",
        message[
            "id"
        ],
    )


    print(
        "OUTPUT:",
        output_dir,
    )


    return output_dir


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    run()