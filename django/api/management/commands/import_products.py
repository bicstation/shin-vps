from __future__ import annotations

from importlib import import_module

from django.core.management.base import (
    BaseCommand,
    CommandError,
)

# ==========================================================
# Reality Runtime Registry
# ==========================================================

REALITY_RUNTIMES = {

    "ark": (
        "ARK",
        "acquisition.sources.scraping.ark.run",
    ),

    "frontier": (
        "FRONTIER",
        "acquisition.sources.scraping.frontier.run",
    ),

    "ozgaming": (
        "OzGaming",
        "acquisition.sources.scraping.ozgaming.run",
    ),

    "geekom": (
        "GEEKOM",
        "acquisition.sources.scraping.geekom.run",
    ),

    "linkshare": (
        "LinkShare",
        "acquisition.sources.scraping.linkshare.run",
    ),

}


class Command(BaseCommand):
    """
    SHIN CORE LINX

    Execute Reality Runtime.
    """

    help = (
        "Execute Reality Runtime "
        "for supported Reality Sources."
    )

    # ======================================================
    # Arguments
    # ======================================================

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "source",
            type=str,
            help="Reality Source",
        )

        parser.add_argument(
            "method",
            nargs="?",
            default="default",
            help=(
                "Acquisition Method "
                "(ftp, api, ...)"
            ),
        )

        parser.add_argument(
            "mid",
            nargs="?",
            default=None,
            help="Merchant ID",
        )

    # ======================================================
    # Handle
    # ======================================================

    def handle(
        self,
        *args,
        **options,
    ):

        source = options["source"].lower()

        runtime = REALITY_RUNTIMES.get(
            source,
        )

        if runtime is None:

            available = ", ".join(
                sorted(
                    REALITY_RUNTIMES.keys()
                )
            )

            raise CommandError(
                f"Unsupported Reality Source: {source}\n"
                f"Available: {available}"
            )

        title, module_path = runtime

        #
        # Lazy Import
        #

        module = import_module(
            module_path,
        )

        runner = module.main

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"=== {title} ==="
            )
        )

        runner(
            method=options["method"],
            mid=options["mid"],
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"=== {title} COMPLETE ==="
            )
        )