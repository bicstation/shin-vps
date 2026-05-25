import os
import sys
import importlib

# ============================================================================
# Paths
# ============================================================================

# PROJECT_ROOT = "/home/maya/shin-dev/shin-vps"
PROJECT_ROOT = "/home/maya/shin-vps"

DJANGO_ROOT = f"{PROJECT_ROOT}/django"

# ============================================================================
# Ensure Django project path exists
# ============================================================================

if DJANGO_ROOT not in sys.path:
    sys.path.insert(0, DJANGO_ROOT)

# ============================================================================
# Import Real Django
# ============================================================================

django = importlib.import_module("django")

# ============================================================================
# Django Settings
# ============================================================================

os.environ.setdefault(
"DJANGO_SETTINGS_MODULE",
"tiper_api.settings"
)

# ============================================================================
# Setup
# ============================================================================

django.setup()

print("✅ Django environment initialized.")
