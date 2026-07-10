# /home/maya/shin-vps/django/visualization/generators/projection/projection_writer.py

# /home/maya/shin-vps/django/visualization/generators/projection/projection_writer.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

Projection Writer

============================================================

Markdown

        ↓

File

============================================================
"""

# --------------------------------------------------
# Write Markdown
# --------------------------------------------------

def write_markdown(

    output_file,
    markdown,

):

    """
    Markdown を保存する
    """

    output_file.parent.mkdir(

        parents=True,
        exist_ok=True,

    )

    output_file.write_text(

        markdown,
        encoding="utf-8",

    )

    return output_file