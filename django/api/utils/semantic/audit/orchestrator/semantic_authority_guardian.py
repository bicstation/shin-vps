# =========================================================
# FILE:
# audit/orchestrator/semantic_authority_guardian.py
# =========================================================

from api.utils.semantic.audit.models.audit_result import ( AuditResult,)

from api.utils.semantic.audit.universe.audit_universe_integrity import (audit_universe_integrity,)
from api.utils.semantic.audit.aliases.audit_alias_integrity import ( audit_alias_integrity, )
from api.utils.semantic.audit.attributes.audit_attribute_integrity import ( audit_attribute_integrity,)
from api.utils.semantic.audit.groups.audit_group_integrity import ( audit_group_integrity,)
from api.utils.semantic.audit.workflows.audit_workflow_integrity import ( audit_workflow_integrity, )
from api.utils.semantic.audit.hierarchy.audit_hierarchy_integrity import ( audit_hierarchy_integrity, )
from api.utils.semantic.audit.normalization.audit_normalization_integrity import ( audit_normalization_integrity, )
from api.utils.semantic.audit.negative_aliases.audit_negative_alias_integrity import ( audit_negative_alias_integrity,)
from api.utils.semantic.audit.orphans.audit_orphans import ( audit_orphans, )


class SemanticAuthorityGuardian:

    def __init__(
        self,
        semantic_master,
    ):

        self.semantic_master = (
            semantic_master
        )

    def run(self):

        result = AuditResult()

        # =====================================
        # Universe Root Audit
        # =====================================

        audit_universe_integrity( self.semantic_master, result,)
        
        audit_alias_integrity( self.semantic_master, result,)

        audit_attribute_integrity( self.semantic_master, result,)
        
        audit_group_integrity( self.semantic_master, result,)
        
        audit_workflow_integrity( self.semantic_master, result, )
        
        audit_hierarchy_integrity( self.semantic_master, result, )
        
        audit_normalization_integrity( self.semantic_master, result, )
        
        audit_negative_alias_integrity( self.semantic_master, result, )
        
        audit_orphans( self.semantic_master, result, )

        return result