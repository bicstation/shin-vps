# /home/maya/shin-vps/django/api/management/commands/import_products.py

# /home/maya/shin-vps/django/api/management/commands/import_products.py

from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from imports.ark.run import main as ark_import


class Command(BaseCommand):
    help = "Import products from supported sources."

    def add_arguments(self, parser):

        parser.add_argument(
            "source",
            type=str,
            help="Import source (ark, amazon, rakuten, tsukumo, valuecommerce)",
        )

    # =====================================================
    # Handle
    # =====================================================

    def handle(self, *args, **options):

        source = options["source"].lower()

        if source == "ark":

            self.stdout.write("")
            self.stdout.write(self.style.SUCCESS("=== ARK Import ==="))
            ark_import()
            return

        raise CommandError(
            f"Unsupported import source: {source}"
        )