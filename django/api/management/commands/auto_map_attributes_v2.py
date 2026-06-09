#  //home/maya/shin-dev/shin-vps/django/api/management/commands/auto_map_attributes_v2.py
from django.core.management.base import ( BaseCommand, )
from api.models import ( PCProduct, PCAttribute, )

class Command(BaseCommand):


    help = (
        "Attach semantic attributes from runtime"
    )

    def handle(

        self,

        *args,

        **options,

    ):

        total = 0
        attached = 0
        errors = 0

        products = (
            PCProduct.objects
            .all()
            .order_by("id")
        )

        for product in products:

            try:

                runtime = (
                    product.semantic_runtime
                    or {}
                )

                attribute_slugs = (

                    runtime.get(
                        "semantic_attributes",
                        []
                    )

                )

                product.attributes.clear()

                if not attribute_slugs:

                    continue

                attributes = (

                    PCAttribute.objects

                    .filter(
                        slug__in=attribute_slugs
                    )

                )

                if attributes.exists():

                    product.attributes.add(
                        *attributes
                    )

                    attached += (
                        attributes.count()
                    )

                total += 1

                print({

                    "product_id":
                        product.id,

                    "runtime_attributes":
                        len(
                            attribute_slugs
                        ),

                    "attached":
                        attributes.count(),

                })

            except Exception as error:

                errors += 1

                print({

                    "product_id":
                        product.id,

                    "error":
                        str(error),

                })

        print()
        print("=" * 60)
        print("AUTO MAP ATTRIBUTES V2")
        print("=" * 60)

        print({

            "products":
                total,

            "attached":
                attached,

            "errors":
                errors,

        })

