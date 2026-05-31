# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from api.management.commands.fanza_api_utils import (
    FanzaAPIClient
)

from api.models import FanzaFloorMaster


class Command(BaseCommand):
    help = "FANZA/DMM Floor Master 同期"

    def handle(self, *args, **options):

        self.stdout.write(
            self.style.MIGRATE_HEADING(
                "FANZA Floor Master Sync Start"
            )
        )

        client = FanzaAPIClient()

        floors = client.get_flattened_floors()

        if not floors:
            self.stdout.write(
                self.style.WARNING(
                    "APIからフロア情報取得失敗"
                )
            )
            return

        created = 0
        updated = 0

        for item in floors:

            is_adult_site = (
                item["site_code"].upper() == "FANZA"
            )

            obj, was_created = (
                FanzaFloorMaster.objects.update_or_create(
                    floor_code=item["floor_code"],
                    defaults={
                        "site_code": item["site_code"],
                        "site_name": item["site_name"],
                        "service_code": item["service_code"],
                        "service_name": item["service_name"],
                        "floor_name": item["floor_name"],
                        "is_adult": is_adult_site,
                    }
                )
            )

            if was_created:
                created += 1
            else:
                updated += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"完了 Created={created} Updated={updated}"
            )
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"総件数={FanzaFloorMaster.objects.count()}"
            )
        )