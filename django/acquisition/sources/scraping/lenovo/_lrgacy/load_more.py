#!/usr/bin/env python3
"""
==============================================================================
FILE:
    acquisition/sources/scraping/lenovo/load_more.py

SHIN CORE LINX

LENOVO Load More Runtime

Listing Page
        │
        ▼
Load More
        │
        ▼
Complete Listing HTML

Reality First
Observation First

Responsibilities

- Detect Load More Button
- Click Load More
- Wait Rendering
- Expand Listing HTML

NOT Responsibilities

- Fetch
- Observation
- Formatter
- Mapper
- Integration
- Semantic Processing

==============================================================================
"""

from __future__ import annotations

from playwright.sync_api import (
    Page,
    TimeoutError,
)

from acquisition.common.trace.reality_trace import (
    trace_pipeline,
)


# ==============================================================================
# Runtime
# ==============================================================================

def load_all_products(
    page: Page,
) -> None:
    """
    Expand all listing products.
    """

    trace_pipeline(
        "LOAD MORE",
    )

    print()

    print("=" * 70)

    print("📄 LOAD MORE")

    page.evaluate(

            "window.scrollTo(0, document.body.scrollHeight)"

        )

    page.wait_for_timeout(

            2000,

        )

    button = page.locator(

            "button.pc_more"

        )

    print("=" * 70)

    clicked = 0
    
    while True:

        try:

            button = page.locator(

                "button.pc_more"

            )
            
            print(

                f"BUTTONS : {button.count()}"

            )

            #
            # No Load More Button
            #

            if button.count() == 0:

                break

            #
            # Hidden
            #

            if not button.first.is_visible():

                break

            print(

                f"CLICK : {clicked + 1}"

            )

            button.first.click()

            page.wait_for_timeout(

                3000,

            )

            clicked += 1

        except TimeoutError:

            print(

                "Load More Timeout"

            )

            break

        except Exception as e:

            print(

                f"Load More Finished : {e}"

            )

            break

    print()

    print("=" * 70)

    print(

        f"LOAD MORE : {clicked}"

    )

    print("=" * 70)
    

# ==============================================================================
# Entry Point
# ==============================================================================

def main(
    page: Page,
) -> None:
    """
    Runtime Entry Point.
    """

    load_all_products(

        page,

    )


if __name__ == "__main__":

    raise RuntimeError(

        "load_more.py must be called from fetch_listing.py"

    )    