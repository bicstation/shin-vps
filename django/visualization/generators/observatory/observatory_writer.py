# /home/maya/shin-dev/shin-vps/django/visualization/generators/observatory/observatory_writer.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Observatory Writer

============================================================

Markdown
↓
File

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from visualization.common.constants import (
    DEFAULT_ENCODING,
)

# --------------------------------------------------
# Write Markdown
# --------------------------------------------------

def write_markdown(

    output_file,

    markdown,

):

    output_file.parent.mkdir(

        parents=True,

        exist_ok=True,

    )

    output_file.write_text(

        markdown,

        encoding=DEFAULT_ENCODING,

    )