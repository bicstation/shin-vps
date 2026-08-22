from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from email.utils import parseaddr

SCOPES = ["https://www.googleapis.com/auth/gmail.readonly"]


def main():
    creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    service = build("gmail", "v1", credentials=creds)

    result = service.users().messages().list(
        userId="me",
        q="Lenovo",
        maxResults=1,
    ).execute()

    messages = result.get("messages", [])

    if not messages:
        print("Lenovoメールが見つかりませんでした。")
        return

    message_id = messages[0]["id"]

    message = service.users().messages().get(
        userId="me",
        id=message_id,
        format="full",
    ).execute()

    print("=" * 80)
    print("GMAIL REALITY — LENOVO 1 MAIL")
    print("=" * 80)

    print(f"Message ID : {message['id']}")
    print(f"Thread ID  : {message.get('threadId')}")

    headers = {
        h["name"].lower(): h["value"]
        for h in message["payload"].get("headers", [])
    }

    print(f"From       : {headers.get('from', '')}")
    print(f"To         : {headers.get('to', '')}")
    print(f"Date       : {headers.get('date', '')}")
    print(f"Subject    : {headers.get('subject', '')}")

    print("=" * 80)
    print("RAW PAYLOAD")
    print("=" * 80)

    print(message["payload"])


if __name__ == "__main__":
    main()