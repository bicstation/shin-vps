# =========================================================
# SHIN CORE LINX
# DOMAIN REALITY SURVEY
# =========================================================

from collections import Counter
from collections import defaultdict

from django.core.management.base import (
    BaseCommand
)

from api.models import (
    AdultProduct
)


# =========================================================
# Runtime Config
# =========================================================

DEFAULT_LIMIT = 1000

DEFAULT_TOP_GENRES = 100

CAMPAIGN_KEYWORDS = [

    "キャンペーン",

    "クーポン",

    "OFF",

    "還元",

    "割引",

]


# =========================================================
# Command
# =========================================================

class Command(BaseCommand):

    help = (
        "Survey FANZA Domain Reality"
    )

    # =====================================================
    # Arguments
    # =====================================================

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(

            "--limit",

            type=int,

            default=DEFAULT_LIMIT,

            help=(
                f"Products per domain "
                f"(default={DEFAULT_LIMIT})"
            ),
        )

        parser.add_argument(

            "--top",

            type=int,

            default=DEFAULT_TOP_GENRES,

            help=(
                f"Top genres "
                f"(default={DEFAULT_TOP_GENRES})"
            ),
        )

    # =====================================================
    # Handle
    # =====================================================

    def handle(
        self,
        *args,
        **options,
    ):

        limit = options["limit"]

        top = options["top"]

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            "DOMAIN REALITY SURVEY"
        )
        self.stdout.write("=" * 60)

        # =================================================
        # Domain Collection
        # =================================================

        domains = defaultdict(list)

        qs = (

            AdultProduct.objects

            .prefetch_related(
                "genres"
            )

            .order_by("id")

        )

        for product in qs.iterator():

            domain = (

                product.floor_code

                or product.api_service

                or "unknown"

            )

            if (
                len(domains[domain])
                >= limit
            ):
                continue

            domains[
                domain
            ].append(product)

        # =================================================
        # Domain Distribution
        # =================================================

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            "DOMAIN DISTRIBUTION"
        )
        self.stdout.write("=" * 60)

        for domain in sorted(
            domains.keys()
        ):

            self.stdout.write(

                f"{domain:<30}"
                f"{len(domains[domain])}"

            )

        # =================================================
        # Genre Survey
        # =================================================

        for domain in sorted(
            domains.keys()
        ):

            products = domains[
                domain
            ]

            counter = Counter()

            for product in products:

                for genre in (
                    product.genres.all()
                ):

                    counter[
                        genre.name
                    ] += 1

            self.stdout.write("")
            self.stdout.write("=" * 60)
            self.stdout.write(
                f"DOMAIN : {domain}"
            )
            self.stdout.write("=" * 60)

            for (
                genre_name,
                count,
            ) in counter.most_common(top):

                coverage = (
                    count
                    / max(
                        len(products),
                        1
                    )
                ) * 100

                self.stdout.write(

                    f"{genre_name:<40}"
                    f"{count:>8}"
                    f" ({coverage:.1f}%)"

                )

        # =================================================
        # Campaign Survey
        # =================================================

        campaign_counter = Counter()

        for domain in domains.values():

            for product in domain:

                for genre in (
                    product.genres.all()
                ):

                    if any(

                        word in genre.name

                        for word in
                        CAMPAIGN_KEYWORDS

                    ):

                        campaign_counter[
                            genre.name
                        ] += 1

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            "CAMPAIGN VOCABULARY"
        )
        self.stdout.write("=" * 60)

        for (
            genre_name,
            count,
        ) in campaign_counter.most_common():

            self.stdout.write(

                f"{genre_name:<60}"
                f"{count}"

            )

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            "SURVEY COMPLETE"
        )
        self.stdout.write("=" * 60)