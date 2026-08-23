import json
import base64

from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


# =========================================================
# PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

OUTPUT_DIR = BASE_DIR / "output"

TOKEN_PATH = BASE_DIR.parent / "token.json"


# =========================================================
# GMAIL
# =========================================================

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]


SENDER = (
    "support@valuecommerce.ne.jp"
)

# =========================================================
# TARGET SUBJECT
# =========================================================

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
# FIND TARGET MAIL
# =========================================================

def find_target_mail(
    service,
):

    page_token = None

    index = 0


    while True:

        result = (
            service
            .users()
            .messages()
            .list(
                userId="me",
                q=f"from:{SENDER}",
                maxResults=100,
                pageToken=page_token,
            )
            .execute()
        )


        messages = result.get(
            "messages",
            [],
        )


        for message in messages:

            index += 1


            metadata = (
                service
                .users()
                .messages()
                .get(
                    userId="me",
                    id=message["id"],
                    format="metadata",
                    metadataHeaders=[
                        "Subject",
                    ],
                )
                .execute()
            )


            headers = extract_headers(
                metadata["payload"]
            )


            subject = headers.get(
                "Subject",
                "",
            )


            if TARGET_SUBJECT_MARKER in subject:

                print(
                    f"[{index}] ○ {subject}"
                )

                return message


            print(
                f"[{index}] × {subject}"
            )


        page_token = result.get(
            "nextPageToken"
        )


        if not page_token:

            break


    raise RuntimeError(
        "Lenovo target mail not found"
    )


# =========================================================
# FETCH FULL MAIL
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

        for part in payload["parts"]:

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
        raw["payload"]
    )


    text, html = (
        extract_content(
            raw["payload"]
        )
    )


    output_dir = (
        OUTPUT_DIR
        /
        message["id"]
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
                message["id"],

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


    with open(
        output_dir / "observation.json",
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
        "LENOVO MAIL OBSERVER"
    )

    print("=" * 80)


    service = build_service()


    message = find_target_mail(
        service
    )


    raw = fetch_message(
        service,
        message["id"],
    )


    output_dir = save_observation(
        message,
        raw,
    )


    print()

    print(
        "TARGET FOUND"
    )


    print(
        "OUTPUT:",
        output_dir,
    )


    return output_dir


if __name__ == "__main__":

    run()