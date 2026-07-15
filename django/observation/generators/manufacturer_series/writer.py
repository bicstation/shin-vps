# /home/maya/shin-vps/django/observation/generators/manufacturer_series/writer.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Manufacturer Series Writer

============================================================

Markdown

        ↓

Markdown File

============================================================

Writer

Writes Observation Report.

No Observation.

No Semantic.

No Evaluation.

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from pathlib import Path

# --------------------------------------------------
# Write Markdown
# --------------------------------------------------

def write_markdown(

    output_file,

    markdown,

):

    """
    Write Markdown report.

    Parameters
    ----------
    output_file : Path
    markdown : str
    """

    output_file = Path(

        output_file,

    )

    output_file.parent.mkdir(

        parents=True,

        exist_ok=True,

    )

    output_file.write_text(

        markdown,

        encoding="utf-8",

    )