# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/review_writer.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/review/review_writer.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Review Writer

============================================================

Markdown

        ↓

File

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

# --------------------------------------------------
# Write Review
# --------------------------------------------------

def write_review(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Write Proposal
# --------------------------------------------------

def write_proposal(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Write Summary
# --------------------------------------------------

def write_summary(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Write Commander Report
# --------------------------------------------------

def write_commander_report(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )