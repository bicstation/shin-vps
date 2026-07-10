# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_writer.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_writer.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

API Writer

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
# Write API Observation
# --------------------------------------------------

def write_api(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )

# --------------------------------------------------
# Write Endpoint
# --------------------------------------------------

def write_endpoint(

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
# Write Health Report
# --------------------------------------------------

def write_health_report(

    output_file,
    markdown,

):

    write_markdown(

        output_file,

        markdown,

    )