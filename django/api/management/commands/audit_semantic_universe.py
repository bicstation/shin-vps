from django.core.management.base import BaseCommand

from api.utils.semantic.authority.loader import ( load_semantic_master, )
from api.utils.semantic.audit.orchestrator.semantic_authority_guardian import ( SemanticAuthorityGuardian,)
from api.utils.semantic.audit.reporting.build_metrics_report import ( build_metrics_report, )
from api.utils.semantic.audit.reporting.build_health_report import (  build_health_report, )
from api.utils.semantic.audit.reporting.build_audit_report import ( build_audit_report, )

class Command(BaseCommand):

    help = "Semantic Authority Guardian"

    def handle(self, *args, **options):

        semantic_master = (
            load_semantic_master()
        )

        guardian = (
            SemanticAuthorityGuardian(
                semantic_master
            )
        )

        # result = (
        #     guardian.run()
        # )
        
        result = guardian.run()

        build_audit_report(
            result
        )
