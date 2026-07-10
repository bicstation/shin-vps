# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_loader.py

# /home/maya/shin-dev/shin-vps/django/visualization/generators/api/api_loader.py

"""
============================================================

SHIN CORE LINX

Visualization Platform

API Loader

============================================================

API Runtime

        ↓

API Object

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

import json
import urllib.request

# --------------------------------------------------
# Load API
# --------------------------------------------------

def load_api(

    url,

):

    with urllib.request.urlopen(

        url,

    ) as response:

        return json.loads(

            response.read()

        )

# --------------------------------------------------
# Load Discover API
# --------------------------------------------------

def load_discover_api(

    base_url,

):

    return load_api(

        f"{base_url}/api/pc/discover-universe/"

    )

# --------------------------------------------------
# Load Navigation API
# --------------------------------------------------

def load_navigation_api(

    base_url,

):

    return load_api(

        f"{base_url}/api/pc/navigation/"

    )

# --------------------------------------------------
# Load Ranking API
# --------------------------------------------------

def load_ranking_api(

    base_url,

):

    return load_api(

        f"{base_url}/api/pc/ranking/"

    )

# --------------------------------------------------
# Load Finder API
# --------------------------------------------------

def load_finder_api(

    base_url,

):

    return load_api(

        f"{base_url}/api/pc/finder/"

    )