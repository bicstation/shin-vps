# /home/maya/shin-dev/shin-vps/django/api/management/commands/cleanup_reality.py

from __future__ import annotations

from django.core.management.base import BaseCommand, CommandError

from api.models import PCProduct


class Command(BaseCommand):
    help = "Cleanup Reality products by shop."

    def add_arguments(self, parser):

        parser.add_argument(
            "--shop",
            required=True,
            help="Shop code (maker) to cleanup",
        )

        parser.add_argument(
            "--force",
            action="store_true",
            help="Delete without confirmation",
        )

    def handle(self, *args, **options):

        shop = options["shop"]
        force = options["force"]

        queryset = PCProduct.objects.filter(
            maker=shop
        )

        count = queryset.count()

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write("Reality Cleanup")
        self.stdout.write("=" * 60)
        self.stdout.write(f"Shop     : {shop}")
        self.stdout.write(f"Products : {count}")
        self.stdout.write("=" * 60)
        self.stdout.write("")

        if count == 0:
            raise CommandError(f'No products found for "{shop}".')

        if not force:

            answer = input(
                f'Delete {count} products from "{shop}" ? [y/N]: '
            )

            if answer.lower() != "y":
                self.stdout.write(
                    self.style.WARNING("Cancelled.")
                )
                return

        deleted, _ = queryset.delete()

        self.stdout.write("")
        self.stdout.write("=" * 60)
        self.stdout.write(
            self.style.SUCCESS("Reality Cleanup Complete")
        )
        self.stdout.write("=" * 60)
        self.stdout.write(f"Deleted : {deleted}")
        self.stdout.write("")