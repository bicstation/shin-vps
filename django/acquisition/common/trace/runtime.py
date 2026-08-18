# ============================================================================
# Reality Trace Runtime
# ============================================================================

# Master Switch
TRACE_ENABLED = True

# None = Trace Everything
TRACE_PRODUCT_NO: str | None = "72002746"

# ============================================================================
# Trace Level
#
# 0 = Disabled
# 1 = Summary
#     - Contract
#     - Normalized
#     - Builder
#     - Semantic
#     - Model Mapper
#
# 2 = Detail
#     - Runtime Details
#     - Identity
#     - Commerce
#     - Semantic
#
# 3 = Full
#     - Full Django Model
#     - JSON Runtime
#
# 4 = Pipeline
#     - Internal Pipeline
#     - Diff
#     - Timing
#     - Debug
# ============================================================================
TRACE_LEVEL = 1