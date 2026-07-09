# -*- coding: utf-8 -*-
# /home/maya/shin-vps/django/visualization/generators/evidence/evidence_writer.py

"""
============================================================

SHIN CORE LINX

TSV Semantic Infrastructure Team

Semantic Evidence Writer

============================================================

Responsibilities

Markdown

        ↓

Write File

============================================================
"""

# --------------------------------------------------
# Write Markdown
# --------------------------------------------------

def write_markdown(

    output_file,

    markdown,

):

    output_file.write_text(

        markdown,

        encoding="utf-8",

    )