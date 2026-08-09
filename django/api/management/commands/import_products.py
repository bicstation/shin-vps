# /home/maya/shin-vps/django/api/management/commands/import_products.py

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
    
    "lenovo": (
        "LENOVO",
        "acquisition.sources.scraping.lenovo.run",
    ),

    "ozgaming": (
        "OzGaming",
        "acquisition.sources.scraping.ozgaming.run",
    ),

    "geekom": (
        "GEEKOM",
        "acquisition.sources.scraping.geekom.run",
    ),

    "lavie": (
        "NEC LAVIE",
        "acquisition.sources.scraping.lavie.run",
    ),

    "tsukumo": (
        "TSUKUMO",
        "acquisition.sources.scraping.tsukumo.run",
    ),
    
    "storm": (
        "STORM",
        "acquisition.sources.scraping.storm.run",
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

        parser.add_argument(
            "--list",
            action="store_true",
            help="List advertisers (API) or FTP files (FTP)",
        )

        parser.add_argument(
            "--force",
            action="store_true",
            help="Ignore cache and rebuild runtime.",
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
            list_only=options["list"],
            force=options["force"],
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"=== {title} COMPLETE ==="
            )
        )