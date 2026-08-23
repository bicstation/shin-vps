#!/usr/bin/env python3

import json
import base64

from pathlib import Path


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = (
    BASE_DIR
    /
    "output"
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
# BUILD OBSERVATION
# =========================================================

def build_observation(
    message,
    raw,
):

    payload = raw.get(
        "payload",
        {},
    )


    headers = extract_headers(
        payload
    )


    text, html = (
        extract_content(
            payload
        )
    )


    return {

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


# =========================================================
# PERSIST OBSERVATION
# =========================================================

def save_observation(
    message,
    raw,
):

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


    # -----------------------------------------------------
    # RAW
    # -----------------------------------------------------

    raw_path = (
        output_dir
        /
        "raw.json"
    )


    with open(
        raw_path,
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            raw,
            f,
            ensure_ascii=False,
            indent=2,
        )


    # -----------------------------------------------------
    # BODY HTML
    # -----------------------------------------------------

    payload = raw.get(
        "payload",
        {},
    )


    _, html = (
        extract_content(
            payload
        )
    )


    html_path = (
        output_dir
        /
        "body.html"
    )


    with open(
        html_path,
        "w",
        encoding="utf-8",
    ) as f:

        f.write(
            html
        )


    # -----------------------------------------------------
    # OBSERVATION
    # -----------------------------------------------------

    observation = build_observation(
        message,
        raw,
    )


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

def run(
    message,
    raw,
):

    print()

    print("=" * 80)

    print(
        "LENOVO MAIL OBSERVATION"
    )

    print("=" * 80)


    output_dir = save_observation(
        message,
        raw,
    )


    print()

    print(
        "OBSERVATION:",
        output_dir,
    )


    return output_dir


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    raise SystemExit(
        "observe.py is intended to be called by pipeline.py."
    )