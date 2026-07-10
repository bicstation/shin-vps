# /home/maya/shin-dev/shin-vps/django/visualization/common/logger.py

"""
============================================================

SHIN CORE LINX
Visualization Platform
Logger

============================================================
"""

# --------------------------------------------------
# Imports
# --------------------------------------------------

from datetime import datetime

from visualization.common.constants import (
    DEFAULT_ENCODING,
)

# --------------------------------------------------
# Timestamp
# --------------------------------------------------

def timestamp():
    return datetime.now().strftime(
        "%Y-%m-%d %H:%M:%S"
    )

# --------------------------------------------------
# Log
# --------------------------------------------------

def log(
    logfile,
    level,
    message,
):

    with open(
        logfile,
        "a",
        encoding=DEFAULT_ENCODING,
    ) as f:
        f.write(
            f"[{timestamp()}] "
            f"[{level}] "
            f"{message}\n"
        )

# --------------------------------------------------
# Info
# --------------------------------------------------

def info(
    logfile,
    message,
):
    log(
        logfile,
        "INFO",
        message,
    )

# --------------------------------------------------
# Success
# --------------------------------------------------

def success(
    logfile,
    message,
):
    log(
        logfile,
        "SUCCESS",
        message,
    )

# --------------------------------------------------
# Warning
# --------------------------------------------------

def warning(
    logfile,
    message,
):
    log(
        logfile,
        "WARNING",
        message,
    )

# --------------------------------------------------
# Error
# --------------------------------------------------

def error(
    logfile,
    message,
):
    log(
        logfile,
        "ERROR",
        message,
    )