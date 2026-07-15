# /home/maya/shin-vps/django/observation/common/writer.py

"""
============================================================

SHIN CORE LINX

Observation Platform

Common Writer

============================================================

Text

        ↓

File

============================================================

Common Writer

Writes files only.

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
# Write Text
# --------------------------------------------------

def write_text(

    output_file,

    text,

):

    """
    Write text to file.

    Parameters
    ----------
    output_file : Path | str

    text : str
    """

    output_file = Path(

        output_file,

    )

    output_file.parent.mkdir(

        parents=True,

        exist_ok=True,

    )

    output_file.write_text(

        text,

        encoding="utf-8",

    )

# --------------------------------------------------
# Write Markdown
# --------------------------------------------------

def write_markdown(

    output_file,

    markdown,

):

    """
    Write Markdown file.
    """

    write_text(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Write JSON
# --------------------------------------------------

def write_json(

    output_file,

    json_text,

):

    """
    Write JSON file.
    """

    write_text(

        output_file,

        json_text,

    )

# --------------------------------------------------
# Write TSV
# --------------------------------------------------

def write_tsv(

    output_file,

    tsv_text,

):

    """
    Write TSV file.
    """

    write_text(

        output_file,

        tsv_text,

    )