#!/usr/bin/env python3

from __future__ import annotations

from playwright.sync_api import sync_playwright


URL = (
    "https://jp.gmktec.com/"
    "products/"
    "gmktec-ad-gp1-amd-radeon-7600m-xt-"
    "external-gpu-docking-station"
)


def inspect_price_nodes(
    page,
    selector: str,
) -> None:

    nodes = page.locator(
        selector
    )

    count = nodes.count()

    print()
    print("=" * 70)
    print(f"PRICE NODES : {selector}")
    print("=" * 70)

    print(
        "COUNT :",
        count,
    )

    for index in range(count):

        node = nodes.nth(index)

        try:
            text = node.inner_text()
        except Exception:
            text = ""

        try:
            visible = node.is_visible()
        except Exception:
            visible = False

        try:
            box = node.bounding_box()
        except Exception:
            box = None

        print()
        print(
            f"[{index + 1}]"
        )

        print(
            "VISIBLE :",
            visible,
        )

        print(
            "BOX     :",
            box,
        )

        print(
            "TEXT    :",
            repr(text),
        )

        # --------------------------------------------------
        # Parent Structure
        # --------------------------------------------------

        try:

            parent_html = node.evaluate(
                """
                (el) => {
                    let current = el;

                    for (let i = 0; i < 3 && current; i++) {
                        current = current.parentElement;
                    }

                    return current
                        ? current.outerHTML
                        : "";
                }
                """
            )

            print(
                "PARENT HTML :"
            )

            print(
                parent_html[:3000]
            )

        except Exception as e:

            print(
                "PARENT HTML ERROR :",
                e,
            )


def main() -> None:

    print("=" * 70)
    print("🎭 GMKTEC PLAYWRIGHT PRICE TEST")
    print("=" * 70)

    with sync_playwright() as p:

        browser = p.chromium.launch(
            headless=True,
        )

        page = browser.new_page(
            locale="ja-JP",
            timezone_id="Asia/Tokyo",
        )

        print()
        print(
            "URL :",
            URL,
        )

        response = page.goto(
            URL,
            wait_until="domcontentloaded",
            timeout=60_000,
        )

        print(
            "STATUS :",
            response.status
            if response
            else None,
        )

        # --------------------------------------------------
        # Allow Dynamic Runtime
        # --------------------------------------------------

        page.wait_for_timeout(
            5_000,
        )

        # --------------------------------------------------
        # Page
        # --------------------------------------------------

        print()
        print("=" * 70)
        print("PAGE")
        print("=" * 70)

        print(
            "TITLE :",
            page.title(),
        )

        print(
            "FINAL URL :",
            page.url,
        )

        # --------------------------------------------------
        # Sale Price
        # --------------------------------------------------

        inspect_price_nodes(
            page,
            "b.price-item--sale",
        )

        # --------------------------------------------------
        # Regular Price
        # --------------------------------------------------

        inspect_price_nodes(
            page,
            "b.price-item--regular",
        )

        # --------------------------------------------------
        # JSON-LD
        # --------------------------------------------------

        scripts = page.locator(
            'script[type="application/ld+json"]'
        )

        print()
        print("=" * 70)
        print("JSON-LD")
        print("=" * 70)

        print(
            "SCRIPTS :",
            scripts.count(),
        )

        # --------------------------------------------------
        # Visible Price Text
        # --------------------------------------------------

        print()
        print("=" * 70)
        print("VISIBLE PRICE TEXT")
        print("=" * 70)

        body_text = page.locator(
            "body"
        ).inner_text()

        for line in body_text.splitlines():

            line = line.strip()

            if "¥" in line:

                print(
                    repr(line)
                )

        # --------------------------------------------------
        # Finish
        # --------------------------------------------------

        print()
        print("=" * 70)
        print("PLAYWRIGHT TEST COMPLETE")
        print("=" * 70)

        browser.close()


if __name__ == "__main__":
    main()