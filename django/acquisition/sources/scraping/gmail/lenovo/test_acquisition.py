import base64
import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from html import unescape
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


BASE_DIR = Path(__file__).resolve().parent

TOKEN_PATH = (
    Path("/usr/src/app/acquisition/sources/scraping/gmail")
    / "token.json"
)

OUTPUT_DIR = BASE_DIR / "output"

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly"
]


# =========================================================
# TARGET REALITY MARKERS
# =========================================================

TARGET_MARKERS = [
    "アフィリエイター様限定",
    "FIFAモデル割引クーポン",
    "39FIFA2026",
    "ThinkBook 14 Gen 9 IPL FIFA World Cup 26 Edition",
]


# =========================================================
# HTML PARSER
# =========================================================

class MailHTMLParser(HTMLParser):

    def __init__(self):
        super().__init__()

        self.text_parts = []
        self.links = []
        self.images = []

        self.skip_depth = 0

        self.current_link = None
        self.link_order = 0
        self.image_order = 0

    # =====================================================
    # START TAG
    # =====================================================

    def handle_starttag(self, tag, attrs):

        attrs = dict(attrs)

        if tag in {
            "script",
            "style",
            "head",
        }:
            self.skip_depth += 1
            return

        if self.skip_depth:
            return

        # -------------------------------------------------
        # LINK
        # -------------------------------------------------

        if tag == "a":

            href = attrs.get("href")

            if href:

                self.link_order += 1

                self.current_link = {
                    "order": self.link_order,
                    "tag": "a",
                    "href": href,
                    "attributes": attrs,
                    "text_parts": [],
                }

        # -------------------------------------------------
        # IMAGE
        # -------------------------------------------------

        elif tag == "img":

            src = attrs.get("src")

            if src:

                self.image_order += 1

                self.images.append(
                    {
                        "order": self.image_order,
                        "tag": "img",
                        "src": src,
                        "attributes": attrs,
                    }
                )

    # =====================================================
    # END TAG
    # =====================================================

    def handle_endtag(self, tag):

        if tag in {
            "script",
            "style",
            "head",
        }:

            if self.skip_depth:
                self.skip_depth -= 1

            return

        if self.skip_depth:
            return

        if tag == "a" and self.current_link:

            text = " ".join(
                self.current_link["text_parts"]
            ).strip()

            self.links.append(
                {
                    "order": self.current_link["order"],
                    "tag": "a",
                    "href": self.current_link["href"],
                    "attributes": self.current_link["attributes"],
                    "text": text,
                }
            )

            self.current_link = None

    # =====================================================
    # DATA
    # =====================================================

    def handle_data(self, data):

        if self.skip_depth:
            return

        text = data.strip()

        if not text:
            return

        text = unescape(text)

        self.text_parts.append(text)

        if self.current_link:

            self.current_link["text_parts"].append(
                text
            )


# =========================================================
# BASE64 DECODE
# =========================================================

def decode_body(data):

    if not data:
        return ""

    raw = base64.urlsafe_b64decode(
        data + "=" * (-len(data) % 4)
    )

    return raw.decode(
        "utf-8",
        errors="replace",
    )


# =========================================================
# FIND HTML
# =========================================================

def find_html(payload):

    mime_type = payload.get(
        "mimeType",
        "",
    )

    body = payload.get(
        "body",
        {},
    )

    data = body.get("data")

    if (
        data
        and mime_type == "text/html"
    ):

        return decode_body(data)

    for part in payload.get(
        "parts",
        [],
    ):

        html_body = find_html(part)

        if html_body:
            return html_body

    return ""


# =========================================================
# HEADERS
# =========================================================

def normalize_headers(message):

    headers = {}

    for header in message.get(
        "payload",
        {},
    ).get(
        "headers",
        [],
    ):

        name = header.get(
            "name",
            "",
        ).lower()

        value = header.get(
            "value",
            "",
        )

        if name:
            headers[name] = value

    return headers


# =========================================================
# PARSE MAIL TEXT
# =========================================================

def extract_mail_text(message):

    html_body = find_html(
        message.get(
            "payload",
            {},
        )
    )

    parser = MailHTMLParser()

    if html_body:

        parser.feed(
            html_body
        )

    text_body = "\n".join(
        parser.text_parts
    )

    return (
        html_body,
        text_body,
        parser,
    )


# =========================================================
# TARGET MATCH
# =========================================================

def match_target(text):

    matched = [
        marker
        for marker in TARGET_MARKERS
        if marker in text
    ]

    return matched


# =========================================================
# MAIN
# =========================================================

def main():

    print()
    print("=" * 80)
    print("GMAIL / LENOVO AFFILIATE ACQUISITION TEST")
    print("=" * 80)

    # =====================================================
    # AUTH
    # =====================================================

    if not TOKEN_PATH.exists():

        raise RuntimeError(
            f"token.json not found: {TOKEN_PATH}"
        )

    print()
    print("[1] AUTH")

    credentials = (
        Credentials.from_authorized_user_file(
            str(TOKEN_PATH),
            SCOPES,
        )
    )

    service = build(
        "gmail",
        "v1",
        credentials=credentials,
    )

    print("    OK")

    # =====================================================
    # SEARCH
    # =====================================================

    print()
    print("[2] SEARCH")

    query = (
        "from:lenovo@ecomm.lenovo.com"
    )

    print()
    print("    QUERY")
    print(f"    {query}")

    result = (
        service.users()
        .messages()
        .list(
            userId="me",
            q=query,
            maxResults=50,
        )
        .execute()
    )

    messages = result.get(
        "messages",
        [],
    )

    if not messages:

        print()
        print(
            "    Lenovo mail not found."
        )

        return

    print()
    print(
        f"    SEARCH RESULTS: {len(messages)}"
    )

    # =====================================================
    # CANDIDATE SCAN
    # =====================================================

    print()
    print("[3] TARGET SEARCH")

    target = None
    target_message = None
    target_html = ""
    target_text = ""
    target_parser = None

    candidates = []

    for index, item in enumerate(
        messages,
        1,
    ):

        # -------------------------------------------------
        # METADATA
        # -------------------------------------------------

        candidate = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=item["id"],
                format="metadata",
                metadataHeaders=[
                    "From",
                    "To",
                    "Subject",
                    "Date",
                ],
            )
            .execute()
        )

        candidate_headers = normalize_headers(
            candidate
        )

        candidate_info = {
            "message_id": item["id"],
            "from": candidate_headers.get(
                "from",
                "",
            ),
            "subject": candidate_headers.get(
                "subject",
                "",
            ),
            "date": candidate_headers.get(
                "date",
                "",
            ),
        }

        candidates.append(
            candidate_info
        )

        print()
        print(
            f"    [{index}]"
        )

        print(
            f"    message_id : "
            f"{candidate_info['message_id']}"
        )

        print(
            f"    from       : "
            f"{candidate_info['from']}"
        )

        print(
            f"    date       : "
            f"{candidate_info['date']}"
        )

        print(
            f"    subject    : "
            f"{candidate_info['subject']}"
        )

        # -------------------------------------------------
        # ACQUIRE CANDIDATE BODY
        # -------------------------------------------------

        candidate_message = (
            service.users()
            .messages()
            .get(
                userId="me",
                id=item["id"],
                format="full",
            )
            .execute()
        )

        (
            candidate_html,
            candidate_text,
            candidate_parser,
        ) = extract_mail_text(
            candidate_message
        )

        # -------------------------------------------------
        # MATCH REALITY MARKERS
        # -------------------------------------------------

        matched = match_target(
            candidate_text
        )

        print(
            f"    matches    : "
            f"{len(matched)}/{len(TARGET_MARKERS)}"
        )

        for marker in matched:

            print(
                f"      ✓ {marker}"
            )

        # -------------------------------------------------
        # TARGET
        # -------------------------------------------------

        if len(matched) == len(
            TARGET_MARKERS
        ):

            target = candidate_info

            target_message = (
                candidate_message
            )

            target_html = (
                candidate_html
            )

            target_text = (
                candidate_text
            )

            target_parser = (
                candidate_parser
            )

            print()
            print(
                "    >>> TARGET MATCHED"
            )

            break

    # =====================================================
    # TARGET NOT FOUND
    # =====================================================

    if target is None:

        print()
        print(
            "=" * 80
        )

        print(
            "TARGET NOT FOUND"
        )

        print(
            "=" * 80
        )

        print()
        print(
            "Required Reality Markers:"
        )

        for marker in TARGET_MARKERS:

            print(
                f"  - {marker}"
            )

        raise RuntimeError(
            "Target Lenovo FIFA affiliate "
            "mail not found."
        )

    # =====================================================
    # TARGET
    # =====================================================

    message_id = target[
        "message_id"
    ]

    print()
    print("[4] TARGET")

    print(
        f"    message_id : "
        f"{message_id}"
    )

    print(
        f"    from       : "
        f"{target['from']}"
    )

    print(
        f"    subject    : "
        f"{target['subject']}"
    )

    print(
        f"    date       : "
        f"{target['date']}"
    )

    # =====================================================
    # OBSERVATION
    # =====================================================

    print()
    print("[5] OBSERVATION")

    headers = normalize_headers(
        target_message
    )

    observation = {

        "schema": {
            "name": "gmail_mail_observation",
            "version": "0.1",
        },

        "source": {
            "type": "gmail",
            "provider": "gmail",
            "query": query,
        },

        "observed_at": (
            datetime.now(
                timezone.utc
            ).isoformat()
        ),

        "identity": {

            "message_id": (
                target_message.get(
                    "id",
                    "",
                )
            ),

            "thread_id": (
                target_message.get(
                    "threadId",
                    "",
                )
            ),

            "history_id": (
                target_message.get(
                    "historyId",
                    "",
                )
            ),

            "internal_date": (
                target_message.get(
                    "internalDate",
                    "",
                )
            ),
        },

        "headers": headers,

        "target": {
            "markers": TARGET_MARKERS,
            "matched": match_target(
                target_text
            ),
        },

        "content": {

            "html": target_html,

            "text": target_text,
        },

        "links": (
            target_parser.links
            if target_parser
            else []
        ),

        "images": (
            target_parser.images
            if target_parser
            else []
        ),
    }

    print(
        f"    links : "
        f"{len(observation['links'])}"
    )

    print(
        f"    images: "
        f"{len(observation['images'])}"
    )

    print(
        f"    text  : "
        f"{len(target_text)} chars"
    )

    # =====================================================
    # TIMESTAMP
    # =====================================================

    timestamp = (
        datetime.now(
            timezone.utc
        ).strftime(
            "%Y%m%dT%H%M%SZ"
        )
    )

    output_dir = (
        OUTPUT_DIR
        / timestamp
    )

    output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # =====================================================
    # PERSIST
    # =====================================================

    print()
    print("[6] PERSIST")

    # -----------------------------------------------------
    # RAW
    # -----------------------------------------------------

    with open(
        output_dir / "raw.json",
        "w",
        encoding="utf-8",
    ) as f:

        json.dump(
            target_message,
            f,
            ensure_ascii=False,
            indent=2,
        )

    # -----------------------------------------------------
    # OBSERVATION
    # -----------------------------------------------------

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

    # -----------------------------------------------------
    # HTML
    # -----------------------------------------------------

    if target_html:

        with open(
            output_dir / "body.html",
            "w",
            encoding="utf-8",
        ) as f:

            f.write(
                target_html
            )

    print()
    print(
        f"    output: {output_dir}"
    )

    # =====================================================
    # COMPLETE
    # =====================================================

    print()
    print("=" * 80)

    print(
        "GMAIL / LENOVO AFFILIATE ACQUISITION TEST COMPLETE"
    )

    print("=" * 80)


if __name__ == "__main__":
    main()