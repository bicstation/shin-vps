# -*- coding: utf-8 -*-
# /home/maya/shin-dev/shin-vps/django/api/services/semantic/v2/navigation/navigation_rules.py

"""
SHIN CORE LINX

Navigation Policy

Responsibility

Topology
↓
Navigation

Semantic Meaning は持たない。

Authority は TSV が管理する。

ここでは

「どの Semantic Group を
Navigation として露出するか」

のみを定義する。
"""

# ==========================================================
# PRIMARY
# TOP Navigation
# ==========================================================

PRIMARY_PARENT_GROUPS = [

    "usage",

    "device",

    "monitor",
]


# ==========================================================
# SECONDARY
# Sidebar / Finder
# ==========================================================

SECONDARY_PARENT_GROUPS = [

    "cpu",

    "gpu",

    "memory",

    "storage",
]


# ==========================================================
# TERTIARY
# Deep Discovery
# ==========================================================

TERTIARY_PARENT_GROUPS = [

    "maker",

    "adult",
]


# ==========================================================
# VISIBILITY
# ==========================================================

VISIBLE_PARENT_GROUPS = (

    PRIMARY_PARENT_GROUPS
    +
    SECONDARY_PARENT_GROUPS
    +
    TERTIARY_PARENT_GROUPS
)


# ==========================================================
# UTIL
# ==========================================================

def is_primary_group(
    parent_group,
):

    return (
        parent_group
        in
        PRIMARY_PARENT_GROUPS
    )


def is_secondary_group(
    parent_group,
):

    return (
        parent_group
        in
        SECONDARY_PARENT_GROUPS
    )


def is_tertiary_group(
    parent_group,
):

    return (
        parent_group
        in
        TERTIARY_PARENT_GROUPS
    )


def is_visible_group(
    parent_group,
):

    return (
        parent_group
        in
        VISIBLE_PARENT_GROUPS
    )