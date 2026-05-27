# ============================================================================
# FILE:
# /home/maya/shin-vps/satellite_ops/pipelines/run_single_blog.py
# ============================================================================
# SHIN SATELLITE OPS｜Single Blog Pipeline
# ============================================================================
# Purpose:
# Thin runtime entrypoint
# ============================================================================
# Responsibilities:
#
# - runtime boot
# - runtime execution trigger
# - lightweight pipeline entrypoint
#
# ============================================================================

from satellite_ops.runtime.engine.runtime_engine import (
    RuntimeEngine,
)

# ============================================================================
# Runtime Config
# ============================================================================

BLOG_NAME = "pc-compass"

ENABLE_REAL_POST = True

# ============================================================================
# Runtime Boot
# ============================================================================

def main():

    engine = RuntimeEngine()

    context = engine.execute(

        blog_name=BLOG_NAME,

        enable_real_post=ENABLE_REAL_POST,
    )

    return context

# ============================================================================
# Entrypoint
# ============================================================================

if __name__ == "__main__":

    main()