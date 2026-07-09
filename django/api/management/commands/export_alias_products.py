# -*- coding: utf-8 -*-

from django.core.management.base import BaseCommand

from api.services.semantic.v2.inventory.export_alias_products import (
    export_alias_products,
)


class Command(BaseCommand):

    help = "Export Alias Research TSV"

    def handle(self, *args, **options):

        path = export_alias_products()

        self.stdout.write(
            self.style.SUCCESS(
                f"Export completed: {path}"
            )
        )