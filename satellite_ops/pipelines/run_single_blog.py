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

import argparse

from satellite_ops.runtime.engine.runtime_engine import (RuntimeEngine,)

# ============================================================================
# Runtime Config
# ============================================================================

DEFAULT_BLOG_NAME = "pc-compass"
ENABLE_REAL_POST = True

# ============================================================================
# CLI
# ============================================================================

parser = argparse.ArgumentParser()

parser.add_argument(

"--rss",
type=str,
default=None,
help="RSS source filter"

)

parser.add_argument(

"--blog",
type=str,
default=DEFAULT_BLOG_NAME,
help="Target blog name"

)

args = parser.parse_args()

# ============================================================================
# Runtime Boot
# ============================================================================

def main():

    print("\n🛰 SHIN SATELLITE OPS\n")
    print("\n🎯 Runtime Target\n")
    print(f"Blog => {args.blog}")
    print(f"RSS   => {args.rss}")

    engine = RuntimeEngine()

    context = engine.execute(

        blog_name=args.blog,
        enable_real_post=ENABLE_REAL_POST,
        rss_filter=args.rss,

    )

    return context

# ============================================================================
# Entrypoint
# ============================================================================

if __name__ == "__main__":
    main()
