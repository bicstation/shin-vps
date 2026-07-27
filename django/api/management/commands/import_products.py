# /home/maya/shin-vps/django/api/management/commands/import_products.py

from __future__ import annotations

from django.core.management.base import (
    BaseCommand,
    CommandError,
)

from acquisition.sources.scraping.ark.run import (
    main as ark_import,
)

# from acquisition.sources.scraping.tsukumo.run import (
#     main as tsukumo_import,
# )

# from acquisition.sources.scraping.frontier.run import (
#     main as frontier_import,
# )

from acquisition.sources.scraping.ozgaming.run import (
    main as ozgaming_import,
)

from acquisition.sources.scraping.geekom.run import (
    main as geekom_import,
)


# ==========================================================
# Acquisition Runtime Registry
# ==========================================================

ACQUISITION_RUNTIMES = {

    "ark": (
        "ARK",
        ark_import,
    ),

    # "tsukumo": (
    #     "TSUKUMO",
    #     tsukumo_import,
    # ),

    # "frontier": (
    #     "FRONTIER",
    #     frontier_import,
    # ),

    "ozgaming": (
        "OzGaming",
        ozgaming_import,
    ),

    "geekom": (
        "GEEKOM",
        geekom_import,
    ),

}


class Command(BaseCommand):
    """
    SHIN CORE LINX

    Execute Acquisition Runtime.
    """

    help = (
        "Execute Acquisition Runtime "
        "for supported Reality Sources."
    )

    # ======================================================
    # Arguments
    # ======================================================

    def add_arguments(self, parser):

        parser.add_argument(
            "source",
            type=str,
            help=(
                "Reality Source "
                "(ark, tsukumo, frontier, "
                "ozgaming, geekom)"
            ),
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

        runtime = ACQUISITION_RUNTIMES.get(
            source,
        )

        if runtime is None:

            available = ", ".join(
                sorted(
                    ACQUISITION_RUNTIMES.keys()
                )
            )

            raise CommandError(
                f"Unsupported Reality Source: {source}\n"
                f"Available: {available}"
            )

        title, runner = runtime

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"=== {title} Acquisition ==="
            )
        )

        runner()

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"=== {title} COMPLETE ==="
            )
        )