# =========================================================
# FILE:
# api/services/ai/models/pc_spec_result.py
# =========================================================

from dataclasses import dataclass
from dataclasses import field


@dataclass
class PCSpecResult:

    cpu_model: str = ""

    gpu_model: str = ""

    memory_gb: int = 0

    storage_gb: int = 0

    display_info: str = ""

    is_ai_pc: bool = False

    raw_response: dict = field(
        default_factory=dict
    )

    # =====================================================
    # VALID
    # =====================================================

    @property
    def is_valid(self):

        return bool(
            self.cpu_model
        )

    # =====================================================
    # DICT
    # =====================================================

    def to_dict(self):

        return {

            "cpu_model":
                self.cpu_model,

            "gpu_model":
                self.gpu_model,

            "memory_gb":
                self.memory_gb,

            "storage_gb":
                self.storage_gb,

            "display_info":
                self.display_info,

            "is_ai_pc":
                self.is_ai_pc,
        }