from django.core.management.base import (
    BaseCommand,
)

from api.services.feed.services.linkshare_import_service import (
    LinkshareImportService,
)

from api.services.feed.constants.linkshare_mid_map import (
    LINKSHARE_MID_MAP,
)


class Command(BaseCommand):

    help = (
        "Import LinkShare "
        "Products -> PCProduct"
    )

    def add_arguments(
        self,
        parser,
    ):

        parser.add_argument(
            "--mid",
            type=str,
        )

        parser.add_argument(
            "--all",
            action="store_true",
        )

    def handle(
        self,
        *args,
        **options,
    ):

        service = (
            LinkshareImportService()
        )

        if options["all"]:

            for mid in (
                LINKSHARE_MID_MAP.keys()
            ):

                result = (
                    service.import_mid(
                        mid
                    )
                )

                self.stdout.write(
                    self.style.SUCCESS(
                        str(result)
                    )
                )

            return

        mid = options.get(
            "mid"
        )

        if not mid:

            self.stdout.write(
                self.style.ERROR(
                    "--mid or --all required"
                )
            )

            return

        result = (
            service.import_mid(
                mid
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                str(result)
            )
        )