# /home/maya/shin-dev/shin-vps/django/api/management/commands/reset_semantic_runtime.py

from django.core.management.base import BaseCommand

from api.models.pc_products import PCProduct


class Command(BaseCommand):
    help = "Reset Semantic Runtime compile flags."

    def add_arguments(self, parser):

        parser.add_argument(
            "--maker",
            type=str,
            help="Target maker (example: rakuten, asus, lenovo)",
        )

        parser.add_argument(
            "--all",
            action="store_true",
            help="Reset all products.",
        )

        parser.add_argument(
            "--force",
            action="store_true",
            help="Skip confirmation.",
        )

    def handle(self, *args, **options):

        maker = options.get("maker")
        reset_all = options.get("all")
        force = options.get("force")

        if not maker and not reset_all:
            self.stdout.write(
                self.style.ERROR(
                    "Specify either --maker or --all"
                )
            )
            return

        queryset = PCProduct.objects.all()

        if maker:
            queryset = queryset.filter(
                maker__iexact=maker,
            )

        count = queryset.count()

        self.stdout.write("")
        self.stdout.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
        self.stdout.write(" Semantic Runtime Reset")
        self.stdout.write("━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

        if maker:
            self.stdout.write(f"Maker : {maker}")
        else:
            self.stdout.write("Maker : ALL")

        self.stdout.write(f"Target: {count} products")
        self.stdout.write("")

        if count == 0:
            self.stdout.write(
                self.style.WARNING(
                    "No matching products."
                )
            )
            return

        if not force:

            answer = input(
                "Reset semantic runtime? [y/N]: "
            )

            if answer.lower() != "y":

                self.stdout.write(
                    self.style.WARNING(
                        "Cancelled."
                    )
                )

                return

        updated = queryset.update(
            semantic_runtime_compiled=False,
        )

        self.stdout.write("")
        self.stdout.write(
            self.style.SUCCESS(
                f"Reset completed ({updated} products)"
            )
        )