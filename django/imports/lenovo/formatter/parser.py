# /home/maya/shin-vps/django/imports/lenovo/formatter/parser.py

"""
Lenovo HTML Parser

HTMLを読み込み BeautifulSoup を生成する。
"""

from pathlib import Path

from bs4 import BeautifulSoup


def read_html(
    html_file: Path,
) -> str:
    """
    HTMLを読み込む。
    """

    for encoding in (
        "utf-8",
        "cp932",
        "shift_jis",
    ):
        try:
            return html_file.read_text(
                encoding=encoding,
            )
        except UnicodeDecodeError:
            continue

    return html_file.read_text(
        encoding="utf-8",
        errors="replace",
    )


def parse(
    html_file: Path,
) -> BeautifulSoup:
    """
    HTMLからBeautifulSoupを生成する。
    """

    html = read_html(html_file)

    return BeautifulSoup(
        html,
        "html.parser",
    )


if __name__ == "__main__":

    BASE_DIR = Path(__file__).resolve().parent.parent

    RAW_DIR = BASE_DIR / "output" / "raw"

    html_files = sorted(
        RAW_DIR.glob("*.html")
    )

    if not html_files:
        print("No HTML files found.")
        raise SystemExit(1)

    html_file = html_files[0]

    print("=" * 60)
    print("LENOVO HTML PARSER")
    print("=" * 60)
    print(f"File : {html_file.name}")

    soup = parse(html_file)

    print(f"Title: {soup.title.string if soup.title else '(No Title)'}")

    print("=" * 60)
    print("Parser OK")
    print("=" * 60)