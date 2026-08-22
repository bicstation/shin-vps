import base64
import json
import re
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build


SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]

BASE_DIR = Path(__file__).resolve().parent
OBSERVATION_DIR = BASE_DIR / "mail_observations"

SEARCH_QUERY = "Lenovo"
MAX_RESULTS = 1


class MailHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__()

        self.text_parts = []
        self.links = []
        self.images = []

        self._skip_depth = 0
        self._current_link = None
        self._link_order = 0
        self._image_order = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)

        if tag in {"script", "style", "head"}:
            self._skip_depth += 1
            return

        if self._skip_depth:
            return

        if tag == "a":
            href = attrs_dict.get("href")

            if href:
                self._link_order += 1

                self._current_link = {
                    "order": self._link_order,
                    "href": href,
                    "text_parts": [],
                }

        elif tag == "img":
            src = attrs_dict.get("src")

            if src:
                self._image_order += 1

                self.images.append(
                    {
                        "order": self._image_order,
                        "src": src,
                        "alt": attrs_dict.get("alt", ""),
                        "width": attrs_dict.get("width", ""),
                        "height": attrs_dict.get("height", ""),
                    }
                )

    def handle_endtag(self, tag):
        if tag in {"script", "style", "head"}:
            if self._skip_depth:
                self._skip_depth -= 1
            return

        if self._skip_depth:
            return

        if tag == "a" and self._current_link:
            text = " ".join(
                self._current_link["text_parts"]
            ).strip()

            self.links.append(
                {
                    "order": self._current_link["order"],
                    "href": self._current_link["href"],
                    "text": text,
                }
            )

            self._current_link = None

    def handle_data(self, data):
        if self._skip_depth:
            return

        text = data.strip()

        if not text:
            return

        self.text_parts.append(text)

        if self._current_link:
            self._current_link["text_parts"].append(text)


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


def collect_parts(payload):
    html_body = ""
    text_body = ""

    mime_type = payload.get(
        "mimeType",
        "",
    )

    body = payload.get(
        "body",
        {},
    )

    data = body.get("data")

    if data:
        decoded = decode_body(data)

        if mime_type == "text/html":
            html_body = decoded

        elif mime_type == "text/plain":
            text_body = decoded

    for part in payload.get("parts", []):
        child_html, child_text = collect_parts(part)

        if child_html and not html_body:
            html_body = child_html

        if child_text and not text_body:
            text_body = child_text

    return html_body, text_body


def normalize_text(parts):
    text = "\n".join(parts)

    text = unescape(text)

    text = re.sub(
        r"[ \t]+",
        " ",
        text,
    )

    lines = []

    for line in text.splitlines():
        line = line.strip()

        if line:
            lines.append(line)

    return "\n".join(lines)


def normalize_headers(message):
    headers = {}

    for header in message.get(
        "payload",
        {},
    ).get("headers", []):

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


def parse_received_at(headers):
    value = headers.get(
        "date",
        "",
    )

    if not value:
        return None

    try:
        dt = parsedate_to_datetime(value)

        if dt.tzinfo is None:
            dt = dt.replace(
                tzinfo=timezone.utc
            )

        return dt.astimezone(
            timezone.utc
        ).isoformat()

    except Exception:
        return None


def build_observation(
    message,
    headers,
    html_body,
    text_body,
    parser,
):
    observed_at = datetime.now(
        timezone.utc
    ).isoformat()

    received_at = parse_received_at(
        headers
    )

    clean_text = (
        normalize_text(
            parser.text_parts
        )
        if html_body
        else text_body.strip()
    )

    links = []

    seen_links = set()

    for link in parser.links:
        href = link["href"]

        if href in seen_links:
            continue

        seen_links.add(href)

        links.append(
            {
                "order": link["order"],
                "href": href,
                "text": link["text"],
            }
        )

    images = []

    seen_images = set()

    for image in parser.images:
        src = image["src"]

        if src in seen_images:
            continue

        seen_images.add(src)

        images.append(image)

    return {
        "schema": {
            "name": "mail_observation",
            "version": "1.0",
        },
        "observation": {
            "observed_at": observed_at,
            "source": "gmail",
            "search_query": SEARCH_QUERY,
        },
        "identity": {
            "message_id": message.get(
                "id",
                "",
            ),
            "thread_id": message.get(
                "threadId",
                "",
            ),
            "history_id": message.get(
                "historyId",
                "",
            ),
            "internal_date": message.get(
                "internalDate",
                "",
            ),
        },
        "headers": {
            "from": headers.get(
                "from",
                "",
            ),
            "to": headers.get(
                "to",
                "",
            ),
            "cc": headers.get(
                "cc",
                "",
            ),
            "bcc": headers.get(
                "bcc",
                "",
            ),
            "date": headers.get(
                "date",
                "",
            ),
            "received_at": received_at,
            "subject": headers.get(
                "subject",
                "",
            ),
            "reply_to": headers.get(
                "reply-to",
                "",
            ),
        },
        "content": {
            "text": clean_text,
            "text_length": len(clean_text),
            "html_available": bool(
                html_body
            ),
            "plain_text_available": bool(
                text_body
            ),
        },
        "links": links,
        "link_count": len(links),
        "images": images,
        "image_count": len(images),
    }


def save_json(path, data):
    with path.open(
        "w",
        encoding="utf-8",
    ) as f:
        json.dump(
            data,
            f,
            ensure_ascii=False,
            indent=2,
        )


def save_text(path, text):
    with path.open(
        "w",
        encoding="utf-8",
    ) as f:
        f.write(text)


def main():
    print()
    print("=" * 80)
    print("SALE REALITY ACQUISITION")
    print("MAIL OBSERVATION RUNTIME")
    print("=" * 80)

    token_path = BASE_DIR / "token.json"

    if not token_path.exists():
        print()
        print("ERROR: token.json がありません。")
        return

    print()
    print("[1] Gmail authentication")

    creds = Credentials.from_authorized_user_file(
        str(token_path),
        SCOPES,
    )

    service = build(
        "gmail",
        "v1",
        credentials=creds,
    )

    print("    OK")

    print()
    print("[2] Gmail search")
    print(f"    query       : {SEARCH_QUERY}")
    print(f"    max_results : {MAX_RESULTS}")

    result = service.users().messages().list(
        userId="me",
        q=SEARCH_QUERY,
        maxResults=MAX_RESULTS,
    ).execute()

    messages = result.get(
        "messages",
        []
    )

    if not messages:
        print()
        print("Lenovoメールが見つかりませんでした。")
        return

    message_id = messages[0]["id"]

    print(f"    message_id  : {message_id}")

    print()
    print("[3] Gmail message acquisition")

    message = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full",
    ).execute()

    print("    OK")

    headers = normalize_headers(
        message
    )

    html_body, text_body = collect_parts(
        message["payload"]
    )

    print()
    print("[4] HTML / text observation")

    print(
        f"    html        : "
        f"{'YES' if html_body else 'NO'}"
    )

    print(
        f"    text        : "
        f"{'YES' if text_body else 'NO'}"
    )

    parser = MailHTMLParser()

    if html_body:
        parser.feed(
            html_body
        )

    observation = build_observation(
        message=message,
        headers=headers,
        html_body=html_body,
        text_body=text_body,
        parser=parser,
    )

    print()
    print("[5] Observation")

    print(
        f"    links       : "
        f"{observation['link_count']}"
    )

    print(
        f"    images      : "
        f"{observation['image_count']}"
    )

    message_timestamp = (
        observation["headers"]
        .get("received_at")
    )

    if message_timestamp:
        folder_timestamp = re.sub(
            r"[^0-9]",
            "",
            message_timestamp,
        )[:14]
    else:
        folder_timestamp = datetime.now(
            timezone.utc
        ).strftime(
            "%Y%m%d%H%M%S"
        )

    safe_message_id = re.sub(
        r"[^A-Za-z0-9_-]",
        "_",
        message_id,
    )

    observation_dir = (
        OBSERVATION_DIR
        / f"{folder_timestamp}_{safe_message_id}"
    )

    observation_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    print()
    print("[6] Persistence")
    print(
        f"    directory   : "
        f"{observation_dir}"
    )

    # Raw Gmail API response.
    save_json(
        observation_dir / "raw.json",
        message,
    )

    # Structured observation.
    save_json(
        observation_dir / "observation.json",
        observation,
    )

    # Original HTML body.
    if html_body:
        save_text(
            observation_dir / "body.html",
            html_body,
        )

    # Original plain text body.
    if text_body:
        save_text(
            observation_dir / "body.txt",
            text_body,
        )

    print("    raw.json          OK")
    print("    observation.json  OK")

    if html_body:
        print("    body.html         OK")

    if text_body:
        print("    body.txt          OK")

    print()
    print("=" * 80)
    print("MAIL OBSERVATION COMPLETE")
    print("=" * 80)

    print()
    print("[IDENTITY]")
    print(
        f"message_id : "
        f"{observation['identity']['message_id']}"
    )

    print(
        f"thread_id  : "
        f"{observation['identity']['thread_id']}"
    )

    print()
    print("[HEADERS]")
    print(
        f"from       : "
        f"{observation['headers']['from']}"
    )

    print(
        f"date       : "
        f"{observation['headers']['date']}"
    )

    print(
        f"subject    : "
        f"{observation['headers']['subject']}"
    )

    print()
    print("[CONTENT]")
    print(
        f"text       : "
        f"{observation['content']['text_length']} chars"
    )

    print()
    print("[LINKS]")
    for link in observation["links"]:
        print(
            f"{link['order']:02d}. "
            f"{link['text']} "
            f"-> {link['href']}"
        )

    print()
    print("[IMAGES]")
    for image in observation["images"]:
        print(
            f"{image['order']:02d}. "
            f"{image['alt']} "
            f"-> {image['src']}"
        )

    print()
    print(f"Saved to: {observation_dir}")


if __name__ == "__main__":
    main()